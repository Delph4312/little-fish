<script setup>
import { ref, watch, computed } from 'vue'
import { images } from '@/data/images'

const props = defineProps({
  conv: { type: Object, default: null },
  convId: { type: String, default: '' },
  convName: { type: String, default: '' }
})

// 本地消息副本：切换会话时重置，发送消息时追加（真实感）
const messages = ref([])
watch(
  () => props.conv,
  (c) => {
    if (!c) { messages.value = []; return }
    if (props.convId === 'teacher') {
      // 老师会话：初始只显示时间分隔 + 第一条问候语，其余靠交互逐条产生
      messages.value = c.messages.slice(0, 2).map((m) => ({ ...m }))
    } else {
      messages.value = c.messages.map((m) => ({ ...m }))
    }
    initTeacher()
  },
  { immediate: true }
)

const draft = ref('')
function isTime(m) { return !!m.t }

// 根据会话名/群成员名映射到头像图片
const avatarMap = {
  '谢遥': images.avatar.xieyao,
  '姐姐': images.avatar.sister,
  '谢晴': images.avatar.sister,
  '爸爸': images.avatar.dad,
  '妈妈': images.avatar.mom,
  '小岛老师': images.avatar.teacher,
  '鲸鱼先生': images.avatar.whale,
  '班主任': images.avatar.headTeacher,
  '同学A': images.avatar.classmateA,
  '同学B': images.avatar.classmateB
}
function avatarOf(m) {
  if (m.from === 'me') return images.avatar.xieyao
  if (m.fromName) return avatarMap[m.fromName] || null
  return avatarMap[props.convName] || null
}
function avatarTextOf(m) {
  if (m.from === 'me') return '遥'
  return m.fromName ? m.fromName.slice(0, 1) : props.convName.slice(0, 1)
}

// 图片消息映射：把 caption 映射到真实图片素材
const imageMap = {
  '一盘土豆丝': images.moments.potato,
  '土豆丝': images.moments.potato
}
function imageUrl(m) { return (m.type === 'image' && imageMap[m.caption]) || null }

// ===== 小岛老师会话：点击输入框自动填台词 → 发送 → 老师逐条回复 =====
const isTeacher = computed(() => props.convId === 'teacher')

// 完整剧本（按用户给定顺序）：老师先发问候，玩家依次发 2 条文字 + 1 张截图，老师按字数逐条回复
const TEACHER_GREETING = '你好。你说你们遇到了困难，能跟我详细说说吗？'
const PLAYER_LINES = [
  '你好。我是用我朋友的弟弟的账号登录的。他昨天给我朋友发了奇怪的消息，然后就失踪了。',
  '我们找到了浅湾论坛，怀疑他被鲸鱼先生引导，准备杀死仇人后自杀。'
]
const TEACHER_REPLIES = [
  '你找到我，说明你已经看到论坛里那些东西了。',
  '鲸鱼先生不会帮自杀者做具体的决定和计划，所以你朋友的弟弟一定是自己完成的策划。',
  '你们要找出谢遥的计划，他可能在电脑或论坛里留下过痕迹。',
  '如果遇到卡住的地方，可以来问我。'
]
// 老师会话初始只显示问候语，玩家发言与老师后续回复靠交互逐条产生
function initTeacher() {
  teacherStep.value = 0
  teacherPhase.value = 'player'
  replyQueue.value = []
}
const teacherStep = ref(0)        // 玩家已发送的文字条数（0..2，第3条为截图）
const teacherPhase = ref('player') // player | replying | done
const replyQueue = ref([])
const teacherTyping = ref(false)

// 按字数估算回复延时：约每字 90ms，至少 900ms（内容越长等待越久）
function replyDelay(text) { return Math.max(900, text.length * 90) }

function scrollBottom() {
  requestAnimationFrame(() => {
    const box = document.getElementById('chat-messages')
    if (box) box.scrollTop = box.scrollHeight
  })
}

// 点击输入框：自动填入当前台词（第3步为截图，点击即发送截图）
function fillTeacherLine() {
  if (!isTeacher.value || teacherPhase.value !== 'player') return
  if (teacherStep.value >= PLAYER_LINES.length) {
    // 第三条：发送开篇截图
    sendScreenshot()
    return
  }
  draft.value = PLAYER_LINES[teacherStep.value]
}

