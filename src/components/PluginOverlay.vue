<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore, ANSWERS } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'

const game = useGameStore()
const system = useSystemStore()
const router = useRouter()

// 阶段：idle(未开始) / intro(安装完成提示) / game(倒计时中) / result(结算)
const phase = ref('idle')
const tipStep = ref(0)

// 限时文本：弟弟计划节选，其中三个词是"地点线索"，需要被点选记录
// 真实答案 finalPlace 是纯文本待补，这里的高亮词是可点击记录的关键信息
const tokens = [
  { id: 'a', text: '城郊旧码头', key: false },
  { id: 'b', text: '防波堤尽头', key: true },
  { id: 'c', text: '灰蓝色海面', key: false },
  { id: 'd', text: '灯塔下的礁石', key: true },
  { id: 'e', text: '十二年前的面馆', key: false },
  { id: 'f', text: '高潮时刻 22:41', key: true }
]

const captured = ref([])
const recordedText = ref('')
let tickTimer = null
let introTimer = null

const remainingText = computed(() => {
  const r = game.countdown.remaining
  return r < 10 ? '0' + r : String(r)
})

function startGame() {
  phase.value = 'game'
  captured.value = []
  recordedText.value = ''
  game.startCountdown(45)
  clearInterval(tickTimer)
  tickTimer = setInterval(() => {
    game.countdown.remaining--
    if (game.countdown.remaining <= 0) {
      clearInterval(tickTimer)
      fail('时间耗尽，连接中断。')
    }
  }, 1000)
}

function clickToken(t) {
  if (phase.value !== 'game') return
  if (captured.value.includes(t.id)) return
  captured.value.push(t.id)
  // 把点选的词追加到记录文本（模拟"用便签记下"）
  recordedText.value += (recordedText.value ? ' / ' : '') + t.text
  game.recordedPlace = recordedText.value
}

function submit() {
  if (phase.value !== 'game') return
  clearInterval(tickTimer)
  const allKeyCaptured = tokens.filter((t) => t.key).every((t) => captured.value.includes(t.id))
  if (allKeyCaptured && recordedText.value.trim()) {
    game.finishCountdown(true)
    phase.value = 'result'
    system.notify({ from: '系统', text: '记录完成。地点信息已保存。' })
  } else {
    fail('记录不完整，地址信息缺失。')
  }
}

function fail(reason) {
  clearInterval(tickTimer)
  game.finishCountdown(false)
  game.pluginUsed = true
  phase.value = 'result'
  system.notify({ from: '系统', text: reason, type: 'whale', duration: 5000 })
  setTimeout(() => router.push('/ending/bad'), 2200)
}

function closeResult() {
  phase.value = 'idle'
}

// 监听 store 里的 pluginUsed 触发（由微信/桌面点击"使用插件"置 true）
watch(
  () => game.pluginUsed,
  (val) => {
    if (val && phase.value === 'idle' && !game.countdown.finished) {
      phase.value = 'intro'
    }
  }
)

onMounted(() => {
  if (game.pluginUsed && !game.countdown.finished) phase.value = 'intro'
})
onUnmounted(() => {
  clearInterval(tickTimer)
  clearTimeout(introTimer)
})
</script>

