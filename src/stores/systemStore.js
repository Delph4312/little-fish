import { defineStore } from 'pinia'

/**
 * 系统状态：模拟一台电脑的窗口管理器 + 通知中心
 * 每个窗口：{ id, app, title, icon, component, props, x, y, w, h, z, minimized, maximized }
 */
export const useSystemStore = defineStore('system', {
  state: () => ({
    windows: [],
    zCounter: 10,
    activeWindowId: null,
    notifications: [],
    wallpaper: 'beach',
    locked: true,
    // 全局断电/断网演出，鲸鱼先生用
    networkDown: false,
    glitch: false
  }),

  getters: {
    visibleWindows: (s) =>
      s.windows.filter((w) => !w.minimized).sort((a, b) => a.z - b.z),
    activeWindow: (s) => s.windows.find((w) => w.id === s.activeWindowId) || null,
    isOpen: (s) => (app) => s.windows.some((w) => w.app === app)
  },

  actions: {
    openWindow({ app, title, icon, component, props = {}, w = 820, h = 560, chrome = true }) {
      const existing = this.windows.find((win) => win.app === app)
      if (existing) {
        this.focusWindow(existing.id)
        return existing.id
      }
      const offset = (this.windows.length % 6) * 28
      const id = `${app}-${Date.now()}`
      // 无外壳（登录卡片）时在桌面内居中；普通窗口沿用偏移定位
      const x = chrome ? 90 + offset : Math.max(0, Math.round((window.innerWidth - w) / 2))
      const y = chrome ? 60 + offset : Math.max(0, Math.round((window.innerHeight - h) / 2))
      this.windows.push({
        id,
        app,
        title,
        icon,
        component,
        props,
        x,
        y,
        w,
        h,
        chrome,
        z: ++this.zCounter,
        minimized: false,
        maximized: false
      })
      this.activeWindowId = id
      return id
    },

    focusWindow(id) {
      const win = this.windows.find((w) => w.id === id)
      if (!win) return
      win.z = ++this.zCounter
      this.activeWindowId = id
    },

    closeWindow(id) {
      this.windows = this.windows.filter((w) => w.id !== id)
      if (this.activeWindowId === id) {
        const top = [...this.windows].sort((a, b) => b.z - a.z)[0]
        this.activeWindowId = top ? top.id : null
      }
    },

    minimizeWindow(id) {
      const win = this.windows.find((w) => w.id === id)
      if (win) win.minimized = true
      if (this.activeWindowId === id) this.activeWindowId = null
    },

    toggleMaximize(id) {
      const win = this.windows.find((w) => w.id === id)
      if (win) win.maximized = !win.maximized
    },

    moveWindow(id, dx, dy) {
      const win = this.windows.find((w) => w.id === id)
      if (!win || win.maximized) return
      win.x = Math.max(0, win.x + dx)
      win.y = Math.max(0, win.y + dy)
    },

    // 直接更新窗口位置与尺寸（如登录卡片收缩为卡片自身大小）
    setWindowRect(id, { x, y, w, h } = {}) {
      const win = this.windows.find((w) => w.id === id)
      if (!win) return
      if (x !== undefined) win.x = x
      if (y !== undefined) win.y = y
      if (w !== undefined) win.w = w
      if (h !== undefined) win.h = h
    },

    resizeWindow(id, { dx = 0, dy = 0, dw = 0, dh = 0, left = false, top = false }) {
      const win = this.windows.find((w) => w.id === id)
      if (!win || win.maximized) return
      const minW = 480
      const minH = 340
      let { x, y, w, h } = win
      // 右/下方向：改变宽高
      w = Math.max(minW, w + dw)
      h = Math.max(minH, h + dh)
      // 左/上方向：固定右/下边界，移动左上角
      if (left) {
        const newW = Math.max(minW, w - dx)
        x = x + (w - newW)
        w = newW
      }
      if (top) {
        const newH = Math.max(minH, h - dy)
        y = y + (h - newH)
        h = newH
      }
      win.x = Math.max(0, x)
      win.y = Math.max(0, y)
      win.w = w
      win.h = h
    },

    unlock() {
      this.locked = false
    },

    notify({ from = '系统', text, type = 'info', duration = 6000, avatar }) {
      const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      this.notifications.push({ id, from, text, type, avatar })
      if (duration > 0) {
        setTimeout(() => this.removeNotification(id), duration)
      }
      return id
    },

    removeNotification(id) {
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },

    setNetworkDown(value) {
      this.networkDown = value
    },

    triggerGlitch(ms = 900) {
      this.glitch = true
      setTimeout(() => (this.glitch = false), ms)
    }
  }
})
