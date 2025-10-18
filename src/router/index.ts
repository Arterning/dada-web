import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/daily-outfits',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/daily-outfits',
    name: 'DailyOutfitList',
    component: () => import('@/views/DailyOutfitList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/daily-outfits/new',
    name: 'DailyOutfitNew',
    component: () => import('@/views/DailyOutfitForm.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/daily-outfits/edit/:id',
    name: 'DailyOutfitEdit',
    component: () => import('@/views/DailyOutfitForm.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !token) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (!requiresAuth && token && (to.path === '/login' || to.path === '/register')) {
    // 已登录用户访问登录/注册页，跳转到首页
    next('/daily-outfits')
  } else {
    next()
  }
})

export default router
