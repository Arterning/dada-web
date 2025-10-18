<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-6">
        <button
          @click="router.back()"
          class="flex items-center text-gray-600 hover:text-primary-500 transition-colors"
        >
          <span class="text-xl mr-2">←</span>
          <span>返回</span>
        </button>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ isEdit ? '编辑穿搭记录' : '新增穿搭记录' }}
        </h1>
        <div class="w-20"></div>
      </div>

      <!-- 表单卡片 -->
      <div class="bg-white rounded-cute shadow-cute-lg p-6 md:p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 日期选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              日期 *
            </label>
            <input
              v-model="outfitForm.date"
              type="date"
              required
              class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          <!-- 穿搭描述 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              今日穿搭
            </label>
            <textarea
              v-model="outfitForm.todays_clothes"
              rows="4"
              class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors resize-none"
              placeholder="描述一下今天穿了什么吧~ 例如：白色T恤+蓝色牛仔裤+小白鞋"
            ></textarea>
          </div>

          <!-- 天气和温度 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 天气 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                天气
              </label>
              <select
                v-model="outfitForm.weather"
                class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              >
                <option value="">请选择</option>
                <option value="晴天">☀️ 晴天</option>
                <option value="多云">☁️ 多云</option>
                <option value="阴天">🌥️ 阴天</option>
                <option value="雨天">🌧️ 雨天</option>
                <option value="雪天">❄️ 雪天</option>
              </select>
            </div>

            <!-- 温度 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                温度
              </label>
              <input
                v-model="outfitForm.temperature"
                type="text"
                class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
                placeholder="例如：25°C"
              />
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="bg-red-50 border-2 border-red-200 rounded-cute p-3">
            <p class="text-red-600 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- 成功提示 -->
          <div v-if="successMessage" class="bg-green-50 border-2 border-green-200 rounded-cute p-3">
            <p class="text-green-600 text-sm">{{ successMessage }}</p>
          </div>

          <!-- 按钮组 -->
          <div class="flex gap-4">
            <button
              type="button"
              @click="router.back()"
              class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-cute hover:bg-gray-50 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 rounded-cute hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span v-if="!loading">{{ isEdit ? '更新' : '保存' }} ✨</span>
              <span v-else>保存中...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createDailyOutfit, updateDailyOutfit, getDailyOutfit } from '@/api/dailyOutfit'
import { getCurrentWeather } from '@/api/weather'
import type { CreateDailyOutfitRequest } from '@/types'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isEdit = ref(false)

// 获取东八区当前日期
const getLocalDate = () => {
  const now = new Date()
  const offset = 8 * 60 // 东八区偏移分钟数
  const localTime = new Date(now.getTime() + offset * 60 * 1000)
  return localTime.toISOString().split('T')[0]
}

const outfitForm = ref<CreateDailyOutfitRequest>({
  date: getLocalDate(),
  todays_clothes: '',
  temperature: '',
  weather: '',
  clothing_ids: [],
})

// 加载天气数据并自动填充
const loadWeatherData = async () => {
  try {
    const weatherData = await getCurrentWeather()
    // 只在新增模式下自动填充天气
    if (!isEdit.value) {
      outfitForm.value.temperature = `${Math.round(weatherData.temperature)}°C`
      outfitForm.value.weather = weatherData.weather
    }
  } catch (error) {
    console.error('加载天气数据失败:', error)
  }
}

// 如果是编辑模式，加载数据；否则加载天气数据
onMounted(async () => {
  const id = route.params.id
  if (id) {
    isEdit.value = true
    try {
      const outfit = await getDailyOutfit(Number(id))
      outfitForm.value = {
        date: outfit.date,
        todays_clothes: outfit.todays_clothes || '',
        temperature: outfit.temperature || '',
        weather: outfit.weather || '',
        clothing_ids: outfit.clothing_ids,
      }
    } catch (error: any) {
      errorMessage.value = '加载穿搭记录失败'
    }
  } else {
    // 新增模式，自动填充天气
    await loadWeatherData()
  }
})

const handleSubmit = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    if (isEdit.value && route.params.id) {
      await updateDailyOutfit(Number(route.params.id), outfitForm.value)
      successMessage.value = '更新成功！'
    } else {
      await createDailyOutfit(outfitForm.value)
      successMessage.value = '保存成功！'
    }

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      router.push('/daily-outfits')
    }, 1000)
  } catch (error: any) {
    errorMessage.value = error.message || '保存失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>
