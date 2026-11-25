<script setup>
import { ref, computed } from 'vue'
import { poemNote, otherNotes, xhsNav } from '@/data/xhsData'

const view = ref('feed') // feed | detail
const current = ref(null)
const activeNav = ref('发现')
const keyword = ref('')
const commentDraft = ref('')

// 送别诗帖子放在第一行最右（第 4 位），与原先首行最右的帖子交换
const allNotes = computed(() => {
  const arr = [...otherNotes]
  const swapIndex = 3 // 第一行第 4 个
  const displaced = arr[swapIndex]
  arr[swapIndex] = poemNote
  return [displaced, ...arr.slice(1)]
})

function openNote(note) {
  current.value = note
  view.value = 'detail'
}
function back() {
  view.value = 'feed'
  activeNav.value = '发现'
}
function selectNav(n) {
  activeNav.value = n
  view.value = 'feed'
}

function toggleLike(note) {
  note.liked = !note.liked
  note.stats.likes += note.liked ? 1 : -1
}
function toggleFav(note) {
  note.faved = !note.faved
  note.stats.favs += note.faved ? 1 : -1
}
function toggleCommentLike(c) {
  c.liked = !c.liked
  c.likes += c.liked ? 1 : -1
}
function sendComment(note) {
  const text = commentDraft.value.trim()
  if (!text) return
  note.comments.push({ id: Date.now(), user: '我', avatar: '我', text, likes: 0, liked: false })
  note.stats.comments += 1
  commentDraft.value = ''
}
</script>

