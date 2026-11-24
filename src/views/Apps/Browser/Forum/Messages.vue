<script setup>
import { ref, computed } from 'vue'
import { whaleDialogue } from '@/data/forumData'
import { images } from '@/data/images'
import { useSystemStore } from '@/stores/systemStore'
import { useGameStore } from '@/stores/gameStore'

const system = useSystemStore()
const game = useGameStore()
const props = defineProps({ active: { type: Boolean, default: true } })
const emit = defineEmits(['new-message'])

// 当前时间（时:分），用于分隔线文案
function nowHM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 私信对象：仅鲸鱼先生（其余占位，不可切换）
const contacts = [
  { id: 'whale', name: '鲸鱼先生', avatar: '鲸' }
]
const activeContact = ref('whale')

// 同一聊天窗口：旧记录在前，新对话在后，按时间先后排列
const script = whaleDialogue.withPlayer
const thread = ref([
  ...whaleDialogue.old.map((m) => ({ ...m, mine: m.user === '谢遥' })),
  { user: '鲸鱼先生', text: nowHM(), sys: true },
  { user: '鲸鱼先生', text: script[0].text }
])

// 玩家的规定输入：从剧本里抽取所有「你」的发言，依次填入
const playerLines = computed(() => script.filter((m) => m.user === '你').map((m) => m.text))
const step = ref(0)
const input = ref('')
const filled = ref(false)

function fillScripted() {
  if (step.value >= playerLines.value.length) return
  input.value = playerLines.value[step.value]
  filled.value = true
}

// 发送玩家台词后，输出紧随其后的鲸鱼先生回复（直到下一句玩家台词）
function send() {
  if (!filled.value || !input.value.trim()) return
  const text = input.value
  thread.value.push({ user: '你', text, mine: true })
  // 找到本句之后到下一条玩家输入之间的鲸鱼回复
  const replies = []
  let found = false
  for (const m of script) {
    if (m.user === '你' && m.text === text && !found) { found = true; continue }
    if (!found) continue
    if (m.user === '你') break
    replies.push(m.text)
  }
  input.value = ''
  filled.value = false
  step.value += 1
  // 首条回复延迟送达，之后逐条弹出（不再一次性批量显示）
  setTimeout(() => {
    if (!props.active) return  // 私信窗口收起后，已收到的私信不再变动
    let idx = 0
    const pushNext = () => {
      if (idx >= replies.length) return
      thread.value.push({ user: '鲸鱼先生', text: replies[idx] })
      system.triggerGlitch(90) // 抖动效果再减小：每条仅 90ms
      idx += 1
      if (idx < replies.length) setTimeout(pushNext, 700)
    }
    pushNext()
    game.markWhaleTriggered('chat')
    if (replies.length) emit('new-message', replies[replies.length - 1])
  }, 650)
}
</script>

<template>
  <div class="messages">
    <div class="contact-tabs">
      <div
        v-for="c in contacts"
        :key="c.id"
        class="ctab active"
        @click="activeContact = c.id"
      >
        <span class="ct-av" v-lazy-bg="images.avatar.whale"></span>{{ c.name }}
      </div>
    </div>
    <div class="c-body">
      <div v-for="(m, i) in thread" :key="i" class="row" :class="{ mine: m.mine, sys: m.sys }">
        <template v-if="m.sys">
          <div class="sys-line">{{ m.text }}</div>
        </template>
        <template v-else>
          <div class="name">{{ m.user }}</div>
          <div class="bub">{{ m.text }}</div>
        </template>
      </div>
    </div>
    <div class="c-input">
      <input
        :value="input"
        readonly
        placeholder="请输入内容"
        @click="fillScripted"
      />
      <button class="btn" :disabled="!filled" @click="send">发送</button>
    </div>
  </div>
</template>

<style scoped>
.messages { display: flex; flex-direction: column; height: 100%; background: #f5f7f6; }
.contact-tabs { height: 40px; flex: 0 0 40px; display: flex; align-items: center; border-bottom: 1px solid #e2e7e6; background: #fff; }
.ctab { display: flex; align-items: center; gap: 8px; height: 100%; padding: 0 14px; font-size: 12px; color: #3a4a50; border-bottom: 2px solid #2f6f8f; }
.ct-av { width: 24px; height: 24px; border-radius: 50%; background: #16324f; color: #9fc6d6; display: grid; place-items: center; font-size: 11px; }
.c-body { flex: 1; overflow: auto; padding: 10px 12px; }
.row { margin: 10px 0; }
.row.mine { text-align: right; }
.name { font-size: 10px; color: #9aa7ab; margin-bottom: 3px; }
.bub { display: inline-block; max-width: 88%; background: #fff; border: 1px solid #e2e7e6; border-radius: 6px; padding: 7px 9px; font-size: 11px; line-height: 1.6; text-align: left; }
.mine .bub { background: #d9eddf; border-color: #c7e3d1; }
.sys-line { text-align: center; font-size: 10px; color: #a5b0b3; padding: 6px 0; }
.c-input { flex: 0 0 auto; border-top: 1px solid #e2e7e6; padding: 8px; display: flex; gap: 6px; }
.c-input input { flex: 1; min-width: 0; padding: 6px 8px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 11px; cursor: text; }
.c-input .btn { padding: 5px 10px; font-size: 11px; }
.c-input .btn:disabled { opacity: .5; cursor: default; }
</style>
