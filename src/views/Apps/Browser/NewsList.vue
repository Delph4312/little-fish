<script setup>
defineProps({
  news: { type: Array, default: () => [] },
  nav: { type: Array, default: () => [] }
})
const emit = defineEmits(['open'])
</script>

<template>
  <div class="news-list">
    <div class="site-nav">
      <span class="logo">新闻网</span>
      <span v-for="n in nav" :key="n" class="nav-item">{{ n }}</span>
    </div>
    <div class="search-bar"><input placeholder="搜索新闻" /><button>搜索</button></div>
    <div class="list">
      <div v-for="item in news" :key="item.id" class="item" @click="emit('open', item.id)">
        <div class="thumb"></div>
        <div class="item-body">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-summary">{{ item.summary }}</div>
          <div class="item-meta">{{ item.category }} · {{ item.time }}</div>
        </div>
      </div>
    </div>
    <div class="pager">上一页 &nbsp; <b>1</b> &nbsp; 2 &nbsp; 3 &nbsp; 下一页</div>
  </div>
</template>

<style scoped>
.news-list { background: #fff; min-height: 100%; }
.site-nav { display: flex; align-items: center; gap: 22px; padding: 12px 22px; border-bottom: 2px solid #2f6f8f; }
.logo { font-size: 18px; font-weight: 600; color: #2f6f8f; }
.nav-item { font-size: 13px; color: #4a5b62; cursor: pointer; }
.nav-item:hover { color: #2f6f8f; }
.search-bar { display: flex; gap: 6px; max-width: 420px; margin: 16px 22px; }
.search-bar input { flex: 1; padding: 7px 10px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; }
.search-bar button { padding: 7px 14px; border: 1px solid #2f6f8f; background: #2f6f8f; color: #fff; border-radius: 4px; font-size: 12px; }
.list { padding: 0 22px; }
.item { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid #eef1f0; cursor: pointer; }
.item:hover .item-title { color: #2f6f8f; }
.thumb { width: 116px; height: 76px; flex: 0 0 116px; background: linear-gradient(135deg, #b9c6cc, #e0d5c4); filter: grayscale(1); border-radius: 3px; }
.item-body { flex: 1; min-width: 0; }
.item-title { font-size: 15px; font-weight: 500; line-height: 1.5; margin-bottom: 6px; }
.item-summary { font-size: 12px; color: #6b7b82; line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-meta { font-size: 11px; color: #a5b0b3; margin-top: 8px; }
.pager { text-align: center; padding: 24px; font-size: 12px; color: #6b7b82; }
</style>
