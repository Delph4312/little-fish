<script setup>
import { ref, computed, nextTick } from 'vue'
import { newsNav, baseBookmarks, extraBookmarks, newsList as news, newsDetail, crashReport } from '@/data/newsData'
import { useGameStore } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'
import HomePage from './HomePage.vue'
import NewsList from './NewsList.vue'
import NewsDetail from './NewsDetail.vue'
import ForumHome from './Forum/ForumHome.vue'
import XhsApp from './XhsApp.vue'

const game = useGameStore()
const system = useSystemStore()

const tabs = ref([
  { id: 't1', title: '新标签页', type: 'home', view: 'home' }
])
const activeTab = ref('t1')
const address = ref('')
const history = ref([''])
const histIndex = ref(0)
const pageEl = ref(null)

const active = computed(() => tabs.value.find((t) => t.id === activeTab.value))
const visibleBookmarks = computed(() =>
  game.browserWxLoggedIn ? [...baseBookmarks, ...extraBookmarks] : [...baseBookmarks]
)

function scrollTop() {
  nextTick(() => { if (pageEl.value) pageEl.value.scrollTop = 0 })
}

function newTab() {
  const id = 't' + Date.now()
  tabs.value.push({ id, title: '新标签页', type: 'home', view: 'home' })
  activeTab.value = id
  histIndex.value = 0
  history.value = ['']
  address.value = ''
  scrollTop()
}
function closeTab(id, e) {
  e.stopPropagation()
  tabs.value = tabs.value.filter((t) => t.id !== id)
  if (activeTab.value === id && tabs.value.length) activeTab.value = tabs.value[0].id
}
function navigate(type, view, title, url, extra = {}) {
  const tab = active.value
  if (!tab) return
  Object.assign(tab, { type, view, title }, extra)
  address.value = url
  history.value = history.value.slice(0, histIndex.value + 1)
  history.value.push(url)
  histIndex.value = history.value.length - 1
  scrollTop()
}

function go(urlValue) {
  const url = (urlValue || address.value).trim()
  if (!url) return
  if (url.includes('qianwan') || url.includes('forum')) return openForum()
  if (url.includes('xiaohongshu') || url.includes('xhs')) return openXhs()
  if (url.includes('news')) return openNewsHome()
  navigate('news', 'list', '新闻网', url)
}
function openNewsHome() {
  navigate('news', 'list', '新闻网', 'news.cn')
}
function doSearch(keyword) {
  navigate('news', 'list', `搜索：${keyword}`, 'news.cn')
  game.addClue('browser-search')
}
function renderAddress(url) {
  const tab = active.value
  if (!tab) return
  if (!url) {
    Object.assign(tab, { type: 'home', view: 'home', title: '新标签页' })
  } else if (url.includes('qianwan') || url.includes('forum')) {
    Object.assign(tab, { type: 'forum', view: 'forum', title: '浅湾论坛' })
  } else if (url.includes('xiaohongshu') || url.includes('xhs')) {
    Object.assign(tab, { type: 'xhs', view: 'xhs', title: '小红书' })
  } else if (url.includes('article/')) {
    const id = Number(url.split('article/')[1])
    Object.assign(tab, {
      type: 'news', view: 'detail', newsId: id,
      title: (newsDetail[id] || crashReport).title.slice(0, 12) + '…'
    })
  } else {
    Object.assign(tab, { type: 'news', view: 'list', title: '新闻网' })
  }
  scrollTop()
}
function back() {
  if (histIndex.value > 0) {
    histIndex.value--
    address.value = history.value[histIndex.value]
    renderAddress(address.value)
  }
}
function forward() {
  if (histIndex.value < history.value.length - 1) {
    histIndex.value++
    address.value = history.value[histIndex.value]
    renderAddress(address.value)
  }
}
function openNews(id) {
  navigate('news', 'detail', (newsDetail[id] || crashReport).title.slice(0, 12) + '…', `news.cn/article/${id}`, { newsId: id })
}
function backToList() {
  navigate('news', 'list', '新闻网', 'news.cn')
}
function openForum() {
  game.forumVisited = true
  game.addClue('forum-visited')
  navigate('forum', 'forum', '浅湾论坛', 'qianwan.forum')
}
function openXhs() {
  navigate('xhs', 'xhs', '小红书', 'xiaohongshu.com')
}
function gotoSite(action) {
  if (action === 'forum') openForum()
  else if (action === 'xhs') openXhs()
  else openNewsHome()
}
// 浏览器内部右下角提示窗：不可跳转书签点击时给出明确反馈
const bmToast = ref('')
let bmToastTimer
function showBmToast(msg) {
  bmToast.value = msg
  clearTimeout(bmToastTimer)
  bmToastTimer = setTimeout(() => (bmToast.value = ''), 4000)
}
function canOpenBookmark(b) {
  return ['forum', 'news', 'xhs'].includes(b.action)
}
function openBookmark(b) {
  if (b.action === 'forum') openForum()
  else if (b.action === 'news') openNewsHome()
  else if (b.action === 'xhs') openXhs()
  else {
    showBmToast(`⚠ 无法访问 ${b.name}，该网站暂未接入。`)
    system.notify({ from: '浏览器', text: `正在打开 ${b.name}…` })
  }
}

// 浏览器右上角微信快捷登录：免密，但需微信软件已登录（game.wechatLoggedIn）
function doWxLogin() {
  if (!game.wechatLoggedIn) {
    system.notify({ from: '浏览器', text: '请先在微信软件中登录。' })
    showWxLogin.value = false
    return
  }
  game.browserWxLoggedIn = true
  showWxLogin.value = false
  system.notify({ from: '浏览器', text: '微信登录成功。' })
}
</script>

