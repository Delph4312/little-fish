<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { posts, hiddenPosts, users, profilePosts, whaleDialogue, searchPosts, pinnedPost } from '@/data/forumData'
import { ANSWERS, useGameStore } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'
import { images } from '@/data/images'
import ForumPost from './ForumPost.vue'
import UserProfile from './UserProfile.vue'
import PrivateDiary from './PrivateDiary.vue'
import DriftBottle from './DriftBottle.vue'
import Messages from './Messages.vue'
import NewPost from './NewPost.vue'

const game = useGameStore()
const system = useSystemStore()
const view = ref('home')
const currentPost = ref(null)
const profileUser = ref(null)
const activeSection = ref('全部')
const page = ref(1)
const pageSize = 8
const forumBody = ref(null)
const forumRoot = ref(null)
let whaleTimer

const sections = ['全部', '闲聊', '求助', '生活', '公告']

// 登录弹窗：用户名 + 密码（用户名栏不显示实际用户名）
const showLogin = ref(false)
const loginUser = ref('')
const loginPwd = ref('')
const loginErr = ref(false)
function doForumLogin() {
  if (loginUser.value.trim() === ANSWERS.forumUsername && loginPwd.value.trim() === ANSWERS.forumPassword) {
    game.forumLoggedIn = true
    game.wechatLoggedIn = true
    game.addClue('forum-login')
    showLogin.value = false
    loginErr.value = false
    loginUser.value = ''
    loginPwd.value = ''
  } else {
    loginErr.value = true
    setTimeout(() => (loginErr.value = false), 1500)
  }
}

// 管理员模式弹窗：未开启=标题+密码框+确定；已开启=标题+退出
const adminPwd = ref('')
const adminErr = ref(false)
function enableAdmin() {
  if (adminPwd.value.trim() === ANSWERS.adminPassword) {
    game.toggleAdmin()
    game.addClue('admin-mode')
    adminErr.value = false
    adminPwd.value = ''
  } else {
    adminErr.value = true
    setTimeout(() => (adminErr.value = false), 1500)
  }
}
function exitAdmin() {
  game.adminMode = false
}

// 置顶帖固定展示；公开帖 + 隐藏帖（管理员模式）+ 用户发帖
const realPosts = computed(() => {
  const base = game.adminMode ? [...posts, ...hiddenPosts, ...searchPosts] : [...posts]
  return [...base, ...game.userPosts]
})

// 占位帖：文案未给的板块卡片用 "-" 留空，随机回复/点赞数（≤99），稳定不跳动
function placeholderPosts(section, count) {
  const arr = []
  for (let i = 0; i < count; i++) {
    const seed = (section.charCodeAt(0) + i * 37) % 97
    arr.push({
      id: `ph-${section}-${i}`, placeholder: true, section,
      title: '-', author: '-', time: '-',
      content: ['-'],
      likes: 3 + (seed % 94), replies: 1 + ((seed * 7) % 96),
      comments: []
    })
  }
  return arr
}

// 每个板块补足到 8 张卡片；公告板块只有置顶帖
const sectionPosts = computed(() => {
  if (activeSection.value === '公告') return []
  let real = realPosts.value.filter((p) => activeSection.value === '全部' || p.section === activeSection.value)
  // 全部板块：8 篇真实帖都在第一页，置顶帖单独置顶显示
  const need = Math.max(0, pageSize - real.length)
  return [...real, ...placeholderPosts(activeSection.value, need)]
})

