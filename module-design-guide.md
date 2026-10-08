# Module Design Guide

## Core Rule
Keep module changes aligned across backend, shared contracts, and frontend services.

## Backend (api)
- Location: api/app/modules/<module>/
- Required files: controller.ts, service.ts, validators.ts, routes.ts
- Nested features follow same pattern (example: auth/forget-password, auth/passkey)
- Register module routes in api/app/modules/routes.ts
- Global prefix is /api/v1 (api/start/routes.ts)
- Success response must use Response.success(data)
- Response envelope contract: { success: true, message?: string, data: payload }

## Shared Contracts (shared)
- Location: shared/src/api/
- Mirror backend namespace/folder structure exactly
- Use operation-specific names (example: LoginWithPasswordRequest, LoginWithPasswordResponse)
- Define:
1. input types
2. output payload types
3. ApiResponse<TData> aliases
- Re-export namespaces from shared/src/api/index.ts

## Frontend Services (web)
- Location: web/src/api/
- No index files for services
- Use explicit files like <module>-service.ts
- Mirror backend/shared structure exactly
- Reuse web/src/api/api-service-utils.ts
- Every method accepts one args object: { path, query, body }
- Use axios instance from web/src/api.ts
- Return only actual payload via unwrapData(response.data)
- Use types from @ws/shared/api

## Required Order For Any Module Change
1. Backend module + routes
2. Shared contracts
3. Frontend services
4. Validation commands

## Validation Commands
- pnpm --filter @ws/api typecheck
- pnpm --filter @ws/shared typecheck
- pnpm --filter @ws/shared build
- pnpm --filter @ws/web type-check

## Non-Negotiables
1. Keep folder hierarchy consistent across layers
2. Keep file names kebab-case
3. If backend payload changes, update shared + frontend in same change
4. Do not break response payload compatibility unless explicitly requested
