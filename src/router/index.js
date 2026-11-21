import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/boot'
  },
  {
    path: '/boot',
    name: 'Boot',
    component: () => import('@/views/Boot/IntroView.vue'),
    meta: { title: '小鱼' }
  },
  {
    path: '/lock',
    name: 'Lock',
    component: () => import('@/views/Boot/LockScreen.vue'),
    meta: { title: '锁屏' }
  },
  {
    path: '/desktop',
    name: 'Desktop',
    component: () => import('@/views/Desktop/DesktopView.vue'),
    meta: { title: '桌面' }
  },
  {
    path: '/ending/bad',
    name: 'EndingBad',
    component: () => import('@/views/Ending/EndingBad.vue'),
    meta: { title: '结局' }
  },
  {
    path: '/ending/epilogue',
    name: 'Epilogue',
    component: () => import('@/views/Ending/Epilogue.vue'),
    meta: { title: '遗物' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
