<script setup>
import { conversationList, contactApplication } from '@/data/wechatData'
import { ref } from 'vue'

const added = ref(false)
</script>

<template>
  <div class="contacts">
    <div class="c-head">通讯录</div>
    <div class="search">🔍 搜索</div>
    <div class="c-list">
      <div class="group">新的朋友</div>
      <div class="c-row">
        <div class="c-avatar">屿</div>
        <div>
          <div class="c-name">风前屿</div>
          <div class="c-sub">微信号：windbefore_island</div>
        </div>
        <button class="btn" :disabled="added" @click="added = true">{{ added ? '已添加' : '添加' }}</button>
      </div>
      <div class="c-note" v-if="!added">申请信息：{{ contactApplication.message }}</div>
      <div class="group">联系人</div>
      <div v-for="c in conversationList" :key="c.id" class="c-row">
        <div class="c-avatar">{{ c.avatarText }}</div>
        <div class="c-name">{{ c.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contacts { height: 100%; background: #f5f7f6; }
.c-head { padding: 18px 22px 10px; font-size: 15px; font-weight: 500; }
.search { margin: 4px 16px 12px; padding: 7px 10px; background: #fff; border-radius: 4px; font-size: 12px; color: #9aa7ab; }
.group { padding: 10px 20px 6px; font-size: 11px; color: #9aa7ab; background: #eef1f0; }
.c-row { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #eef1f0; }
.c-avatar { width: 36px; height: 36px; flex: 0 0 36px; border-radius: 4px; background: #d7e4dd; color: #46685a; display: grid; place-items: center; font-size: 14px; }
.c-name { font-size: 13px; flex: 1; }
.c-sub { font-size: 11px; color: #9aa7ab; margin-top: 3px; }
.c-note { background: #fff; padding: 8px 20px 14px 68px; font-size: 12px; color: #8c9a9e; }
.c-row .btn { padding: 5px 12px; font-size: 12px; }
</style>
