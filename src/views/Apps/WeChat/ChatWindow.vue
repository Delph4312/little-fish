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
    messages.value = c ? [...c.messages] : []
    teacherStep.value = 0
    teacherFilled.value = false
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

// ===== 小岛老师会话：点击输入框自动填写台词 → 发送 → 老师逐条回复 =====
const isTeacher = computed(() => props.convId === 'teacher')
// 玩家依次要说的话（点击输入框逐条填入）；文案为占位，可按剧情替换
const teacherPlayerLines = [
  '老师，我有点事想问你。',
  '那张截图是我发给姐姐的最后一条消息。',
  '如果我想找谢遥留下的计划，该从哪里看起？'
]
// 老师对应回复（每条玩家消息后逐条送达）
const teacherReplies = [
  '你说吧，我在。',
  '我看到了。先把能找到的线索都整理出来。',
  '别急，电脑和论坛里都可能留有痕迹，一处一处看。'
]
const teacherStep = ref(0)
const teacherFilled = ref(false)

// 点击输入框：自动填入当前台词
function fillTeacherLine() {
  if (!isTeacher.value || teacherStep.value >= teacherPlayerLines.length) return
  draft.value = teacherPlayerLines[teacherStep.value]
  teacherFilled.value = true
}

function scrollBottom() {
  requestAnimationFrame(() => {
    const box = document.getElementById('chat-messages')
    if (box) box.scrollTop = box.scrollHeight
  })
}

function send() {
  const text = draft.value.trim()
  if (!text || !props.conv) return
  const replyIndex = teacherStep
  messages.value.push({ from: 'me', type: 'text', text })
  draft.value = ''
  teacherFilled.value = false
  scrollBottom()

  // 老师会话：发送后逐条回复；其余会话保持原样
  if (isTeacher.value && replyIndex < teacherReplies.length) {
    teacherStep.value += 1
    setTimeout(() => {
      messages.value.push({ from: 'other', type: 'text', text: teacherReplies[replyIndex] })
      scrollBottom()
    }, 700)
  }
}

// 玩家发送一张图片消息（开篇微信消息截图）
function sendScreenshot() {
  if (!props.conv) return
  messages.value.push({ from: 'me', type: 'screenshot', text: '[图片]', caption: '开篇谢遥发送给谢晴的微信消息' })
  scrollBottom()
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
                  <div class="shot-head">谢晴</div>
                  <div class="shot-row right"><span class="shot-av" v-lazy-bg="images.avatar.xieyao"></span><span class="shot-bub">姐姐，不要来找我，也不要为我担心。我不是一个好弟弟。你以后要照顾好自己。</span></div>
                </div>
              </template>
              <template v-else-if="m.type === 'image'">
                <div class="img-photo">{{ m.caption || '图片' }}</div>
              </template>
              <template v-else>{{ m.text }}</template>
            </div>
          </div>
        </div>
      </template>
      <div v-if="!messages.length" class="empty">暂无消息</div>
    </div>
    <div class="chat-empty" v-else>
      <div class="ce-logo">💬</div>
      <p>选择一个联系人开始聊天</p>
    </div>
    <div class="chat-input" v-if="conv">
      <div class="toolbar">
        <span>😊</span>
        <span @click="sendScreenshot" class="tool-btn" title="发送开篇微信消息截图">📎</span>
        <span>✂️</span>
      </div>
      <textarea
        v-model="draft"
        :placeholder="isTeacher && teacherStep < teacherPlayerLines.length ? '点击此处自动填写内容…' : '发消息'"
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
.img-photo { width: 170px; height: 96px; border-radius: 4px; background: linear-gradient(135deg, #b7cdd4, #e3d4bd); display: grid; place-items: center; font-size: 11px; color: #48616b; }
/* 开篇微信消息截图：手机端聊天界面，保留消息完整内容 */
.wx-shot { width: 250px; background: #ededed; border-radius: 4px; padding: 10px; font-size: 11px; color: #222; }
.shot-head { text-align: center; color: #444; padding-bottom: 7px; border-bottom: 1px solid #dcdcdc; margin-bottom: 8px; font-size: 11px; }
.shot-row { display: flex; align-items: flex-start; gap: 6px; margin: 6px 0; }
.shot-row.right { flex-direction: row-reverse; }
.shot-av { width: 20px; height: 20px; flex: 0 0 20px; border-radius: 3px; background: #cfe0d6; display: grid; place-items: center; }
.shot-bub { max-width: 205px; background: #fff; border-radius: 4px; padding: 6px 8px; line-height: 1.55; word-break: break-word; text-align: left; }
.shot-row.right .shot-bub { background: #95ec69; }
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
