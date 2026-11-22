<script setup>
import { ref, computed, reactive } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'

const props = defineProps({ post: { type: Object, default: null } })
const emit = defineEmits(['back', 'open-profile'])
const game = useGameStore()
const system = useSystemStore()

const input = ref('')

const allComments = computed(() => {
  if (!props.post) return []
  const base = (props.post.comments || []).map((c) => ({ ...c }))
  const mine = game.userComments[props.post.id] || []
  return [...base, ...mine]
})

// 每页最多 7 条：保留小岛老师/鲸鱼先生/作者，其余随机去除，不足用 "-" 空白评论补齐
const commentPageSize = 7
const commentPage = ref(1)
const preparedComments = computed(() => {
  const list = allComments.value
  const mustKeep = list.filter((c) => ['小岛老师', '鲸鱼先生'].includes(c.user) || c.isAuthor || c.mine)
  const others = list.filter((c) => !['小岛老师', '鲸鱼先生'].includes(c.user) && !c.isAuthor && !c.mine)
  // 随机打散普通评论
  const shuffled = [...others].sort(() => Math.random() - 0.5)
  let kept = [...mustKeep, ...shuffled].slice(0, commentPageSize)
  // 不足补空白评论
  let fillIdx = 0
  const blankLikes = [38, 61, 86, 59, 57, 73, 11]
  while (kept.length < commentPageSize) {
    kept.push({ user: '-', text: '-', blank: true, likes: blankLikes[fillIdx % blankLikes.length] })
    fillIdx++
  }
  return kept
})
const commentTotalPages = computed(() => Math.max(1, Math.ceil(preparedComments.value.length / commentPageSize)))
const pageComments = computed(() =>
  preparedComments.value.slice((commentPage.value - 1) * commentPageSize, commentPage.value * commentPageSize)
)

function postComment() {
  const text = input.value.trim()
  if (!text) return
  if (!game.forumLoggedIn) {
    system.notify({ from: '浅湾论坛', text: '请先登录论坛，才能发言。' })
    return
  }
  if (!game.userComments[props.post.id]) game.userComments[props.post.id] = []
  game.userComments[props.post.id].push({ user: usersName(), text, time: '刚刚', mine: true })
  input.value = ''
  commentPage.value = 1
}
function usersName() { return '遥遥云梦泽' }

// 帖子点赞：≤99，点赞 +1
const postLiked = computed(() => game.likedPosts?.includes?.(props.post?.id) || false)
function togglePostLike() {
  if (!game.likedPosts) game.likedPosts = []
  const i = game.likedPosts.indexOf(props.post.id)
  if (i >= 0) game.likedPosts.splice(i, 1)
  else game.likedPosts.push(props.post.id)
}
const displayLikes = computed(() => {
  const base = Math.min(99, props.post?.likes || 0)
  return base + (postLiked.value ? 1 : 0)
})

// 评论点赞与回复
const likedComments = reactive({})
function toggleCommentLike(i) {
  likedComments[i] = !likedComments[i]
}
function commentLikes(c, i) {
  const base = Math.min(99, c.likes || 0)
  return base + (likedComments[i] ? 1 : 0)
}
const replyTo = ref(null)
const replyText = ref('')
function openReply(i) {
  replyTo.value = i
  replyText.value = ''
}
function sendReply(i) {
  const text = replyText.value.trim()
  if (!text) return
  if (!game.forumLoggedIn) {
    system.notify({ from: '浅湾论坛', text: '请先登录论坛。' })
    return
  }
  if (!game.userComments[props.post.id]) game.userComments[props.post.id] = []
  const target = pageComments.value[i]?.user || ''
  game.userComments[props.post.id].push({ user: '遥遥云梦泽', text: `回复 ${target}：${text}`, time: '刚刚', mine: true })
  replyText.value = ''
  replyTo.value = null
}

// 可点击跳转主页的评论者（含遥遥云梦泽）
function isLinkUser(name) {
  return ['小岛老师', '鲸鱼先生', '遥遥云梦泽', '谢遥'].includes(name)
}
</script>

