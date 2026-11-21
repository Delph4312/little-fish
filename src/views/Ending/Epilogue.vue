<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const items = ref([
  '一支用完的黑色水笔',
  '叠成四折、没有寄出的信',
  '一张写着地址的便签',
  '被关机的电脑'
])
const shown = ref(0)

function reveal() {
  if (shown.value < items.value.length) shown.value++
}
</script>

<template>
  <div class="epilogue" @click="reveal">
    <div class="title">遗物整理</div>
    <div class="desc">桌子被一点点清空。每拿起一样东西，都像是又确认了一次他真的不在了。</div>
    <div class="items">
      <div v-for="(it, i) in items" :key="i" class="item" :class="{ show: i < shown }">
        <span class="dot"></span>{{ it }}
      </div>
    </div>
    <div class="final" v-if="shown >= items.length">
      窗外还是那片海。海洋很大，而我们都只是一条小鱼。
      <button class="btn" @click="router.push('/boot')">重新开始</button>
    </div>
    <div class="hint" v-else>点击继续整理</div>
  </div>
</template>

<style scoped>
.epilogue { position: absolute; inset: 0; background: #111d24; color: #d7e1e4; padding: 60px 30px; text-align: center; overflow: auto; cursor: pointer; }
.title { font-size: 24px; font-weight: 300; letter-spacing: 6px; color: #b9cbd1; }
.desc { max-width: 560px; margin: 20px auto 40px; font-size: 13px; line-height: 2; color: #91a5ad; }
.items { max-width: 460px; margin: 0 auto; text-align: left; }
.item { display: flex; align-items: center; gap: 12px; padding: 14px 0; font-size: 14px; border-bottom: 1px solid #26363e; opacity: 0; transform: translateY(8px); transition: all .8s; }
.item.show { opacity: 1; transform: none; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #7d9aa6; }
.final { margin-top: 50px; font-size: 15px; line-height: 2; color: #c9d7db; }
.final .btn { display: block; margin: 30px auto; }
.hint { margin-top: 40px; font-size: 12px; opacity: .5; }
</style>
