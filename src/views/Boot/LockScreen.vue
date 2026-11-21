<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemStore } from '@/stores/systemStore'
import { useGameStore, ANSWERS } from '@/stores/gameStore'

const router = useRouter()
const system = useSystemStore()
const game = useGameStore()

const input = ref('')
const error = ref(false)
const shaking = ref(false)
const now = ref(new Date())

const timeText = computed(() =>
  now.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
)
const dateText = computed(() =>
  now.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
)

let timer
onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000)
})

function submit() {
  if (input.value.trim().toLowerCase() === ANSWERS.lockScreen) {
    game.unlock()
    system.unlock()
    router.push('/desktop')
  } else {
    error.value = true
    shaking.value = true
    input.value = ''
    setTimeout(() => (shaking.value = false), 420)
  }
}

function onKey(e) {
  if (e.key === 'Enter') submit()
}
</script>

<template>
  <div class="lock-root" @keydown="onKey">
    <div class="wallpaper">
      <div class="sun"></div>
      <div class="sea-shimmer"></div>
      <div class="breakwater"></div>
      <div class="lighthouse"></div>
    </div>
    <div class="shade"></div>

    <div class="lock-ui">
      <div class="clock">{{ timeText }}</div>
      <div class="date">{{ dateText }}</div>
      <div class="avatar">遥</div>
      <div class="who">谢遥的电脑</div>

      <div class="pwd-box" :class="{ shake: shaking }">
        <input
          v-model="input"
          type="password"
          placeholder="输入密码"
          autofocus
          @keyup.enter="submit"
        />
        <button @click="submit">→</button>
      </div>
      <div class="err" v-if="error">密码不正确</div>
      <div class="tip">提示：姐姐的名字（拼音）</div>

      <div class="hint-bar">这台电脑属于一个高三学生。他好像遇到麻烦了。</div>
    </div>
  </div>
</template>

<style scoped>
.lock-root { position: absolute; inset: 0; display: grid; place-items: center; }
.shade { position: absolute; inset: 0; background: rgba(10,22,28,.42); backdrop-filter: blur(2px); }
.lock-ui { position: relative; text-align: center; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.35); }
.clock { font-size: 76px; font-weight: 200; line-height: 1; letter-spacing: 2px; }
.date { font-size: 15px; opacity: .85; margin-top: 8px; }
.avatar {
  width: 62px; height: 62px; border-radius: 50%;
  background: rgba(255,255,255,.85); color: #2c5361;
  display: grid; place-items: center; font-size: 28px;
  margin: 34px auto 10px;
  box-shadow: 0 4px 14px rgba(0,0,0,.3);
}
.who { font-size: 15px; margin-bottom: 22px; }
.pwd-box {
  display: flex; justify-content: center; align-items: center; gap: 8px;
}
.pwd-box input {
  width: 220px; padding: 9px 12px;
  border: 1px solid rgba(255,255,255,.5);
  border-radius: 5px;
  background: rgba(255,255,255,.14);
  color: #fff; text-align: center; outline: none;
}
.pwd-box input::placeholder { color: rgba(255,255,255,.6); }
.pwd-box input:focus { background: rgba(255,255,255,.22); }
.pwd-box button {
  width: 38px; height: 36px;
  border: 1px solid rgba(255,255,255,.5);
  border-radius: 5px;
  background: rgba(255,255,255,.14);
  color: #fff; font-size: 18px;
}
.pwd-box button:hover { background: rgba(255,255,255,.28); }
.shake { animation: shake .4s; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-9px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(4px); }
}
.err { color: #ffb4b4; font-size: 12px; margin-top: 10px; }
.tip { color: rgba(255,255,255,.6); font-size: 12px; margin-top: 14px; }
.hint-bar {
  position: absolute; top: 60vh; left: 50%; transform: translateX(-50%);
  font-size: 12px; opacity: .55; white-space: nowrap;
}
</style>
