<script setup>
import { ref } from 'vue'
import { bottleMessages, redBottleMessages, bottleColors } from '@/data/forumData'
import { useSystemStore } from '@/stores/systemStore'

const system = useSystemStore()

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 生成海面上的瓶子：每条消息作为独立漂流瓶，随机分布；负面内容（红瓶文本）强制红瓶
function makeBottles() {
  const normal = [
    ...bottleMessages.wish, ...bottleMessages.bless,
    ...bottleMessages.whisper, ...bottleMessages.short
  ].map((text) => ({ type: 'normal', text }))
  const negative = redBottleMessages.map((text) => ({ type: 'red', text }))
  const all = shuffle([...normal, ...negative])
  // 增加海面瓶子数量：各类别等比例随机铺满（约 26 个）
  const picked = shuffle(all).slice(0, Math.min(26, all.length))
  return picked.map((b, i) => ({
    id: i,
    type: b.type,
    text: b.text,
    color: b.type === 'red' ? 'red' : bottleColors[Math.floor(Math.random() * bottleColors.length)],
    top: 6 + Math.random() * 78,        // 纵向分布变化大
    duration: 22 + Math.random() * 26,  // 从右到左流速较慢且各不相同
    delay: -Math.random() * 40,         // 负延迟让海面一开始就有瓶子
    vanished: false
  }))
}

const bottles = ref(makeBottles())
const opened = ref(null)
const fading = ref(false)

function openBottle(b) {
  if (b.vanished) return
  opened.value = b
  fading.value = false
  if (b.type === 'red') {
    system.triggerGlitch(400)
  }
}

function closeBottle() {
  // 负面瓶：关闭文字窗口时，对应瓶子立即从海面消失
  if (opened.value && opened.value.type === 'red') {
    const target = bottles.value.find((x) => x.id === opened.value.id)
    if (target) target.vanished = true
  }
  opened.value = null
  fading.value = false
}

const composeText = ref('')
const composeColor = ref(bottleColors[0])
const sent = ref(false)
function sendBottle() {
  if (!composeText.value.trim()) return
  // 投放后立即清空文字框，只保留短暂提示
  composeText.value = ''
  sent.value = true
  setTimeout(() => { sent.value = false }, 1200)
}
</script>

