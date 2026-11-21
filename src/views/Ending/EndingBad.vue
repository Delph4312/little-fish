<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { badEnding } from '@/data/storyData'

const router = useRouter()
const fade = ref(false)
const showLead = ref(false)
const lines = ref([])

onMounted(() => {
  setTimeout(() => (fade.value = true), 800)
  setTimeout(() => (showLead.value = true), 2800)
  // 遗书逐行打字机
  let i = 0
  const timer = setInterval(() => {
    if (i < badEnding.suicideNote.length) {
      lines.value.push(badEnding.suicideNote[i])
      i++
    } else {
      clearInterval(timer)
    }
  }, 2200)
})
</script>

<template>
  <div class="ending" :class="{ dark: fade }">
    <div class="sea">
      <div class="sky"></div>
      <div class="water"></div>
      <div class="dam"></div>
      <div class="lonely-lamp"></div>
    </div>

    <div class="scene-text" v-if="!showLead">{{ badEnding.scene }}</div>

    <transition name="fade">
      <div class="letter" v-if="showLead">
        <div class="letter-title">遗书</div>
        <div class="lead">{{ badEnding.lead }}</div>
        <div class="note-lines">
          <p v-for="(line, i) in lines" :key="i" class="line">{{ line }}</p>
        </div>
        <button class="btn" @click="router.push('/ending/epilogue')">继续 ›</button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.ending { position: absolute; inset: 0; background: #0b1a22; overflow: auto; transition: background 2.4s; color: #dfe8eb; }
.ending.dark { background: #060e13; }
.sea { position: relative; height: 46vh; }
.sky { position: absolute; inset: 0; background: linear-gradient(180deg, #233945, #4a5f64 55%, #7d8073 100%); }
.water { position: absolute; left: 0; right: 0; top: 62%; bottom: 0; background: linear-gradient(180deg,#3a5963,#122a37); }
.dam { position: absolute; left: -5%; bottom: 12%; width: 80%; height: 20%; background: #0d1d25; clip-path: polygon(0 30%, 100% 0, 100% 100%, 0 100%); }
.lonely-lamp { position: absolute; right: 22%; bottom: 18%; width: 3px; height: 46px; background: #c9c2b0; }
.lonely-lamp::after { content: ""; position: absolute; top: -4px; left: -4px; width: 11px; height: 10px; background: #e8d9a6; border-radius: 50%; box-shadow: 0 0 24px 10px rgba(232,217,166,.3); }
.scene-text { position: absolute; top: 52%; left: 0; right: 0; text-align: center; font-size: 16px; line-height: 1.9; padding: 0 10%; opacity: .9; }
.letter { max-width: 640px; margin: 0 auto; padding: 30px 30px 60px; }
.letter-title { font-size: 26px; font-weight: 300; letter-spacing: 8px; color: #cdd9dd; text-align: center; margin-bottom: 24px; }
.lead { font-size: 13px; color: #8fa3ab; line-height: 1.9; margin-bottom: 26px; text-align: center; }
.note-lines { border-left: 1px solid #34474f; padding-left: 24px; }
.line { font-size: 15px; line-height: 2.2; color: #d9e2e5; margin: 0 0 16px; animation: appear 1.2s ease; }
@keyframes appear { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.letter .btn { margin-top: 20px; }
.fade-enter-active { transition: opacity 1.4s; }
.fade-enter-from { opacity: 0; }
</style>
