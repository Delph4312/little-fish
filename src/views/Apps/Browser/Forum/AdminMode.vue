<script setup>
import { useGameStore } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'
import { whaleDialogue } from '@/data/forumData'

const emit = defineEmits(['back'])
const game = useGameStore()
const system = useSystemStore()

function toggle() {
  if (game.adminMode) {
    system.notify({ from: '系统', text: '已退出管理员模式，隐藏帖子重新隐藏。' })
  } else {
    game.toggleAdmin()
    game.addClue('admin-mode')
    system.notify({ from: '系统', text: '管理员模式已开启。隐藏帖子现在可见。' })
  }
}

function chatWithWhale() {
  system.notify({ from: '鲸鱼先生', text: whaleDialogue.withPlayer[0].text, type: 'whale', duration: 8000 })
  system.triggerGlitch(900)
}
</script>

<template>
  <div class="admin">
    <div class="bar"><button @click="emit('back')">‹ 返回论坛</button><span>管理员模式</span></div>
    <div class="panel">
      <div class="badge">ADMIN</div>
      <h2>管理者控制台</h2>
      <p class="muted">鲸鱼先生不会把真话摆在明面上。隐藏帖子里才有他真正在做的事。</p>
      <div class="switch" :class="{ on: game.adminMode }" @click="toggle">
        <span class="knob"></span>
        <span class="label">{{ game.adminMode ? '已开启 · 隐藏帖可见' : '已关闭 · 仅游客内容' }}</span>
      </div>
      <div class="info">
        <div><b>当前状态：</b>{{ game.adminMode ? '管理员' : '游客' }}</div>
        <div><b>可见帖子：</b>{{ game.adminMode ? '公开帖 + 隐藏帖' : '仅公开帖' }}</div>
        <div><b>私人日记：</b>{{ game.adminMode ? '可见（需密码）' : '隐藏' }}</div>
      </div>
      <button class="btn whisper" @click="chatWithWhale">与鲸鱼先生对话</button>
    </div>
  </div>
</template>

<style scoped>
.admin { min-height: 100%; background: #eef1f2; }
.bar { display: flex; justify-content: space-between; padding: 10px 20px; background: #16323f; color: #cfe0e6; font-size: 12px; }
.bar button { border: 0; background: transparent; color: #cfe0e6; cursor: pointer; }
.panel { max-width: 520px; margin: 50px auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.08); text-align: center; }
.badge { display: inline-block; background: #16324f; color: #9fc6d6; font-size: 10px; letter-spacing: 2px; padding: 3px 8px; border-radius: 3px; }
.panel h2 { font-size: 18px; font-weight: 600; margin: 14px 0 8px; }
.panel p { font-size: 12px; line-height: 1.7; }
.switch { display: flex; align-items: center; gap: 12px; width: 260px; margin: 26px auto; padding: 10px 14px; background: #e6ebec; border-radius: 24px; cursor: pointer; transition: background .2s; }
.switch.on { background: #cfe4d8; }
.knob { width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.2); transition: transform .2s; }
.switch.on .knob { transform: translateX(178px); background: #3c8a5c; }
.label { font-size: 13px; color: #3a4a50; }
.info { text-align: left; background: #f6f8f8; border-radius: 5px; padding: 14px 18px; font-size: 12px; line-height: 2; }
.whisper { margin-top: 22px; }
</style>
