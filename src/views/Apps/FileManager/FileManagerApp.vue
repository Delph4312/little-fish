<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useGameStore, ANSWERS } from '@/stores/gameStore'

const game = useGameStore()

// D 盘里那个随机字母命名的文件夹：唯一可进入，里面放着密码文件。
// 名字固定，保证线索稳定可解（每次打开都一样）。
const SECRET_FOLDER = 'QXKM'

const location = ref('computer') // computer | C: | D: | secret
const searchQuery = ref('')
const toast = ref('')
const openedFile = ref(null)
let toastTimer

const drives = [
  { name: '本地磁盘 (C:)', key: 'C:', free: '42.1 GB 可用，共 68.0 GB', used: 0.62 },
  { name: '本地磁盘 (D:)', key: 'D:', free: '128 GB 可用，共 180 GB', used: 0.29 }
]

const folders = {
  'C:': [
    { name: 'Windows', open: false },
    { name: 'Program Files', open: false },
    { name: 'Users', open: false }
  ],
  'D:': [
    { name: SECRET_FOLDER, open: true, to: 'secret' },
    { name: '游戏', open: false },
    { name: '影视', open: false },
    { name: '备份', open: false }
  ],
  secret: []
}

const files = {
  'C:': [],
  'D:': [{ name: '待整理.txt', type: 'txt', size: '1 KB' }],
  secret: [
    { name: '微信密码.txt', type: 'txt', size: '1 KB', key: 'wechatpwd', clickable: true },
    { name: '关于找工作的几点想法.txt', type: 'txt', size: '2 KB' },
    { name: '潮汐表.pdf', type: 'pdf', size: '348 KB' },
    { name: '成绩单.pdf', type: 'pdf', size: '96 KB' },
    { name: '相关资料.zip', type: 'zip', size: '1.2 MB' }
  ]
}

const breadcrumb = computed(() => ({
  computer: ['此电脑'],
  'C:': ['此电脑', '本地磁盘 (C:)'],
  'D:': ['此电脑', '本地磁盘 (D:)'],
  secret: ['此电脑', '本地磁盘 (D:)', SECRET_FOLDER]
}[location.value]))

const allFiles = computed(() => {
  const out = []
  for (const loc of Object.keys(files)) {
    for (const f of files[loc]) out.push({ ...f, loc })
  }
  return out
})

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allFiles.value.filter((f) => f.name.toLowerCase().includes(q))
})

const currentFolders = computed(() => folders[location.value] || [])
const currentFiles = computed(() => files[location.value] || [])

function goLocation(loc) {
  location.value = loc
  searchQuery.value = ''
  toast.value = ''
}

function goCrumb(index) {
  if (index === 0) goLocation('computer')
  else if (index === 1) goLocation(location.value === 'C:' ? 'C:' : 'D:')
}

function goBack() {
  if (location.value === 'secret') goLocation('D:')
  else if (location.value === 'C:' || location.value === 'D:') goLocation('computer')
  else searchQuery.value = ''
}

function openDrive(d) {
  goLocation(d.key)
}

function openFolder(f) {
  // 只有可进入的文件夹有响应；其余为普通文件夹、不可选（点击无任何反应）
  if (f.open && f.to) goLocation(f.to)
}

function openFile(f) {
  if (f.clickable) {
    game.addClue('wechat-password')
    openedFile.value = {
      name: f.name,
      content: `微信登录密码：${ANSWERS.wechat}\n\n（小遥，别忘了改掉这个。）`
    }
  } else {
    openedFile.value = {
      name: f.name,
      content: `[ ${f.type.toUpperCase()} 文件预览占位 ]\n\n${f.name}\n大小：${f.size}`
    }
  }
}

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2200)
}

function iconFor(t) {
  return { txt: '📄', pdf: '📕', zip: '🗜️' }[t] || '📄'
}
function colorFor(t) {
  return { txt: '#6b8fa3', pdf: '#b25a5a', zip: '#b9963f' }[t] || '#888'
}

onUnmounted(() => clearTimeout(toastTimer))
</script>

