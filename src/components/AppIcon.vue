<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  glyph: { type: String, default: '▣' },
  color: { type: String, default: '#fff' },
  app: { type: String, required: true }
})
const emit = defineEmits(['open'])
const selected = ref(false)

// 桌面空白点击由父级统一清除选中，这里只处理本图标
function onClick() {
  selected.value = true
}
function onDblClick() {
  emit('open', props.app)
}
function defineExposeReset() {
  selected.value = false
}
defineExpose({ reset: defineExposeReset })
</script>

<template>
  <div
    class="app-icon"
    :class="{ selected }"
    @click="onClick"
    @dblclick="onDblClick"
  >
    <div class="glyph" :style="{ background: color }">{{ glyph }}</div>
    <div class="label">{{ label }}</div>
  </div>
</template>
