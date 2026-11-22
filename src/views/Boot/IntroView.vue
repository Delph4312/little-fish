<script setup>
import { useRouter } from 'vue-router'
import { introScreens } from '@/data/storyData'

const router = useRouter()
const intro = introScreens[0]

function enter() {
  router.push('/lock')
}
</script>

<template>
  <div class="intro-root" @click="enter">
    <div class="vignette"></div>

    <div class="stage">
      <!-- 微信手机端截图 -->
      <div class="phone">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <!-- 状态栏 -->
          <div class="wx-status">
            <span class="wx-time">23:58</span>
            <span class="wx-status-right">▮▮▮  ᯤ  ▰</span>
          </div>
          <!-- 导航栏 -->
          <div class="wx-nav">
            <span class="wx-back">‹</span>
            <span class="wx-nav-title">{{ intro.screenshot.from }}</span>
            <span class="wx-nav-more">···</span>
          </div>
          <!-- 聊天区 -->
          <div class="wx-chat">
            <div class="wx-timestamp">昨天 23:58</div>
            <div class="wx-msg-row">
              <div class="wx-avatar">遥</div>
              <div class="wx-bubble">{{ intro.screenshot.text }}</div>
            </div>
          </div>
          <!-- 输入栏 -->
          <div class="wx-inputbar">
            <span class="wx-voice">🎙</span>
            <div class="wx-input">发消息...</div>
            <span class="wx-emoji">☺</span>
            <span class="wx-plus">＋</span>
          </div>
        </div>
      </div>

      <!-- 旁白 -->
      <div class="story">
        <div class="chapter">一条奇怪的消息</div>
        <p class="narration">{{ intro.text }}</p>
        <button class="enter-btn" @click.stop="enter">打开电脑 · 开始查找 ›</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.intro-root {
  position: absolute; inset: 0;
  background: linear-gradient(120deg, #0e212b 0%, #173746 55%, #244b5a 100%);
  display: grid; place-items: center;
  cursor: pointer;
  overflow: hidden;
}
.vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 42% 45%, transparent 25%, rgba(0,0,0,.6) 100%);
  pointer-events: none;
}
.stage {
  position: relative;
  display: flex;
  align-items: center;
  gap: 60px;
  max-width: 920px;
  padding: 0 32px;
}

/* ---- 微信手机截图 ---- */
.phone {
  position: relative;
  width: 300px;
  height: 600px;
  flex: 0 0 300px;
  background: #111;
  border: 7px solid #1b1b1b;
  border-radius: 40px;
  box-shadow: 0 24px 60px rgba(0,0,0,.6), inset 0 0 0 2px #333;
  padding: 0;
  overflow: hidden;
}
.phone-notch {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 22px;
  background: #111;
  border-radius: 0 0 14px 14px;
  z-index: 3;
}
.phone-screen {
  position: absolute; inset: 0;
  background: #ededed;
  display: flex;
  flex-direction: column;
  border-radius: 33px;
  overflow: hidden;
}
.wx-status {
  height: 30px; flex: 0 0 30px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px;
  background: #ededed;
  font-size: 11px; color: #000;
}
.wx-status-right { font-size: 10px; letter-spacing: 1px; }
.wx-nav {
  height: 44px; flex: 0 0 44px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 14px;
  background: #ededed;
  border-bottom: 1px solid #dcdcdc;
}
.wx-back { font-size: 26px; color: #181818; line-height: 1; }
.wx-nav-title { font-size: 15px; font-weight: 500; color: #181818; }
.wx-nav-more { font-size: 20px; color: #181818; letter-spacing: 1px; }
.wx-chat {
  flex: 1;
  padding: 14px 12px;
  overflow: hidden;
}
.wx-timestamp {
  text-align: center; font-size: 11px; color: #b2b2b2; margin-bottom: 16px;
}
.wx-msg-row { display: flex; gap: 8px; align-items: flex-start; }
.wx-avatar {
  width: 38px; height: 38px; flex: 0 0 38px;
  border-radius: 5px;
  background: linear-gradient(145deg, #7a9aa6, #476673);
  color: #fff;
  display: grid; place-items: center;
  font-size: 17px;
}
.wx-bubble {
  position: relative;
  background: #fff;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #181818;
  max-width: 200px;
  box-shadow: 0 1px 1px rgba(0,0,0,.05);
}
.wx-bubble::before {
  content: ""; position: absolute;
  top: 12px; left: -6px;
  border-width: 6px 6px 6px 0;
  border-style: solid;
  border-color: transparent #fff transparent transparent;
}
.wx-inputbar {
  height: 52px; flex: 0 0 52px;
  display: flex; align-items: center; gap: 8px;
  padding: 0 10px;
  background: #f7f7f7;
  border-top: 1px solid #dcdcdc;
  font-size: 18px; color: #555;
}
.wx-input {
  flex: 1; height: 32px;
  background: #fff; border-radius: 5px;
  display: flex; align-items: center;
  padding: 0 10px; font-size: 12px; color: #b2b2b2;
}
.wx-emoji, .wx-plus { font-size: 20px; }

/* ---- 旁白 ---- */
.story { max-width: 440px; }
.chapter { color: #8fb4c4; font-size: 12px; letter-spacing: 3px; margin-bottom: 22px; }
.narration {
  color: #eef3f4;
  font-size: 18px;
  line-height: 2;
  white-space: pre-line;
  text-shadow: 0 2px 12px rgba(0,0,0,.4);
  margin: 0 0 28px;
}
.enter-btn {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.35);
  color: #eef3f4;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
}
.enter-btn:hover { background: rgba(255,255,255,.16); }
.hint {
  position: absolute; bottom: 22px; left: 0; right: 0;
  text-align: center; color: rgba(238,243,244,.45); font-size: 12px;
  animation: breathe 2.4s ease-in-out infinite;
}
@keyframes breathe { 0%,100% { opacity: .35; } 50% { opacity: .9; } }
</style>
