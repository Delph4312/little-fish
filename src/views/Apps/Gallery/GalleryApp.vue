<script setup>
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const game = useGameStore()

const photos = [
  { id: 1, name: 'IMG_0903.jpg', label: '远处防波堤夜景', exif: null, gradient: 'linear-gradient(160deg,#2c3e50,#1a2f3a)' },
  { id: 2, name: 'IMG_0915.jpg', label: '便利店咖啡', exif: null, gradient: 'linear-gradient(160deg,#e8d5b5,#c9a882)' },
  { id: 3, name: 'IMG_1002.jpg', label: '灰蓝色海面与低云', exif: null, gradient: 'linear-gradient(160deg,#9fb7c2,#6e8fa0)' },
  { id: 4, name: 'IMG_1021.jpg', label: '一盘土豆丝', exif: null, gradient: 'linear-gradient(160deg,#e6d9b8,#c9b886)' },
  { id: 5, name: 'IMG_1106.jpg', label: '书桌和台灯', exif: null, gradient: 'linear-gradient(160deg,#d9c9a8,#8a7452)' },
  { id: 6, name: 'IMG_1114.jpg', label: '海边防波堤（原图）', exif: '32.9216, 118.4837', gradient: 'linear-gradient(160deg,#7c9aa8,#2f5d70)', key: true }
]

const selected = ref(null)
function openPhoto(p) {
  selected.value = p
  if (p.exif) game.addClue('exif-found')
}
</script>

<template>
  <div class="gallery">
    <div class="bar"><span class="title">相册</span><span class="muted">6 张照片</span></div>
    <div class="grid">
      <div v-for="p in photos" :key="p.id" class="photo" @click="openPhoto(p)">
        <div class="thumb" :style="{ background: p.gradient }"></div>
        <div class="pname">{{ p.name }}</div>
        <span v-if="p.key" class="star">★</span>
      </div>
    </div>

    <div v-if="selected" class="viewer" @click.self="selected = null">
      <div class="viewer-card">
        <div class="v-head">{{ selected.name }} <span @click="selected = null">×</span></div>
        <div class="v-image" :style="{ background: selected.gradient }"></div>
        <div class="v-info">
          <div><b>描述：</b>{{ selected.label }}</div>
          <div v-if="selected.exif"><b>EXIF 坐标：</b>{{ selected.exif }}</div>
          <div v-else class="muted">未检测到 EXIF 信息</div>
          <p v-if="selected.exif" class="tip">提示：把这个坐标输入到"地图与潮汐"里试试。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery { height: 100%; background: #f5f5f3; }
.bar { height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; border-bottom: 1px solid #e2e7e6; }
.title { font-size: 15px; font-weight: 500; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 18px; }
.photo { position: relative; cursor: pointer; background: #fff; border-radius: 5px; padding: 6px; border: 1px solid #e2e7e6; }
.photo:hover { border-color: #9fc4d4; }
.thumb { height: 110px; border-radius: 3px; }
.pname { font-size: 11px; text-align: center; margin-top: 6px; color: #5b6b73; }
.star { position: absolute; top: 10px; right: 10px; color: #e8b93a; }
.viewer { position: fixed; inset: 0; background: rgba(8,16,20,.82); display: grid; place-items: center; z-index: 60000; }
.viewer-card { width: 560px; background: #fff; border-radius: 6px; overflow: hidden; }
.v-head { background: #26363e; color: #fff; padding: 10px 16px; font-size: 13px; display: flex; justify-content: space-between; }
.v-head span { cursor: pointer; }
.v-image { height: 300px; }
.v-info { padding: 16px 20px; font-size: 13px; line-height: 1.9; }
.tip { color: #8e6a3a; font-size: 12px; margin: 10px 0 0; }
</style>
