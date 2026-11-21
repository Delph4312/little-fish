<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'

const props = defineProps({ post: { type: Object, default: null } })
const emit = defineEmits(['back'])
const game = useGameStore()
const system = useSystemStore()

const input = ref('')

// 文案里的评论 + 玩家自己发的评论
const allComments = computed(() => {
  if (!props.post) return []
  const mine = game.userComments[props.post.id] || []
  return [...(props.post.comments || []), ...mine]
})

function postComment() {
  const text = input.value.trim()
  if (!text) return
  if (!game.wechatLoggedIn) {
    system.notify({ from: '浅湾论坛', text: '请先登录微信，才能发言。' })
    return
  }
  if (!game.userComments[props.post.id]) game.userComments[props.post.id] = []
  game.userComments[props.post.id].push({
    user: '你', text, time: '刚刚', mine: true
  })
  input.value = ''
  system.notify({ from: '浅湾论坛', text: '回复已发布。' })
}
</script>

<template>
  <div class="post-detail" v-if="post">
    <div class="bar"><button @click="emit('back')">‹ 返回列表</button><span>{{ post.section }}</span></div>
    <div class="wrap">
      <h1>{{ post.title }}</h1>
      <div class="meta">楼主：{{ post.author }} · 发表于 {{ post.time }}</div>
      <p v-for="(line, i) in post.content" :key="i" class="para">{{ line }}</p>
      <div class="stats">回复 {{ post.replies + (game.userComments[post.id]?.length || 0) }} · 点赞 {{ post.likes }}</div>
      <div class="comments">
        <div class="c-title">评论区</div>
        <div v-for="(c, i) in allComments" :key="i" class="comment" :class="{ mine: c.mine }">
          <b>@{{ c.user }}：</b>{{ c.text }}
          <span v-if="c.time" class="c-time">{{ c.time }}</span>
        </div>
      </div>

      <div class="composer">
        <div v-if="!game.wechatLoggedIn" class="need-login" @click="system.notify({ from: '浅湾论坛', text: '请先登录微信，才能发言。' })">
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
.stats { font-size: 11px; color: #a5b0b3; padding: 14px 0; border-top: 1px solid #eef1f0; border-bottom: 1px solid #eef1f0; }
.comments { padding-top: 8px; }
.c-title { font-size: 14px; font-weight: 500; padding: 12px 0; }
.comment { font-size: 13px; line-height: 1.8; padding: 10px 12px; background: #f6f8f8; border-radius: 4px; margin-bottom: 8px; }
.comment.mine { background: #e4f0ea; }
.comment b { color: #4a6d8c; font-weight: 500; }
.c-time { font-size: 10px; color: #a5b0b3; margin-left: 8px; }
.composer { margin: 20px 0 0; padding-top: 16px; border-top: 1px solid #eef1f0; }
.composer textarea { width: 100%; height: 72px; resize: vertical; border: 1px solid #d5dcdb; border-radius: 4px; padding: 9px; font-size: 13px; }
.composer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.composer-row .muted { font-size: 11px; }
.need-login { padding: 16px; text-align: center; background: #f2f5f4; border-radius: 4px; font-size: 12px; color: #6b7b82; cursor: pointer; }
</style>