<template>
  <div class="xhs">
    <!-- 左侧导航 -->
    <aside class="xhs-side">
      <div class="xhs-logo" @click="back">
        <span class="logo-mark">小</span>
        <span class="logo-word">小红书</span>
      </div>
      <div class="side-nav">
        <div
          v-for="n in xhsNav"
          :key="n"
          class="side-item"
          :class="{ active: activeNav === n }"
          @click="selectNav(n)"
        >{{ n }}</div>
      </div>
      <div class="side-foot">你的生活指南</div>
    </aside>

    <div class="xhs-main">
      <!-- 顶部搜索 -->
      <header class="xhs-top">
        <div class="search-wrap">
          <input v-model="keyword" placeholder="搜索你感兴趣的内容" />
          <button @click="() => {}">🔍</button>
        </div>
      </header>

      <!-- 其他板块内容（发布/通知/我） -->
      <div class="xhs-content nav-panel" v-if="activeNav !== '发现'">
        <template v-if="activeNav === '发布'">
          <div class="panel-head">发布笔记</div>
          <div class="publish-box">
            <div class="pub-upload">＋ 上传图片 / 视频</div>
            <input class="pub-title" placeholder="填写标题，更容易被看到" />
            <textarea class="pub-body" placeholder="分享你的生活和想法…"></textarea>
            <button class="btn btn-primary pub-btn">发布笔记</button>
          </div>
        </template>
        <template v-else-if="activeNav === '通知'">
          <div class="panel-head">通知</div>
          <div class="notice-list">
            <div class="notice-item"><span class="ni-ic">❤️</span><div><b>橘子汽水</b> 赞了你的笔记 <span class="ni-time">昨天 21:14</span></div></div>
            <div class="notice-item"><span class="ni-ic">💬</span><div><b>慢半拍</b> 评论了你：写得好真实 <span class="ni-time">2天前</span></div></div>
            <div class="notice-item"><span class="ni-ic">⭐</span><div><b>看到我叫我去做项目</b> 收藏了你的笔记 <span class="ni-time">3天前</span></div></div>
          </div>
        </template>
        <template v-else-if="activeNav === '我'">
          <div class="profile-head">
            <div class="ph-avatar">我</div>
            <div class="ph-name">我的小红书</div>
            <div class="ph-id">小红书号：xiaoyu_2026</div>
          </div>
          <div class="profile-stats"><span><b>12</b> 关注</span><span><b>38</b> 粉丝</span><span><b>156</b> 获赞与收藏</span></div>
          <div class="panel-head">我的笔记</div>
          <div class="profile-notes">
            <div class="pn-card"><div class="pn-cover"></div><div class="pn-title">我的第一篇笔记</div></div>
          </div>
        </template>
      </div>

      <!-- 笔记流 -->
      <div class="xhs-content" v-else-if="activeNav === '发现' && view === 'feed'">
        <div class="feed-grid">
          <div v-for="note in allNotes" :key="note.id" class="note-card" @click="openNote(note)">
            <div class="note-cover" :style="{ background: note.cover || 'linear-gradient(135deg,#c9a27e,#6e9aa8)' }">
              <span class="cover-tag">笔记</span>
            </div>
            <div class="note-title">{{ note.title }}</div>
            <div class="note-author">
              <span class="na-av">{{ note.avatar }}</span>
              <span>{{ note.author }}</span>
            </div>
            <div class="note-stats">
              <span @click.stop="toggleLike(note)" :class="{ on: note.liked }">❤️ {{ note.stats.likes }}</span>
              <span>💬 {{ note.stats.comments }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 笔记详情 -->
      <div class="xhs-content detail-content" v-else-if="view === 'detail' && current">
        <button class="detail-back" @click="back">‹ 返回发现</button>
        <div class="detail-card">
          <div class="detail-cover" :style="{ background: current.cover || 'linear-gradient(135deg,#8fb0bd,#2f5d70)' }"></div>
          <div class="detail-body">
            <h1 class="detail-title">{{ current.title }}</h1>
            <div class="detail-author">
              <span class="da-av">{{ current.avatar || '周' }}</span>
              <b>{{ current.author }}</b>
            </div>
            <div class="detail-text">
              <template v-for="(b, i) in current.blocks" :key="i">
                <p v-if="b.type === 'text'" class="blk-text">{{ b.text }}</p>
                <p v-else-if="b.type === 'bold'" class="blk-bold">{{ b.text }}</p>
                <blockquote v-else-if="b.type === 'quote'" class="blk-quote">{{ b.text }}</blockquote>
                <p v-else-if="b.type === 'list'" class="blk-list">· {{ b.text }}</p>
              </template>
            </div>
            <div class="detail-actions">
              <span class="act" :class="{ on: current.liked }" @click="toggleLike(current)">❤️ 赞 {{ current.stats.likes }}</span>
              <span class="act" :class="{ on: current.faved }" @click="toggleFav(current)">⭐ 收藏 {{ current.stats.favs }}</span>
              <span class="act">💬 评论 {{ current.stats.comments }}</span>
              <span class="act">↗️ 分享 {{ current.stats.shares }}</span>
            </div>

            <!-- 评论区 -->
            <div class="comments">
              <div class="comments-title">共 {{ current.comments.length }} 条评论</div>
              <div v-for="c in current.comments" :key="c.id" class="comment">
                <span class="c-av">{{ c.avatar }}</span>
                <div class="c-main">
                  <div class="c-user">{{ c.user }} <span v-if="c.isAuthor" class="author-tag">作者</span></div>
                  <div class="c-text"><span v-if="c.replyTo" class="reply-to">回复 @{{ c.replyTo }}：</span>{{ c.text }}</div>
                  <div class="c-meta">
                    <span class="c-like" :class="{ on: c.liked }" @click="toggleCommentLike(c)">👍 {{ c.likes }}</span>
                  </div>
                </div>
              </div>
              <div v-if="!current.comments.length" class="no-comment">还没有评论，来说点什么吧</div>
              <div class="comment-compose">
                <input v-model="commentDraft" placeholder="说点什么…" @keyup.enter="sendComment(current)" />
                <button class="btn btn-primary" @click="sendComment(current)">发送</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.xhs { display: flex; height: 100%; background: #fff; font-family: var(--font); }
.xhs-side { width: 168px; flex: 0 0 168px; border-right: 1px solid #f0f0f0; display: flex; flex-direction: column; padding: 20px 0; background: #fafafa; }
.xhs-logo { display: flex; align-items: center; gap: 8px; padding: 0 20px 22px; cursor: pointer; }
.logo-mark { width: 30px; height: 30px; border-radius: 8px; background: #ff2442; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 16px; }
.logo-word { font-size: 17px; font-weight: 700; color: #ff2442; letter-spacing: 1px; }
.side-nav { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
.side-item { padding: 10px 14px; font-size: 14px; color: #555; border-radius: 8px; cursor: pointer; }
.side-item:hover { background: #f2f2f2; }
.side-item.active { background: #ffe9ed; color: #ff2442; font-weight: 600; }
.side-foot { margin-top: auto; padding: 0 20px; font-size: 11px; color: #bbb; }
.xhs-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.xhs-top { height: 60px; flex: 0 0 60px; display: flex; align-items: center; gap: 16px; padding: 0 24px; border-bottom: 1px solid #f0f0f0; }
.search-wrap { flex: 1; max-width: 460px; display: flex; align-items: center; background: #f5f5f5; border-radius: 22px; padding: 0 6px 0 16px; height: 38px; }
.search-wrap input { flex: 1; border: 0; outline: none; background: transparent; font-size: 13px; }
.search-wrap button { border: 0; background: transparent; font-size: 15px; padding: 4px 8px; }
.top-user { margin-left: auto; }
.tu-av { width: 32px; height: 32px; border-radius: 50%; background: #ffe9ed; color: #ff2442; display: grid; place-items: center; font-size: 13px; }
.xhs-content { flex: 1; overflow: auto; padding: 20px 24px; background: #fff; }
.feed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
.note-card { border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden; cursor: pointer; transition: box-shadow .15s, transform .15s; }
.note-card:hover { box-shadow: 0 8px 22px rgba(0,0,0,.1); transform: translateY(-2px); }
.note-cover { height: 180px; position: relative; }
.cover-tag { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,.3); color: #fff; font-size: 10px; padding: 2px 7px; border-radius: 8px; }
.note-title { font-size: 13px; line-height: 1.5; padding: 10px 12px 4px; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.note-author { display: flex; align-items: center; gap: 6px; padding: 0 12px; font-size: 11px; color: #888; }
.na-av { width: 20px; height: 20px; border-radius: 50%; background: #f0f2f5; display: grid; place-items: center; }
.note-stats { display: flex; gap: 12px; padding: 8px 12px 12px; font-size: 11px; color: #999; }
.note-stats .on { color: #ff2442; }
.detail-content { padding-top: 12px; }
.detail-back { border: 0; background: transparent; color: #222; font-size: 13px; cursor: pointer; padding: 6px 0 14px; }
.detail-back:hover { color: #000; }
.detail-card { max-width: 640px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; }
.detail-cover { height: 220px; }
.detail-body { padding: 22px 26px 28px; }
.detail-title { font-size: 20px; line-height: 1.5; margin: 0 0 14px; color: #222; }
.detail-author { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 18px; }
.da-av { width: 32px; height: 32px; border-radius: 50%; background: #ffe9ed; color: #ff2442; display: grid; place-items: center; }
.detail-text .blk-text { font-size: 14px; line-height: 1.9; color: #333; margin: 0 0 12px; }
.detail-text .blk-bold { font-size: 15px; font-weight: 700; color: #222; margin: 18px 0 10px; }
.detail-text .blk-quote { font-size: 15px; font-weight: 600; color: #2b373d; border-left: 3px solid #c8d0d2; margin: 12px 0; padding: 4px 14px; background: #f6f8f8; }
.detail-text .blk-list { font-size: 14px; line-height: 1.8; color: #444; margin: 2px 0 2px 12px; }
.detail-actions { display: flex; gap: 22px; padding: 18px 0; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; margin-top: 20px; }
.detail-actions .act { font-size: 12px; color: #888; cursor: pointer; user-select: none; }
.detail-actions .act:hover, .detail-actions .act.on { color: #ff2442; }
.comments { padding-top: 18px; }
.comments-title { font-size: 13px; font-weight: 600; color: #444; margin-bottom: 14px; }
.comment { display: flex; gap: 10px; margin-bottom: 16px; }
.c-av { width: 30px; height: 30px; flex: 0 0 30px; border-radius: 50%; background: #f0f2f5; display: grid; place-items: center; font-size: 11px; color: #666; }
.c-main { flex: 1; }
.c-user { font-size: 12px; color: #666; font-weight: 500; }
.author-tag { background: #ffe9ed; color: #ff2442; font-size: 10px; padding: 1px 5px; border-radius: 4px; margin-left: 4px; }
.c-text { font-size: 13px; line-height: 1.7; color: #333; margin: 3px 0; }
.reply-to { color: #8a8a8a; }
.c-meta { margin-top: 4px; }
.c-like { font-size: 11px; color: #999; cursor: pointer; user-select: none; }
.c-like.on { color: #ff2442; }
.no-comment { font-size: 12px; color: #bbb; text-align: center; padding: 16px; }
/* 非发现板块内容页 */
.nav-panel { background: #fff; }
.panel-head { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 18px; }
.publish-box { max-width: 560px; display: flex; flex-direction: column; gap: 14px; }
.pub-upload { height: 180px; border: 1px dashed #d8d8d8; border-radius: 10px; display: grid; place-items: center; color: #aaa; font-size: 14px; background: #fafafa; cursor: pointer; }
.pub-title { padding: 10px 12px; border: 1px solid #eee; border-radius: 8px; font-size: 13px; outline: none; }
.pub-body { min-height: 140px; padding: 10px 12px; border: 1px solid #eee; border-radius: 8px; font-size: 13px; outline: none; resize: vertical; }
.pub-btn { align-self: flex-end; border-radius: 20px; background: #ff2442; border-color: #ff2442; padding: 8px 24px; }
.notice-list { max-width: 640px; }
.notice-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 4px; border-bottom: 1px solid #f2f2f2; font-size: 13px; color: #555; }
.ni-ic { font-size: 18px; }
.notice-item b { color: #333; }
.ni-time { color: #bbb; font-size: 11px; margin-left: 8px; }
.profile-head { text-align: center; padding: 20px 0 12px; }
.ph-avatar { width: 64px; height: 64px; border-radius: 50%; background: #ffe9ed; color: #ff2442; display: grid; place-items: center; font-size: 24px; margin: 0 auto 10px; }
.ph-name { font-size: 16px; font-weight: 600; color: #333; }
.ph-id { font-size: 11px; color: #bbb; margin-top: 4px; }
.profile-stats { display: flex; justify-content: center; gap: 40px; padding: 16px 0 24px; border-bottom: 1px solid #f2f2f2; margin-bottom: 22px; font-size: 12px; color: #888; }
.profile-stats b { color: #333; font-size: 15px; }
.profile-notes { display: flex; gap: 16px; }
.pn-card { width: 180px; }
.pn-cover { height: 180px; border-radius: 10px; background: linear-gradient(135deg,#c9a27e,#6e9aa8); }
.pn-title { font-size: 12px; color: #555; padding: 8px 2px; }
.comment-compose { display: flex; gap: 8px; margin-top: 12px; }
.comment-compose input { flex: 1; padding: 9px 12px; border: 1px solid #e8e8e8; border-radius: 20px; font-size: 13px; outline: none; }
.comment-compose input:focus { border-color: #ff2442; }
.comment-compose .btn { border-radius: 20px; background: #ff2442; border-color: #ff2442; font-size: 12px; }
</style>
