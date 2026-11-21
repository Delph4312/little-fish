<script setup>
import { computed } from 'vue'
import { users } from '@/data/forumData'
import { useGameStore } from '@/stores/gameStore'

const props = defineProps({
  user: { type: Object, default: null },
  posts: { type: Array, default: () => [] }
})
const emit = defineEmits(['open-post', 'open-diary'])
const game = useGameStore()

const isXieYao = computed(() => props.user && props.user.id === 'xieyao')
</script>

<template>
  <div class="profile" v-if="user">
    <div class="banner" :class="user.avatarStyle"></div>
    <div class="card">
      <div class="avatar" :class="user.avatarStyle">{{ user.avatarText || '遥' }}</div>
      <div class="info">
        <div class="name">{{ user.name || '谢遥' }} <span v-for="t in user.tags || []" class="tag">{{ t }}</span></div>
        <div class="sig">{{ user.signature || '' }}</div>
        <div class="reg">注册时间：{{ user.registerTime || '——' }} · 发帖数：{{ user.postCount || 0 }}</div>
        <div v-if="user.hint" class="hint">[头像] {{ user.hint }}</div>
      </div>
      <div class="actions" v-if="isXieYao">
        <button class="btn" @click="emit('open-diary')">私人日记</button>
      </div>
    </div>

    <div class="section-title">TA 的帖子</div>
    <div v-for="p in posts" :key="p.id" class="mini-post" @click="emit('open-post', p)">
      <div class="mp-title">{{ p.title }}</div>
      <div class="mp-meta">{{ p.author }} · {{ p.time }} · {{ p.section }}</div>
      <div class="mp-content">{{ p.content[0] }}</div>
    </div>

    <div class="diary-entry" v-if="game.adminMode && isXieYao">
      <button class="btn" @click="emit('open-diary')">🔒 查看私人日记（管理员可见）</button>
    </div>
  </div>
</template>

<style scoped>
.profile { min-height: 100%; background: #f0f3f4; padding-bottom: 30px; }
.banner { height: 120px; background: linear-gradient(120deg, #7fa6b6, #c9a27e); }
.banner.whale { background: linear-gradient(120deg, #10273d, #1d4a63); }
.banner.boat { background: linear-gradient(120deg, #9fc0c4, #d9c6a8); }
.card { display: flex; gap: 16px; align-items: flex-start; background: #fff; margin: -32px 20px 0; padding: 18px 20px; border-radius: 6px; box-shadow: 0 4px 14px rgba(0,0,0,.08); position: relative; }
.avatar { width: 66px; height: 66px; flex: 0 0 66px; border-radius: 8px; background: #dce8e6; color: #3c6472; display: grid; place-items: center; font-size: 26px; border: 3px solid #fff; }
.avatar.whale { background: #16324f; color: #9fc6d6; }
.avatar.boat { background: #e8eee8; color: #5c7d86; }
.info { flex: 1; }
.name { font-size: 16px; font-weight: 600; }
.tag { display: inline-block; background: #16324f; color: #fff; font-size: 10px; font-weight: 400; padding: 2px 6px; border-radius: 3px; margin-left: 6px; vertical-align: middle; }
.sig { font-size: 12px; color: #5b7b86; margin: 6px 0; }
.reg { font-size: 11px; color: #a5b0b3; }
.hint { font-size: 11px; color: #9aa7ab; margin-top: 6px; }
.section-title { padding: 20px 22px 10px; font-size: 14px; font-weight: 500; }
.mini-post { margin: 0 20px 10px; background: #fff; border-radius: 5px; padding: 14px 16px; cursor: pointer; border: 1px solid #e2e7e6; }
.mp-title { font-size: 14px; font-weight: 500; }
.mp-meta { font-size: 11px; color: #a5b0b3; margin: 5px 0; }
.mp-content { font-size: 12px; color: #6b7b82; }
.diary-entry { padding: 16px 22px; }
</style>
