<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { posts, hiddenPosts, users, profilePosts, whaleDialogue, searchPosts } from '@/data/forumData'
import { useGameStore } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'
import ForumPost from './ForumPost.vue'
import UserProfile from './UserProfile.vue'
import PrivateDiary from './PrivateDiary.vue'
import DriftBottle from './DriftBottle.vue'
import AdminMode from './AdminMode.vue'
import Messages from './Messages.vue'
import NewPost from './NewPost.vue'

const game = useGameStore()
const system = useSystemStore()
const view = ref('home')
const currentPost = ref(null)
const profileUser = ref(null)
let whaleTimer

const visiblePosts = computed(() => {
  const base = game.adminMode ? [...posts, ...hiddenPosts, ...searchPosts] : [...posts]
  // 玩家自己发的帖始终可见
  return [...base, ...game.userPosts]
})

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
function enterAdmin() {
  game.toggleAdmin()
  view.value = 'admin'
}
function goto(v) {
  view.value = v
}

// 鲸鱼先生干扰：停留论坛过久弹话术（全局触发器的简化版）
onMounted(() => {
  whaleTimer = setInterval(() => {
    if (game.whaleTriggers.includes('forum-idle')) return
    const line = whaleDialogue.interruptions[0]
    system.notify({ from: '鲸鱼先生', text: line, type: 'whale', duration: 7000 })
    system.triggerGlitch(700)
    game.markWhaleTriggered('forum-idle')
  }, 60000)
})
onUnmounted(() => clearInterval(whaleTimer))
</script>

<template>
  <div class="forum">
    <div class="forum-head">
      <div class="brand">浅湾 <span>QIANWAN FORUM</span></div>
      <div class="nav">
        <span @click="goto('home')">首页</span>
        <span @click="goto('bottle')">漂流瓶</span>
        <span @click="goto('messages')">私信</span>
        <span @click="openProfile(users.xieyao)">我的主页</span>
        <span @click="openProfile(users.teacher)">小岛老师</span>
        <span @click="openProfile(users.whale)">鲸鱼先生</span>
      </div>
      <div class="head-right">
        <button class="btn post-btn" @click="goto('newpost')">✎ 发帖</button>
        <button class="btn" @click="goto('admin')">{{ game.adminMode ? '管理员模式 · 开' : '管理员模式' }}</button>
      </div>
    </div>

    <div class="forum-body">
      <template v-if="view === 'home'">
        <div class="welcome" v-if="!game.adminMode">
          <b>这里没有唠叨，没有不解，没有"你只是想太多"。</b>
          <span>如果你累了，就靠岸。这里的水不深。</span>
        </div>
        <div class="hidden-banner" v-else>
          🔓 管理员模式已开启 · 隐藏帖子已显示
        </div>
        <div class="post-list">
          <div v-for="p in visiblePosts" :key="p.id" class="post-row" @click="openPost(p)">
            <div class="p-avatar">{{ p.author.slice(0,1) }}</div>
            <div class="p-main">
              <div class="p-title">{{ p.title }} <span class="section">[{{ p.section }}]</span></div>
              <div class="p-summary">{{ p.content[0] }}</div>
              <div class="p-meta">{{ p.author }} · {{ p.time }} · 回复 {{ p.replies }} · 赞 {{ p.likes }}</div>
            </div>
          </div>
        </div>
      </template>

      <ForumPost v-else-if="view === 'post'" :post="currentPost" @back="goto('home')" />
      <UserProfile v-else-if="view === 'profile'" :user="profileUser" :posts="profilePostsForUser" @open-post="openPost" @open-diary="goto('diary')" />
      <PrivateDiary v-else-if="view === 'diary'" @back="goto('profile')" />
      <DriftBottle v-else-if="view === 'bottle'" />
      <AdminMode v-else-if="view === 'admin'" @back="goto('home')" />
      <Messages v-else-if="view === 'messages'" />
      <NewPost v-else-if="view === 'newpost'" @back="goto('home')" @published="goto('home')" />
    </div>
  </div>
</template>

<style scoped>
.forum { height: 100%; display: flex; flex-direction: column; background: #f0f3f4; }
.forum-head { height: 52px; flex: 0 0 52px; display: flex; align-items: center; gap: 20px; padding: 0 18px; background: #16323f; color: #dce8ec; }
.brand { font-size: 17px; font-weight: 600; color: #eaf2f4; white-space: nowrap; }
.brand span { font-size: 9px; letter-spacing: 1px; color: #7fa6b6; margin-left: 6px; }
.nav { display: flex; gap: 16px; flex: 1; }
.nav span { font-size: 12px; cursor: pointer; color: #b9cdd4; }
.nav span:hover { color: #fff; }
.head-right { display: flex; gap: 6px; }
.head-right .btn { background: rgba(255,255,255,.1); color: #eaf2f4; border-color: rgba(255,255,255,.25); font-size: 11px; padding: 5px 10px; }
.head-right .post-btn { background: #2f6f8f; border-color: #2f6f8f; }
.forum-body { flex: 1; overflow: auto; }
.welcome { margin: 16px 18px; padding: 16px 18px; background: linear-gradient(120deg, #e8f0f1, #dce8e6); border-left: 3px solid #2f6f8f; border-radius: 4px; display: flex; flex-direction: column; gap: 6px; }
.welcome b { font-size: 13px; font-weight: 500; color: #244b5d; }
.welcome span { font-size: 12px; color: #5b7b86; }
.hidden-banner { margin: 16px 18px; padding: 10px 16px; background: #f7eaea; border-left: 3px solid #a33; border-radius: 4px; font-size: 12px; color: #8e2b2b; }
.post-list { padding: 0 18px 20px; }
.post-row { display: flex; gap: 12px; background: #fff; border: 1px solid #e2e7e6; border-radius: 5px; padding: 14px 16px; margin-bottom: 10px; cursor: pointer; }
.post-row:hover { border-color: #b9ced4; }
.p-avatar { width: 34px; height: 34px; flex: 0 0 34px; border-radius: 4px; background: #dce8e6; color: #3c6472; display: grid; place-items: center; font-size: 14px; }
.p-main { flex: 1; min-width: 0; }
.p-title { font-size: 14px; font-weight: 500; margin-bottom: 5px; }
.section { font-size: 11px; color: #9aa7ab; font-weight: 400; }
.p-summary { font-size: 12px; color: #6b7b82; line-height: 1.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p-meta { font-size: 11px; color: #a5b0b3; margin-top: 8px; }
</style>
