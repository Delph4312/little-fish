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

const style = computed(() => ({
  left: props.win.x + 'px',
  top: props.win.y + 'px',
  width: props.win.w + 'px',
  height: props.win.h + 'px',
  zIndex: props.win.z,
  display: props.win.minimized ? 'none' : 'flex'
}))

// 标题栏拖动
function onBarMousedown(e) {
  if (e.button !== 0 || props.win.maximized) return
  if (e.target.closest('.window-controls')) return
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
    document.body.style.userSelect = ''
  }
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

// 边缘/角落缩放：dir 组合包含 left/top 表示向左或向上拉
function onResizeMousedown(e, dir) {
  if (e.button !== 0 || props.win.maximized) return
  e.stopPropagation()
  system.focusWindow(props.win.id)
  const startX = e.clientX
  const startY = e.clientY
  const start = { w: props.win.w, h: props.win.h }
  const left = dir.includes('l')
  const top = dir.includes('t')
  function onMove(ev) {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    system.resizeWindow(props.win.id, {
      dx,
      dy,
      dw: dir.includes('r') ? dx : 0,
      dh: dir.includes('b') ? dy : 0,
      left,
      top
    })
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    document.body.style.userSelect = ''
  }
  document.body.style.userSelect = 'none'
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
        <button title="最大化 / 还原" @click.stop="system.toggleMaximize(win.id)">
          {{ win.maximized ? '❐' : '□' }}
        </button>
        <button class="close" title="关闭" @click.stop="system.closeWindow(win.id)">×</button>
      </div>
    </div>
    <div class="window-body">
      <component v-if="appComponent" :is="appComponent" v-bind="win.props" />
      <div v-else class="center" style="height:100%;color:#8a979c">应用尚未实现：{{ win.app }}</div>
    </div>

    <!-- 8 方向缩放手柄 -->
    <template v-if="!win.maximized">
      <div class="rs rs-n" @mousedown="onResizeMousedown($event, 'n')"></div>
      <div class="rs rs-s" @mousedown="onResizeMousedown($event, 's')"></div>
      <div class="rs rs-w" @mousedown="onResizeMousedown($event, 'w')"></div>
      <div class="rs rs-e" @mousedown="onResizeMousedown($event, 'e')"></div>
      <div class="rs rs-nw" @mousedown="onResizeMousedown($event, 'nw')"></div>
      <div class="rs rs-ne" @mousedown="onResizeMousedown($event, 'ne')"></div>
      <div class="rs rs-sw" @mousedown="onResizeMousedown($event, 'sw')"></div>
      <div class="rs rs-se" @mousedown="onResizeMousedown($event, 'se')"></div>
    </template>
  </div>
</template>

<style scoped>
/* 最大化时禁用内联定位，交由全局 .window.maximized 控制 */
.window.maximized {
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0;
}

/* 缩放手柄 */
.rs { position: absolute; z-index: 5; }
.rs-n, .rs-s { left: 8px; right: 8px; height: 5px; cursor: ns-resize; }
.rs-n { top: 0; }
.rs-s { bottom: 0; }
.rs-w, .rs-e { top: 8px; bottom: 8px; width: 5px; cursor: ew-resize; }
.rs-w { left: 0; }
.rs-e { right: 0; }
.rs-nw, .rs-ne, .rs-sw, .rs-se { width: 12px; height: 12px; }
.rs-nw { top: 0; left: 0; cursor: nwse-resize; }
.rs-ne { top: 0; right: 0; cursor: nesw-resize; }
.rs-sw { bottom: 0; left: 0; cursor: nesw-resize; }
.rs-se { bottom: 0; right: 0; cursor: nwse-resize; }
</style>