<template>
  <div class="post-detail" v-if="post">
    <div class="bar"><button @click="emit('back')">‹ 返回列表</button><span>{{ post.section }}</span></div>
    <div class="wrap">
      <h1>{{ post.title }}</h1>
      <div class="meta">楼主：{{ post.author }} · 发表于 {{ post.time }}</div>
      <p v-for="(line, i) in post.content" :key="i" class="para">{{ line }}</p>
      <div class="stats">
        <span class="act" :class="{ on: postLiked }" @click="togglePostLike">👍 {{ displayLikes }}</span>
        <span>💬 回复 {{ post.replies + (game.userComments[post.id]?.length || 0) }}</span>
      </div>
      <div class="comments">
        <div class="c-title">评论区</div>
        <template v-if="!post.commentsClosed">
          <div v-for="(c, i) in pageComments" :key="i" class="comment" :class="{ mine: c.mine, blank: c.blank }">
            <div class="c-head">
              <b
                class="c-user"
                :class="{ link: isLinkUser(c.user) }"
                @click="isLinkUser(c.user) && emit('open-profile', c.user)"
              >{{ c.user }}</b>
              <span v-if="c.replyTo" class="c-reply-to">回复 @{{ c.replyTo }}</span>
              <span v-if="c.time" class="c-time">{{ c.time }}</span>
            </div>
            <div class="c-text">{{ c.text }}</div>
            <div class="c-actions">
              <span class="act" :class="{ on: likedComments[i] }" @click="toggleCommentLike(i)">👍 {{ commentLikes(c, i) }}</span>
              <span class="act" @click="openReply(i)">💬 回复</span>
            </div>
            <div v-if="replyTo === i" class="reply-box">
              <input v-model="replyText" placeholder="回复…" @keyup.enter="sendReply(i)" />
              <button class="btn" @click="sendReply(i)">发送</button>
            </div>
          </div>
          <!-- 评论区分页 -->
          <div class="comment-pager" v-if="commentTotalPages > 1">
            <button v-for="n in commentTotalPages" :key="n" :class="{ cur: commentPage === n }" @click="commentPage = n">{{ n }}</button>
          </div>
        </template>
        <div v-else class="closed">{{ post.commentsClosedText }}</div>
      </div>

      <div class="composer" v-if="!post.commentsClosed">
        <div v-if="!game.forumLoggedIn" class="need-login" @click="system.notify({ from: '浅湾论坛', text: '请先登录论坛。' })">
          登录后参与讨论 →
        </div>
        <template v-else>
          <textarea v-model="input" placeholder="说点什么……" @keyup.ctrl.enter="postComment"></textarea>
          <div class="composer-row">
            <span class="muted">Ctrl + Enter 发送</span>
            <button class="btn btn-primary" @click="postComment">发表回复</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-detail { min-height: 100%; background: #fff; }
.bar { display: flex; justify-content: space-between; padding: 10px 20px; border-bottom: 1px solid #eef1f0; font-size: 12px; color: #6b7b82; }
.bar button { border: 0; background: transparent; color: #2f6f8f; cursor: pointer; font-size: 12px; }
.wrap { max-width: 720px; margin: 0 auto; padding: 24px 20px; }
h1 { font-size: 20px; font-weight: 600; line-height: 1.5; margin: 0 0 10px; }
.meta { font-size: 12px; color: #a5b0b3; margin-bottom: 22px; }
.para { font-size: 14px; line-height: 2; color: #2b373d; margin: 0 0 14px; }
.stats { font-size: 12px; color: #5b6b73; padding: 14px 0; border-top: 1px solid #eef1f0; border-bottom: 1px solid #eef1f0; display: flex; gap: 20px; }
.act { cursor: pointer; }
.act:hover, .act.on { color: #2f6f8f; }
.comments { padding-top: 8px; }
.c-title { font-size: 14px; font-weight: 500; padding: 12px 0; }
.comment { font-size: 13px; line-height: 1.8; padding: 12px; background: #f6f8f8; border-radius: 4px; margin-bottom: 8px; }
.comment.mine { background: #e4f0ea; }
.comment.blank { opacity: .55; }
.c-head { display: flex; align-items: center; gap: 8px; }
.c-user { font-weight: 500; color: #4a6d8c; }
.c-user.link { cursor: pointer; color: #2f6f8f; }
.c-user.link:hover { text-decoration: underline; }
.c-reply-to { font-size: 11px; color: #9aa7ab; }
.c-time { font-size: 10px; color: #a5b0b3; margin-left: auto; }
.c-text { margin: 2px 0 6px; }
.c-actions { display: flex; gap: 16px; font-size: 11px; color: #9aa7ab; }
.reply-box { display: flex; gap: 6px; margin-top: 8px; }
.reply-box input { flex: 1; padding: 6px 8px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; }
.reply-box .btn { padding: 5px 12px; font-size: 12px; }
.comment-pager { display: flex; gap: 6px; justify-content: center; padding: 12px 0; }
.comment-pager button { border: 1px solid #d5dcdb; background: #fff; border-radius: 4px; padding: 4px 10px; font-size: 12px; cursor: pointer; }
.comment-pager button.cur { background: #2f6f8f; color: #fff; border-color: #2f6f8f; }
.closed { padding: 24px; text-align: center; color: #9aa7ab; font-size: 12px; }
.composer { margin: 20px 0 0; padding-top: 16px; border-top: 1px solid #eef1f0; }
.composer textarea { width: 100%; height: 72px; resize: vertical; border: 1px solid #d5dcdb; border-radius: 4px; padding: 9px; font-size: 13px; }
.composer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.composer-row .muted { font-size: 11px; }
.need-login { padding: 16px; text-align: center; background: #f2f5f4; border-radius: 4px; font-size: 12px; color: #6b7b82; cursor: pointer; }
</style>
