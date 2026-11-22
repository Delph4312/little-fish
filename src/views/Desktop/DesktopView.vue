<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '@/stores/systemStore'
import { useGameStore } from '@/stores/gameStore'
import { images } from '@/data/images'
import AppIcon from '@/components/AppIcon.vue'

const wallpaperStyle = { background: `url(${images.desktopBg}) center/cover no-repeat` }
import Window from '@/components/Window.vue'

const system = useSystemStore()
const game = useGameStore()
const iconRefs = ref([])
const showStart = ref(false)

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
  showStart.value = false
  clearSelection()
}

function clearSelection() {
  iconRefs.value.forEach((r) => r && r.reset && r.reset())
}

// 任务栏点击：未激活→聚焦；已激活→最小化；最小化→还原
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
    <div class="wallpaper" :style="wallpaperStyle"></div>

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

    <!-- 开始菜单 -->
    <div v-if="showStart" class="start-menu" @click.self="showStart = false">
      <div class="start-panel">
        <div class="start-title">所有应用</div>
        <div
          v-for="ic in icons"
          :key="ic.app"
          class="start-item"
          @click="openApp(ic.app)"
        >
          <span class="start-ico" :style="{ background: ic.color }">{{ ic.glyph }}</span>
          <span>{{ ic.label }}</span>
        </div>
      </div>
    </div>

    <div class="taskbar">
      <div class="start" :class="{ open: showStart }" @click.stop="showStart = !showStart">⊞ 开始</div>
      <div class="tasks">
        <div
          v-for="win in system.windows"
          :key="win.id"
          class="task-chip"
          :class="{
            active: system.activeWindowId === win.id && !win.minimized,
            running: !win.minimized
          }"
          @click="onTaskClick(win)"
        >
          <span class="chip-ico">{{ win.icon }}</span>
          <span class="chip-title">{{ win.title }}</span>
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

.start-menu {
  position: absolute; inset: 0 0 42px 0;
  z-index: 99999;
  display: flex; align-items: flex-end;
  padding-left: 8px; padding-bottom: 6px;
}
.start-panel {
  width: 320px;
  background: rgba(24,34,40,.97);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 8px;
  padding: 14px;
  color: #eef3f4;
  box-shadow: 0 12px 40px rgba(0,0,0,.5);
  animation: start-in .16s ease;
}
@keyframes start-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.start-title { font-size: 12px; opacity: .6; padding: 4px 8px 10px; }
.start-item {
  display: flex; align-items: center; gap: 12px;
  padding: 9px 8px; font-size: 13px; border-radius: 5px; cursor: pointer;
}
.start-item:hover { background: rgba(255,255,255,.12); }
.start-ico { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 6px; font-size: 15px; }

.taskbar .start.open { background: rgba(47,111,143,.85); }
.task-chip { position: relative; }
.task-chip .chip-ico { margin-right: 5px; }
.task-chip .chip-title { vertical-align: middle; }
.task-chip.running::after {
  content: ""; position: absolute; left: 8px; right: 8px; bottom: 2px;
  height: 2px; background: rgba(160,190,205,.7); border-radius: 2px;
}
.task-chip.active::after { background: #cfeaf6; }
</style>