<template>
  <div class="fm">
    <div class="fm-toolbar">
      <button class="nav" @click="goBack">‹ 返回</button>
      <div class="addr">
        <template v-for="(c, i) in breadcrumb" :key="i">
          <span class="crumb" @click="goCrumb(i)">{{ c }}</span>
          <span v-if="i < breadcrumb.length - 1" class="sep">›</span>
        </template>
      </div>
      <div class="search-wrap">
        <span class="search-ico">🔍</span>
        <input v-model="searchQuery" class="search" placeholder="搜索文件" />
      </div>
    </div>

    <div class="fm-body">
      <aside class="side">
        <div class="side-title">快速访问</div>
        <div class="side-row" :class="{ active: location === 'computer' }" @click="goLocation('computer')">🖥️ 此电脑</div>
        <div class="side-row" :class="{ active: location === 'C:' }" @click="goLocation('C:')">💽 本地磁盘 (C:)</div>
        <div class="side-row" :class="{ active: location === 'D:' || location === 'secret' }" @click="goLocation('D:')">💽 本地磁盘 (D:)</div>
        <div class="side-title" style="margin-top:10px">文件夹</div>
        <div class="side-row" @click="showToast('回收站为空。')">🗑️ 回收站</div>
      </aside>

      <main class="main">
        <!-- 搜索结果 -->
        <template v-if="searchQuery.trim()">
          <div class="section-label">搜索结果 · {{ searchResults.length }} 项</div>
          <div v-if="!searchResults.length" class="empty">没有找到与“{{ searchQuery }}”匹配的文件。</div>
          <div class="result-list">
            <div v-for="f in searchResults" :key="f.loc + f.name" class="result-row" @dblclick="openFile(f)">
              <span class="result-ico" :style="{ color: colorFor(f.type) }">{{ iconFor(f.type) }}</span>
              <span class="result-name">{{ f.name }}</span>
              <span class="result-path">{{ f.loc === 'secret' ? `D:\\${SECRET_FOLDER}` : (f.loc === 'D:' ? 'D:\\' : 'C:\\') }}</span>
              <span class="result-size">{{ f.size }}</span>
            </div>
          </div>
        </template>

        <!-- 此电脑：磁盘列表 -->
        <template v-else-if="location === 'computer'">
          <div class="section-label">设备和驱动器</div>
          <div class="drive-grid">
            <div v-for="d in drives" :key="d.key" class="drive" @dblclick="openDrive(d)">
              <div class="drive-ico">💽</div>
              <div class="drive-name">{{ d.name }}</div>
              <div class="drive-bar"><i :style="{ width: (d.used * 100) + '%' }"></i></div>
              <div class="drive-free">{{ d.free }}</div>
            </div>
          </div>
        </template>

        <!-- C盘 / D盘 / 秘密文件夹 -->
        <template v-else>
          <div v-if="currentFolders.length" class="folder-grid">
            <div
              v-for="f in currentFolders"
              :key="f.name"
              class="folder"
              :class="{ selectable: f.open }"
              @dblclick="openFolder(f)"
            >
              <div class="folder-icon">📁</div>
              <div>{{ f.name }}</div>
            </div>
          </div>
          <div class="section-label">文件</div>
          <div class="file-grid">
            <div
              v-for="f in currentFiles"
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
        </template>
      </main>
    </div>

    <div class="status">
      <span>{{ searchQuery.trim() ? '搜索结果' : location === 'computer' ? '此电脑' : breadcrumb.join(' › ') }}</span>
      <span>{{ searchQuery.trim() ? searchResults.length : (currentFolders.length + currentFiles.length) }} 个对象</span>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>

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
.fm-toolbar { height: 46px; flex: 0 0 46px; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-bottom: 1px solid #d5dcdb; }
.nav { border: 1px solid #d5dcdb; background: #fff; border-radius: 4px; padding: 5px 10px; font-size: 12px; white-space: nowrap; }
.addr { flex: 1; padding: 6px 12px; background: #f2f5f4; border-radius: 4px; font-size: 12px; display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap; }
.crumb { cursor: pointer; }
.crumb:hover { color: var(--accent); }
.sep { color: #9aa7ab; }
.search-wrap { position: relative; display: flex; align-items: center; }
.search-ico { position: absolute; left: 8px; font-size: 12px; opacity: .6; }
.search { padding: 6px 10px 6px 26px; border: 1px solid #d5dcdb; border-radius: 4px; font-size: 12px; width: 170px; }
.fm-body { flex: 1; display: flex; min-height: 0; }
.side { width: 180px; flex: 0 0 180px; background: #f2f5f4; border-right: 1px solid #d5dcdb; padding: 10px 0; overflow: auto; }
.side-title { padding: 6px 14px; font-size: 11px; color: #9aa7ab; }
.side-row { padding: 8px 14px; font-size: 12px; cursor: pointer; }
.side-row:hover, .side-row.active { background: #e1eae9; }
.main { flex: 1; overflow: auto; padding: 14px; }
.section-label { font-size: 11px; color: #9aa7ab; margin: 4px 0 10px; }
.drive-grid { display: flex; flex-wrap: wrap; gap: 20px; padding-bottom: 16px; }
.drive { width: 180px; border: 1px solid #e3e8e7; border-radius: 6px; padding: 14px; cursor: pointer; }
.drive:hover { background: #f4f8f9; border-color: #bcd3dd; }
.drive-ico { font-size: 40px; }
.drive-name { font-size: 13px; margin: 8px 0; }
.drive-bar { height: 6px; background: #e5eaea; border-radius: 3px; overflow: hidden; }
.drive-bar i { display: block; height: 100%; background: #5f93a8; }
.drive-free { font-size: 10px; color: #9aa7ab; margin-top: 6px; }
.folder-grid { display: flex; flex-wrap: wrap; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid #eef1f0; }
.folder { width: 84px; text-align: center; font-size: 11px; padding: 6px; border-radius: 4px; word-break: break-all; user-select: none; }
.folder.selectable { cursor: pointer; }
.folder.selectable:hover { background: #f0f5f5; }
.folder-icon { font-size: 34px; }
.file-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.file { width: 96px; text-align: center; font-size: 11px; padding: 8px 4px; border-radius: 4px; cursor: pointer; }
.file:hover { background: #f0f5f5; }
.file.clickable { outline: 1px dashed #9fc4d4; }
.file-icon { font-size: 30px; }
.file-name { margin-top: 5px; line-height: 1.4; word-break: break-all; }
.file-size { color: #a5b0b3; font-size: 10px; margin-top: 3px; }
.result-list { display: flex; flex-direction: column; }
.result-row { display: flex; align-items: center; gap: 12px; padding: 9px 8px; font-size: 12px; border-bottom: 1px solid #eef1f0; cursor: pointer; }
.result-row:hover { background: #f0f5f5; }
.result-ico { font-size: 18px; }
.result-name { flex: 1; }
.result-path { color: #9aa7ab; font-size: 11px; }
.result-size { color: #a5b0b3; font-size: 11px; }
.empty { padding: 30px; text-align: center; color: #9aa7ab; font-size: 12px; }
.status { height: 26px; flex: 0 0 26px; background: #f2f5f4; border-top: 1px solid #d5dcdb; font-size: 11px; color: #8c9a9e; padding: 5px 12px; display: flex; justify-content: space-between; }
.toast { position: absolute; left: 50%; bottom: 46px; transform: translateX(-50%); background: rgba(28,36,41,.92); color: #fff; font-size: 12px; padding: 10px 18px; border-radius: 6px; z-index: 100; box-shadow: 0 6px 18px rgba(0,0,0,.3); }
.preview { position: fixed; inset: 0; background: rgba(10,22,28,.5); display: grid; place-items: center; z-index: 60000; }
.preview-card { width: 460px; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
.p-head { padding: 12px 16px; background: #2c3e46; color: #fff; font-size: 13px; display: flex; justify-content: space-between; }
.p-head span { cursor: pointer; }
.preview-card pre { padding: 20px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; font-family: var(--font); }
</style>
