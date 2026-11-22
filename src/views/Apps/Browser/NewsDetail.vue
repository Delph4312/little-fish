<script setup>
import { ref, reactive } from 'vue'
import { useSystemStore } from '@/stores/systemStore'

const props = defineProps({ article: { type: Object, required: true } })
const emit = defineEmits(['back'])
const system = useSystemStore()

// 每条评论的点赞状态与本地增减
const liked = reactive({})
function toggleLike(i) {
  liked[i] = !liked[i]
}

// 回复弹框
const replyTo = ref(null)
const replyText = ref('')
const extraComments = reactive({})
function openReply(i) {
  replyTo.value = i
  replyText.value = ''
}
function sendReply(i) {
  const text = replyText.value.trim()
  if (!text) return
  if (!extraComments[i]) extraComments[i] = []
  extraComments[i].push({ user: '你', text })
  replyText.value = ''
  replyTo.value = null
}
</script>

<template>
  <div class="detail">
    <div class="top-nav"><button @click="emit('back')">‹ 返回列表</button><span>相关推荐</span></div>
    <div class="article">
      <h1>{{ article.title }}</h1>
      <div class="meta">{{ article.category }} · {{ article.time }}</div>
      <p v-for="(p, i) in article.paragraphs" :key="i" class="para">{{ p }}</p>
      <div class="note-img" v-if="article.commentsClosed">[ 页面配图已黑白处理 ]</div>
    </div>
    <div class="comments" v-if="!article.commentsClosed">
      <div class="c-title">评论区 {{ article.commentCount }}条</div>
      <div v-for="(c, i) in article.comments" :key="i" class="comment">
        <div class="c-head">
          <b v-if="c.hot" class="hot-tag">热评</b>
          <span class="user">{{ c.user }}</span>
        </div>
        <div class="c-text">{{ c.text }}</div>
        <div class="c-meta">
          <span class="act" :class="{ on: liked[i] }" @click="toggleLike(i)">👍 {{ c.likes }}<span v-if="liked[i]">·你</span></span>
          <span class="act" @click="openReply(i)">💬 回复 {{ c.replies }}</span>
        </div>
        <div v-if="extraComments[i] && extraComments[i].length" class="replies">
          <div v-for="(r, k) in extraComments[i]" :key="k"><b>{{ r.user }}：</b>{{ r.text }}</div>
        </div>
        <div v-if="replyTo === i" class="reply-box">
          <input v-model="replyText" placeholder="回复…" @keyup.enter="sendReply(i)" />
          <button class="btn" @click="sendReply(i)">发送</button>
        </div>
      </div>
    </div>
    <div class="closed" v-else>
      {{ article.commentsClosedText }}
    </div>
    <div class="bottom"><button class="btn" @click="emit('back')">返回列表</button></div>
  </div>
</template>

<style scoped>
.detail { background: #fff; min-height: 100%; padding-bottom: 30px; }
.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 10px 22px; border-bottom: 1px solid #eef1f0; font-size: 12px; color: #6b7b82; }
.top-nav button { border: 0; background: transparent; color: #2f6f8f; font-size: 12px; cursor: pointer; }
.article { max-width: 720px; margin: 0 auto; padding: 24px 20px; }
.article h1 { font-size: 21px; line-height: 1.5; font-weight: 600; margin: 0 0 10px; }
.meta { color: #a5b0b3; font-size: 12px; margin-bottom: 22px; }
.para { font-size: 14px; line-height: 2; color: #2b373d; margin: 0 0 16px; text-indent: 2em; }
.note-img { height: 100px; background: linear-gradient(135deg,#b9c6cc,#e0d5c4); filter: grayscale(1); display: grid; place-items: center; color: #556; font-size: 11px; border-radius: 3px; }
.comments { max-width: 720px; margin: 0 auto; padding: 0 20px; }
.c-title { font-size: 15px; font-weight: 500; padding: 16px 0; border-top: 2px solid #eef1f0; }
.comment { padding: 14px 0; border-bottom: 1px solid #eef1f0; }
.c-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.user { font-size: 13px; color: #4a6d8c; font-weight: 500; }
.hot-tag { background: #fbeaea; color: #b23b3b; font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 400; }
.c-text { font-size: 13px; line-height: 1.7; }
.c-meta { font-size: 11px; color: #a5b0b3; margin-top: 8px; display: flex; gap: 16px; }
.act { cursor: pointer; }
.act:hover, .act.on { color: #2f6f8f; }
.replies { margin-top: 8px; padding: 8px 10px; background: #f6f8f8; border-radius: 4px; font-size: 12px; line-height: 1.7; }
.replies b { color: #4a6d8c; }
.reply-box { display: flex; gap: 6px; margin-top: 8px; }
.reply-box input { flex: 1; padding: 6px 8px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; }
.reply-box .btn { padding: 5px 12px; font-size: 12px; }
.closed { max-width: 720px; margin: 0 auto; padding: 20px; color: #9aa7ab; font-size: 12px; text-align: center; }
.bottom { text-align: center; margin-top: 24px; }
</style>
