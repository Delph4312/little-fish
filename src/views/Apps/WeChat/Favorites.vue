<script setup>
defineProps({ items: { type: Array, default: () => [] } })
</script>

<template>
  <div class="fav">
    <div class="fav-head">收藏 <span class="muted">（{{ items.length }}）</span></div>
    <div class="fav-list">
      <div v-for="item in items" :key="item.id" class="fav-card">
        <div class="fav-title">{{ item.title }}</div>
        <div class="fav-source">{{ item.source }}</div>
        <div class="fav-summary">{{ item.summary }}</div>
        <div class="fav-clue">🔖 线索：{{ item.clue }}</div>
      </div>
      <div v-if="!items.length" class="fav-empty">暂无收藏内容</div>
    </div>
  </div>
</template>

<style scoped>
.fav { height: 100%; background: #f5f7f6; }
.fav-head { padding: 18px 22px 10px; font-size: 15px; font-weight: 500; border-bottom: 1px solid #e2e7e6; }
.fav-list { padding: 16px 22px; }
.fav-card { background: #fff; border: 1px solid #e2e7e6; border-radius: 6px; padding: 16px 18px; margin-bottom: 14px; }
.fav-title { font-size: 15px; font-weight: 500; margin-bottom: 6px; }
.fav-source { font-size: 11px; color: #9aa7ab; margin-bottom: 12px; }
.fav-summary { font-size: 13px; line-height: 1.85; color: #39474d; }
.fav-clue { margin-top: 14px; padding-top: 12px; border-top: 1px dashed #e2e7e6; font-size: 12px; color: #8e6a3a; }
.fav-empty { text-align: center; color: #a5b0b3; font-size: 13px; padding: 60px 0; }
</style>
