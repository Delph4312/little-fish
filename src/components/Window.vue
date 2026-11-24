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

// 标题栏拖动：document 级监听
function onBarPointerDown(e) {
  if (e.button !== 0 || props.win.maximized) return
  if (e.target.closest('.window-controls')) return
  system.focusWindow(props.win.id)
  const startX = e.clientX
  const startY = e.clientY
  const origin = { x: props.win.x, y: props.win.y }
  document.body.style.userSelect = 'none'
  function onMove(ev) {
    props.win.x = Math.max(0, origin.x + (ev.clientX - startX))
    props.win.y = Math.max(0, origin.y + (ev.clientY - startY))
  }
  function onUp() {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.body.style.userSelect = ''
  }
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
}

// 边缘/角落缩放：document 级监听，和标题栏拖动同一套机制，
// 避免 pointer capture 被应用内部元素抢走导致拖不动。
function onResizePointerDown(e, dir) {
  if (e.button !== 0 || props.win.maximized) return
  e.stopPropagation()
  e.preventDefault()
  system.focusWindow(props.win.id)
  resizing.value = true
  const startX = e.clientX
  const startY = e.clientY
  const start = { x: props.win.x, y: props.win.y, w: props.win.w, h: props.win.h }
  const minW = 320
  const minH = 220
  const hasL = dir.includes('w')
  const hasT = dir.includes('n')
  const hasR = dir.includes('e')
  const hasB = dir.includes('s')
  // dir 形如 n/s/w/e/nw/ne/sw/se：左右看 w/e，上下看 n/s
  document.body.style.userSelect = 'none'
  document.body.style.cursor = window.getComputedStyle(e.currentTarget).cursor || ''

  function onMove(ev) {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    let { x, y, w, h } = start
    if (hasR) w = Math.max(minW, start.w + dx)
    if (hasB) h = Math.max(minH, start.h + dy)
    if (hasL) {
      const newW = Math.max(minW, start.w - dx)
      x = start.x + (start.w - newW)
      w = newW
    }
    if (hasT) {
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
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', onUp)
}
</script>

<template>
  <div
    class="window"
    :class="{ active: isActive, maximized: win.maximized, resizing }"
    :style="style"
    @pointerdown="system.focusWindow(win.id)"
  >
    <div class="window-bar" @pointerdown="onBarPointerDown">
      <div class="title">
        <span>{{ win.icon }}</span>
        <span>{{ win.title }}</span>
      </div>
      <div class="window-controls" @pointerdown.stop>
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

    <!-- 8 方向缩放手柄：覆盖窗口边缘一圈，z-index 高于应用内容 -->
    <template v-if="!win.maximized">
      <div class="rs rs-n" @pointerdown="onResizePointerDown($event, 'n')"></div>
      <div class="rs rs-s" @pointerdown="onResizePointerDown($event, 's')"></div>
      <div class="rs rs-w" @pointerdown="onResizePointerDown($event, 'w')"></div>
      <div class="rs rs-e" @pointerdown="onResizePointerDown($event, 'e')"></div>
      <div class="rs rs-nw" @pointerdown="onResizePointerDown($event, 'nw')"></div>
      <div class="rs rs-ne" @pointerdown="onResizePointerDown($event, 'ne')"></div>
      <div class="rs rs-sw" @pointerdown="onResizePointerDown($event, 'sw')"></div>
      <div class="rs rs-se" @pointerdown="onResizePointerDown($event, 'se')"><i></i></div>
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
/* 手柄命中区：覆盖边缘但不侵占标题栏右上角按钮区（约 110px x 36px）。
   控制按钮层级提高到 300，保证左上角/右上角按钮始终可点。 */
.rs { position: absolute; z-index: 200; touch-action: none; }
.rs-n, .rs-s { left: 16px; right: 16px; height: 12px; cursor: ns-resize; }
.rs-n { top: 0; right: 118px; }
.rs-s { bottom: 0; }
.rs-w, .rs-e { top: 16px; bottom: 16px; width: 12px; cursor: ew-resize; }
.rs-w { left: 0; }
.rs-e { right: 0; }
.rs-nw, .rs-ne, .rs-sw, .rs-se { width: 24px; height: 24px; }
.rs-nw { top: 0; left: 0; cursor: nwse-resize; }
/* 右上角手柄下移到标题栏下方（标题栏高约 36px），不再遮挡关闭/最大化/最小化 */
.rs-ne { top: 38px; right: 0; cursor: nesw-resize; }
.rs-sw { bottom: 0; left: 0; cursor: nesw-resize; }
.rs-se { bottom: 0; right: 0; cursor: nwse-resize; }
.window-controls { position: relative; z-index: 300; }
/* 右下角明显的拖拽斜纹标识 */
.rs-se i {
  position: absolute; right: 3px; bottom: 3px;
  width: 14px; height: 14px;
  background: repeating-linear-gradient(135deg, transparent 0 3px, rgba(90,110,120,.8) 3px 5px);
  border-radius: 2px;
}
.window.resizing { user-select: none; }
</style>
