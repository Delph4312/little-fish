<script setup>
import { ref, computed } from 'vue'
import {
  wechatSidebar, conversationList, conversations, moments, momentsCover,
  teacherHints, favorites, wechatAccount, contactApplication
} from '@/data/wechatData'
import { useGameStore, ANSWERS } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'
import { images } from '@/data/images'
import ChatWindow from './ChatWindow.vue'
import Moments from './Moments.vue'
import Favorites from './Favorites.vue'
import Contacts from './Contacts.vue'

const game = useGameStore()
const system = useSystemStore()
const activeNav = ref('聊天')
const activeConv = ref(null) // 刚进入时不选中任何会话（姐姐对话需玩家主动点开）
const loggedIn = ref(false)
const password = ref('')
const loginError = ref(false)
const showHint = ref(false)
const hintText = ref('')
const searchText = ref('')

const conv = computed(() => conversations[activeConv.value])
function avatarStyle(c) {
  const key = c.avatarKey
  const url = key && images.avatar[key]
  return url ? { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
}

// 会话列表：小岛老师需先搜索添加才显示
const visibleConversations = computed(() =>
  conversationList.filter((c) => !c.hidden || game.teacherAdded)
)

// 红点：已读会话归零
function unreadOf(c) {
  return game.wechatReadConvs.includes(c.id) ? 0 : c.unread
}
const totalUnread = computed(() => visibleConversations.value.reduce((s, c) => s + unreadOf(c), 0))

function doLogin() {
  if (password.value.trim() !== ANSWERS.wechat) {
    loginError.value = true
    setTimeout(() => (loginError.value = false), 1600)
    return
  }
  loggedIn.value = true
  game.wechatLoggedIn = true
  game.addClue('wechat-favorites')
  // 不再弹登录系统提示
}

function openConv(id) {
  activeConv.value = id
  activeNav.value = '聊天'
  game.markConvRead(id)
  if (id === 'teacher') {
    showHint.value = true
    hintText.value = teacherHints.beforeAdmin[0]
  }
}

function navTo(item) {
  activeNav.value = item
}

// 搜索微信号：命中风前屿则弹出个人信息/好友申请窗口
const showApply = ref(false)
const remark = ref('')
function doSearch() {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return
  if ((q === contactApplication.wechatId.toLowerCase() || q.includes('风前屿')) && !game.teacherAdded) {
    remark.value = ''
    showApply.value = true
    searchText.value = ''
  } else {
    system.notify({ from: '微信', text: '没有找到相关用户。' })
  }
}
function fillRemark() {
  remark.value = contactApplication.remark
}
function submitApply() {
  game.teacherAdded = true
  showApply.value = false
  activeConv.value = 'teacher'
  activeNav.value = '聊天'
  game.markConvRead('teacher')
  system.notify({ from: '微信', text: '已添加「风前屿」为好友，你们开始聊天了。' })
}

// 插件发放：当玩家看过论坛、进过管理员模式、解开了日记计划后，小岛老师发来插件
const pluginReady = computed(() => game.forumVisited && game.adminMode && game.planUnlocked)
const showPluginCard = computed(() => activeConv.value === 'teacher' && pluginReady.value)

function installPlugin() {
  game.pluginGot = true
  game.pluginInstalled = true
  system.notify({ from: '小岛老师', text: '插件装好了。鲸鱼先生动手的时候，点右下角的「使用插件」。' })
}

function usePlugin() {
  game.pluginGot = true
  game.pluginUsed = true
}
</script>

<template>
  <div class="wechat" v-if="loggedIn">
    <aside class="rail">
      <div class="me">
        <div class="avatar">{{ wechatAccount.avatarText }}</div>
      </div>
      <div class="rail-icons">
        <button
          v-for="item in wechatSidebar"
          :key="item"
          :class="{ active: activeNav === item }"
          :title="item"
          @click="navTo(item)"
        >
          <span class="dot" v-if="item === '聊天' && totalUnread > 0"></span>
          {{ item.slice(0, 2) }}
        </button>
      </div>
      <div class="rail-bottom">⚙</div>
    </aside>

    <section class="list-pane">
      <template v-if="activeNav === '聊天'">
        <div class="search-box">
          <input v-model="searchText" placeholder="搜索微信号" @keyup.enter="doSearch" />
          <button @click="doSearch">搜索</button>
        </div>
        <div class="conv-list">
          <div
            v-for="c in visibleConversations"
            :key="c.id"
            class="conv"
            :class="{ active: activeConv === c.id }"
            @click="openConv(c.id)"
          >
            <div class="conv-avatar" :style="avatarStyle(c)">{{ c.avatarKey ? '' : c.avatarText }}</div>
            <div class="conv-main">
              <div class="conv-top">
                <span class="conv-name">{{ c.name }}</span>
                <span class="conv-time">{{ c.time }}</span>
              </div>
              <div class="conv-preview">{{ c.preview }}</div>
            </div>
            <span class="badge" v-if="unreadOf(c)">{{ unreadOf(c) }}</span>
          </div>
        </div>
      </template>
      <template v-else-if="activeNav === '通讯录'">
        <Contacts @add-teacher="game.teacherAdded = true" />
      </template>
      <div v-else class="pane-title">{{ activeNav }}</div>
    </section>

    <main class="chat-pane">
      <ChatWindow v-if="activeNav === '聊天'" :conv="conv" :conv-name="conv ? conv.name : ''" />
      <Moments v-else-if="activeNav === '朋友圈'" :moments="moments" :cover="momentsCover" />
      <Favorites v-else-if="activeNav === '收藏'" :items="favorites" />
      <div v-else class="placeholder">{{ activeNav }}（占位）</div>
    </main>

    <!-- 小岛老师发来的插件 -->
    <div v-if="showPluginCard" class="plugin-card">
      <div class="pc-icon">🧩</div>
      <div class="pc-body">
        <div class="pc-title">连接保全程序.zip</div>
        <div class="pc-desc">小岛老师：装好它，等鲸鱼先生切断论坛时用。</div>
        <div class="pc-actions">
          <button v-if="!game.pluginInstalled" class="btn btn-primary" @click="installPlugin">安装插件</button>
          <button v-else class="btn use" @click="usePlugin">▶ 使用插件</button>
        </div>
      </div>
    </div>

    <div v-if="showHint" class="hint-toast" @click="showHint = false">
      <b>小岛老师：</b>{{ hintText }} <span>×点击关闭</span>
    </div>

    <!-- 添加风前屿：个人信息 / 好友申请窗口 -->
    <div v-if="showApply" class="apply-mask" @click.self="showApply = false">
      <div class="apply-card">
        <div class="apply-title">个人信息</div>
        <div class="apply-avatar">屿</div>
        <div class="apply-rows">
          <div class="apply-row"><span class="k">微信名</span><span class="v">{{ contactApplication.wechatName }}</span></div>
          <div class="apply-row"><span class="k">微信号</span><span class="v">{{ contactApplication.wechatId }}</span></div>
          <div class="apply-row clickable" @click="fillRemark"><span class="k">备注</span><span class="v" :class="{ filled: remark }">{{ remark || '点击此处填写备注' }}</span></div>
          <div class="apply-row"><span class="k">申请信息</span><span class="v msg">{{ contactApplication.message }}</span></div>
        </div>
        <div class="apply-actions">
          <button class="btn" @click="showApply = false">取消</button>
          <button class="btn btn-primary" @click="submitApply">添加</button>
        </div>
      </div>
    </div>
  </div>

  <div class="login" v-else>
    <div class="login-card">
      <div class="login-avatar" :style="{ backgroundImage: `url(${images.avatar.xieyao})` }"></div>
      <div class="login-name">遥</div>
      <input v-model="password" type="password" placeholder="请输入微信密码" @keyup.enter="doLogin" />
      <div v-if="loginError" class="login-err">密码不正确</div>
      <button class="btn btn-primary" @click="doLogin">进入</button>
    </div>
  </div>
</template>

<style scoped>
.wechat { display: flex; width: 100%; height: 100%; background: #f5f7f6; position: relative; }
.rail { width: 62px; background: #2b3236; display: flex; flex-direction: column; align-items: center; color: #cfd6d8; flex: 0 0 62px; }
.me { padding: 18px 0 12px; }
.me .avatar { width: 34px; height: 34px; border-radius: 4px; background: #cfe6d6; color: #2b5c3a; display: grid; place-items: center; font-size: 16px; }
.rail-icons { display: flex; flex-direction: column; gap: 6px; flex: 1; width: 100%; }
.rail-icons button { position: relative; border: 0; background: transparent; color: #9fb0b6; font-size: 11px; padding: 8px 0; width: 100%; }
.rail-icons button.active, .rail-icons button:hover { color: #fff; background: rgba(255,255,255,.08); }
.dot { position: absolute; top: 5px; right: 14px; width: 6px; height: 6px; border-radius: 50%; background: #e05353; }
.rail-bottom { padding: 12px; font-size: 16px; color: #9fb0b6; }
.list-pane { width: 258px; flex: 0 0 258px; background: #e9edec; border-right: 1px solid #d5dcdb; display: flex; flex-direction: column; }
.search-box { display: flex; gap: 4px; margin: 10px; }
.search-box input { flex: 1; min-width: 0; padding: 6px 8px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; }
.search-box button { border: 1px solid #c4cfd0; background: #fff; border-radius: 4px; font-size: 11px; padding: 0 8px; color: #4a5b62; }
.pane-title { padding: 16px; font-size: 14px; font-weight: 500; }
.conv-list { overflow: auto; flex: 1; }
.conv { display: flex; gap: 10px; padding: 11px 12px; cursor: pointer; align-items: center; position: relative; }
.conv:hover { background: #dfe5e4; }
.conv.active { background: #c9dcd6; }
.conv-avatar { width: 38px; height: 38px; border-radius: 4px; background: #d7e4dd; color: #46685a; display: grid; place-items: center; font-size: 15px; flex: 0 0 38px; }
.conv-main { flex: 1; min-width: 0; }
.conv-top { display: flex; justify-content: space-between; align-items: center; }
.conv-name { font-size: 13px; font-weight: 500; }
.conv-time { font-size: 10px; color: #9aa7ab; }
.conv-preview { font-size: 12px; color: #8c9a9e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; }
.badge { position: absolute; right: 10px; bottom: 12px; background: #e05353; color: #fff; font-size: 10px; border-radius: 9px; padding: 1px 6px; }
.chat-pane { flex: 1; min-width: 0; }
.placeholder { display: grid; place-items: center; height: 100%; color: #9aa7ab; }
.hint-toast { position: absolute; right: 16px; bottom: 16px; background: #fff; border: 1px solid #cdd8d8; border-radius: 6px; padding: 12px 30px 12px 14px; font-size: 12px; line-height: 1.6; max-width: 320px; box-shadow: 0 6px 18px rgba(0,0,0,.15); cursor: pointer; }
.hint-toast span { color: #9aa7ab; font-size: 10px; display: block; margin-top: 6px; }
.login { display: grid; place-items: center; height: 100%; background: linear-gradient(160deg, #eaf1ee, #dbe7e2); }
.login-card { text-align: center; background: #fff; padding: 30px 40px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.12); width: 320px; }
.login-avatar { width: 58px; height: 58px; border-radius: 8px; background-color: #cfe6d6; background-size: cover; background-position: center; margin: 0 auto 8px; }
.login-name { font-size: 15px; color: #2b3236; margin-bottom: 16px; }
.login-card h2 { margin: 0 0 6px; font-size: 18px; font-weight: 500; }
.login-card p { margin: 4px 0; font-size: 12px; }
.login-card .small { color: #b0bbbe; }
.login-card input { width: 100%; margin: 18px 0 12px; padding: 9px; border: 1px solid #d5dcdb; border-radius: 4px; text-align: center; }
.login-err { color: #b23b3b; font-size: 12px; margin-bottom: 10px; }
.plugin-card { position: absolute; right: 14px; bottom: 150px; width: 300px; display: flex; gap: 12px; background: #fff; border: 1px solid #c7d8d0; border-radius: 8px; padding: 14px; box-shadow: 0 8px 24px rgba(0,0,0,.2); z-index: 20; }
.pc-icon { width: 44px; height: 44px; flex: 0 0 44px; display: grid; place-items: center; background: #e3f0e8; border-radius: 6px; font-size: 22px; }
.pc-body { flex: 1; }
.pc-title { font-size: 13px; font-weight: 500; }
.pc-desc { font-size: 11px; color: #6b7b82; line-height: 1.6; margin: 6px 0 10px; }
.pc-actions .btn { padding: 5px 12px; font-size: 12px; }
.pc-actions .use { background: #8e2b2b; color: #fff; border-color: #8e2b2b; }
/* 添加好友申请窗口 */
.apply-mask { position: absolute; inset: 0; background: rgba(10,22,28,.45); display: grid; place-items: center; z-index: 80; }
.apply-card { width: 340px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,.35); text-align: center; }
.apply-title { padding: 12px; background: #2c3e46; color: #fff; font-size: 14px; }
.apply-avatar { width: 56px; height: 56px; border-radius: 8px; background: #dbe8e4; color: #46685a; display: grid; place-items: center; font-size: 24px; margin: 18px auto 12px; }
.apply-rows { padding: 0 18px 8px; }
.apply-row { display: flex; gap: 10px; padding: 9px 4px; border-bottom: 1px solid #eef1f0; font-size: 12px; text-align: left; }
.apply-row .k { width: 58px; flex: 0 0 58px; color: #9aa7ab; }
.apply-row .v { flex: 1; color: #39474d; word-break: break-all; }
.apply-row .v.msg { line-height: 1.6; color: #5b6b73; }
.apply-row.clickable { cursor: pointer; border-radius: 4px; }
.apply-row.clickable:hover { background: #f2f7f6; }
.apply-row .v.filled { color: #2f6f8f; font-weight: 500; }
.apply-actions { display: flex; gap: 8px; justify-content: flex-end; padding: 12px 18px 18px; }
.apply-actions .btn { font-size: 12px; padding: 6px 16px; }
</style>
