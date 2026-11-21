<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search', 'goto'])

const keyword = ref('')

const sites = [
  { name: '百度', glyph: '百', color: '#2932e1', action: 'news' },
  { name: '知乎', glyph: '知', color: '#0066ff', action: 'news' },
  { name: '微博', glyph: '微', color: '#e6162d', action: 'news' },
  { name: '新闻网', glyph: '📰', color: '#2f6f8f', action: 'news' }
]

function doSearch() {
  if (!keyword.value.trim()) return
  emit('search', keyword.value.trim())
}
</script>

<template>
  <div class="home">
    <div class="home-inner">
      <div class="logo">
        <span class="logo-b">搜</span>
        <span class="logo-text">搜索</span>
      </div>
      <div class="search-box">
        <input
          v-model="keyword"
          placeholder="输入关键词，按回车搜索"
          @keyup.enter="doSearch"
        />
        <button @click="doSearch">搜索</button>
      </div>

      <div class="shortcuts">
        <div
          v-for="s in sites"
          :key="s.name"
          class="site"
          @click="emit('goto', s.action)"
        >
          <div class="site-ico" :style="{ background: s.color }">{{ s.glyph }}</div>
          <div class="site-name">{{ s.name }}</div>
        </div>
      </div>
    </div>
    <div class="home-foot">输入网址，或从上方图标进入网站</div>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  height: 100%;
  background: #fff;
  display: grid;
  place-items: center;
}
.home-inner {
  width: 100%;
  max-width: 620px;
  padding: 0 24px;
  transform: translateY(-30px);
}
.logo {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-bottom: 26px;
}
.logo-b {
  width: 54px; height: 54px; border-radius: 14px;
  background: linear-gradient(145deg, #2f8fd0, #2f6f8f);
  color: #fff; font-size: 28px; font-weight: 600;
  display: grid; place-items: center;
  box-shadow: 0 6px 18px rgba(47,111,143,.3);
}
.logo-text { font-size: 34px; font-weight: 300; color: #3a4650; letter-spacing: 2px; }
.search-box {
  display: flex; align-items: center;
  border: 1px solid #c8d0d2; border-radius: 22px;
  padding: 4px 4px 4px 16px;
  height: 44px;
  box-shadow: 0 2px 10px rgba(0,0,0,.04);
}
.search-box:focus-within { border-color: #2f6f8f; box-shadow: 0 2px 14px rgba(47,111,143,.15); }
.search-box input { flex: 1; border: 0; outline: none; font-size: 14px; }
.search-box button {
  border: 0; background: #2f6f8f; color: #fff;
  padding: 8px 20px; border-radius: 18px; font-size: 13px;
}
.search-box button:hover { background: #285f7d; }
.shortcuts {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 20px 12px; margin-top: 40px;
}
.site { text-align: center; cursor: pointer; }
.site-ico {
  width: 52px; height: 52px; margin: 0 auto 8px;
  border-radius: 14px;
  display: grid; place-items: center;
  color: #fff; font-size: 22px; font-weight: 600;
  box-shadow: 0 3px 10px rgba(0,0,0,.12);
  transition: transform .12s;
}
.site:hover .site-ico { transform: translateY(-3px); }
.site-name { font-size: 12px; color: #4a5b62; }
.home-foot {
  position: absolute; bottom: 20px; left: 0; right: 0;
  text-align: center; font-size: 11px; color: #a5b0b3;
}
</style>
