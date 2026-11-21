<script setup>
import { ref } from 'vue'
import { whaleDialogue } from '@/data/forumData'
import { useSystemStore } from '@/stores/systemStore'
import { useGameStore } from '@/stores/gameStore'

const system = useSystemStore()
const game = useGameStore()
const activeChat = ref('whale')
const input = ref('')
const oldChat = ref(false)
const messages = ref([{ user: '鲸鱼先生', text: whaleDialogue.withPlayer[0].text }])

function send() {
  const text = input.value.trim()
  if (!text) return
  messages.value.push({ user: '你', text })
  input.value = ''
  setTimeout(() => {
    let reply = whaleDialogue.interruptions[1]
    if (text.includes('卑鄙') || text.includes('邪教')) reply = whaleDialogue.withPlayer[2].text
    else if (text.includes('不打算') || text.includes('辩论')) reply = whaleDialogue.withPlayer[5].text
    messages.value.push({ user: '鲸鱼先生', text: reply })
    system.triggerGlitch(700)
    game.markWhaleTriggered('chat')
  }, 800)
}
</script>

<template>
  <div class="messages">
    <div class="side">
      <div class="s-title">私信</div>
      <div class="s-row active"><span class="av whale">鲸</span><div><b>鲸鱼先生</b><p>{{ whaleDialogue.withPlayer[0].text.slice(0,12) }}…</p></div></div>
      <div class="s-row" @click="oldChat = !oldChat"><span class="av">遥</span><div><b>谢遥 × 鲸鱼先生</b><p>（旧记录）</p></div></div>
    </div>
    <div class="chat">
      <div class="c-head">{{ oldChat ? '旧记录（已清理）' : '鲸鱼先生' }}</div>
      <div class="c-body">
        <template v-if="oldChat">
          <div v-for="(m,i) in whaleDialogue.old" :key="i" class="row" :class="m.user === '谢遥' ? 'mine' : ''">
            <div class="name">{{ m.user }}</div><div class="bub">{{ m.text }}</div>
          </div>
        </template>
        <template v-else>
          <div v-for="(m,i) in messages" :key="i" class="row" :class="m.user === '你' ? 'mine' : ''">
            <div class="name">{{ m.user }}</div><div class="bub">{{ m.text }}</div>
          </div>
        </template>
      </div>
      <div class="c-input" v-if="!oldChat">
        <input v-model="input" placeholder="发消息" @keyup.enter="send" />
        <button class="btn" @click="send">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.messages { display: flex; height: 100%; min-height: 460px; }
.side { width: 220px; flex: 0 0 220px; background: #e9edec; border-right: 1px solid #d5dcdb; }
.s-title { padding: 16px; font-size: 14px; font-weight: 500; }
.s-row { display: flex; gap: 10px; padding: 12px; cursor: pointer; align-items: center; }
.s-row:hover, .s-row.active { background: #dbe4e4; }
.av { width: 34px; height: 34px; flex: 0 0 34px; border-radius: 4px; background: #d7e4dd; color: #46685a; display: grid; place-items: center; font-size: 14px; }
.av.whale { background: #16324f; color: #9fc6d6; }
.s-row b { font-size: 12px; }
.s-row p { font-size: 11px; color: #9aa7ab; margin: 3px 0 0; }
.chat { flex: 1; display: flex; flex-direction: column; }
.c-head { height: 48px; display: flex; align-items: center; padding: 0 18px; border-bottom: 1px solid #e2e7e6; font-size: 14px; font-weight: 500; }
.c-body { flex: 1; overflow: auto; padding: 16px 20px; }
.row { margin: 12px 0; }
.row.mine { text-align: right; }
.name { font-size: 11px; color: #9aa7ab; margin-bottom: 4px; }
.bub { display: inline-block; max-width: 74%; background: #fff; border: 1px solid #e2e7e6; border-radius: 6px; padding: 9px 12px; font-size: 13px; line-height: 1.7; text-align: left; }
.mine .bub { background: #d9eddf; border-color: #c7e3d1; }
.c-input { border-top: 1px solid #e2e7e6; padding: 10px; display: flex; gap: 8px; }
.c-input input { flex: 1; padding: 8px 10px; border: 1px solid #d5dcdb; border-radius: 4px; }
</style>