function send() {
  const text = draft.value.trim()
  if (!text || !props.conv) return
  if (isTeacher.value && teacherPhase.value !== 'player') return
  messages.value.push({ from: 'me', type: 'text', text })
  draft.value = ''
  scrollBottom()

  if (isTeacher.value) {
    teacherStep.value += 1
    // 两条文字发完后，等待玩家发送截图（第三步）
    if (teacherStep.value >= PLAYER_LINES.length) {
      // 已发完文字，下一步由 fillTeacherLine 触发截图
    }
  }
}

// 玩家发送截图（开篇谢遥给谢晴的消息），之后老师开始按字数逐条回复
function sendScreenshot() {
  if (!props.conv) return
  if (isTeacher.value) {
    if (teacherPhase.value !== 'player' || teacherStep.value < PLAYER_LINES.length) return
    teacherPhase.value = 'replying'
  }
  messages.value.push({ from: 'me', type: 'screenshot', text: '[图片]' })
  scrollBottom()
  if (isTeacher.value) startTeacherReplies()
}

function startTeacherReplies() {
  replyQueue.value = [...TEACHER_REPLIES]
  const next = () => {
    if (!replyQueue.value.length) {
      teacherPhase.value = 'done'
      teacherTyping.value = false
      return
    }
    const text = replyQueue.value.shift()
    teacherTyping.value = true
    scrollBottom()
    setTimeout(() => {
      messages.value.push({ from: 'other', type: 'text', text })
      teacherTyping.value = false
      scrollBottom()
      if (replyQueue.value.length) setTimeout(next, 320)
      else teacherPhase.value = 'done'
    }, replyDelay(text))
  }
  setTimeout(next, 500)
}

// 普通会话里也能手动发截图（非老师会话）
function onAttachClick() {
  if (isTeacher.value) {
    fillTeacherLine()
    return
  }
  sendScreenshot()
}
</script>

<template>
  <div class="chat-window">
    <div class="chat-head">{{ convName }}</div>
    <div class="messages" id="chat-messages" v-if="conv">
      <template v-for="(m, i) in messages" :key="i">
        <div v-if="isTime(m)" class="time-sep">{{ m.t }}</div>
        <div v-else class="msg-row" :class="m.from === 'me' ? 'mine' : 'theirs'">
          <div class="msg-avatar" v-lazy-bg="avatarOf(m) || ''">{{ avatarOf(m) ? '' : avatarTextOf(m) }}</div>
          <div class="bubble-wrap">
            <div class="sender" v-if="m.fromName">{{ m.fromName }}</div>
            <div class="bubble" :class="{ transfer: m.type === 'transfer', image: m.type === 'image' || m.type === 'screenshot' }">
              <template v-if="m.type === 'transfer'">💰 {{ m.text }}</template>
              <template v-else-if="m.type === 'screenshot'">
                <div class="wx-shot">
                  <div class="shot-head">遥遥</div>
                  <div class="shot-row right"><span class="shot-av" v-lazy-bg="images.avatar.xieyao"></span><span class="shot-bub">姐姐，不要来找我，也不要为我担心。我不是一个好弟弟。你以后要照顾好自己。</span></div>
                </div>
              </template>
              <template v-else-if="m.type === 'image'">
                <div v-if="imageUrl(m)" class="img-photo" :style="{ backgroundImage: `url(${imageUrl(m)})`, backgroundSize: 'cover', backgroundPosition: 'center' }"></div>
                <div v-else class="img-photo">{{ m.caption || '图片' }}</div>
              </template>
              <template v-else>{{ m.text }}</template>
            </div>
          </div>
        </div>
      </template>
      <div v-if="teacherTyping" class="msg-row theirs">
        <div class="msg-avatar" v-lazy-bg="images.avatar.teacher"></div>
        <div class="bubble typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      </div>
      <div v-if="!messages.length" class="empty">暂无消息</div>
    </div>
    <div class="chat-empty" v-else>
      <div class="ce-logo">💬</div>
      <p>选择一个联系人开始聊天</p>
    </div>
    <div class="chat-input" v-if="conv">
      <div class="toolbar">
        <span>😊</span>
        <span @click="onAttachClick" class="tool-btn" title="发送图片">📎</span>
        <span>✂️</span>
      </div>
      <textarea
        v-model="draft"
        :placeholder="isTeacher && teacherPhase === 'player' && teacherStep < PLAYER_LINES.length + 1 ? '点击输入框填写内容' : ''"
        @click="fillTeacherLine"
        @keydown.enter.exact.prevent="send"
      ></textarea>
      <div class="send-row"><span>按 Enter 发送</span><button class="btn" @click="send">发送(S)</button></div>
    </div>
  </div>