<template>
  <div v-if="phase !== 'idle'" class="plugin-mask">
    <!-- 安装完成提示 -->
    <div v-if="phase === 'intro'" class="panel intro">
      <div class="p-badge">小岛老师的插件</div>
      <h2>连接保全程序</h2>
      <p>插件已安装。一旦鲸鱼先生切断论坛，你会有一段不到一分钟的时间。</p>
      <p>那段时间里，屏幕上会闪过弟弟计划的片段。把里面的<b>地点关键词</b>点选记录下来——他会用便签，你也可以。</p>
      <p class="warn">时间一到，论坛彻底断连。机会只有一次。</p>
      <div class="p-actions">
        <button class="btn" @click="phase = 'idle'">稍后</button>
        <button class="btn btn-primary" @click="startGame">启动插件</button>
      </div>
    </div>

    <!-- 倒计时小游戏 -->
    <div v-else-if="phase === 'game'" class="panel game-panel">
      <div class="game-head">
        <div>
          <div class="p-badge">记录模式</div>
          <h2>抓住这些地址</h2>
        </div>
        <div class="timer" :class="{ urgent: game.countdown.remaining < 10 }">{{ remainingText }}s</div>
      </div>
      <div class="progress"><div class="bar" :style="{ width: (game.countdown.remaining / game.countdown.total) * 100 + '%' }"></div></div>
      <p class="instruction">点击下面文本中的地点关键词，把它们记录到便签。</p>
      <div class="text-stream">
        <p>那天他坐在电脑前，把计划又看了一遍。他想起<a
          v-for="t in tokens"
          :key="t.id"
          class="token"
          :class="{ key: t.key, captured: captured.includes(t.id) }"
          @click="clickToken(t)"
        >{{ t.text }}</a>，一笔一划地抄在便签上。他把纸折成四折，塞进抽屉最里面。明天，就明天。</p>
      </div>
      <div class="notepad">
        <div class="np-label">我的便签（已记录 {{ captured.length }} / {{ tokens.filter(t => t.key).length }} 个关键点）</div>
        <div class="np-content">{{ recordedText || '（点击上面的地点关键词，记录会显示在这里）' }}</div>
      </div>
      <div class="p-actions">
        <button class="btn btn-primary" @click="submit">保存记录并提交</button>
      </div>
    </div>

    <!-- 结算 -->
    <div v-else-if="phase === 'result'" class="panel result">
      <template v-if="game.countdown.success">
        <div class="p-badge success">连接保持</div>
        <h2>记录完成</h2>
        <p>你把地址信息抄了下来。趁论坛还在，赶紧去找他。</p>
        <button class="btn btn-primary" @click="closeResult">返回论坛</button>
      </template>
      <template v-else>
        <div class="p-badge fail">连接中断</div>
        <h2>来不及了</h2>
        <p>屏幕一闪，论坛的页面变成了空白。你记下的东西不够。</p>
        <button class="btn" @click="closeResult">关闭</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.plugin-mask { position: fixed; inset: 0; background: rgba(6,14,18,.88); display: grid; place-items: center; z-index: 300000; backdrop-filter: blur(4px); }
.panel { width: 620px; max-width: 92vw; background: #101e26; color: #dfe8ec; border: 1px solid #2a424e; border-radius: 10px; padding: 30px 34px; box-shadow: 0 24px 60px rgba(0,0,0,.6); }
.p-badge { display: inline-block; font-size: 10px; letter-spacing: 2px; color: #7fa6b6; border: 1px solid #345463; border-radius: 3px; padding: 3px 8px; }
.p-badge.success { color: #8fd0a8; border-color: #3c6b52; }
.p-badge.fail { color: #e08a8a; border-color: #7a3a3a; }
.panel h2 { font-size: 22px; font-weight: 400; margin: 14px 0 18px; }
.panel p { font-size: 13px; line-height: 1.9; color: #a9c0c9; }
.panel p b { color: #e8d9a6; font-weight: 500; }
.panel p.warn { color: #d99a9a; }
.p-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.p-actions .btn { background: #1b303b; color: #dfe8ec; border-color: #345463; }
.p-actions .btn-primary { background: #2f6f8f; border-color: #2f6f8f; }
.game-head { display: flex; justify-content: space-between; align-items: flex-start; }
.timer { font-size: 40px; font-weight: 200; color: #8fd0e0; font-variant-numeric: tabular-nums; }
.timer.urgent { color: #e88a8a; animation: pulse .6s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
.progress { height: 4px; background: #1b303b; border-radius: 2px; margin: 14px 0 18px; overflow: hidden; }
.progress .bar { height: 100%; background: #3c8fa8; transition: width 1s linear; }
.instruction { font-size: 12px !important; color: #8fa8b2 !important; margin-bottom: 12px !important; }
.text-stream { background: #162932; border-left: 3px solid #2f6f8f; border-radius: 4px; padding: 20px 22px; font-size: 15px; line-height: 2.6; }
.token { color: #9fb8c2; border-bottom: 1px dashed #5b7b86; cursor: pointer; padding: 0 2px; }
.token.key:hover { background: #2f5d70; color: #fff; }
.token.captured { background: #24563f; color: #a8e0bd; border-color: #3c7a58; text-decoration: line-through; }
.notepad { margin-top: 18px; background: #e8e3d2; color: #3a3529; border-radius: 4px; padding: 14px 16px; }
.np-label { font-size: 11px; color: #8a8069; margin-bottom: 8px; }
.np-content { font-size: 14px; line-height: 1.7; min-height: 24px; }
.result { text-align: center; }
.result .btn { margin-top: 12px; }
</style>
