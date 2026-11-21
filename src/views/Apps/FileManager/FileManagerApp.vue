<script setup>
import { ref, computed } from 'vue'
import { useSystemStore } from '@/stores/systemStore'
import { useGameStore, ANSWERS } from '@/stores/gameStore'

const system = useSystemStore()
const game = useGameStore()

const path = ref('此电脑')
const folders = ['桌面', '文档', '下载', '图片', '音乐']
const files = [
  { name: '关于找工作的几点想法.txt', type: 'txt', size: '2 KB' },
  { name: '微信密码.txt', type: 'txt', size: '1 KB', key: 'wechatpwd', clickable: true },
  { name: '潮汐表.pdf', type: 'pdf', size: '348 KB' },
  { name: '相关资料.zip', type: 'zip', size: '1.2 MB' },
  { name: '成绩单.pdf', type: 'pdf', size: '96 KB' }
]

const openedFile = ref(null)

function openFile(f) {
  if (f.clickable) {
    game.addClue('wechat-password')
    openedFile.value = { name: f.name, content: `微信登录密码：${ANSWERS.wechat}\n\n（小遥，别忘了改掉这个。）` }
  } else {
    openedFile.value = { name: f.name, content: `[ ${f.type.toUpperCase()} 文件预览占位 ]\n\n${f.name}\n大小：${f.size}` }
  }
}

function iconFor(t) {
  return { txt: '📄', pdf: '📕', zip: '🗜️' }[t] || '📄'
}
function colorFor(t) {
  return { txt: '#6b8fa3', pdf: '#b25a5a', zip: '#b9963f' }[t] || '#888'
}
</script>

<template>
  <div class="fm">
    <div class="fm-bar">
      <button class="nav" @click="path = '此电脑'">‹ 返回</button>
      <div class="addr">此电脑 <span v-if="path !== '此电脑'"> › {{ path }}</span></div>
      <input class="search" placeholder="搜索文件" />
    </div>
    <div class="fm-body">
      <aside class="side">
        <div class="side-title">快速访问</div>
        <div v-for="f in folders" :key="f" class="side-row" :class="{ active: path === f }" @click="path = f">📁 {{ f }}</div>
        <div class="side-row" @click="path = '回收站'">🗑️ 回收站</div>
      </aside>
      <main class="main">
        <div class="folder-grid">
          <div v-for="f in folders" :key="f" class="folder" @dblclick="path = f">
            <div class="folder-icon">📁</div><div>{{ f }}</div>
          </div>
        </div>
        <div class="section-label">文件</div>
        <div class="file-grid">
          <div
            v-for="f in files"
            :key="f.name"
            class="file"
            :class="{ clickable: f.clickable }"
            @dblclick="openFile(f)"
          >
            <div class="file-icon" :style="{ color: colorFor(f.type) }">{{ iconFor(f.type) }}</div>
            <div class="file-name">{{ f.name }}</div>
            <div class="file-size">{{ f.size }}</div>
          </div>
        </div>
      </main>
    </div>
    <div class="status">{{ path }} · {{ files.length }} 个对象</div>

    <div v-if="openedFile" class="preview" @click.self="openedFile = null">
      <div class="preview-card">
        <div class="p-head">{{ openedFile.name }} <span @click="openedFile = null">×</span></div>
        <pre>{{ openedFile.content }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fm { display: flex; flex-direction: column; height: 100%; background: #fff; }
.fm-bar { height: 46px; flex: 0 0 46px; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-bottom: 1px solid #d5dcdb; }
.nav { border: 1px solid #d5dcdb; background: #fff; border-radius: 4px; padding: 5px 10px; font-size: 12px; }
.addr { flex: 1; padding: 6px 12px; background: #f2f5f4; border-radius: 4px; font-size: 12px; }
.search { padding: 6px 10px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; width: 150px; }
.fm-body { flex: 1; display: flex; min-height: 0; }
.side { width: 170px; flex: 0 0 170px; background: #f2f5f4; border-right: 1px solid #d5dcdb; padding: 10px 0; }
.side-title { padding: 6px 14px; font-size: 11px; color: #9aa7ab; }
.side-row { padding: 8px 14px; font-size: 12px; cursor: pointer; }
.side-row:hover, .side-row.active { background: #e1eae9; }
.main { flex: 1; overflow: auto; padding: 14px; }
.folder-grid { display: flex; flex-wrap: wrap; gap: 16px; padding-bottom: 12px; border-bottom: 1px solid #eef1f0; }
.folder { width: 76px; text-align: center; font-size: 11px; cursor: pointer; padding: 6px; }
.folder:hover { background: #f0f5f5; border-radius: 4px; }
.folder-icon { font-size: 34px; }
.section-label { font-size: 11px; color: #9aa7ab; margin: 14px 0 8px; }
.file-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.file { width: 96px; text-align: center; font-size: 11px; padding: 8px 4px; border-radius: 4px; cursor: pointer; }
.file:hover { background: #f0f5f5; }
.file.clickable { outline: 1px dashed #9fc4d4; }
.file-icon { font-size: 30px; }
.file-name { margin-top: 5px; line-height: 1.4; word-break: break-all; }
.file-size { color: #a5b0b3; font-size: 10px; margin-top: 3px; }
.status { height: 26px; flex: 0 0 26px; background: #f2f5f4; border-top: 1px solid #d5dcdb; font-size: 11px; color: #8c9a9e; padding: 5px 12px; }
.preview { position: fixed; inset: 0; background: rgba(10,22,28,.5); display: grid; place-items: center; z-index: 60000; }
.preview-card { width: 460px; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
.p-head { padding: 12px 16px; background: #2c3e46; color: #fff; font-size: 13px; display: flex; justify-content: space-between; }
.p-head span { cursor: pointer; }
.preview-card pre { padding: 20px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; font-family: var(--font); }
</style>
