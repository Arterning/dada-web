<template>
  <div class="min-h-screen">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo和品牌 -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold">
              🎉
            </h1>
            <span class="ml-2 text-primary-500 font-bold">慧搭</span>
          </div>

          <!-- 导航菜单 -->
          <div class="hidden md:flex items-center space-x-2">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              :class="[
                'px-4 py-2 rounded-lg transition-all text-sm font-medium',
                isActive(item.path)
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-cute'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
              ]"
            >
              {{ item.icon }} {{ item.label }}
            </router-link>
          </div>

          <!-- 用户信息 -->
          <div class="flex items-center gap-4">
            <div class="hidden sm:flex items-center gap-2">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {{ userInitial }}
              </div>
              <span class="text-sm text-gray-700">{{ userName }}</span>
            </div>
            <button
              @click="handleLogout"
              class="text-gray-500 hover:text-primary-600 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              退出
            </button>
          </div>
        </div>
      </div>

      <!-- 移动端导航菜单 -->
      <div class="md:hidden border-t border-gray-200 px-4 py-2">
        <div class="flex overflow-x-auto space-x-2 pb-2">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all text-xs font-medium whitespace-nowrap',
              isActive(item.path)
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            ]"
          >
            {{ item.icon }} {{ item.label }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 主要内容区 -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 导航菜单项
const navItems = [
  { path: '/daily-outfits', label: '穿搭日记', icon: '📅' },
  { path: '/outfits', label: '搭配方案', icon: '🎨' },
  { path: '/clothes', label: '我的衣橱', icon: '👔' },
  { path: '/weather/statistics', label: '天气统计', icon: '🌤️' }
]

// 判断当前路由是否激活
const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const userName = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    return user.nickname || user.username
  }
  return '用户'
})


const userInitial = computed(() => {
  const name = userName.value
  return name.charAt(0).toUpperCase()
})

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗?')) {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    router.push('/login')
  }
}
</script>

<style scoped>
/* 移动端导航滚动条样式 */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #FFB6C1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #FF9FB0;
}
</style>