</template>

<style scoped>
.chat-window { display: flex; flex-direction: column; height: 100%; background: #f5f7f6; }
.chat-head { height: 48px; flex: 0 0 48px; display: flex; align-items: center; padding: 0 20px; border-bottom: 1px solid #e2e7e6; background: #f9fbfa; font-size: 14px; font-weight: 500; }
.messages { flex: 1; overflow: auto; padding: 18px 22px; }
.time-sep { text-align: center; font-size: 11px; color: #a5b0b3; margin: 14px 0; }
.msg-row { display: flex; gap: 10px; margin: 10px 0; align-items: flex-start; }
.msg-row.mine { flex-direction: row-reverse; }
.msg-avatar { width: 34px; height: 34px; flex: 0 0 34px; border-radius: 4px; background: #d7e4dd; color: #46685a; display: grid; place-items: center; font-size: 13px; background-size: cover; background-position: center; }
.mine .msg-avatar { background-color: #cfe0d6; }
.bubble-wrap { max-width: 66%; }
.sender { font-size: 11px; color: #8c9a9e; margin-bottom: 3px; }
.bubble { display: inline-block; background: #fff; border: 1px solid #e3e9e8; border-radius: 6px; padding: 9px 12px; font-size: 13px; line-height: 1.65; color: #1c2429; word-break: break-word; white-space: pre-wrap; }
.mine .bubble { background: #d9eddf; border-color: #c7e3d1; }
.bubble.transfer { background: #fde9d6; border-color: #f4d5b4; }
.bubble.image { padding: 4px; background: #fff; }
.img-photo { width: 170px; height: 128px; border-radius: 4px; background-color: #d9e2df; display: grid; place-items: center; font-size: 11px; color: #48616b; }
/* 开篇微信消息截图：手机端聊天界面，保留消息完整内容 */
.wx-shot { width: 250px; background: #ededed; border-radius: 4px; padding: 10px; font-size: 11px; color: #222; }
.shot-head { text-align: center; color: #444; padding-bottom: 7px; border-bottom: 1px solid #dcdcdc; margin-bottom: 8px; font-size: 11px; }
.shot-row { display: flex; align-items: flex-start; gap: 6px; margin: 6px 0; }
.shot-row.right { flex-direction: row-reverse; }
.shot-av { width: 20px; height: 20px; flex: 0 0 20px; border-radius: 3px; background: #cfe0d6; display: grid; place-items: center; }
.shot-bub { max-width: 205px; background: #fff; border-radius: 4px; padding: 6px 8px; line-height: 1.55; word-break: break-word; text-align: left; }
.shot-row.right .shot-bub { background: #95ec69; }
.typing { display: inline-flex; gap: 4px; align-items: center; padding: 12px; }
.typing .dot { width: 5px; height: 5px; border-radius: 50%; background: #9aa7ab; animation: blink 1s infinite; }
.typing .dot:nth-child(2) { animation-delay: .15s; }
.typing .dot:nth-child(3) { animation-delay: .3s; }
@keyframes blink { 0%,60%,100% { opacity: .25; } 30% { opacity: 1; } }
.empty { text-align: center; color: #9aa7ab; margin-top: 60px; font-size: 13px; }
.chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #b5c0c3; }
.chat-empty .ce-logo { font-size: 46px; opacity: .5; }
.chat-empty p { font-size: 13px; }
.chat-input { flex: 0 0 138px; border-top: 1px solid #e2e7e6; display: flex; flex-direction: column; background: #fafcfb; }
.toolbar { padding: 6px 16px 0; font-size: 14px; color: #7d8b8f; letter-spacing: 8px; }
.tool-btn { cursor: pointer; }
.tool-btn:hover { color: #2f6f8f; }
.chat-input textarea { flex: 1; border: 0; outline: none; resize: none; padding: 6px 16px; font-size: 13px; background: transparent; }
.send-row { display: flex; justify-content: space-between; align-items: center; padding: 0 16px 8px; }
.send-row span { font-size: 10px; color: #a5b0b3; }
.send-row .btn { padding: 4px 12px; font-size: 12px; }
</style>
