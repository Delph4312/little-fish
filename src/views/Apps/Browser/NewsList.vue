<script setup>
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'

defineProps({
  news: { type: Array, default: () => [] },
  nav: { type: Array, default: () => [] }
})
const emit = defineEmits(['open'])
const game = useGameStore()

const activeNav = ref('首页')
const loginTip = ref(false)

function handleLogin() {
  if (game.wechatLoggedIn) {
    loginTip.value = true
    setTimeout(() => (loginTip.value = false), 2000)
  } else {
    loginTip.value = true
    setTimeout(() => (loginTip.value = false), 2600)
  }
}
</script>

<template>
  <div class="news-list">
    <!-- 顶部栏 -->
    <header class="site-header">
      <div class="brand">
        <span class="brand-mark">新</span>
        <span class="brand-name">新闻网</span>
        <span class="brand-slogan">看见每一天</span>
      </div>
      <div class="site-search">
        <input placeholder="搜索新闻、话题" />
        <button>搜索</button>
      </div>
      <div class="login-area">
        <div v-if="loginTip" class="login-tip">
          {{ game.wechatLoggedIn ? '已使用微信登录' : '请先在微信中登录' }}
        </div>
        <button class="wx-login" @click="handleLogin">
          <span class="wx-ico">💬</span>
          {{ game.wechatLoggedIn ? '已登录' : '微信登录' }}
        </button>
      </div>
    </header>

    <div class="layout">
      <!-- 左侧纵向导航 -->
      <aside class="side-nav">
        <div class="side-head">栏目</div>
        <div
          v-for="n in nav"
          :key="n"
          class="side-item"
          :class="{ active: activeNav === n }"
          @click="activeNav = n"
        >
          <span class="side-dot"></span>{{ n }}
        </div>
        <div class="side-foot">新闻热线 · 12345</div>
      </aside>

      <!-- 内容区 -->
      <main class="content">
        <div class="content-head">
          <h2>{{ activeNav }}</h2>
          <span class="date">2026年11月 · 今日更新 {{ news.length }} 条</span>
        </div>
        <div class="list">
          <div v-for="item in news" :key="item.id" class="item" @click="emit('open', item.id)">
            <div class="thumb"></div>
            <div class="item-body">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-summary">{{ item.summary }}</div>
              <div class="item-meta">
                <span class="cat">{{ item.category }}</span>
                <span>{{ item.time }}</span>
                <span class="comments">💬 {{ item.commentCount }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="pager">上一页 &nbsp; <b>1</b> &nbsp; 2 &nbsp; 3 &nbsp; 下一页</div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.news-list { background: #fff; min-height: 100%; color: var(--ink); }
.site-header {
  height: 58px; display: flex; align-items: center; gap: 20px;
  padding: 0 20px; border-bottom: 2px solid #2f6f8f; background: #fff;
}
.brand { display: flex; align-items: center; gap: 8px; }
.brand-mark {
  width: 30px; height: 30px; border-radius: 6px;
  background: #2f6f8f; color: #fff; font-size: 17px; font-weight: 600;
  display: grid; place-items: center;
}
.brand-name { font-size: 19px; font-weight: 600; color: #2f6f8f; }
.brand-slogan { font-size: 11px; color: #9aa7ab; margin-left: 4px; }
.site-search { flex: 1; display: flex; max-width: 380px; margin-left: 20px; }
.site-search input { flex: 1; padding: 7px 10px; border: 1px solid #d5dcdb; border-radius: 3px 0 0 3px; font-size: 12px; }
.site-search button { padding: 7px 14px; border: 1px solid #2f6f8f; background: #2f6f8f; color: #fff; border-radius: 0 3px 3px 0; font-size: 12px; }
.login-area { margin-left: auto; position: relative; display: flex; align-items: center; gap: 8px; }
.wx-login {
  display: flex; align-items: center; gap: 6px;
  border: 1px solid #d5dcdb; background: #fff; color: #4a5b62;
  padding: 6px 12px; border-radius: 18px; font-size: 12px;
}
.wx-login:hover { border-color: #2f6f8f; color: #2f6f8f; }
.wx-ico { font-size: 14px; }
.login-tip {
  position: absolute; right: 0; top: 38px; z-index: 40;
  background: #2c3e46; color: #fff; font-size: 11px;
  padding: 7px 12px; border-radius: 5px; white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
}

.layout { display: flex; min-height: calc(100% - 58px); }
.side-nav {
  width: 150px; flex: 0 0 150px;
  background: #f2f5f4; border-right: 1px solid #e2e7e6;
  padding: 16px 0;
}
.side-head { padding: 0 18px 10px; font-size: 11px; color: #9aa7ab; letter-spacing: 2px; }
.side-item {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 18px; font-size: 13px; color: #4a5b62; cursor: pointer;
  border-left: 3px solid transparent;
}
.side-item:hover { background: #e8eeee; }
.side-item.active { background: #e1ecef; color: #2f6f8f; border-left-color: #2f6f8f; font-weight: 500; }
.side-dot { width: 5px; height: 5px; border-radius: 50%; background: #b7c3c6; }
.side-item.active .side-dot { background: #2f6f8f; }
.side-foot { padding: 20px 18px; font-size: 10px; color: #a5b0b3; margin-top: 20px; }

.content { flex: 1; min-width: 0; padding: 18px 22px; }
.content-head { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #eef1f0; padding-bottom: 12px; }
.content-head h2 { font-size: 18px; margin: 0; color: #2c3e46; }
.date { font-size: 11px; color: #a5b0b3; }
.item { display: flex; gap: 14px; padding: 15px 0; border-bottom: 1px solid #eef1f0; cursor: pointer; }
.item:hover .item-title { color: #2f6f8f; }
.thumb { width: 120px; height: 78px; flex: 0 0 120px; background: linear-gradient(135deg, #b9c6cc, #e0d5c4); filter: grayscale(1); border-radius: 3px; }
.item-body { flex: 1; min-width: 0; }
.item-title { font-size: 15px; font-weight: 500; line-height: 1.5; margin-bottom: 6px; }
.item-summary { font-size: 12px; color: #6b7b82; line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-meta { font-size: 11px; color: #a5b0b3; margin-top: 8px; display: flex; gap: 12px; align-items: center; }
.item-meta .cat { color: #2f6f8f; }
.item-meta .comments { margin-left: auto; }
.pager { text-align: center; padding: 24px; font-size: 12px; color: #6b7b82; }
</style>
