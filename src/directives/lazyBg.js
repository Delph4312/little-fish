/**
 * v-lazy-bg="图片地址"
 * 图片素材已压缩为 webp（几十 KB），无需延迟加载。
 * 这里改为挂载时立即设置背景图，并用 Image 对象提前预热浏览器缓存，
 * 消除原本「进入可视区才加载」造成的头像/配图白屏与加载缓慢感。
 */
const prefetched = new Set()

function prefetch(url) {
  if (!url || prefetched.has(url)) return
  prefetched.add(url)
  const im = new Image()
  im.src = url
}

export const vLazyBg = {
  mounted(el, binding) {
    if (!binding.value) return
    prefetch(binding.value)
    el.style.backgroundImage = `url(${binding.value})`
  },
  updated(el, binding) {
    if (!binding.value) return
    if (el.dataset.lazyBg === binding.value) return
    el.dataset.lazyBg = binding.value
    prefetch(binding.value)
    el.style.backgroundImage = `url(${binding.value})`
  }
}

// 供 main.js 注册
export function registerLazyBg(app) {
  app.directive('lazy-bg', vLazyBg)
}
