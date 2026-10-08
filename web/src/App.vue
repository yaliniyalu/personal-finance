<script setup lang="ts">
import { Notivue, Notification, NotificationProgress, NotivueSwipe } from 'notivue'
import DynamicDialog from 'primevue/dynamicdialog'
</script>
<template>
  <RouterView />
  <DynamicDialog />
  <Notivue v-slot="item">
    <NotivueSwipe :item="item">
      <Notification :item="item">
        <NotificationProgress :item="item" />
      </Notification>
    </NotivueSwipe>
  </Notivue>
</template>
