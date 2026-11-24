<script setup>
import { reactive, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { images } from '@/data/images'

const props = defineProps({
  moments: { type: Array, default: () => [] },
  cover: { type: String, default: '' }
})
const game = useGameStore()

// 每条动态的点赞状态（是否已点赞）与追加评论
// 数据里 likes 已包含「谢遥」的动态，初始就显示已点赞（♥ 深色实心）
const liked = reactive({})
props.moments.forEach((m, i) => {
  if ((m.likes || []).includes('谢遥')) liked[i] = true
})
const extraComments = reactive({})
const commentOpen = ref(null)
const commentText = ref('')

function toggleLike(i) {
  liked[i] = !liked[i]
}

function openComment(i) {
  commentOpen.value = i
  commentText.value = ''
}

function sendComment(i) {
  const text = commentText.value.trim()
  if (!text) return
  if (!extraComments[i]) extraComments[i] = []
  extraComments[i].push({ user: '谢遥', text })
  commentText.value = ''
  commentOpen.value = null
}

// 朋友圈图片映射
const momentImgMap = {
  '便利店咖啡': images.moments.coffee,
  '土豆丝': images.moments.potato,
  '一盘土豆丝': images.moments.potato,
  '家常菜': images.moments.home,
  '一桌家常菜': images.moments.home,
  '防波堤夜景': images.moments.seawall,
  '远处防波堤夜景': images.moments.seawall,
  '书桌和台灯': images.moments.seawall
}
const avatarMap = {
  '谢遥': images.avatar.xieyao,
  '谢晴': images.avatar.sister,
  '爸爸': images.avatar.dad,
  '妈妈': images.avatar.mom
}
function imgUrl(name) { return momentImgMap[name] || null }
function avatarUrl(name) { return avatarMap[name] || null }

// 显示点赞名单：原始 + 我（谢遥）点赞时追加；去重避免「谢遥」出现两次
function displayLikes(m, i) {
  const arr = [...(m.likes || [])]
  if (liked[i] && !arr.includes('谢遥')) arr.push('谢遥')
  return arr
}
</script>

<template>
  <div class="moments">
    <div class="cover">
      <div class="cover-scene" v-lazy-bg="images.moments.seawall"></div>
      <div class="cover-name">谢遥</div>
    </div>
    <div class="feed">
      <div v-for="(m, i) in moments" :key="i" class="moment">
        <div class="m-avatar" v-lazy-bg="avatarUrl(m.user) || ''">{{ avatarUrl(m.user) ? '' : m.avatarText }}</div>
        <div class="m-body">
          <div class="m-user">{{ m.user }}</div>
          <div class="m-text">{{ m.text }}</div>
          <div v-if="m.images && m.images.length" class="m-images">
            <div v-for="(img, j) in m.images" :key="j" class="m-img" v-lazy-bg="imgUrl(img) || ''">{{ imgUrl(img) ? '' : img }}</div>
          </div>
          <div class="m-meta">
            <span>{{ m.time }}</span>
            <span v-if="m.visibility" class="vis">{{ m.visibility }}</span>
            <span class="m-actions">
              <span class="act" :class="{ liked: liked[i] }" @click="toggleLike(i)">{{ liked[i] ? '♥' : '♡' }} 赞</span>
              <span class="act" @click="openComment(i)">💬 评论</span>
            </span>
          </div>
          <div v-if="displayLikes(m, i).length" class="m-likes"><span class="heart">♥</span> {{ displayLikes(m, i).join('、') }}</div>
          <div v-if="(m.comments && m.comments.length) || (extraComments[i] && extraComments[i].length)" class="m-comments">
            <div v-for="(c, k) in m.comments || []" :key="'o'+k"><b>{{ c.user }}：</b>{{ c.text }}</div>
            <div v-for="(c, k) in extraComments[i] || []" :key="'e'+k"><b>{{ c.user }}：</b>{{ c.text }}</div>
          </div>
          <div v-if="commentOpen === i" class="comment-box">
            <input v-model="commentText" placeholder="评论…" @keyup.enter="sendComment(i)" />
            <button class="btn" @click="sendComment(i)">发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.moments { height: 100%; overflow: auto; background: #ededed; }
.cover { height: 180px; position: relative; background: #6f97a4; }
.cover-scene { position: absolute; inset: 0; background: linear-gradient(180deg, #b9c8c6 0%, #dcc09a 45%, #4d7383 46%, #21485c 100%); }
.cover-scene::after { content: ""; position: absolute; right: 22%; bottom: 0; width: 90px; height: 34px; background: #16303c; clip-path: polygon(0 100%, 30% 0, 70% 0, 100% 100%); }
.cover-name { position: absolute; right: 18px; bottom: 12px; color: #fff; font-size: 16px; text-shadow: 0 1px 4px rgba(0,0,0,.5); }
.feed { padding: 10px 20px; }
.moment { display: flex; gap: 12px; padding: 18px 0; border-bottom: 1px solid #dcdcdc; }
.m-avatar { width: 40px; height: 40px; flex: 0 0 40px; border-radius: 4px; background: #cfe0d6; color: #46685a; display: grid; place-items: center; font-size: 15px; }
.m-body { flex: 1; min-width: 0; }
.m-user { color: #4a6d8c; font-size: 13px; font-weight: 500; margin-bottom: 5px; }
.m-text { font-size: 13px; line-height: 1.7; }
.m-images { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.m-img { width: 110px; height: 82px; border-radius: 3px; background: linear-gradient(135deg, #a9c0c6, #e0ccae); display: grid; place-items: center; font-size: 10px; color: #3f5964; text-align: center; padding: 4px; }
.m-meta { display: flex; gap: 12px; color: #9aa7ab; font-size: 11px; margin-top: 8px; align-items: center; }
.vis { color: #8c9a9e; }
.m-actions { margin-left: auto; display: flex; gap: 10px; }
.act { cursor: pointer; color: #6b7b82; }
.act:hover { color: #2f6f8f; }
.act.liked { color: #8a2b3a; }
.m-likes { margin-top: 8px; background: #e3e8ea; padding: 6px 10px; font-size: 12px; color: #4a6d8c; border-radius: 3px; }
.m-likes .heart { color: #8a2b3a; }
.m-comments { margin-top: 6px; background: #e3e8ea; padding: 8px 10px; font-size: 12px; line-height: 1.7; border-radius: 3px; }
.m-comments b { color: #4a6d8c; font-weight: 500; }
.comment-box { display: flex; gap: 6px; margin-top: 8px; }
.comment-box input { flex: 1; padding: 6px 8px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; }
.comment-box .btn { padding: 5px 12px; font-size: 12px; }
</style>
