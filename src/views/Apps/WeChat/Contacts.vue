<script setup>
import { ref } from 'vue'
import { conversationList, contactApplication } from '@/data/wechatData'
import { useGameStore } from '@/stores/gameStore'

const game = useGameStore()
const emit = defineEmits(['search'])
const contactSearch = ref('')
function doContactSearch() {
  if (!contactSearch.value.trim()) return
  emit('search', contactSearch.value)
  contactSearch.value = ''
}
</script>

<template>
  <div class="contacts">
    <div class="c-search">
      <input v-model="contactSearch" placeholder="搜索微信号" @keyup.enter="doContactSearch" />
      <button @click="doContactSearch">搜索</button>
    </div>
    <div class="c-head">通讯录</div>
    <div class="c-list">
      <!-- 风前屿初始不显示；玩家在聊天搜索微信号添加后才出现 -->
      <template v-if="game.teacherAdded">
        <div class="group">新的朋友</div>
        <div class="c-row">
          <div class="c-avatar">屿</div>
          <div>
            <div class="c-name">风前屿</div>
            <div class="c-sub">微信号：{{ contactApplication.wechatId }}</div>
          </div>
        </div>
      </template>
      <div class="group">联系人</div>
      <div v-for="c in conversationList.filter(x => !x.hidden)" :key="c.id" class="c-row">
        <div class="c-avatar">{{ c.avatarText }}</div>
        <div class="c-name">{{ c.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contacts { height: 100%; background: #f5f7f6; }
.c-search { display: flex; gap: 4px; margin: 10px; }
.c-search input { flex: 1; min-width: 0; padding: 6px 8px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; }
.c-search button { border: 1px solid #c4cfd0; background: #fff; border-radius: 4px; font-size: 11px; padding: 0 8px; color: #4a5b62; }
.c-head { padding: 8px 22px 10px; font-size: 15px; font-weight: 500; }
.group { padding: 10px 20px 6px; font-size: 11px; color: #9aa7ab; background: #eef1f0; }
.c-row { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #eef1f0; }
.c-avatar { width: 36px; height: 36px; flex: 0 0 36px; border-radius: 4px; background: #d7e4dd; color: #46685a; display: grid; place-items: center; font-size: 14px; }
.c-name { font-size: 13px; flex: 1; }
.c-sub { font-size: 11px; color: #9aa7ab; margin-top: 3px; }
</style>
