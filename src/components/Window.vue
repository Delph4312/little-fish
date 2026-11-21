<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import { useSystemStore } from '@/stores/systemStore'

const props = defineProps({
  win: { type: Object, required: true }
})

const system = useSystemStore()
const isActive = computed(() => system.activeWindowId === props.win.id)
const resizing = ref(false)

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
  const startX = e.clientX
  const startY = e.clientY
  const origin = { x: props.win.x, y: props.win.y }
  function onMove(ev) {
    props.win.x = Math.max(0, origin.x + (ev.clientX - startX))
    props.win.y = Math.max(0, origin.y + (ev.clientY - startY))
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

// 边缘/角落缩放：dir 含 l/t 表示向左/上拉伸
function onResizeMousedown(e, dir) {
  if (e.button !== 0 || props.win.maximized) return
  e.stopPropagation()
  e.preventDefault()
  system.focusWindow(props.win.id)
  resizing.value = true
  const startX = e.clientX
  const startY = e.clientY
  const start = { x: props.win.x, y: props.win.y, w: props.win.w, h: props.win.h }
  const minW = 420
  const minH = 300
  const left = dir.includes('l')
  const top = dir.includes('t')
  const right = dir.includes('r')
  const bottom = dir.includes('b')

  function onMove(ev) {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    let { x, y, w, h } = start
    if (right) w = Math.max(minW, start.w + dx)
    if (bottom) h = Math.max(minH, start.h + dy)
    if (left) {
      const newW = Math.max(minW, start.w - dx)
      x = start.x + (start.w - newW)
      w = newW
    }
    if (top) {
      const newH = Math.max(minH, start.h - dy)
      y = start.y + (start.h - newH)
      h = newH
    }
    props.win.x = Math.max(0, x)
    props.win.y = Math.max(0, y)
    props.win.w = w
    props.win.h = h
  }
  function onUp() {
    resizing.value = false
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}
</script>

<template>
  <div
    class="window"
    :class="{ active: isActive, maximized: win.maximized, resizing }"
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

    <!-- 8 方向缩放手柄（加宽命中区；最大化时隐藏） -->
    <template v-if="!win.maximized">
      <div class="rs rs-n" @mousedown="onResizeMousedown($event, 'n')"></div>
      <div class="rs rs-s" @mousedown="onResizeMousedown($event, 's')"></div>
      <div class="rs rs-w" @mousedown="onResizeMousedown($event, 'w')"></div>
      <div class="rs rs-e" @mousedown="onResizeMousedown($event, 'e')"></div>
      <div class="rs rs-nw" @mousedown="onResizeMousedown($event, 'nw')"></div>
      <div class="rs rs-ne" @mousedown="onResizeMousedown($event, 'ne')"></div>
      <div class="rs rs-sw" @mousedown="onResizeMousedown($event, 'sw')"></div>
      <div class="rs rs-se" @mousedown="onResizeMousedown($event, 'se')"><i></i></div>
    </template>
  </div>
</template>

<style scoped>
.window.maximized {
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0;
}
.rs { position: absolute; z-index: 30; }
.rs-n, .rs-s { left: 10px; right: 10px; height: 8px; cursor: ns-resize; }
.rs-n { top: -2px; }
.rs-s { bottom: -2px; }
.rs-w, .rs-e { top: 10px; bottom: 10px; width: 8px; cursor: ew-resize; }
.rs-w { left: -2px; }
.rs-e { right: -2px; }
.rs-nw, .rs-ne, .rs-sw, .rs-se { width: 18px; height: 18px; }
.rs-nw { top: -3px; left: -3px; cursor: nwse-resize; }
.rs-ne { top: -3px; right: -3px; cursor: nesw-resize; }
.rs-sw { bottom: -3px; left: -3px; cursor: nesw-resize; }
.rs-se { bottom: -3px; right: -3px; cursor: nwse-resize; }
/* 右下角明显的拖拽斜纹标识 */
.rs-se i {
  position: absolute; right: 3px; bottom: 3px;
  width: 12px; height: 12px;
  background: repeating-linear-gradient(135deg, transparent 0 3px, rgba(90,110,120,.65) 3px 5px);
  border-radius: 2px;
}
</style>
