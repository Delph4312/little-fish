<script setup>
import { ref } from 'vue'
import { diaries, diaryMeta, finalPlan } from '@/data/diaryData'
import { useGameStore, ANSWERS } from '@/stores/gameStore'
import { useSystemStore } from '@/stores/systemStore'

const emit = defineEmits(['back'])
const game = useGameStore()
const system = useSystemStore()

const unlocked = ref(game.diaryUnlocked)
const pwd = ref('')
const err = ref(false)
const showPlan = ref(false)
const planPwd = ref('')
const planErr = ref(false)
const planUnlocked = ref(game.planUnlocked)

function unlock() {
  if (pwd.value.trim() === ANSWERS.diary) {
    unlocked.value = true
    game.diaryUnlocked = true
    game.addClue('diary-unlocked')
    system.notify({ from: '系统', text: '日记已解锁。' })
  } else {
    err.value = true
    setTimeout(() => (err.value = false), 1500)
  }
}

function openPlan() {
  // 最后一篇日记里的密码锁
  if (planUnlocked.value) {
    showPlan.value = true
    return
  }
  if (planPwd.value.trim() === ANSWERS.planCode) {
    planUnlocked.value = true
    game.planUnlocked = true
    game.addClue('plan-unlocked')
    showPlan.value = true
  } else {
    planErr.value = true
    setTimeout(() => (planErr.value = false), 1500)
  }
}
</script>

<template>
  <div class="diary">
    <div class="bar"><button @click="emit('back')">‹ 返回主页</button><span>{{ diaryMeta.title }}</span></div>

    <div v-if="!unlocked" class="lock">
      <div class="lock-icon">🔒</div>
      <h2>私人日记</h2>
      <input v-model="pwd" type="password" placeholder="请输入密码" @keyup.enter="unlock" />
      <button class="btn btn-primary" @click="unlock">解锁</button>
      <div v-if="err" class="err">密码错误</div>
    </div>

    <div v-else class="pages">
      <div v-for="d in diaries" :key="d.date" class="entry">
        <div class="date">{{ d.date }}</div>
        <p v-for="(line, i) in d.content" :key="i">{{ line }}</p>
        <button v-if="d.unlocksNext" class="btn plan-btn" @click="openPlan">查看隐藏内容 →</button>
      </div>

      <div v-if="!planUnlocked" class="plan-lock">
        <div class="plan-lock-row">
          <input v-model="planPwd" type="password" placeholder="输入六位密码" @keyup.enter="openPlan" />
          <button class="btn" @click="openPlan">解锁</button>
        </div>
        <div v-if="planErr" class="err">密码错误</div>
      </div>

      <div v-if="showPlan" class="plan">
        <h3>{{ finalPlan.title }}</h3>
        <div class="plan-row"><b>犯案地点：</b>{{ finalPlan.crimePlace }}</div>
        <div class="plan-row"><b>最终地点：</b>{{ finalPlan.suicidePlace }}</div>
        <p class="muted small">{{ finalPlan.note }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diary { min-height: 100%; background: #f6f4ef; }
.bar { display: flex; justify-content: space-between; padding: 10px 20px; background: #fff; border-bottom: 1px solid #e2e7e6; font-size: 12px; color: #6b7b82; }
.bar button { border: 0; background: transparent; color: #2f6f8f; cursor: pointer; }
.lock { max-width: 420px; margin: 70px auto; text-align: center; background: #fff; padding: 36px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
.lock-icon { font-size: 40px; }
.lock h2 { font-size: 18px; font-weight: 500; margin: 14px 0 4px; }
.lock p { font-size: 12px; line-height: 1.6; }
.lock input { display: block; width: 100%; margin: 14px 0 12px; padding: 9px; border: 1px solid #d5dcdb; border-radius: 4px; text-align: center; }
.err { color: #b23b3b; font-size: 12px; margin-top: 10px; }
.pages { max-width: 700px; margin: 0 auto; padding: 24px 20px 40px; }
.entry { background: #fff; border-radius: 5px; padding: 20px 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.date { font-size: 15px; font-weight: 600; color: #4a6d8c; padding-bottom: 12px; border-bottom: 1px dashed #d5dcdb; margin-bottom: 14px; }
.entry p { font-size: 13px; line-height: 2; color: #39474d; margin: 0 0 12px; }
.plan-btn { margin-top: 10px; }
.plan-lock { background: #fff; border-left: 3px solid #b9963f; border-radius: 5px; padding: 18px 24px; font-size: 13px; line-height: 1.8; margin-bottom: 16px; }
.plan-lock-row { display: flex; gap: 8px; margin-top: 12px; }
.plan-lock-row input { flex: 1; padding: 8px 10px; border: 1px solid #d5dcdb; border-radius: 4px; }
.plan { background: #fff; border-left: 3px solid #8e2b2b; border-radius: 5px; padding: 20px 24px; }
.plan h3 { font-size: 15px; margin: 0 0 14px; }
.plan-row { font-size: 13px; line-height: 2; }
.small { font-size: 11px; }
</style>
