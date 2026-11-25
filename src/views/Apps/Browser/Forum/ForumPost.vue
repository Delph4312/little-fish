<script setup>
import { ref, computed, reactive } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'

const props = defineProps({ post: { type: Object, default: null } })
const emit = defineEmits(['back', 'open-profile', 'navigate'])

// 右侧栏：快捷入口 + 今日热度榜（与论坛主页一致）
const hotList = [
  { title: '-', replies: 71 }, { title: '-', replies: 40 }, { title: '-', replies: 97 },
  { title: '-', replies: 60 }, { title: '-', replies: 73 }
]
const game = useGameStore()
const system = useSystemStore()

const input = ref('')

const allComments = computed(() => {
  if (!props.post) return []
  const base = (props.post.comments || []).map((c) => ({ ...c }))
  // 顶层评论只取主楼回复；子回复（isSubReply）只在对应评论下方的小评论条显示，不重复出现在评论区
  const mine = (game.userComments[props.post.id] || []).filter((c) => !c.isSubReply)
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
  // 用户主楼新回复始终保留，确保「最新回复在评论区最底端」可见
  const mineComments = list.filter((c) => c.mine && !c.isSubReply)
  mineComments.forEach((mc) => {
    if (!kept.some((k) => k.text === mc.text && k.user === mc.user)) kept.push(mc)
  })
  // 第16项：回复点赞数不再为 0，补一个非零数
  kept = kept.map((c) => ({ ...c, likes: (c.likes > 0 ? c.likes : (Math.abs(hashStr(c.user + c.text)) % 90) + 3) }))
  // 第35项：补日期，按时间从早到晚排序（最早在前，最新在底）
  kept = kept.map((c, idx) => ({
    ...c,
    date: c.date || c.time || commentDateFor(idx)
  }))
  kept.sort((a, b) => dateValue(a.date) - dateValue(b.date))
  // 不足补空白评论（先补齐，再把用户新回复统一挪到最底端，保证最新回复永远在最后）
  let fillIdx = 0
  const blankLikes = [38, 61, 86, 59, 57, 73, 11]
  while (kept.length < commentPageSize) {
    kept.push({ user: '-', text: '-', blank: true, likes: blankLikes[fillIdx % blankLikes.length], date: commentDateFor(kept.length) })
    fillIdx++
  }
  const mineTail = kept.filter((c) => c.mine && !c.isSubReply)
  if (mineTail.length) {
    kept = kept.filter((c) => !(c.mine && !c.isSubReply)).concat(mineTail)
  }
  return kept
})

// 评论日期：游戏内时间线为 2026-11-23，这里给一条从早到晚的日期序列
function commentDateFor(idx) {
  const day = 18 + (idx % 6) // 18~23 日
  const hh = String(8 + (idx * 3) % 14).padStart(2, '0')
  const mm = String((idx * 17) % 60).padStart(2, '0')
  return `2026年11月${day}日 ${hh}:${mm}`
}
function dateValue(s) {
  const m = String(s || '').match(/(\d+)年(\d+)月(\d+)日\s*(\d+):(\d+)/)
  if (!m) return 0
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
}
function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}
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
  // 游戏内时间线：2026年11月23日；用真实时分让新回复排在最底端
  const d = new Date()
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  game.userComments[props.post.id].push({
    user: usersName(), text, time: '刚刚',
    date: `2026年11月23日 ${hhmm}`, mine: true
  })
  input.value = ''
  // 跳到评论区最后一页，确保最新回复可见在最底端
  commentPage.value = commentTotalPages.value
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
  const d = new Date()
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  // 回复作为子评论存储，绑定被回复的用户，展示在该评论下方的小评论条中
  game.userComments[props.post.id].push({
    user: '遥遥云梦泽', text, time: '刚刚',
    date: `2026年11月23日 ${hhmm}`,
    mine: true, replyToUser: target, isSubReply: true
  })
  replyText.value = ''
  replyTo.value = null
}

// 取某条评论下的子回复（小评论条）
function subRepliesOf(c) {
  if (c.blank) return []
  return (game.userComments[props.post.id] || []).filter(
    (r) => r.isSubReply && r.replyToUser === c.user
  )
}

// 可点击跳转主页的评论者（含遥遥云梦泽）
function isLinkUser(name) {
  return ['小岛老师', '鲸鱼先生', '遥遥云梦泽', '谢遥'].includes(name)
}
</script>

