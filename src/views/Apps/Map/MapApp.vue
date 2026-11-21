<script setup>
import { ref } from 'vue'
import { useGameStore, ANSWERS } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'
import { useRouter } from 'vue-router'

const game = useGameStore()
const system = useSystemStore()
const router = useRouter()
const coord = ref('')
const msg = ref('')

function norm(s) {
  return String(s).replace(/[\s,，]/g, '')
}

function submit() {
  if (norm(coord.value) === norm(ANSWERS.mapCoord)) {
    game.mapSolved = true
    game.addClue('map-solved')
    system.notify({ from: '地图', text: '定位成功。潮位表上标出了今晚的高潮时刻。' })
    msg.value = '定位成功：图中标记处正是防波堤尽头。'
  } else {
    msg.value = '坐标不匹配，再看看照片的 EXIF。'
  }
}

function endBad() {
  game.setEnding('bad')
  router.push('/ending/bad')
}
</script>

<template>
  <div class="map">
    <div class="bar"><span class="title">地图与潮汐</span><span class="muted">近岸海图</span></div>
    <div class="map-canvas">
      <div class="grid-lines"></div>
      <div class="coast"></div>
      <div class="pin">📍 防波堤</div>
      <div class="tide">潮位表 · 今日高潮 22:41</div>
    </div>
    <div class="panel">
      <h3>坐标定位</h3>
      <p class="muted">输入从相册照片 EXIF 里读到的坐标，定位弟弟最后出现的地方。</p>
      <div class="row">
        <input v-model="coord" placeholder="例如 39.9, 116.4" @keyup.enter="submit" />
        <button class="btn btn-primary" @click="submit">定位</button>
      </div>
      <div v-if="msg" class="msg">{{ msg }}</div>
      <button class="btn danger" @click="endBad">跳到坏结局（测试）</button>
    </div>
  </div>
</template>

<style scoped>
.map { height: 100%; background: #eef3f2; display: flex; flex-direction: column; }
.bar { height: 46px; flex: 0 0 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; background: #fff; border-bottom: 1px solid #d5dcdb; }
.title { font-size: 15px; font-weight: 500; }
.map-canvas { flex: 1; position: relative; background: linear-gradient(180deg,#cfe0e4,#a9c9cf); overflow: hidden; min-height: 200px; }
.grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px); background-size: 40px 40px; }
.coast { position: absolute; left: -5%; bottom: -10%; width: 70%; height: 70%; background: #c9bfa4; clip-path: polygon(0 0, 40% 8%, 62% 30%, 78% 55%, 100% 70%, 100% 100%, 0 100%); }
.pin { position: absolute; right: 18%; top: 40%; font-size: 13px; color: #8e2b2b; }
.tide { position: absolute; left: 14px; bottom: 14px; background: rgba(255,255,255,.7); padding: 6px 10px; font-size: 11px; border-radius: 4px; }
.panel { flex: 0 0 auto; background: #fff; padding: 16px 18px; border-top: 1px solid #d5dcdb; }
.panel h3 { font-size: 14px; margin: 0 0 6px; font-weight: 500; }
.panel p { font-size: 12px; margin: 0 0 12px; }
.row { display: flex; gap: 8px; }
.row input { flex: 1; padding: 8px 10px; border: 1px solid #d5dcdb; border-radius: 4px; }
.msg { font-size: 12px; color: #2f6f8f; margin-top: 10px; }
.danger { margin-top: 12px; font-size: 11px; color: #8e2b2b; }
</style>
