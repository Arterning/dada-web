<template>
  <div class="bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 rounded-cute shadow-cute-lg p-6 text-white">
    <div v-if="loading" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
    </div>

    <div v-else-if="weather" class="space-y-4">
      <!-- 城市和刷新 -->
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <span>📍</span>
          <span>{{ weather.city }}</span>
        </h3>
        <button
          @click="refreshWeatherData"
          :disabled="refreshing"
          class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors disabled:opacity-50"
        >
          {{ refreshing ? '刷新中...' : '🔄 刷新' }}
        </button>
      </div>

      <!-- 主要天气信息 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- 天气图标 -->
          <div class="text-6xl">
            {{ getWeatherIcon(weather.weather) }}
          </div>

          <!-- 温度和天气 -->
          <div>
            <div class="text-5xl font-bold">{{ Math.round(weather.temperature) }}°</div>
            <div class="text-lg opacity-90">{{ weather.weather }}</div>
          </div>
        </div>

        <!-- 明天天气预报 -->
        <div class="text-right bg-white/20 rounded-cute px-4 py-3">
          <div class="text-sm opacity-80">明天</div>
          <div class="text-2xl">{{ getWeatherIcon(weather.future_weather) }}</div>
          <div class="text-sm">{{ weather.future_weather }}</div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="grid grid-cols-2 gap-3 pt-3 border-t border-white/30">
        <!-- 风向风速 -->
        <div class="flex items-center gap-2">
          <span class="text-2xl">🌬️</span>
          <div class="text-sm">
            <div class="opacity-80">{{ weather.wind_direction }}</div>
            <div class="font-semibold">{{ weather.wind_speed }} km/h</div>
          </div>
        </div>

        <!-- 日出日落 -->
        <div class="flex items-center gap-2">
          <span class="text-2xl">🌅</span>
          <div class="text-sm">
            <div class="opacity-80">日出 {{ weather.sunrise }}</div>
            <div class="opacity-80">日落 {{ weather.sunset }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-4">
      <p class="text-white/80">暂无天气数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCurrentWeather, refreshWeather } from '@/api/weather'
import type { Weather } from '@/types'

const weather = ref<Weather | null>(null)
const loading = ref(false)
const refreshing = ref(false)

// 获取天气图标
const getWeatherIcon = (weatherStr: string) => {
  if (!weatherStr) return '☁️'
  if (weatherStr.includes('晴')) return '☀️'
  if (weatherStr.includes('云')) return '☁️'
  if (weatherStr.includes('阴')) return '🌥️'
  if (weatherStr.includes('雨')) return '🌧️'
  if (weatherStr.includes('雪')) return '❄️'
  if (weatherStr.includes('雾')) return '🌫️'
  return '☁️'
}

// 加载天气数据
const loadWeather = async () => {
  try {
    loading.value = true
    weather.value = await getCurrentWeather()
  } catch (error) {
    console.error('加载天气失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新天气数据
const refreshWeatherData = async () => {
  try {
    refreshing.value = true
    await refreshWeather()
    await loadWeather()
  } catch (error) {
    console.error('刷新天气失败:', error)
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadWeather()
})

// 暴露给父组件使用
defineExpose({
  weather,
  loadWeather
})
</script>
