<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '@/stores/systemStore'
import { useGameStore } from '@/stores/gameStore'
import AppIcon from '@/components/AppIcon.vue'
import Window from '@/components/Window.vue'

const system = useSystemStore()
const game = useGameStore()
const iconRefs = ref([])

const icons = [
  { app: 'wechat', label: '微信', glyph: '💬', color: '#e7f6e6', w: 900, h: 600 },
  { app: 'browser', label: '浏览器', glyph: '🌐', color: '#e6f1fb', w: 960, h: 640 },
  { app: 'filemanager', label: '此电脑', glyph: '🗂️', color: '#eef1f0', w: 860, h: 560 },
  { app: 'gallery', label: '相册', glyph: '🖼️', color: '#fbeaf0', w: 820, h: 560 },
  { app: 'map', label: '地图与潮汐', glyph: '🧭', color: '#e1f5ee', w: 900, h: 600 }
]

const clock = ref('')
let timer
function tick() {
  clock.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
  // 登录后弹一条微信通知作为引导
  setTimeout(() => {
    system.notify({ from: '微信 · 小岛老师', text: '你好。你说你们遇到了困难，能跟我详细说说吗？', avatar: '屿' })
  }, 1200)
})
onUnmounted(() => clearInterval(timer))

function openApp(app) {
  const meta = icons.find((i) => i.app === app) || {}
  system.openWindow({
    app,
    title: meta.label || app,
    icon: meta.glyph || '▣',
    w: meta.w || 860,
    h: meta.h || 560
  })
  clearSelection()
}

function clearSelection() {
  iconRefs.value.forEach((r) => r && r.reset && r.reset())
}

function onTaskClick(win) {
  if (win.minimized) {
    win.minimized = false
    system.focusWindow(win.id)
  } else if (system.activeWindowId === win.id) {
    system.minimizeWindow(win.id)
  } else {
    system.focusWindow(win.id)
  }
}
</script>

<template>
  <div class="desktop-root" @click.self="clearSelection">
    <div class="wallpaper">
      <div class="sun"></div>
      <div class="sea-shimmer"></div>
      <div class="breakwater"></div>
      <div class="lighthouse"></div>
    </div>

    <div class="desktop-icons">
      <AppIcon
        v-for="(ic, idx) in icons"
        :key="ic.app"
        :ref="(el) => (iconRefs[idx] = el)"
        :label="ic.label"
        :glyph="ic.glyph"
        :color="ic.color"
        :app="ic.app"
        @open="openApp"
      />
    </div>

    <div class="window-layer">
      <Window v-for="win in system.windows" :key="win.id" :win="win" />
    </div>

    <button
      v-if="game.pluginInstalled && !game.pluginUsed"
      class="desktop-plugin-btn"
      @click="game.pluginUsed = true"
    >🧩 使用插件</button>

    <div class="taskbar">
      <div class="start">⊞ 开始</div>
      <div class="tasks">
        <div
          v-for="win in system.windows"
          :key="win.id"
          class="task-chip"
          :class="{ active: system.activeWindowId === win.id && !win.minimized }"
          @click="onTaskClick(win)"
        >
          {{ win.icon }} {{ win.title }}
        </div>
      </div>
      <div class="clock">{{ clock }}</div>
    </div>
  </div>
</template>

<style scoped>
.desktop-plugin-btn {
  position: absolute;
  right: 18px;
  bottom: 56px;
  z-index: 90000;
  padding: 10px 16px;
  background: #8e2b2b;
  color: #fff;
  border: 1px solid #b24a4a;
  border-radius: 6px;
  font-size: 13px;
  box-shadow: 0 6px 18px rgba(0,0,0,.35);
  animation: plugin-pulse 2s ease-in-out infinite;
}
.desktop-plugin-btn:hover { background: #a33; }
@keyframes plugin-pulse { 0%,100% { box-shadow: 0 6px 18px rgba(0,0,0,.35); } 50% { box-shadow: 0 6px 26px rgba(180,60,60,.7); } }
</style>
