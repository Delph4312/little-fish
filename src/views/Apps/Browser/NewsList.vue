<script setup>
import { ref, computed } from 'vue'
import { crashReport } from '@/data/newsData'
import { ANSWERS } from '@/stores/gameStore'
import { useGameStore } from '@/stores/gameStore'
import { images } from '@/data/images'

const newsImg = {
  1: images.news.star, 2: images.news.job, 3: images.news.wage,
  4: images.news.fall, 5: images.news.rights, 6: images.news.shop, 7: images.news.rights
}
function thumbUrl(id) {
  return newsImg[id] || ''
}

const props = defineProps({
  news: { type: Array, default: () => [] },
  nav: { type: Array, default: () => [] }
})
const emit = defineEmits(['open'])
const game = useGameStore()

const activeNav = ref('首页')
const showLogin = ref(false)
const username = ref('')
const password = ref('')
const loginErr = ref(false)

const isLoggedIn = computed(() => game.newsLoggedIn)

function doLogin() {
  if (username.value.trim() === ANSWERS.newsUsername && password.value.trim() === ANSWERS.newsPassword) {
    game.newsLoggedIn = true
    game.addClue('news-login')
    showLogin.value = false
    loginErr.value = false
  } else {
    loginErr.value = true
    setTimeout(() => (loginErr.value = false), 1600)
  }
}

function selectNav(n) {
  // 栏目仅"首页"可切换；"我的收藏"是登录后的功能入口，仍可用
  if (n === '首页' || n === '我的收藏') activeNav.value = n
}
function navClickable(n) {
  return n === '首页' || (n === '我的收藏' && isLoggedIn.value)
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
        <button class="login-btn" v-if="!isLoggedIn" @click="showLogin = !showLogin">登录</button>
        <div class="logged" v-else>
          <span class="logged-av">搁</span> {{ ANSWERS.newsUsername }}
        </div>
        <div v-if="showLogin && !isLoggedIn" class="login-pop">
          <div class="lp-title">账号登录</div>
          <input v-model="username" placeholder="用户名" />
          <input v-model="password" type="password" placeholder="密码" @keyup.enter="doLogin" />
          <div v-if="loginErr" class="lp-err">用户名或密码不正确</div>
          <button class="btn btn-primary" @click="doLogin">登录</button>
        </div>
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
          :class="{ active: activeNav === n, clickable: navClickable(n) }"
          @click="navClickable(n) && selectNav(n)"
        >
          <span class="side-dot"></span>{{ n }}
        </div>
        <div class="side-head" style="margin-top:14px" v-if="isLoggedIn">我的</div>
        <div
          v-if="isLoggedIn"
          class="side-item"
          :class="{ active: activeNav === '我的收藏', clickable: true }"
          @click="selectNav('我的收藏')"
        >
          <span class="side-dot"></span>⭐ 我的收藏
        </div>
        <div class="side-foot">新闻热线 · 12345</div>
      </aside>

      <!-- 内容区 -->
      <main class="content">
        <!-- 我的收藏 -->
        <template v-if="activeNav === '我的收藏' && isLoggedIn">
          <div class="content-head">
            <h2>我的收藏</h2>
            <span class="date">{{ 1 }} 篇文章</span>
          </div>
          <div class="fav-card" @click="emit('open', crashReport.id)">
            <div class="fav-thumb" v-lazy-bg="images.news.crash"></div>
            <div class="fav-body">
              <div class="fav-title">{{ crashReport.title }}</div>
              <div class="fav-summary">{{ crashReport.paragraphs[0] }}</div>
              <div class="fav-meta">{{ crashReport.category }} · {{ crashReport.time }} · 收藏于 2025年11月23日</div>
            </div>
          </div>
        </template>

        <!-- 新闻列表 -->
        <template v-else>
          <div class="content-head">
            <h2>{{ activeNav }}</h2>
            <span class="date">2026年11月 · 今日更新 {{ news.length }} 条</span>
          </div>
          <div class="list">
            <div v-for="item in news" :key="item.id" class="item" @click="emit('open', item.id)">
              <div class="thumb" v-lazy-bg="thumbUrl(item.id)"></div>
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
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.news-list { background: #fff; min-height: 100%; color: var(--ink); }
.site-header { position: relative; height: 58px; display: flex; align-items: center; gap: 20px; padding: 0 20px; border-bottom: 2px solid #2f6f8f; background: #fff; }
.brand { display: flex; align-items: center; gap: 8px; }
.brand-mark { width: 30px; height: 30px; border-radius: 6px; background: #2f6f8f; color: #fff; font-size: 17px; font-weight: 600; display: grid; place-items: center; }
.brand-name { font-size: 19px; font-weight: 600; color: #2f6f8f; }
.brand-slogan { font-size: 11px; color: #9aa7ab; margin-left: 4px; }
.site-search { flex: 1; display: flex; max-width: 380px; margin-left: 20px; }
.site-search input { flex: 1; padding: 7px 10px; border: 1px solid #d5dcdb; border-radius: 3px 0 0 3px; font-size: 12px; }
.site-search button { padding: 7px 14px; border: 1px solid #2f6f8f; background: #2f6f8f; color: #fff; border-radius: 0 3px 3px 0; font-size: 12px; }
.login-area { margin-left: auto; position: relative; }
.login-btn { border: 1px solid #2f6f8f; background: #2f6f8f; color: #fff; padding: 6px 16px; border-radius: 18px; font-size: 12px; }
.logged { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #4a5b62; }
.logged-av { width: 24px; height: 24px; border-radius: 50%; background: #d7e4dd; color: #46685a; display: grid; place-items: center; font-size: 12px; }
.login-pop { position: absolute; right: 0; top: 38px; z-index: 60; width: 220px; background: #fff; border: 1px solid #d5dcdb; border-radius: 6px; box-shadow: 0 8px 20px rgba(0,0,0,.18); padding: 14px; text-align: center; }
.lp-title { font-size: 13px; margin-bottom: 10px; }
.login-pop input { width: 100%; padding: 7px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; margin-bottom: 8px; }
.lp-err { color: #b23b3b; font-size: 11px; margin-bottom: 6px; }

.layout { display: flex; min-height: calc(100% - 58px); }
.side-nav { width: 150px; flex: 0 0 150px; background: #f2f5f4; border-right: 1px solid #e2e7e6; padding: 16px 0; }
.side-head { padding: 0 18px 10px; font-size: 11px; color: #9aa7ab; letter-spacing: 2px; }
.side-item { display: flex; align-items: center; gap: 10px; padding: 11px 18px; font-size: 13px; color: #4a5b62; border-left: 3px solid transparent; }
.side-item.clickable { cursor: pointer; }
.side-item.clickable:hover { background: #e8eeee; }
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

.fav-card { display: flex; gap: 14px; padding: 16px; margin-top: 14px; border: 1px solid #e2e7e6; border-radius: 5px; cursor: pointer; }
.fav-card:hover { border-color: #b9ced4; }
.fav-thumb { width: 120px; height: 78px; flex: 0 0 120px; background: linear-gradient(135deg,#b9c6cc,#e0d5c4); filter: grayscale(1); border-radius: 3px; }
.fav-body { flex: 1; min-width: 0; }
.fav-title { font-size: 15px; font-weight: 500; margin-bottom: 6px; }
.fav-summary { font-size: 12px; color: #6b7b82; line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.fav-meta { font-size: 11px; color: #a5b0b3; margin-top: 8px; }
</style>
