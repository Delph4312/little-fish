<script setup>
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'

const emit = defineEmits(['back', 'published'])
const game = useGameStore()
const system = useSystemStore()

const sections = ['闲聊', '求助', '生活', '公告']
const title = ref('')
const section = ref('闲聊')
const content = ref('')

// 基础格式按钮：在光标处包裹标记
function wrap(before, after) {
  content.value += before + after
}
function attach() {
  content.value += '\n[附件：文件]'
}

function publish() {
  if (!game.wechatLoggedIn) {
    system.notify({ from: '浅湾论坛', text: '请先登录微信，才能发帖。' })
    return
  }
  if (!title.value.trim() || !content.value.trim()) {
    system.notify({ from: '浅湾论坛', text: '标题和内容都不能为空。' })
    return
  }
  game.userPosts.unshift({
    id: 'u-' + Date.now(),
    title: title.value.trim(),
    author: '你',
    time: '刚刚',
    section: section.value,
    replies: 0,
    likes: 0,
    content: content.value.trim().split('\n').filter(Boolean),
    comments: []
  })
  system.notify({ from: '浅湾论坛', text: '帖子已发布。' })
  emit('published')
}
</script>

<template>
  <div class="newpost">
    <div class="bar"><button @click="emit('back')">‹ 返回论坛</button><span>发表新帖</span></div>
    <div class="form">
      <div v-if="!game.wechatLoggedIn" class="need-login">
        你需要先登录微信才能发帖。
        <button class="btn" @click="system.notify({ from: '浅湾论坛', text: '请到桌面打开微信，用密码登录。' })">知道了</button>
      </div>
      <template v-else>
        <label>标题</label>
        <input v-model="title" placeholder="给帖子起个标题" />
        <label>版块</label>
        <div class="sections">
          <button
            v-for="s in sections"
            :key="s"
            :class="{ active: section === s }"
            @click="section = s"
          >{{ s }}</button>
        </div>
        <label>正文</label>
        <div class="editor">
          <div class="editor-toolbar">
            <button type="button" title="加粗" class="disabled-btn"><b>B</b></button>
            <button type="button" title="斜体" class="disabled-btn"><i>I</i></button>
            <button type="button" title="附件" class="disabled-btn">📎 附件</button>
            <span class="tool-hint">基础格式</span>
          </div>
          <textarea v-model="content" placeholder="写点什么……"></textarea>
        </div>
        <div class="actions">
          <button class="btn" @click="emit('back')">取消</button>
          <button class="btn btn-primary" @click="publish">发表</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.newpost { min-height: 100%; background: #f0f3f4; }
.bar { display: flex; justify-content: space-between; padding: 10px 20px; background: #16323f; color: #cfe0e6; font-size: 12px; }
.bar button { border: 0; background: transparent; color: #cfe0e6; cursor: pointer; }
.form { max-width: 660px; margin: 24px auto; background: #fff; border-radius: 6px; padding: 24px 28px; }
label { display: block; font-size: 13px; font-weight: 500; margin: 16px 0 8px; }
.form input { width: 100%; padding: 9px 11px; border: 1px solid #d5dcdb; border-radius: 4px; }
.sections { display: flex; gap: 8px; }
.sections button { padding: 6px 14px; border: 1px solid #d5dcdb; background: #fff; border-radius: 4px; font-size: 12px; }
.sections button.active { background: #2f6f8f; color: #fff; border-color: #2f6f8f; }
.editor { border: 1px solid #d5dcdb; border-radius: 4px; overflow: hidden; }
.editor-toolbar { display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: #f4f6f6; border-bottom: 1px solid #d5dcdb; }
.editor-toolbar button { border: 1px solid #d5dcdb; background: #fff; border-radius: 3px; padding: 3px 9px; font-size: 12px; }
.editor-toolbar .disabled-btn { cursor: default; color: #3a4a52; }
.editor-toolbar .disabled-btn:hover { background: #fff; border-color: #d5dcdb; }
.tool-hint { margin-left: auto; font-size: 10px; color: #a5b0b3; }
.editor textarea { width: 100%; height: 180px; resize: vertical; border: 0; padding: 10px; font-size: 13px; line-height: 1.7; outline: none; }
.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.need-login { text-align: center; padding: 60px 20px; color: #6b7b82; font-size: 13px; }
.need-login .btn { display: block; margin: 20px auto 0; }
</style>