const pagedPosts = computed(() => sectionPosts.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const totalPages = computed(() => Math.max(3, Math.ceil(sectionPosts.value / pageSize)))

// 今日热度榜：帖子名称用 "-" 留空
const hotList = computed(() => {
  const nums = [71, 40, 97, 60, 73]
  return nums.map((n, i) => ({ id: `hot-${i}`, title: '-', replies: n }))
})

const profilePostsForUser = computed(() => {
  if (!profileUser.value) return []
  if (profileUser.value.id === 'whale') return profilePosts.whale
  if (profileUser.value.id === 'teacher') return profilePosts.teacher
  return []
})

function resetScroll() {
  nextTick(() => {
    if (forumBody.value) forumBody.value.scrollTop = 0
    if (forumRoot.value) forumRoot.value.scrollTop = 0
  })
}
function openPost(post) {
  currentPost.value = post
  view.value = 'post'
  resetScroll()
}
function openProfile(user) {
  profileUser.value = user
  view.value = 'profile'
  resetScroll()
}
function openProfileByName(name) {
  if (name === '小岛老师') openProfile(users.teacher)
  else if (name === '鲸鱼先生') openProfile(users.whale)
  else if (name === '遥遥云梦泽' || name === '谢遥') openProfile(users.xieyao)
}
function goHome() {
  view.value = 'home'
  activeSection.value = '全部'
  page.value = 1
  resetScroll()
}
function selectSection(s) {
  activeSection.value = s
  page.value = 1
  view.value = 'home'
  resetScroll()
}
function goPage(n) {
  // 除第一页外均不可点击跳转
  if (n === 1) page.value = 1
}

// 私信悬浮窗：收起时新消息右下角弹出
function onWhaleNewMessage(text) {
  if (!game.forumMsgsOpen) {
    system.notify({ from: '鲸鱼先生', text, type: 'whale', duration: 6000 })
  }
}

// 鲸鱼先生干扰：仅在登录后触发
onMounted(() => {
  whaleTimer = setInterval(() => {
    if (!game.forumLoggedIn) return
    if (game.whaleTriggers.includes('forum-idle')) return
    system.notify({ from: '鲸鱼先生', text: whaleDialogue.interruptions[0], type: 'whale', duration: 7000 })
    system.triggerGlitch(700)
    game.markWhaleTriggered('forum-idle')
  }, 60000)
})
onUnmounted(() => clearInterval(whaleTimer))
</script>

<template>
  <div class="forum" ref="forumRoot">
    <!-- 顶部第一行：logo + 登录/用户，一整行置于最顶 -->
    <div class="topbar">
      <div class="brand" @click="goHome">
        <span class="brand-mark" :style="{ background: `url(${images.forum.logo}) center/cover` }"></span>
        <span class="brand-name">浅湾论坛</span>
      </div>
      <div class="top-right">
        <template v-if="!game.forumLoggedIn">
          <button class="login-btn" @click="showLogin = !showLogin">登录</button>
          <div v-if="showLogin" class="login-pop">
            <div class="lp-title">论坛登录</div>
            <input v-model="loginUser" placeholder="用户名" @keyup.enter="doForumLogin" />
            <input v-model="loginPwd" type="password" placeholder="密码" @keyup.enter="doForumLogin" />
            <div v-if="loginErr" class="lp-err">用户名或密码不正确</div>
            <button class="btn btn-primary" @click="doForumLogin">登录</button>
          </div>
        </template>
        <div v-else class="user-chip" @click="openProfile(users.xieyao)">
          <span class="uc-av">{{ users.xieyao.avatarText }}</span> {{ users.xieyao.name }} ▾
        </div>
      </div>
    </div>

    <!-- Banner -->
    <div class="banner" @click="goHome" :style="{ background: `url(${images.forum.banner}) center/cover` }">
      <div class="banner-title">浅湾</div>
      <div class="banner-sub">QIAN WAN · 靠岸的地方</div>
    </div>

    <!-- 板块行 -->
    <div class="section-bar">
      <div class="sections">
        <span
          v-for="s in sections"
          :key="s"
          :class="{ active: activeSection === s }"
          @click="selectSection(s)"
        >{{ s }}</span>
      </div>
      <div class="bar-actions">
        <button class="btn post-btn" v-if="game.forumLoggedIn" @click="view = 'newpost'">✎ 发帖</button>
        <button class="btn admin-btn" v-if="game.forumLoggedIn" @click="view = 'admin'">
          {{ game.adminMode ? '管理员模式 · 开' : '管理员模式' }}
        </button>
      </div>
    </div>

    <!-- 主体 -->
    <div class="forum-body" ref="forumBody">
      <template v-if="view === 'home'">
        <div class="home-layout" :class="{ 'no-side': activeSection === '公告' }">
          <main class="post-area">
            <!-- 置顶帖：鲸鱼先生发布，评论区关闭 -->
            <div class="pinned-row" @click="openPost(pinnedPost)">
              <span class="pin-tag">置顶</span>
              <span class="pin-title">{{ pinnedPost.title }}</span>
              <span class="pin-author">鲸鱼先生</span>
            </div>

            <div v-if="activeSection !== '公告'" class="hidden-banner" v-show="game.adminMode">🔓 管理员模式已开启 · 隐藏帖子已显示</div>

            <div class="post-list">
              <div v-for="p in pagedPosts" :key="p.id" class="post-row" @click="openPost(p)">
                <div class="p-main">
                  <div class="p-title">{{ p.title }}</div>
                  <div class="p-summary">{{ p.content[0] }}</div>
                  <div class="p-meta">{{ p.author }} · {{ p.time }} · 回复 {{ p.replies }} · 赞 {{ p.likes }}</div>
                </div>
              </div>
              <div v-if="!pagedPosts.length && activeSection !== '公告'" class="empty">该板块暂时没有帖子。</div>
            </div>

            <!-- 分页：至少 3 页，仅第一页可点 -->
            <div class="pager" v-if="activeSection !== '公告'">
              <button disabled>‹ 上一页</button>
              <span
                v-for="n in totalPages"
                :key="n"
                :class="{ cur: page === n, disabled: n !== 1 }"
                @click="goPage(n)"
              >{{ n }}</span>
              <button disabled>下一页 ›</button>
            </div>
          </main>

          <!-- 右侧栏 -->
          <aside class="side-panel" v-if="activeSection !== '公告'">
            <div class="side-card">
              <div class="side-card-title">快捷入口</div>
              <div class="quick-grid">
                <div class="quick" @click="view = 'bottle'">
                  <span class="qc">🍾</span>漂流瓶
                </div>
                <div class="quick" @click="selectSection('求助')">
                  <span class="qc">🆘</span>求助
                </div>
                <div class="quick" @click="selectSection('生活')">
                  <span class="qc">🌱</span>生活
                </div>
                <div class="quick" @click="selectSection('闲聊')">
                  <span class="qc">💬</span>闲聊
                </div>
              </div>
            </div>
            <div class="side-card">
              <div class="side-card-title">🔥 今日热度榜</div>
              <div v-for="(p, i) in hotList" :key="p.id" class="hot-row">
                <span class="rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
                <span class="hot-title">{{ p.title }}</span>
                <span class="hot-replies">{{ p.replies }}</span>
              </div>
            </div>
          </aside>
        </div>
      </template>

      <ForumPost
        v-else-if="view === 'post'"
        :post="currentPost"
        @back="goHome"
        @open-profile="openProfileByName"
      />
      <UserProfile v-else-if="view === 'profile'" :user="profileUser" :posts="profilePostsForUser" @open-post="openPost" @open-diary="view = 'diary'" />
      <PrivateDiary v-else-if="view === 'diary'" @back="view = 'profile'" />
      <DriftBottle v-else-if="view === 'bottle'" />
      <NewPost v-else-if="view === 'newpost'" @back="goHome" @published="goHome" />
    </div>

    <!-- 管理员模式弹窗 -->
    <div v-if="view === 'admin'" class="admin-mask" @click.self="view = 'home'">
      <div class="admin-box">
        <div class="admin-title">管理员模式</div>
        <template v-if="!game.adminMode">
          <input v-model="adminPwd" type="password" placeholder="请输入管理员密码" @keyup.enter="enableAdmin" />
          <div v-if="adminErr" class="lp-err">密码不正确</div>
          <button class="btn btn-primary" @click="enableAdmin">确定</button>
          <button class="btn" @click="view = 'home'">取消</button>
        </template>
        <template v-else>
          <div class="admin-on">管理员模式已开启</div>
          <button class="btn" @click="exitAdmin; view = 'home'">退出</button>
        </template>
      </div>
    </div>

    <!-- 私信悬浮窗：登录后右下角，可收起 -->
    <div v-if="game.forumLoggedIn" class="float-msg">
      <button class="float-msg-toggle" @click="game.forumMsgsOpen = !game.forumMsgsOpen">
        💬 私信 <span>{{ game.forumMsgsOpen ? '▾' : '▴' }}</span>
      </button>
      <div v-show="game.forumMsgsOpen" class="float-msg-panel">
        <Messages @new-message="onWhaleNewMessage" />
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">浅湾论坛 · 让人人都有靠岸的地方 · © 2026 Qianwan</div>
  </div>
</template>

<style scoped>
.forum { height: 100%; display: flex; flex-direction: column; background: #eef1f2; overflow: auto; position: relative; }
.topbar { height: 50px; flex: 0 0 50px; display: flex; align-items: center; justify-content: space-between; padding: 0 22px; background: #12313e; color: #eef3f4; }
.brand { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.brand-mark { width: 28px; height: 28px; border-radius: 6px; background: #c9a27e; color: #12313e; display: grid; place-items: center; font-weight: 700; }
.brand-name { font-size: 16px; font-weight: 600; letter-spacing: 1px; }
.top-right { position: relative; }
.login-btn { border: 1px solid #c9a27e; background: transparent; color: #f3ede0; padding: 5px 18px; border-radius: 16px; font-size: 12px; }
.login-btn:hover { background: #c9a27e; color: #12313e; }
.login-pop { position: absolute; right: 0; top: 34px; z-index: 60; width: 220px; background: #fff; border: 1px solid #d5dcdb; border-radius: 6px; box-shadow: 0 8px 20px rgba(0,0,0,.15); padding: 14px; text-align: center; }
.lp-title { font-size: 13px; margin-bottom: 10px; color: #2c3e46; }
.login-pop input { width: 100%; padding: 7px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; margin-bottom: 8px; }
.lp-err { color: #b23b3b; font-size: 11px; margin-bottom: 6px; }
.user-chip { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; }
.uc-av { width: 26px; height: 26px; border-radius: 50%; background: #d7e4dd; color: #46685a; display: grid; place-items: center; font-size: 12px; }

.banner { height: 110px; flex: 0 0 110px; background: linear-gradient(120deg, #12313e 0%, #2b5f6b 50%, #c9a27e 120%); display: grid; place-items: center; position: relative; cursor: pointer; overflow: hidden; }
.banner::after { content:""; position:absolute; inset:0; background: repeating-linear-gradient(90deg, transparent 0 40px, rgba(255,255,255,.03) 40px 41px); }
.banner-title { font-size: 44px; font-weight: 700; letter-spacing: 12px; color: #12313e; text-shadow: 0 2px 10px rgba(255,255,255,.7), 0 0 26px rgba(255,255,255,.5); font-family: "STKaiti","KaiTi",serif; position: relative; z-index: 2; }
.banner::before { content: ""; position: absolute; inset: 0; background: rgba(255,255,255,.28); z-index: 1; }
.banner-sub { position: absolute; bottom: 12px; font-size: 10px; letter-spacing: 3px; color: #2b4a58; z-index: 2; }

.section-bar { height: 46px; flex: 0 0 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 22px; background: #fff; border-bottom: 1px solid #dce3e3; }
.sections { display: flex; gap: 22px; }
.sections span { font-size: 13px; color: #6b7b82; cursor: pointer; padding: 4px 0; }
.sections span.active { color: #2f6f8f; font-weight: 600; border-bottom: 2px solid #2f6f8f; }
.bar-actions { display: flex; gap: 8px; }
.bar-actions .btn { font-size: 12px; padding: 5px 12px; }
.post-btn { background: #2f6f8f; color: #fff; border-color: #2f6f8f; }
.admin-btn { border-color: #c8d3d6; }
.forum-body { flex: 1; }
.home-layout { display: flex; gap: 18px; max-width: 1180px; margin: 0 auto; padding: 20px; align-items: flex-start; }
.home-layout.no-side { max-width: 800px; }
.post-area { flex: 1; min-width: 0; }
.side-panel { width: 280px; flex: 0 0 280px; display: flex; flex-direction: column; gap: 14px; }
.pinned-row { display: flex; align-items: center; gap: 10px; background: #fff8ec; border: 1px solid #ecd8b4; border-radius: 6px; padding: 12px 16px; margin-bottom: 12px; cursor: pointer; }
.pin-tag { background: #c9a27e; color: #fff; font-size: 10px; padding: 2px 7px; border-radius: 3px; }
.pin-title { flex: 1; font-size: 14px; font-weight: 500; color: #6b5227; }
.pin-author { font-size: 11px; color: #a08b62; }
.hidden-banner { margin-bottom: 12px; padding: 10px 16px; background: #f7eaea; border-left: 3px solid #a33; border-radius: 4px; font-size: 12px; color: #8e2b2b; }
.post-list { display: flex; flex-direction: column; gap: 10px; }
.post-row { background: #fff; border: 1px solid #e2e7e6; border-radius: 6px; padding: 15px 18px; cursor: pointer; }
.post-row:hover { border-color: #b9ced4; }
.p-title { font-size: 15px; font-weight: 500; margin-bottom: 6px; }
.p-summary { font-size: 12px; color: #6b7b82; line-height: 1.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p-meta { font-size: 11px; color: #a5b0b3; margin-top: 8px; }
.empty { padding: 40px; text-align: center; color: #9aa7ab; font-size: 12px; background: #fff; border-radius: 6px; }
.pager { display: flex; justify-content: center; align-items: center; gap: 8px; padding: 20px 0; }
.pager button, .pager span { border: 1px solid #d5dcdb; background: #fff; border-radius: 4px; padding: 5px 10px; font-size: 12px; color: #5b6b73; cursor: pointer; }
.pager span.cur { background: #2f6f8f; color: #fff; border-color: #2f6f8f; }
.pager span.disabled { opacity: .5; cursor: default; }
.pager button:disabled { opacity: .45; cursor: default; }
.side-card { background: #fff; border: 1px solid #e2e7e6; border-radius: 6px; padding: 14px; }
.side-card-title { font-size: 13px; font-weight: 600; color: #2c3e46; margin-bottom: 12px; }
.quick-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.quick { display: flex; align-items: center; gap: 6px; padding: 10px; background: #f2f5f4; border-radius: 5px; font-size: 12px; cursor: pointer; }
.quick:hover { background: #e1ecef; }
.qc { font-size: 16px; }
.hot-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f3f3; font-size: 12px; }
.rank { width: 18px; text-align: center; color: #9aa7ab; }
.rank.top { color: #b23b3b; font-weight: 600; }
.hot-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #4a5b62; }
.hot-replies { color: #a5b0b3; font-size: 11px; }

.admin-mask { position: fixed; inset: 0; z-index: 90000; background: rgba(10,22,28,.5); display: grid; place-items: center; }
.admin-box { width: 300px; background: #fff; border-radius: 8px; padding: 24px; text-align: center; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
.admin-title { font-size: 17px; font-weight: 600; margin-bottom: 18px; color: #2c3e46; }
.admin-box input { width: 100%; padding: 8px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; margin-bottom: 10px; }
.admin-box .btn { margin: 4px; font-size: 12px; }
.admin-on { font-size: 13px; color: #3c8a5c; margin-bottom: 14px; }

.float-msg { position: absolute; right: 18px; bottom: 44px; z-index: 700; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.float-msg-toggle { border: 0; background: #2f6f8f; color: #fff; border-radius: 18px; padding: 8px 16px; font-size: 12px; box-shadow: 0 6px 18px rgba(0,0,0,.25); }
.float-msg-toggle span { margin-left: 6px; }
.float-msg-panel { width: 300px; height: 380px; background: #fff; border: 1px solid #d5dcdb; border-radius: 8px; overflow: hidden; box-shadow: 0 12px 32px rgba(0,0,0,.3); }

.footer { flex: 0 0 36px; text-align: center; font-size: 11px; color: #9aa7ab; padding: 10px; border-top: 1px solid #dce3e3; background: #fff; }
</style>
