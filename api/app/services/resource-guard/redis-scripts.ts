export const APPLY_USAGE_SCRIPT = `
local payload = cjson.decode(ARGV[1])
local policyCount = (#KEYS - 1) / 2
local markerKey = KEYS[#KEYS]
if payload.persistMarker then
  local marker = redis.call('get', markerKey)
  if marker then return marker end
end

local function cleanup(hashKey, expiryKey, now)
  local expired = redis.call('zrangebyscore', expiryKey, '-inf', now)
  for _, member in ipairs(expired) do
    local amount = tonumber(redis.call('hget', hashKey, member) or '0')
    if string.sub(member, 1, 2) == 'r:' then
      redis.call('hincrbyfloat', hashKey, 'reserved', -amount)
    elseif string.sub(member, 1, 2) == 'l:' then
      redis.call('hincrbyfloat', hashKey, 'concurrency', -amount)
    end
    redis.call('hdel', hashKey, member)
  end
  if #expired > 0 then redis.call('zremrangebyscore', expiryKey, '-inf', now) end
end

local metrics = {}
local blocked = 0
for index = 1, policyCount do
  local policy = payload.policies[index]
  local hashKey = KEYS[((index - 1) * 2) + 1]
  local expiryKey = KEYS[((index - 1) * 2) + 2]
  cleanup(hashKey, expiryKey, payload.now)

  local consumed = tonumber(redis.call('hget', hashKey, 'consumed') or '0')
  local reserved = tonumber(redis.call('hget', hashKey, 'reserved') or '0')
  local concurrency = tonumber(redis.call('hget', hashKey, 'concurrency') or '0')
  local current = policy.limitType == 'CONCURRENCY' and concurrency or (consumed + reserved)
  local applies = payload.mode == 'check'
    or (payload.mode == 'consume' and policy.limitType ~= 'CONCURRENCY')
    or (payload.mode == 'reserve' and policy.limitType ~= 'RATE' and policy.limitType ~= 'CONCURRENCY')
    or (payload.mode == 'acquire' and policy.limitType == 'CONCURRENCY')
  local projected = current + (applies and payload.amount or 0)

  metrics[index] = {
    consumed = consumed,
    reserved = reserved,
    concurrency = concurrency,
    projected = projected
  }
  if applies and projected > policy.limit and policy.enforcement == 'HARD' and blocked == 0 then
    blocked = index
  end
end

if blocked == 0 and payload.mode ~= 'check' then
  for index = 1, policyCount do
    local policy = payload.policies[index]
    local hashKey = KEYS[((index - 1) * 2) + 1]
    local expiryKey = KEYS[((index - 1) * 2) + 2]
    if payload.mode == 'consume' and policy.limitType ~= 'CONCURRENCY' then
      redis.call('hincrbyfloat', hashKey, 'consumed', payload.amount)
      metrics[index].consumed = metrics[index].consumed + payload.amount
    elseif payload.mode == 'reserve' and policy.limitType ~= 'RATE' and policy.limitType ~= 'CONCURRENCY' then
      redis.call('hincrbyfloat', hashKey, 'reserved', payload.amount)
      redis.call('hset', hashKey, 'r:' .. payload.entryId, payload.amount)
      redis.call('zadd', expiryKey, payload.entryExpiresAt, 'r:' .. payload.entryId)
      metrics[index].reserved = metrics[index].reserved + payload.amount
    elseif payload.mode == 'acquire' and policy.limitType == 'CONCURRENCY' then
      redis.call('hincrbyfloat', hashKey, 'concurrency', payload.amount)
      redis.call('hset', hashKey, 'l:' .. payload.entryId, payload.amount)
      redis.call('zadd', expiryKey, payload.entryExpiresAt, 'l:' .. payload.entryId)
      metrics[index].concurrency = metrics[index].concurrency + payload.amount
    end

    if policy.periodEnd then
      redis.call('pexpireat', hashKey, policy.periodEnd + 60000)
      redis.call('pexpireat', expiryKey, policy.periodEnd + 60000)
    end
  end
end

local result = cjson.encode({ allowed = blocked == 0, blocked = blocked, metrics = metrics })
if payload.persistMarker then redis.call('set', markerKey, result, 'PX', payload.markerTtl) end
return result
`

export const FINALIZE_RESERVATION_SCRIPT = `
local payload = cjson.decode(ARGV[1])
local policyCount = (#KEYS - 1) / 2
local markerKey = KEYS[#KEYS]
local marker = redis.call('get', markerKey)
if marker then return marker end

local found = 0
local blocked = 0
for index = 1, policyCount do
  local policy = payload.policies[index]
  local hashKey = KEYS[((index - 1) * 2) + 1]
  local member = 'r:' .. payload.entryId
  local reservedAmount = tonumber(redis.call('hget', hashKey, member) or '0')
  if reservedAmount > 0 then
    found = found + 1
    if payload.mode == 'settle' then
      local consumed = tonumber(redis.call('hget', hashKey, 'consumed') or '0')
      local reserved = tonumber(redis.call('hget', hashKey, 'reserved') or '0')
      local projected = consumed + reserved - reservedAmount + payload.actualAmount
      if projected > policy.limit and policy.enforcement == 'HARD' and blocked == 0 then
        blocked = index
      end
    end
  end
end

if blocked == 0 then
  for index = 1, policyCount do
    local hashKey = KEYS[((index - 1) * 2) + 1]
    local expiryKey = KEYS[((index - 1) * 2) + 2]
    local member = 'r:' .. payload.entryId
    local reservedAmount = tonumber(redis.call('hget', hashKey, member) or '0')
    if reservedAmount > 0 then
      redis.call('hincrbyfloat', hashKey, 'reserved', -reservedAmount)
      if payload.mode == 'settle' then redis.call('hincrbyfloat', hashKey, 'consumed', payload.actualAmount) end
      redis.call('hdel', hashKey, member)
      redis.call('zrem', expiryKey, member)
    end
  end
end

local result = cjson.encode({ allowed = blocked == 0, blocked = blocked, found = found })
if blocked == 0 then redis.call('set', markerKey, result, 'PX', 86400000) end
return result
`

export const RELEASE_LEASE_SCRIPT = `
local payload = cjson.decode(ARGV[1])
local policyCount = (#KEYS - 1) / 2
local markerKey = KEYS[#KEYS]
local marker = redis.call('get', markerKey)
if marker then return marker end

local found = 0
for index = 1, policyCount do
  local hashKey = KEYS[((index - 1) * 2) + 1]
  local expiryKey = KEYS[((index - 1) * 2) + 2]
  local member = 'l:' .. payload.entryId
  local amount = tonumber(redis.call('hget', hashKey, member) or '0')
  if amount > 0 then
    found = found + 1
    redis.call('hincrbyfloat', hashKey, 'concurrency', -amount)
    redis.call('hdel', hashKey, member)
    redis.call('zrem', expiryKey, member)
  end
end

local result = cjson.encode({ allowed = true, blocked = 0, found = found })
redis.call('set', markerKey, result, 'PX', 86400000)
return result
`
