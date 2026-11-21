<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { posts, hiddenPosts, users, profilePosts, whaleDialogue, searchPosts } from '@/data/forumData'
import { ANSWERS, useGameStore } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'
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
const pageSize = 5
let whaleTimer

const sections = ['全部', '闲聊', '求助', '生活', '公告']

// 登录弹窗
const showLogin = ref(false)
const loginPwd = ref('')
const loginErr = ref(false)
function doForumLogin() {
  if (loginPwd.value.trim() === ANSWERS.wechat) {
    game.forumLoggedIn = true
    game.wechatLoggedIn = true
    game.addClue('forum-login')
    showLogin.value = false
    loginErr.value = false
    system.notify({ from: '浅湾论坛', text: '登录成功。私信已开启。' })
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
    system.notify({ from: '系统', text: '管理员模式已开启，隐藏帖子现在可见。' })
  } else {
    adminErr.value = true
    setTimeout(() => (adminErr.value = false), 1500)
  }
}
function exitAdmin() {
  game.adminMode = false
  system.notify({ from: '系统', text: '已退出管理员模式。' })
}

const visiblePosts = computed(() => {
  const base = game.adminMode ? [...posts, ...hiddenPosts, ...searchPosts] : [...posts]
  const all = [...base, ...game.userPosts]
  const filtered = activeSection.value === '全部' ? all : all.filter((p) => p.section === activeSection.value)
  return filtered
})
const pagedPosts = computed(() => visiblePosts.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const totalPages = computed(() => Math.max(1, Math.ceil(visiblePosts.value.length / pageSize)))

// 热度榜：按回复数排序取前 5
const hotList = computed(() =>
  [...posts].sort((a, b) => b.replies - a.replies).slice(0, 5)
)

const profilePostsForUser = computed(() => {
  if (!profileUser.value) return []
  if (profileUser.value.id === 'whale') return profilePosts.whale
  if (profileUser.value.id === 'teacher') return profilePosts.teacher
  return []
})

function openPost(post) {
  currentPost.value = post
  view.value = 'post'
}
function openProfile(user) {
  profileUser.value = user
  view.value = 'profile'
}
function openProfileByName(name) {
  if (name === '小岛老师') openProfile(users.teacher)
  else if (name === '鲸鱼先生') openProfile(users.whale)
  else if (name === '谢遥') openProfile(users.xieyao)
}
function goHome() {
  view.value = 'home'
  activeSection.value = '全部'
  page.value = 1
}
function selectSection(s) {
  activeSection.value = s
  page.value = 1
  view.value = 'home'
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
  <div class="forum">
    <!-- Banner -->
    <div class="banner" @click="goHome">
      <div class="banner-title">浅湾</div>
      <div class="banner-sub">QIAN WAN · 靠岸的地方</div>
    </div>
    <!-- 顶部：左上角标题可回首页；右上角登录 -->
    <div class="topbar">
      <div class="brand" @click="goHome">浅湾论坛</div>
      <div class="top-right">
        <template v-if="!game.forumLoggedIn">
          <button class="login-btn" @click="showLogin = !showLogin">登录</button>
          <div v-if="showLogin" class="login-pop">
            <div class="lp-title">论坛登录</div>
            <input v-model="loginPwd" type="password" placeholder="输入微信密码" @keyup.enter="doForumLogin" />
            <div v-if="loginErr" class="lp-err">密码不正确</div>
            <button class="btn btn-primary" @click="doForumLogin">登录</button>
          </div>
        </template>
        <div v-else class="user-chip" @click="openProfile(users.xieyao)">
          <span class="uc-av">遥</span> 谢遥 ▾
        </div>
      </div>
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
    <div class="forum-body">
      <template v-if="view === 'home'">
        <div class="home-layout">
          <!-- 帖子列表（两侧留白） -->
          <main class="post-area">
            <div class="welcome" v-if="!game.adminMode">
              <b>这里没有唠叨，没有不解，没有"你只是想太多"。</b>
              <span>如果你累了，就靠岸。这里的水不深。</span>
            </div>
            <div class="hidden-banner" v-else>🔓 管理员模式已开启 · 隐藏帖子已显示</div>

            <div class="post-list">
              <div v-for="p in pagedPosts" :key="p.id" class="post-row" @click="openPost(p)">
                <div class="p-main">
                  <div class="p-title">{{ p.title }}</div>
                  <div class="p-summary">{{ p.content[0] }}</div>
                  <div class="p-meta">{{ p.author }} · {{ p.time }} · 回复 {{ p.replies }} · 赞 {{ p.likes }}</div>
                </div>
              </div>
              <div v-if="!pagedPosts.length" class="empty">该板块暂时没有帖子。</div>
            </div>

            <!-- 分页 -->
            <div class="pager">
              <button :disabled="page <= 1" @click="page--">‹ 上一页</button>
              <span
                v-for="n in totalPages"
                :key="n"
                :class="{ cur: page === n }"
                @click="page = n"
              >{{ n }}</span>
              <button :disabled="page >= totalPages" @click="page++">下一页 ›</button>
            </div>
          </main>

          <!-- 右侧栏 -->
          <aside class="side-panel">
            <!-- 快捷入口 -->
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
            <!-- 热度榜 -->
            <div class="side-card">
              <div class="side-card-title">🔥 热度榜</div>
              <div v-for="(p, i) in hotList" :key="p.id" class="hot-row" @click="openPost(p)">
                <span class="rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
                <span class="hot-title">{{ p.title }}</span>
                <span class="hot-replies">{{ p.replies }}</span>
              </div>
            </div>
            <!-- 私信（登录后，可收起） -->
            <div class="side-card msg-card" v-if="game.forumLoggedIn">
              <div class="side-card-title" @click="game.forumMsgsOpen = !game.forumMsgsOpen">
                私信 <span class="fold">{{ game.forumMsgsOpen ? '收起 ▴' : '展开 ▾' }}</span>
              </div>
              <div v-show="game.forumMsgsOpen" class="msg-slot"><Messages /></div>
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

    <!-- 管理员模式弹窗：仅标题 + 密码框 + 确定 / 已开启后标题 + 退出 -->
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

    <!-- 页脚 -->
    <div class="footer">浅湾论坛 · 让人人都有靠岸的地方 · © 2026 Qianwan</div>
  </div>
</template>

<style scoped>
.forum { height: 100%; display: flex; flex-direction: column; background: #eef1f2; overflow: auto; }
.banner { height: 120px; flex: 0 0 120px; background: linear-gradient(120deg, #12313e 0%, #2b5f6b 50%, #c9a27e 120%); display: grid; place-items: center; position: relative; cursor: pointer; overflow: hidden; }
.banner::after { content:""; position:absolute; inset:0; background: repeating-linear-gradient(90deg, transparent 0 40px, rgba(255,255,255,.03) 40px 41px); }
.banner-title { font-size: 44px; font-weight: 700; letter-spacing: 12px; color: #f3ede0; text-shadow: 0 2px 16px rgba(0,0,0,.4), 0 0 26px rgba(201,162,126,.4); font-family: "STKaiti","KaiTi",serif; }
.banner-sub { position: absolute; bottom: 12px; font-size: 10px; letter-spacing: 3px; color: rgba(243,237,224,.6); }
.topbar { height: 44px; flex: 0 0 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 22px; background: #fff; border-bottom: 1px solid #e2e7e6; }
.brand { font-size: 15px; font-weight: 600; color: #2f6f8f; cursor: pointer; }
.top-right { position: relative; }
.login-btn { border: 1px solid #2f6f8f; background: #fff; color: #2f6f8f; padding: 5px 16px; border-radius: 16px; font-size: 12px; }
.login-btn:hover { background: #2f6f8f; color: #fff; }
.login-pop { position: absolute; right: 0; top: 34px; z-index: 60; width: 220px; background: #fff; border: 1px solid #d5dcdb; border-radius: 6px; box-shadow: 0 8px 20px rgba(0,0,0,.15); padding: 14px; text-align: center; }
.lp-title { font-size: 13px; margin-bottom: 10px; }
.login-pop input { width: 100%; padding: 7px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; margin-bottom: 8px; }
.lp-err { color: #b23b3b; font-size: 11px; margin-bottom: 6px; }
.user-chip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #4a5b62; cursor: pointer; }
.uc-av { width: 26px; height: 26px; border-radius: 50%; background: #d7e4dd; color: #46685a; display: grid; place-items: center; font-size: 12px; }
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
.post-area { flex: 1; min-width: 0; }
.side-panel { width: 280px; flex: 0 0 280px; display: flex; flex-direction: column; gap: 14px; }
.welcome { margin-bottom: 14px; padding: 14px 16px; background: linear-gradient(120deg, #e8f0f1, #dce8e6); border-left: 3px solid #2f6f8f; border-radius: 4px; display: flex; flex-direction: column; gap: 6px; }
.welcome b { font-size: 13px; font-weight: 500; color: #244b5d; }
.welcome span { font-size: 12px; color: #5b7b86; }
.hidden-banner { margin-bottom: 14px; padding: 10px 16px; background: #f7eaea; border-left: 3px solid #a33; border-radius: 4px; font-size: 12px; color: #8e2b2b; }
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
.pager button:disabled { opacity: .45; cursor: default; }
.side-card { background: #fff; border: 1px solid #e2e7e6; border-radius: 6px; padding: 14px; }
.side-card-title { font-size: 13px; font-weight: 600; color: #2c3e46; margin-bottom: 12px; }
.quick-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.quick { display: flex; align-items: center; gap: 6px; padding: 10px; background: #f2f5f4; border-radius: 5px; font-size: 12px; cursor: pointer; }
.quick:hover { background: #e1ecef; }
.qc { font-size: 16px; }
.hot-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f3f3; font-size: 12px; cursor: pointer; }
.rank { width: 18px; text-align: center; color: #9aa7ab; }
.rank.top { color: #b23b3b; font-weight: 600; }
.hot-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #4a5b62; }
.hot-replies { color: #a5b0b3; font-size: 11px; }
.msg-card .side-card-title { cursor: pointer; display: flex; justify-content: space-between; }
.fold { font-size: 11px; color: #9aa7ab; font-weight: 400; }
.msg-slot { height: 300px; overflow: hidden; }
.admin-mask { position: fixed; inset: 0; z-index: 90000; background: rgba(10,22,28,.5); display: grid; place-items: center; }
.admin-box { width: 300px; background: #fff; border-radius: 8px; padding: 24px; text-align: center; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
.admin-title { font-size: 17px; font-weight: 600; margin-bottom: 18px; color: #2c3e46; }
.admin-box input { width: 100%; padding: 8px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; margin-bottom: 10px; }
.admin-box .btn { margin: 4px; font-size: 12px; }
.admin-on { font-size: 13px; color: #3c8a5c; margin-bottom: 14px; }
.footer { flex: 0 0 36px; text-align: center; font-size: 11px; color: #9aa7ab; padding: 10px; border-top: 1px solid #dce3e3; background: #fff; }
</style>
