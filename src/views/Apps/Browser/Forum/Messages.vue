<script setup>
import { ref, computed } from 'vue'
import { whaleDialogue } from '@/data/forumData'
import { images } from '@/data/images'
import { useSystemStore } from '@/stores/systemStore'
import { useGameStore } from '@/stores/gameStore'

const system = useSystemStore()
const game = useGameStore()
const emit = defineEmits(['new-message'])

// 私信对象：仅鲸鱼先生（其余占位，不可切换）
const contacts = [
  { id: 'whale', name: '鲸鱼先生', avatar: '鲸' }
]
const activeContact = ref('whale')

// 同一聊天窗口：旧记录在前，新对话在后，按时间先后排列
const script = whaleDialogue.withPlayer
const thread = ref([
  ...whaleDialogue.old.map((m) => ({ ...m, mine: m.user === '谢遥' })),
  { user: '鲸鱼先生', text: '—— 以下为新的对话 ——', sys: true },
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
  setTimeout(() => {
    replies.forEach((r) => thread.value.push({ user: '鲸鱼先生', text: r }))
    // 抖动效果减小：仅 180ms 轻微故障
    system.triggerGlitch(180)
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
        <span class="ct-av" :style="{ backgroundImage: `url(${images.avatar.whale})`, backgroundSize: 'cover', backgroundPosition: 'center' }"></span>{{ c.name }}
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
        :placeholder="step >= playerLines.length ? '对话已结束' : '点击此处输入…'"
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
