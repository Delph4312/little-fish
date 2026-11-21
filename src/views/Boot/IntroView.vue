<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { introScreens } from '@/data/storyData'

const router = useRouter()
const index = ref(0)
const fading = ref(false)

const current = () => introScreens[index.value]

function next() {
  if (fading.value) return
  fading.value = true
  setTimeout(() => {
    if (index.value < introScreens.length - 1) {
      index.value++
      fading.value = false
    } else {
      router.push('/lock')
    }
  }, 380)
}

function skip() {
  router.push('/lock')
}
</script>

<template>
  <div class="intro-root" @click="next">
    <div class="vignette"></div>
    <div class="content" :class="{ fade: fading }">
      <div class="chapter">屏幕 {{ index + 1 }} / {{ introScreens.length }}</div>
      <p class="narration">{{ current().text }}</p>
      <div v-if="current().screenshot" class="phone-shot">
        <div class="phone-head">遥遥</div>
        <div class="bubble">{{ current().screenshot.text }}</div>
        <div class="phone-time">昨天 23:58</div>
      </div>
    </div>
    <div class="hint">点击继续 · 点击右上角跳过</div>
    <button class="skip" @click.stop="skip">跳过 ›</button>
  </div>
</template>

<style scoped>
.intro-root {
  position: absolute; inset: 0;
  background:
    linear-gradient(180deg, #10242f 0%, #1b3a4b 55%, #2c5361 100%);
  display: grid; place-items: center;
  cursor: pointer;
  overflow: hidden;
}
.vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.55) 100%);
  pointer-events: none;
}
.content {
  position: relative;
  max-width: 620px;
  padding: 0 32px;
  transition: opacity .38s;
}
.content.fade { opacity: 0; }
.chapter { color: #7fa6b6; font-size: 12px; letter-spacing: 3px; margin-bottom: 22px; }
.narration {
  color: #eef3f4;
  font-size: 21px;
  line-height: 2;
  font-weight: 400;
  text-shadow: 0 2px 12px rgba(0,0,0,.4);
  margin: 0;
}
.phone-shot {
  margin-top: 34px;
  max-width: 340px;
  background: #f4f6f5;
  border-radius: 12px;
  padding: 14px 16px 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.4);
}
.phone-head { font-size: 12px; color: #6b7b82; border-bottom: 1px solid #e0e6e6; padding-bottom: 8px; }
.bubble {
  margin-top: 12px;
  background: #fff;
  border: 1px solid #dfe6e6;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.6;
  color: #1c2429;
}
.phone-time { text-align: right; color: #9aa7ab; font-size: 11px; margin-top: 8px; }
.hint {
  position: absolute; bottom: 26px; left: 0; right: 0;
  text-align: center; color: rgba(238,243,244,.5); font-size: 12px;
  animation: breathe 2.4s ease-in-out infinite;
}
@keyframes breathe { 0%,100% { opacity: .35; } 50% { opacity: .9; } }
.skip {
  position: absolute; top: 20px; right: 24px;
  background: transparent; border: 0; color: rgba(238,243,244,.65);
  font-size: 13px;
}
.skip:hover { color: #fff; }
</style>
