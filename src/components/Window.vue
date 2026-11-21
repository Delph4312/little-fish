<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useSystemStore } from '@/stores/systemStore'

const props = defineProps({
  win: { type: Object, required: true }
})

const system = useSystemStore()
const isActive = computed(() => system.activeWindowId === props.win.id)

const registry = {
  wechat: defineAsyncComponent(() => import('@/views/Apps/WeChat/WeChatApp.vue')),
  browser: defineAsyncComponent(() => import('@/views/Apps/Browser/BrowserApp.vue')),
  filemanager: defineAsyncComponent(() => import('@/views/Apps/FileManager/FileManagerApp.vue')),
  gallery: defineAsyncComponent(() => import('@/views/Apps/Gallery/GalleryApp.vue')),
  map: defineAsyncComponent(() => import('@/views/Apps/Map/MapApp.vue'))
}

const appComponent = computed(() => registry[props.win.app] || null)

const style = computed(() => {
  if (props.win.maximized) return {}
  return {
    left: props.win.x + 'px',
    top: props.win.y + 'px',
    width: props.win.w + 'px',
    height: props.win.h + 'px',
    zIndex: props.win.z
  }
})

function onBarMousedown(e) {
  if (e.button !== 0 || props.win.maximized) return
  system.focusWindow(props.win.id)
  let lastX = e.clientX
  let lastY = e.clientY
  function onMove(ev) {
    system.moveWindow(props.win.id, ev.clientX - lastX, ev.clientY - lastY)
    lastX = ev.clientX
    lastY = ev.clientY
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}
</script>

<template>
  <div
    class="window"
    :class="{ active: isActive, maximized: win.maximized }"
    :style="style"
    @mousedown="system.focusWindow(win.id)"
  >
    <div class="window-bar" @mousedown="onBarMousedown">
      <div class="title">
        <span>{{ win.icon }}</span>
        <span>{{ win.title }}</span>
      </div>
      <div class="window-controls" @mousedown.stop>
        <button title="最小化" @click.stop="system.minimizeWindow(win.id)">—</button>
        <button title="最大化" @click.stop="system.toggleMaximize(win.id)">□</button>
        <button class="close" title="关闭" @click.stop="system.closeWindow(win.id)">×</button>
      </div>
    </div>
    <div class="window-body">
      <component v-if="appComponent" :is="appComponent" v-bind="win.props" />
      <div v-else class="center" style="height:100%;color:#8a979c">应用尚未实现：{{ win.app }}</div>
    </div>
  </div>
</template>