<template>
  <div class="browser">
    <div class="tabs">
      <div
        v-for="t in tabs"
        :key="t.id"
        class="tab"
        :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id"
      >
        <span class="tab-title">{{ t.title }}</span>
        <span class="tab-x" @click="closeTab(t.id, $event)">×</span>
      </div>
      <button class="new-tab" @click="newTab">+</button>
    </div>
    <div class="toolbar">
      <button class="nav" @click="back">‹</button>
      <button class="nav" @click="forward">›</button>
      <button class="nav" @click="renderAddress(address); go(address)">↻</button>
      <div class="addr">
        <span class="lock">🔒</span>
        <input v-model="address" @keyup.enter="go()" />
      </div>
      <div class="wx-area">
        <button v-if="!game.browserWxLoggedIn" class="wx-login" @click="doWxLogin">
          <span>💬</span>微信登录
        </button>
        <div v-else class="wx-avatar" title="微信已登录">遥</div>
      </div>
    </div>

    <!-- 书签栏：地址栏下方；未登录仅基础书签，登录后追加更多 -->
    <div class="bookmark-bar">
      <template v-for="b in visibleBookmarks" :key="b.name">
        <span
          class="bm-item"
          :class="{ jump: canOpenBookmark(b), disabled: !canOpenBookmark(b) }"
          :title="canOpenBookmark(b) ? `打开 ${b.name}` : `${b.name}（暂未接入）`"
          @click="openBookmark(b)"
        >🔖 {{ b.name }}</span>
      </template>
    </div>

    <!-- 不可跳转书签的右下角提示窗（浏览器内部，确保可见） -->
    <transition name="bmfade">
      <div v-if="bmToast" class="bm-toast">{{ bmToast }}</div>
    </transition>

    <div class="page" ref="pageEl">
      <template v-if="active">
        <HomePage
          v-if="active.type === 'home'"
          @search="doSearch"
          @goto="gotoSite"
        />
        <NewsList
          v-else-if="active.type === 'news' && active.view === 'list'"
          :news="news" :nav="newsNav" @open="openNews"
        />
        <NewsDetail
          v-else-if="active.type === 'news' && active.view === 'detail'"
          :article="newsDetail[active.newsId] || crashReport"
          @back="backToList"
        />
        <ForumHome v-else-if="active.type === 'forum'" />
        <XhsApp v-else-if="active.type === 'xhs'" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.browser { display: flex; flex-direction: column; height: 100%; background: #fff; position: relative; }
.tabs { height: 34px; flex: 0 0 34px; display: flex; align-items: flex-end; background: #d9e0e2; padding: 0 6px; gap: 2px; }
.tab { display: flex; align-items: center; gap: 8px; height: 27px; max-width: 180px; padding: 0 8px; background: #eceff0; border-radius: 6px 6px 0 0; font-size: 11px; cursor: pointer; }
.tab.active { background: #fff; }
.tab-title { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.tab-x { color: #9aa7ab; }
.new-tab { background: transparent; border: 0; font-size: 16px; padding: 0 8px 4px; color: #6b7b82; }
.toolbar { height: 44px; flex: 0 0 44px; display: flex; align-items: center; gap: 4px; padding: 0 8px; border-bottom: 1px solid #e2e7e6; }
.nav { width: 28px; height: 28px; border: 0; background: transparent; font-size: 17px; color: #5b6b73; border-radius: 4px; }
.nav:hover { background: #eef1f0; }
.addr { flex: 1; display: flex; align-items: center; gap: 4px; background: #f2f5f4; border-radius: 14px; padding: 0 10px; height: 30px; }
.addr .lock { font-size: 11px; }
.addr input { flex: 1; border: 0; outline: none; background: transparent; font-size: 12px; }
.wx-area { position: relative; }
.wx-login { display: flex; align-items: center; gap: 5px; border: 1px solid #d5dcdb; background: #fff; border-radius: 16px; padding: 5px 12px; font-size: 12px; color: #4a5b62; white-space: nowrap; }
.wx-login:hover { border-color: #2f6f8f; color: #2f6f8f; }
.wx-avatar { width: 28px; height: 28px; border-radius: 50%; background: #cfe6d6; color: #2b5c3a; display: grid; place-items: center; font-size: 13px; user-select: none; }
.bookmark-bar { height: 30px; flex: 0 0 30px; display: flex; align-items: center; gap: 16px; padding: 0 12px; background: #fafbfb; border-bottom: 1px solid #eef1f0; overflow-x: auto; white-space: nowrap; }
/* 可跳转书签：正常深色、手型、蓝色 hover */
.bm-item { font-size: 11px; padding: 3px 8px; border-radius: 4px; border: 1px solid transparent; cursor: pointer; }
.bm-item.jump { color: #1f4e63; }
.bm-item.jump:hover { color: #2f6f8f; background: #eef4f7; border-color: #cfe0e9; }
/* 不可跳转书签：明显灰化 + 虚线下划线 + 禁用光标，hover 有提示反馈 */
.bm-item.disabled { color: #b3bdc0; text-decoration: line-through; text-decoration-color: #cdd5d7; cursor: not-allowed; }
.bm-item.disabled:hover { color: #7d8b8f; background: #f4f6f6; border-color: #e2e7e6; text-decoration: underline dotted; }
.bm-toast { position: absolute; right: 16px; bottom: 16px; background: rgba(28,36,41,.94); color: #fff; font-size: 12px; padding: 10px 16px; border-radius: 6px; z-index: 500; box-shadow: 0 6px 18px rgba(0,0,0,.3); max-width: 280px; }
.bmfade-enter-active, .bmfade-leave-active { transition: opacity .2s; }
.bmfade-enter-from, .bmfade-leave-to { opacity: 0; }
.page { flex: 1; overflow: auto; }
</style>