<template>
  <div class="post-detail" v-if="post">
    <div class="bar"><button @click="emit('back')">‹ 返回列表</button><span>{{ post.section }}</span></div>
    <div class="detail-layout">
      <div class="wrap">
      <h1>{{ post.title }}</h1>
      <div class="meta">楼主：
        <b
          class="post-author"
          :class="{ link: isLinkUser(post.author) }"
          @click="isLinkUser(post.author) && emit('open-profile', post.author)"
        >{{ post.author }}</b>
        · 发表于 {{ post.time }}
      </div>
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
              <span v-if="c.date" class="c-time">{{ c.date }}</span>
            </div>
            <div class="c-text">{{ c.text }}</div>
            <div class="c-actions">
              <span class="act" :class="{ on: likedComments[i] }" @click="toggleCommentLike(i)">👍 {{ commentLikes(c, i) }}</span>
              <span class="act" @click="openReply(i)">💬 回复</span>
            </div>
            <!-- 子回复：小评论条，显示在对应评论下方 -->
            <div v-if="subRepliesOf(c).length" class="sub-replies">
              <div v-for="(sr, si) in subRepliesOf(c)" :key="si" class="sub-reply">
                <b class="sub-user">{{ sr.user }}</b>：<span class="sub-text">{{ sr.text }}</span>
                <span class="sub-date">{{ sr.date || '2026年11月23日 15:20' }}</span>
              </div>
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
      </div><!-- /wrap -->

      <!-- 右侧栏：快捷入口 + 今日热度榜 -->
      <aside class="detail-side">
        <div class="side-card">
          <div class="side-card-title">快捷入口</div>
          <div class="quick-grid">
            <div class="quick" @click="emit('navigate', 'bottle')"><span class="qc">🍾</span>漂流瓶</div>
            <div class="quick" @click="emit('navigate', '求助')"><span class="qc">🆘</span>求助</div>
            <div class="quick" @click="emit('navigate', '生活')"><span class="qc">🌱</span>生活</div>
            <div class="quick" @click="emit('navigate', '闲聊')"><span class="qc">💬</span>闲聊</div>
          </div>
        </div>
        <div class="side-card">
          <div class="side-card-title">🔥 今日热度榜</div>
          <div v-for="(p, i) in hotList" :key="i" class="hot-row">
            <span class="rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
            <span class="hot-title">{{ p.title }}</span>
            <span class="hot-replies">{{ p.replies }}</span>
          </div>
        </div>
      </aside>
    </div><!-- /detail-layout -->
  </div>
</template>

<style scoped>
.post-detail { min-height: 100%; background: #fff; }
.bar { display: flex; justify-content: space-between; padding: 10px 20px; border-bottom: 1px solid #eef1f0; font-size: 12px; color: #6b7b82; }
.bar button { border: 0; background: transparent; color: #2f6f8f; cursor: pointer; font-size: 12px; }
/* 帖子详情两栏：内容卡片靠左，右侧保留侧栏；随窗口响应式缩放 */
.detail-layout { display: flex; gap: clamp(12px, 1.6vw, 24px); width: 100%; max-width: 1600px; margin: 0 auto; padding: clamp(12px, 1.6vw, 26px); align-items: flex-start; box-sizing: border-box; }
.wrap { flex: 1; min-width: 0; max-width: 900px; margin: 0; padding: 4px 0; box-sizing: border-box; }
.detail-side { width: clamp(220px, 22vw, 320px); flex: 0 0 clamp(220px, 22vw, 320px); display: flex; flex-direction: column; gap: 14px; }
.side-card { background: #fafbfb; border: 1px solid #e2e7e6; border-radius: 6px; padding: 14px; }
.side-card-title { font-size: 13px; font-weight: 600; color: #2c3e46; margin-bottom: 12px; }
.quick-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.quick { display: flex; align-items: center; gap: 6px; padding: 10px; background: #f2f5f4; border-radius: 5px; font-size: 12px; cursor: pointer; }
.quick:hover { background: #e1ecef; }
.qc { font-size: 16px; }
.hot-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f3f3; font-size: 12px; }
.rank { width: 18px; text-align: center; color: #9aa7ab; }
.rank.top { color: #b23b3b; font-weight: 600; }
.hot-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #4a5b62; }
.hot-replies { color: #a5b0b3; font-size: 11px; }
@media (max-width: 900px) { .detail-layout { flex-direction: column; } .detail-side { width: 100%; flex: 1 1 auto; flex-direction: row; flex-wrap: wrap; } .detail-side .side-card { flex: 1 1 240px; } }
/* 楼主名：与评论区用户名同色号，鲸鱼先生等可跳转主页 */
.post-author { color: #4a6d8c; font-weight: 500; }
.post-author.link { cursor: pointer; }
.post-author.link:hover { text-decoration: underline; }
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
.sub-replies { margin: 8px 0 0 14px; padding-left: 12px; border-left: 2px solid #cfe0e9; }
.sub-reply { font-size: 12px; line-height: 1.8; color: #39474d; padding: 4px 0; }
.sub-user { color: #4a6d8c; font-weight: 500; }
.sub-date { color: #a5b0b3; font-size: 10px; margin-left: 8px; }
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
