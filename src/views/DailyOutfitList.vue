<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- 头部 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">👗 我的穿搭日记</h1>
          <p class="text-gray-600">记录每一天的美好穿搭</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="router.push('/clothes')"
            class="px-6 py-3 border-2 border-primary-300 text-primary-600 rounded-cute hover:bg-primary-50 transition-all"
          >
            👔 我的衣橱
          </button>
          <button
            @click="router.push('/daily-outfits/new')"
            class="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-cute hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-cute"
          >
            ✨ 新增穿搭
          </button>
        </div>
      </div>

      <!-- 用户信息卡片 -->
      <div class="bg-white rounded-cute shadow-cute p-4 mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl">
            {{ userInitial }}
          </div>
          <div>
            <p class="font-semibold text-gray-800">{{ userName }}</p>
            <p class="text-sm text-gray-500">已记录 {{ outfits.length }} 天穿搭</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="text-gray-500 hover:text-primary-500 transition-colors px-4 py-2"
        >
          退出登录
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        <p class="text-gray-500 mt-4">加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="outfits.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">还没有穿搭记录</h3>
        <p class="text-gray-500 mb-6">开始记录你的第一个穿搭吧！</p>
        <button
          @click="router.push('/daily-outfits/new')"
          class="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-cute hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105"
        >
          ✨ 新增穿搭
        </button>
      </div>

      <!-- 穿搭列表 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="outfit in outfits"
          :key="outfit.id"
          class="bg-white rounded-cute shadow-cute hover:shadow-cute-lg transition-all transform hover:-translate-y-1 overflow-hidden"
        >
          <!-- 日期标签 -->
          <div class="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm opacity-90">{{ formatDate(outfit.date) }}</p>
                <p class="text-2xl font-bold">{{ getDayOfMonth(outfit.date) }}</p>
              </div>
              <div class="text-3xl">
                {{ getWeatherEmoji(outfit.weather) }}
              </div>
            </div>
          </div>

          <!-- 内容 -->
          <div class="p-6">
            <!-- 温度和天气 -->
            <div class="flex gap-2 mb-4">
              <span v-if="outfit.weather" class="px-3 py-1 bg-cute-sky/20 text-primary-700 rounded-full text-sm">
                {{ outfit.weather }}
              </span>
              <span v-if="outfit.temperature" class="px-3 py-1 bg-cute-peach/20 text-primary-700 rounded-full text-sm">
                {{ outfit.temperature }}
              </span>
            </div>

            <!-- 穿搭描述 -->
            <p v-if="outfit.todays_clothes" class="text-gray-700 mb-4 line-clamp-3">
              {{ outfit.todays_clothes }}
            </p>
            <p v-else class="text-gray-400 italic mb-4">
              暂无描述
            </p>

            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <button
                @click="router.push(`/daily-outfits/edit/${outfit.id}`)"
                class="flex-1 px-4 py-2 border-2 border-primary-300 text-primary-600 rounded-cute hover:bg-primary-50 transition-colors"
              >
                编辑
              </button>
              <button
                @click="handleDelete(outfit.id)"
                class="flex-1 px-4 py-2 border-2 border-red-300 text-red-600 rounded-cute hover:bg-red-50 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getDailyOutfits, deleteDailyOutfit } from '@/api/dailyOutfit'
import { logout } from '@/api/auth'
import type { DailyOutfit } from '@/types'

const router = useRouter()
const loading = ref(false)
const outfits = ref<DailyOutfit[]>([])

const userName = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    return user.nickname || user.username
  }
  return '用户'
})

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

// 加载穿搭列表
const loadOutfits = async () => {
  try {
    loading.value = true
    outfits.value = await getDailyOutfits()
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

// 删除穿搭
const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这条穿搭记录吗？')) {
    return
  }

  try {
    await deleteDailyOutfit(id)
    outfits.value = outfits.value.filter(outfit => outfit.id !== id)
  } catch (error) {
    alert('删除失败，请稍后再试')
  }
}

// 登出
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    logout()
    router.push('/login')
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday}`
}

// 获取日期的天数
const getDayOfMonth = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.getDate()
}

// 获取天气表情
const getWeatherEmoji = (weather?: string) => {
  if (!weather) return '📅'
  if (weather.includes('晴')) return '☀️'
  if (weather.includes('云')) return '☁️'
  if (weather.includes('阴')) return '🌥️'
  if (weather.includes('雨')) return '🌧️'
  if (weather.includes('雪')) return '❄️'
  return '📅'
}

onMounted(() => {
  loadOutfits()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