<template>
  <div class="bottle-page">
    <div class="head">
      <div>
        <h2>漂流瓶</h2>
        <p class="muted">海面上各色漂流瓶自右向左缓缓漂过，拆开后显示投瓶人的留言。</p>
      </div>
    </div>

    <div class="sea">
      <div class="wave w1"></div>
      <div class="wave w2"></div>
      <div
        v-for="b in bottles"
        :key="b.id"
        v-show="!b.vanished"
        class="bottle-wrap"
        :style="{ top: b.top + '%', animationDuration: b.duration + 's', animationDelay: b.delay + 's' }"
        @click="openBottle(b)"
      >
        <div class="bottle" :class="[b.color, { red: b.type === 'red' }]">
          <span class="cork"></span>
        </div>
      </div>
    </div>

    <div class="compose">
      <h3>扔一个漂流瓶</h3>
      <textarea v-model="composeText" placeholder="写下你想说的话……"></textarea>
      <div class="compose-row">
        <div class="colors">
          <span>瓶子颜色：</span>
          <button
            v-for="c in bottleColors"
            :key="c"
            class="color-dot"
            :class="[c, { picked: composeColor === c }]"
            :title="c"
            @click="composeColor = c"
          ></button>
        </div>
        <button class="btn btn-primary" @click="sendBottle">投放</button>
      </div>
      <div v-if="sent" class="sent-tip">瓶子已经扔进海里了。</div>
    </div>

    <transition name="fade">
      <div v-if="opened" class="modal" @click="closeBottle">
        <div class="letter" :class="{ faded: fading }" @click.stop>
          <div class="letter-cap">{{ opened.type === 'red' ? '来自深海' : '捞到一个漂流瓶' }}</div>
          <div class="letter-text">{{ opened.text }}</div>
          <div class="letter-foot">——点击空白处关闭</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.bottle-page { min-height: 100%; background: #eef4f5; padding: 18px 20px 30px; }
.head h2 { margin: 0; font-size: 17px; font-weight: 600; color: #244b5d; }
.head p { font-size: 12px; margin: 6px 0 0; }
.sea { position: relative; height: 300px; margin: 16px 0; border-radius: 8px; overflow: hidden; background: linear-gradient(180deg, #8fb0bd 0%, #5d8a9c 45%, #2c5a70 100%); }
.wave { position: absolute; left: -10%; right: -10%; height: 20px; background: rgba(255,255,255,.12); border-radius: 50%; filter: blur(1px); animation: waveflow 9s linear infinite; }
.w1 { top: 30%; }
.w2 { top: 62%; animation-duration: 13s; animation-direction: reverse; }
@keyframes waveflow { 0% { transform: translateX(-6%); } 100% { transform: translateX(6%); } }
/* 从右至左缓缓漂过 */
.bottle-wrap { position: absolute; left: 0; cursor: pointer; animation: float-left linear infinite; }
@keyframes float-left {
  0% { transform: translateX(105vw) translateY(0) rotate(-3deg); }
  50% { transform: translateX(50vw) translateY(-10px) rotate(3deg); }
  100% { transform: translateX(-40px) translateY(0) rotate(-3deg); }
}
.bottle { width: 26px; height: 42px; border-radius: 9px 9px 12px 12px; background: #d7e9df; border: 1px solid rgba(0,0,0,.15); position: relative; box-shadow: 0 4px 8px rgba(0,0,0,.2); }
.bottle .cork { position: absolute; top: -8px; left: 8px; width: 10px; height: 8px; background: #b8916a; border-radius: 2px; }
.bottle.浅绿 { background: #cfe6d2; } .bottle.橙黄 { background: #f0d9a8; } .bottle.浅蓝 { background: #c6ddef; } .bottle.淡紫 { background: #ddd2ec; } .bottle.白 { background: #f4f6f5; }
/* 负面内容的瓶子强制红色瓶身（含裂纹瓶口），必须覆盖上面的普通配色 */
.bottle.red, .bottle.red.浅绿, .bottle.red.橙黄, .bottle.red.浅蓝, .bottle.red.淡紫, .bottle.red.白 { background: #8e2b2b !important; border-color: #5e1414 !important; box-shadow: 0 4px 12px rgba(142,43,43,.5); }
.bottle.red .cork { background: #6d2020; }
.compose { background: #fff; border: 1px solid #dfe7e8; border-radius: 6px; padding: 16px 18px; }
.compose h3 { font-size: 14px; font-weight: 500; margin: 0 0 12px; }
.compose textarea { width: 100%; height: 64px; resize: vertical; border: 1px solid #d5dcdb; border-radius: 4px; padding: 9px; font-size: 13px; }
.compose-row { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.colors { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.color-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid transparent; padding: 0; }
.color-dot.picked { border-color: #2f6f8f; }
.color-dot.浅绿 { background: #cfe6d2; } .color-dot.橙黄 { background: #f0d9a8; } .color-dot.浅蓝 { background: #c6ddef; } .color-dot.淡紫 { background: #ddd2ec; } .color-dot.白 { background: #f4f6f5; }
.sent-tip { color: #3c7a52; font-size: 12px; margin-top: 10px; }
.modal { position: fixed; inset: 0; background: rgba(10,22,28,.6); display: grid; place-items: center; z-index: 50000; }
.letter { width: 340px; min-height: 180px; background: #f7f3e8; border-radius: 6px; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,.4); display: flex; flex-direction: column; justify-content: space-between; transition: opacity .3s; }
.letter-cap { font-size: 11px; color: #9b8f76; letter-spacing: 1px; }
.letter-text { font-size: 16px; line-height: 1.9; color: #3a3529; margin: 20px 0; }
.letter-foot { font-size: 11px; color: #b3a990; text-align: right; }
.letter.faded { animation: letter-fade .9s ease forwards; }
@keyframes letter-fade { 0%,40% { opacity: 1; } 50% { opacity: .1; } 60% { opacity: 1; } 70% { opacity: .2; } 80% { opacity: 1; } 100% { opacity: 0; transform: scale(.96); } }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
