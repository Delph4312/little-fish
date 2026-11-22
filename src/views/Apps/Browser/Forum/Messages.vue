<script setup>
import { ref } from 'vue'
import { whaleDialogue } from '@/data/forumData'
import { useSystemStore } from '@/stores/systemStore'
import { useGameStore } from '@/stores/gameStore'

const system = useSystemStore()
const game = useGameStore()
const emit = defineEmits(['new-message'])

// 同一聊天窗口：旧记录在前，新对话在后，按时间先后排列
const thread = ref([
  ...whaleDialogue.old.map((m) => ({ ...m, mine: m.user === '谢遥' })),
  { user: '鲸鱼先生', text: '—— 以下为新的对话 ——', sys: true },
  { user: '鲸鱼先生', text: whaleDialogue.withPlayer[0].text }
])

// 玩家的规定输入内容（来自文案），点击输入框自动填入，不允许自由输入
const scriptedInputs = [
  '你这卑鄙的邪教徒！我会毁掉你的全部！',
  '我不打算跟你玩这些辩论游戏。'
]
// 发送玩家台词后，鲸鱼先生的后续回复（按文案顺序）
const whaleReplies = [
  [
    '你想错了，我并非一个宗教者，宗教不过是经过粉饰的谎言，而我向人类传播真相。',
    '太多困顿又迷茫的人，都盲目信仰着"生活总会变好的"……而我会引导他们走上正确的道路。'
  ],
  [
    '呵，解释不通就打算逃避吗？',
    '没关系，我会用事实让你承认真相。',
    '我不会阻拦你，而你也不会成功。',
    '真期待这个结局。'
  ]
]

const step = ref(0)
const input = ref('')
const filled = ref(false)

function fillScripted() {
  if (step.value >= scriptedInputs.length) return
  input.value = scriptedInputs[step.value]
  filled.value = true
}

function send() {
  if (!filled.value || !input.value.trim()) return
  const text = input.value
  thread.value.push({ user: '你', text, mine: true })
  const replyIdx = step.value
  input.value = ''
  filled.value = false
  step.value += 1
  setTimeout(() => {
    const replies = whaleReplies[replyIdx] || []
    replies.forEach((r) => thread.value.push({ user: '鲸鱼先生', text: r }))
    system.triggerGlitch(700)
    game.markWhaleTriggered('chat')
    if (replies.length) emit('new-message', replies[replies.length - 1])
  }, 800)
}
</script>

<template>
  <div class="messages">
    <div class="c-head">鲸鱼先生</div>
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
        :placeholder="step >= scriptedInputs.length ? '对话已结束' : '点击此处输入…'"
        @click="fillScripted"
      />
      <button class="btn" :disabled="!filled" @click="send">发送</button>
    </div>
  </div>
</template>

<style scoped>
.messages { display: flex; flex-direction: column; height: 100%; background: #f5f7f6; }
.c-head { height: 36px; flex: 0 0 36px; display: flex; align-items: center; padding: 0 12px; border-bottom: 1px solid #e2e7e6; font-size: 12px; font-weight: 500; color: #3a4a50; }
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
