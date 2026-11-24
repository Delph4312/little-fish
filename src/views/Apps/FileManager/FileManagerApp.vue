<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useGameStore, ANSWERS } from '@/stores/gameStore'

const game = useGameStore()

// 工具栏基础操作：选中文件 + 剪切/复制/粘贴/查看/删除
const selectedFile = ref(null)
const clipboard = ref(null)
const clipboardMode = ref('')
function selectFile(f) { selectedFile.value = f }
function doCut() {
  if (!selectedFile.value) return showToast('请先选中一个文件。')
  clipboard.value = { ...selectedFile.value }
  clipboardMode.value = 'cut'
  showToast('已剪切：' + selectedFile.value.name)
}
function doCopy() {
  if (!selectedFile.value) return showToast('请先选中一个文件。')
  clipboard.value = { ...selectedFile.value }
  clipboardMode.value = 'copy'
  showToast('已复制：' + selectedFile.value.name)
}
function doPaste() {
  if (!clipboard.value) return showToast('剪贴板为空。')
  showToast(`${clipboardMode.value === 'cut' ? '移动' : '粘贴'}：${clipboard.value.name}（演示）`)
}
function doView() {
  if (!selectedFile.value) return showToast('请先选中一个文件。')
  openFile(selectedFile.value)
}
function doDelete() {
  if (!selectedFile.value) return showToast('请先选中一个文件。')
  showToast('已删除：' + selectedFile.value.name + '（演示）')
  selectedFile.value = null
}

// D 盘里那个随机字母命名的文件夹：唯一可进入，里面放着密码文件。
// 名字固定，保证线索稳定可解（每次打开都一样）。
const SECRET_FOLDER = 'QXKM'

const location = ref('computer') // computer | C: | D: | secret
const searchQuery = ref('')
const toast = ref('')
const openedFile = ref(null)
let toastTimer

// 工具栏「查看」下拉菜单
const viewMenuOpen = ref(false)
const showHidden = ref(false)   // 显示隐藏的项目
const viewMode = ref('icons')   // icons | list
function toggleViewMenu() { viewMenuOpen.value = !viewMenuOpen.value }
function toggleHidden() { showHidden.value = !showHidden.value }
function setViewMode(m) { viewMode.value = m }
function refreshView() { viewMenuOpen.value = false; showToast('已刷新。') }

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
  'D:': [],
  secret: [
    // 微信密码.txt 为隐藏文件：文件夹内不显示，只能靠搜索找到并打开
    { name: '微信密码.txt', type: 'txt', size: '1 KB', key: 'wechatpwd', clickable: true, hidden: true },
    { name: '潮汐表.pdf', type: 'pdf', size: '348 KB' },
    { name: '成绩单.pdf', type: 'pdf', size: '96 KB' }
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
const currentFiles = computed(() => (files[location.value] || []).filter((f) => showHidden.value || !f.hidden))

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
      content: `微信登录密码：${ANSWERS.wechat}`
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
      <div class="tool-actions">
        <button title="剪切" @click="doCut">✂</button>
        <button title="复制" @click="doCopy">⧉</button>
        <button title="粘贴" @click="doPaste">📋</button>
        <div class="view-wrap">
          <button title="查看" @click="toggleViewMenu">👁</button>
          <div v-if="viewMenuOpen" class="view-menu">
            <div class="vm-title">查看</div>
            <div class="vm-item" @click="toggleHidden">
              <span class="vm-check">{{ showHidden ? '☑' : '☐' }}</span> 显示隐藏的项目
            </div>
            <div class="vm-sep"></div>
            <div class="vm-item" :class="{ on: viewMode === 'icons' }" @click="setViewMode('icons')">▦ 大图标</div>
            <div class="vm-item" :class="{ on: viewMode === 'list' }" @click="setViewMode('list')">☰ 详细信息</div>
            <div class="vm-sep"></div>
            <div class="vm-item" @click="doView">↗ 打开选中项</div>
            <div class="vm-item" @click="refreshView">↻ 刷新</div>
          </div>
        </div>
        <button title="删除" @click="doDelete">🗑</button>
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
            <div v-for="f in searchResults" :key="f.loc + f.name" class="result-row" :class="{ selected: selectedFile === f }" @click="selectFile(f)" @dblclick="openFile(f)">
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
          <div class="file-grid" :class="{ list: viewMode === 'list' }">
            <div
              v-for="f in currentFiles"
              :key="f.name"
              class="file"
              :class="{ clickable: f.clickable, selected: selectedFile === f }"
              @click="selectFile(f)"
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
.tool-actions { display: flex; gap: 2px; }
.tool-actions button { width: 28px; height: 26px; border: 1px solid transparent; background: transparent; border-radius: 4px; font-size: 13px; }
.tool-actions button:hover { background: #eef2f1; border-color: #d5dcdb; }
.view-wrap { position: relative; }
.view-menu { position: absolute; top: 30px; left: 0; z-index: 300; width: 178px; background: #fff; border: 1px solid #d5dcdb; border-radius: 6px; box-shadow: 0 8px 22px rgba(0,0,0,.16); padding: 6px 0; }
.vm-title { padding: 4px 14px 8px; font-size: 11px; color: #9aa7ab; font-weight: 500; }
.vm-item { padding: 7px 14px; font-size: 12px; color: #39474d; cursor: pointer; white-space: nowrap; }
.vm-item:hover { background: #eef4f7; }
.vm-item.on { color: #2f6f8f; font-weight: 500; }
.vm-check { display: inline-block; width: 16px; color: #2f6f8f; }
.vm-sep { height: 1px; background: #eef1f0; margin: 4px 0; }
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
.file-grid.list { flex-direction: column; gap: 0; }
.file-grid.list .file { width: 100%; display: flex; align-items: center; gap: 12px; text-align: left; padding: 7px 10px; border-radius: 0; border-bottom: 1px solid #eef1f0; }
.file-grid.list .file-icon { font-size: 18px; }
.file-grid.list .file-name { margin: 0; flex: 1; }
.file-grid.list .file-size { margin: 0; }
.file { width: 96px; text-align: center; font-size: 11px; padding: 8px 4px; border-radius: 4px; cursor: pointer; }
.file:hover { background: #f0f5f5; }
.file.clickable { outline: 1px dashed #9fc4d4; }
.file.selected, .result-row.selected { background: #cfe3f0; outline: 1px solid #7fb0cc; }
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
