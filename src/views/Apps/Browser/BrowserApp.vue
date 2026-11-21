<script setup>
import { ref, computed } from 'vue'
import { newsNav, bookmarks, newsList as news, newsDetail, crashReport } from '@/data/newsData'
import { useGameStore } from '@/stores/gameStore'
import HomePage from './HomePage.vue'
import NewsList from './NewsList.vue'
import NewsDetail from './NewsDetail.vue'
import ForumHome from './Forum/ForumHome.vue'

const game = useGameStore()

const tabs = ref([
  { id: 't1', title: '新标签页', type: 'home', view: 'home' }
])
const activeTab = ref('t1')
const address = ref('')
const history = ref([''])
const histIndex = ref(0)
const showBookmarks = ref(false)

const active = computed(() => tabs.value.find((t) => t.id === activeTab.value))

function newTab() {
  const id = 't' + Date.now()
  tabs.value.push({ id, title: '新标签页', type: 'home', view: 'home' })
  activeTab.value = id
  histIndex.value = 0
  history.value = ['']
  address.value = ''
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
  // 截断前进历史后再压入（符合真实浏览器行为）
  history.value = history.value.slice(0, histIndex.value + 1)
  history.value.push(url)
  histIndex.value = history.value.length - 1
}

function go(urlValue) {
  const url = (urlValue || address.value).trim()
  if (!url) return
  if (url.includes('qianwan') || url.includes('forum')) return openForum()
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
// 根据地址恢复视图（前进/后退用）
function renderAddress(url) {
  const tab = active.value
  if (!tab) return
  if (!url) {
    Object.assign(tab, { type: 'home', view: 'home', title: '新标签页' })
  } else if (url.includes('qianwan') || url.includes('forum')) {
    Object.assign(tab, { type: 'forum', view: 'forum', title: '浅湾论坛' })
  } else if (url.includes('article/')) {
    const id = Number(url.split('article/')[1])
    Object.assign(tab, {
      type: 'news', view: 'detail', newsId: id,
      title: (newsDetail[id] || crashReport).title.slice(0, 12) + '…'
    })
  } else {
    Object.assign(tab, { type: 'news', view: 'list', title: '新闻网' })
  }
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
  showBookmarks.value = false
}
function gotoSite(action) {
  if (action === 'forum') openForum()
  else openNewsHome()
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
        <button class="bookmark-btn" @click="showBookmarks = !showBookmarks">☆ 书签</button>
        <div v-if="showBookmarks" class="bookmark-menu">
          <div class="bm-title">书签栏</div>
          <div v-for="b in bookmarks" :key="b.name" class="bm-item" @click="openForum">
            🔖 {{ b.name }} <span class="muted">{{ b.note }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="page">
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
      </template>
    </div>
  </div>
</template>

<style scoped>
.browser { display: flex; flex-direction: column; height: 100%; background: #fff; }
.tabs { height: 34px; flex: 0 0 34px; display: flex; align-items: flex-end; background: #d9e0e2; padding: 0 6px; gap: 2px; }
.tab { display: flex; align-items: center; gap: 8px; height: 27px; max-width: 180px; padding: 0 8px; background: #eceff0; border-radius: 6px 6px 0 0; font-size: 11px; cursor: pointer; }
.tab.active { background: #fff; }
.tab-title { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.tab-x { color: #9aa7ab; }
.new-tab { background: transparent; border: 0; font-size: 16px; padding: 0 8px 4px; color: #6b7b82; }
.toolbar { height: 44px; flex: 0 0 44px; display: flex; align-items: center; gap: 4px; padding: 0 8px; border-bottom: 1px solid #e2e7e6; }
.nav { width: 28px; height: 28px; border: 0; background: transparent; font-size: 17px; color: #5b6b73; border-radius: 4px; }
.nav:hover { background: #eef1f0; }
.addr { flex: 1; display: flex; align-items: center; gap: 4px; position: relative; background: #f2f5f4; border-radius: 14px; padding: 0 10px; height: 30px; }
.addr .lock { font-size: 11px; }
.addr input { flex: 1; border: 0; outline: none; background: transparent; font-size: 12px; }
.bookmark-btn { border: 0; background: transparent; font-size: 11px; color: #6b7b82; white-space: nowrap; }
.bookmark-menu { position: absolute; right: 0; top: 36px; width: 260px; background: #fff; border: 1px solid #d5dcdb; border-radius: 6px; box-shadow: 0 8px 20px rgba(0,0,0,.15); padding: 8px; z-index: 50; }
.bm-title { font-size: 11px; color: #9aa7ab; padding: 4px 8px; }
.bm-item { padding: 9px 8px; font-size: 12px; cursor: pointer; border-radius: 4px; }
.bm-item:hover { background: #eef4f6; }
.bm-item .muted { font-size: 10px; margin-left: 6px; }
.page { flex: 1; overflow: auto; }
.blank-page { display: grid; place-items: center; align-content: center; height: 100%; gap: 8px; color: #9aa7ab; }
.blank-logo { font-size: 46px; opacity: .5; }
</style>
