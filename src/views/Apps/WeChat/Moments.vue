<script setup>
defineProps({
  moments: { type: Array, default: () => [] },
  cover: { type: String, default: '' }
})
</script>

<template>
  <div class="moments">
    <div class="cover">
      <div class="cover-scene"></div>
      <div class="cover-name">谢遥</div>
    </div>
    <div class="feed">
      <div v-for="(m, i) in moments" :key="i" class="moment">
        <div class="m-avatar">{{ m.avatarText }}</div>
        <div class="m-body">
          <div class="m-user">{{ m.user }}</div>
          <div class="m-text">{{ m.text }}</div>
          <div v-if="m.images && m.images.length" class="m-images">
            <div v-for="(img, j) in m.images" :key="j" class="m-img">{{ img }}</div>
          </div>
          <div class="m-meta">
            <span>{{ m.time }}</span>
            <span v-if="m.visibility" class="vis">{{ m.visibility }}</span>
          </div>
          <div v-if="m.likes && m.likes.length" class="m-likes">♡ {{ m.likes.join('、') }}</div>
          <div v-if="m.comments && m.comments.length" class="m-comments">
            <div v-for="(c, k) in m.comments" :key="k"><b>{{ c.user }}：</b>{{ c.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.moments { height: 100%; overflow: auto; background: #ededed; }
.cover { height: 180px; position: relative; background: #6f97a4; }
.cover-scene { position: absolute; inset: 0; background: linear-gradient(180deg, #b9c8c6 0%, #dcc09a 45%, #4d7383 46%, #21485c 100%); }
.cover-scene::after { content: ""; position: absolute; right: 22%; bottom: 0; width: 90px; height: 34px; background: #16303c; clip-path: polygon(0 100%, 30% 0, 70% 0, 100% 100%); }
.cover-name { position: absolute; right: 18px; bottom: 12px; color: #fff; font-size: 16px; text-shadow: 0 1px 4px rgba(0,0,0,.5); }
.feed { padding: 10px 20px; }
.moment { display: flex; gap: 12px; padding: 18px 0; border-bottom: 1px solid #dcdcdc; }
.m-avatar { width: 40px; height: 40px; flex: 0 0 40px; border-radius: 4px; background: #cfe0d6; color: #46685a; display: grid; place-items: center; font-size: 15px; }
.m-body { flex: 1; min-width: 0; }
.m-user { color: #4a6d8c; font-size: 13px; font-weight: 500; margin-bottom: 5px; }
.m-text { font-size: 13px; line-height: 1.7; }
.m-images { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.m-img { width: 110px; height: 82px; border-radius: 3px; background: linear-gradient(135deg, #a9c0c6, #e0ccae); display: grid; place-items: center; font-size: 10px; color: #3f5964; text-align: center; padding: 4px; }
.m-meta { display: flex; gap: 12px; color: #9aa7ab; font-size: 11px; margin-top: 8px; }
.vis { color: #8c9a9e; }
.m-likes { margin-top: 8px; background: #e3e8ea; padding: 6px 10px; font-size: 12px; color: #4a6d8c; border-radius: 3px; }
.m-comments { margin-top: 6px; background: #e3e8ea; padding: 8px 10px; font-size: 12px; line-height: 1.7; border-radius: 3px; }
.m-comments b { color: #4a6d8c; font-weight: 500; }
</style>
