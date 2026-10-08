<script setup>
import { CustomControl, GoogleMap, Marker } from 'vue3-google-map'
import { computed, inject, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'

const dialogRef = inject('dialogRef')

const emitOnSelect = ref(false)
const onLocationChange = ref(() => {})

onMounted(() => {
  const params = dialogRef.value.data
  emitOnSelect.value = params.emitOnSelect

  if (params.default) {
    location.value = params.default
    center.value = params.default.position

    if (!params.default.address) {
      reverseGeocode(params.default.position)
    }
  }

  if (params.onLocationChange) {
    onLocationChange.value = params.onLocationChange
  }
})

const token = import.meta.env.VITE_GMAP_API_KEY

const center = ref({
  lat: 13.03272287127276,
  lng: 77.63079864913361
})

const markerOptions = computed(() => ({
  position: center.value,
  draggable: true
}))

const markerRef = ref()
const mapRef = ref()
const inputRef = ref()

const location = ref({})

let readyFired = false

watchEffect(() => {
  if (mapRef.value?.ready && !readyFired) {
    readyFired = true
    ready()
  }
})

onBeforeUnmount(() => {
  if (autocompleteHandle) {
    autocompleteHandle.remove()
  }
})

let autocomplete = null
let autocompleteHandle = null

function ready() {
  autocomplete = new window.google.maps.places.Autocomplete(inputRef.value, { types: ['geocode'] })
  autocompleteHandle = autocomplete.addListener('place_changed', autocompleteChange)

  const circle = new window.google.maps.Circle({
    center: center.value,
    radius: 1000
  })
  autocomplete.setBounds(circle.getBounds())

  if (!location.value.position) {
    navigator.geolocation.getCurrentPosition(function (position) {
      // 🛑 DO NOT override if user already selected something
      if (location.value.position) {return}

      const geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      center.value = geolocation
      location.value = {
        position: geolocation,
        address: null
      }

      reverseGeocode(geolocation) // 👈 also fix address issue
    })
  }
}

function reverseGeocode(position) {
  const geocoder = new window.google.maps.Geocoder()

  geocoder.geocode({ location: position }, (response) => {
    if (response && response.length > 0) {
      location.value.address = response[0].formatted_address
      inputRef.value.value = response[0].formatted_address
    }
  })
}

function autocompleteChange() {
  const place = autocomplete.getPlace()

  const loc = {
    position: {},
    address: null
  }

  if (place?.geometry?.location) {
    center.value = place.geometry.location
    loc.position = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
  }

  if (place?.formatted_address) {
    loc.address = place.formatted_address
  }

  location.value = loc
  emitOnSelect.value && onLocationChange.value(loc)
}

function positionChanged(e) {
  const newPosition = {
    lat: e.latLng.lat(),
    lng: e.latLng.lng()
  }

  location.value = {
    position: newPosition,
    address: null
  }

  center.value = newPosition

  reverseGeocode(newPosition)

  emitOnSelect.value && onLocationChange.value(location.value)
}

function onOk() {
  onLocationChange.value(location.value)
  dialogRef.value.close(location.value)
  dialogRef.value.data?.onOk?.(location.value)
}

function onCancel() {
  dialogRef.value.close()
  dialogRef.value.data?.onCancel?.()
}
</script>

<template>
  <div class="min-w-[500px] max-w-screen h-[350px]">
    <GoogleMap
      :api-key="token"
      :center="center"
      style="width: 100%; height: 300px"
      :zoom="14"
      ref="mapRef"
      :fullscreenControl="false"
      :mapTypeControl="false"
      :streetViewControl="false"
      :zoomControl="false"
    >
      <CustomControl position="TOP_RIGHT">
        <input
          placeholder="Search for a place"
          class="p-inputtext p-component places-search"
          ref="inputRef"
        />
      </CustomControl>
      <Marker :options="markerOptions" ref="markerRef" @dragend="positionChanged" />
    </GoogleMap>

    <div class="flex justify-between gap-2 mt-4">
      <div class="flex flex-col">
        <span class="break-words">{{ location.address }}</span>
        <span class="text-xs text-gray-500"
          >{{ location.position?.lat }}, {{ location.position?.lng }}</span
        >
      </div>
      <div class="flex gap-2">
        <Button severity="secondary" label="Cancel" @click="onCancel" />
        <Button @click="onOk" label="OK" />
      </div>
    </div>
  </div>
</template>

<style>
.pac-container {
  z-index: 10000 !important;
}

.places-search {
  padding: 7px 14px;
  margin: 10px;
  width: 30%;
  min-width: 300px;
  font-family: Roboto, serif;
  font-size: 15px;
  font-weight: 300;
  text-overflow: ellipsis;
  border: 0;
  border-radius: 2px 0 0 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
</style>
