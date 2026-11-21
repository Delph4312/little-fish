<script setup>
import { ref } from 'vue'
import { whaleDialogue } from '@/data/forumData'
import { useSystemStore } from '@/stores/systemStore'
import { useGameStore } from '@/stores/gameStore'

const system = useSystemStore()
const game = useGameStore()
const input = ref('')

// 同一聊天窗口：旧记录（谢遥×鲸鱼）在前，玩家对话在后，按时间先后排列
const thread = ref([
  ...whaleDialogue.old.map((m) => ({ ...m, mine: m.user === '谢遥' })),
  { user: '鲸鱼先生', text: '—— 以下为新的对话 ——', sys: true },
  { user: '鲸鱼先生', text: whaleDialogue.withPlayer[0].text }
])

function send() {
  const text = input.value.trim()
  if (!text) return
  thread.value.push({ user: '你', text, mine: true })
  input.value = ''
  setTimeout(() => {
    let reply = whaleDialogue.interruptions[1]
    if (text.includes('卑鄙') || text.includes('邪教')) reply = whaleDialogue.withPlayer[2].text
    else if (text.includes('不打算') || text.includes('辩论')) reply = whaleDialogue.withPlayer[5].text
    thread.value.push({ user: '鲸鱼先生', text: reply })
    system.triggerGlitch(700)
    game.markWhaleTriggered('chat')
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
      <input v-model="input" placeholder="发消息…" @keyup.enter="send" />
      <button class="btn" @click="send">发送</button>
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
.c-input input { flex: 1; min-width: 0; padding: 6px 8px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 11px; }
.c-input .btn { padding: 5px 10px; font-size: 11px; }
</style>
