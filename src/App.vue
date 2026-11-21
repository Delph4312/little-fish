<script setup>
import { computed } from 'vue'
import { useSystemStore } from '@/stores/systemStore'
import Notification from '@/components/Notification.vue'
import PluginOverlay from '@/components/PluginOverlay.vue'

const system = useSystemStore()
const appClass = computed(() => (system.glitch ? 'glitch' : ''))
</script>

<template>
  <div :class="appClass" style="width:100vw;height:100vh;position:relative">
    <router-view />
    <!-- 全局通知层：任何页面都能弹 -->
    <Notification />
    <!-- 插件倒计时：解密主线的全屏交互 -->
    <PluginOverlay />
  </div>
</template>
