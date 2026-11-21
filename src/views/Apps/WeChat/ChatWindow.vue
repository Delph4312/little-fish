<script setup>
defineProps({
  conv: { type: Object, default: null },
  convName: { type: String, default: '' }
})

function isTime(m) { return !!m.t }
</script>

<template>
  <div class="chat-window">
    <div class="chat-head">{{ convName }}</div>
    <div class="messages" v-if="conv">
      <template v-for="(m, i) in conv.messages" :key="i">
        <div v-if="isTime(m)" class="time-sep">{{ m.t }}</div>
        <div v-else class="msg-row" :class="m.from === 'me' ? 'mine' : 'theirs'">
          <div class="msg-avatar">{{ m.from === 'me' ? '遥' : (m.fromName ? m.fromName.slice(0,1) : convName.slice(0,1)) }}</div>
          <div class="bubble-wrap">
            <div class="sender" v-if="m.fromName">{{ m.fromName }}</div>
            <div class="bubble" :class="{ transfer: m.type === 'transfer', image: m.type === 'image' || m.type === 'screenshot' }">
              <template v-if="m.type === 'transfer'">💰 {{ m.text }}</template>
              <template v-else-if="m.type === 'image' || m.type === 'screenshot'">
                <div class="img-photo">{{ m.caption || '图片' }}</div>
              </template>
              <template v-else>{{ m.text }}</template>
            </div>
          </div>
        </div>
      </template>
      <div v-if="!conv.messages.length" class="empty">暂无消息</div>
    </div>
    <div class="chat-input">
      <div class="toolbar">😊 📎 ✂️</div>
      <textarea placeholder="发消息"></textarea>
      <div class="send-row"><span>按 Enter 发送</span><button class="btn">发送(S)</button></div>
    </div>
  </div>
</template>

<style scoped>
.chat-window { display: flex; flex-direction: column; height: 100%; background: #f5f7f6; }
.chat-head { height: 48px; flex: 0 0 48px; display: flex; align-items: center; padding: 0 20px; border-bottom: 1px solid #e2e7e6; background: #f9fbfa; font-size: 14px; font-weight: 500; }
.messages { flex: 1; overflow: auto; padding: 18px 22px; }
.time-sep { text-align: center; font-size: 11px; color: #a5b0b3; margin: 14px 0; }
.msg-row { display: flex; gap: 10px; margin: 10px 0; align-items: flex-start; }
.msg-row.mine { flex-direction: row-reverse; }
.msg-avatar { width: 34px; height: 34px; flex: 0 0 34px; border-radius: 4px; background: #d7e4dd; color: #46685a; display: grid; place-items: center; font-size: 13px; }
.mine .msg-avatar { background: #cfe0d6; }
.bubble-wrap { max-width: 66%; }
.sender { font-size: 11px; color: #8c9a9e; margin-bottom: 3px; }
.bubble { display: inline-block; background: #fff; border: 1px solid #e3e9e8; border-radius: 6px; padding: 9px 12px; font-size: 13px; line-height: 1.65; color: #1c2429; word-break: break-word; }
.mine .bubble { background: #d9eddf; border-color: #c7e3d1; }
.bubble.transfer { background: #fde9d6; border-color: #f4d5b4; }
.img-photo { width: 170px; height: 96px; border-radius: 4px; background: linear-gradient(135deg, #b7cdd4, #e3d4bd); display: grid; place-items: center; font-size: 11px; color: #48616b; }
.empty { text-align: center; color: #9aa7ab; margin-top: 60px; font-size: 13px; }
.chat-input { flex: 0 0 138px; border-top: 1px solid #e2e7e6; display: flex; flex-direction: column; background: #fafcfb; }
.toolbar { padding: 6px 16px 0; font-size: 14px; color: #7d8b8f; letter-spacing: 8px; }
.chat-input textarea { flex: 1; border: 0; outline: none; resize: none; padding: 6px 16px; font-size: 13px; background: transparent; }
.send-row { display: flex; justify-content: space-between; align-items: center; padding: 0 16px 8px; }
.send-row span { font-size: 10px; color: #a5b0b3; }
.send-row .btn { padding: 4px 12px; font-size: 12px; }
</style>
