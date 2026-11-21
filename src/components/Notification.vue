<script setup>
import { useSystemStore } from '@/stores/systemStore'

const system = useSystemStore()
</script>

<template>
  <div class="notification-layer">
    <transition-group name="notif">
      <div
        v-for="n in system.notifications"
        :key="n.id"
        class="notification"
        :class="{ whale: n.type === 'whale' }"
        @click="system.removeNotification(n.id)"
      >
        <div class="n-from">{{ n.from }}</div>
        <div class="n-text">{{ n.text }}</div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.notif-leave-active { transition: opacity .2s, transform .2s; }
.notif-leave-to { opacity: 0; transform: translateX(24px); }
</style>
