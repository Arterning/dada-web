<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-8">
        <button
          @click="router.back()"
          class="flex items-center text-gray-600 hover:text-primary-500 transition-colors"
        >
          <span class="text-xl mr-2">←</span>
          <span>返回</span>
        </button>
        <h1 class="text-3xl font-bold text-gray-800">📊 历史天气统计</h1>
        <div class="w-20"></div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        <p class="text-gray-500 mt-4">加载中...</p>
      </div>

      <!-- 统计数据 -->
      <div v-else-if="statistics">
        <!-- 概览卡片 -->
        <div class="bg-white rounded-cute shadow-cute p-6 mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">📈 数据概览</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-cute p-4">
              <div class="text-sm text-blue-600 mb-1">记录天数</div>
              <div class="text-3xl font-bold text-blue-700">{{ statistics.total_days }}</div>
              <div class="text-xs text-blue-500 mt-1">天</div>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-cute p-4">
              <div class="text-sm text-green-600 mb-1">平均温度</div>
              <div class="text-3xl font-bold text-green-700">{{ averageTemp }}°C</div>
              <div class="text-xs text-green-500 mt-1">今年平均</div>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-cute p-4">
              <div class="text-sm text-orange-600 mb-1">温度范围</div>
              <div class="text-3xl font-bold text-orange-700">{{ tempRange }}</div>
              <div class="text-xs text-orange-500 mt-1">最低~最高</div>
            </div>
          </div>
        </div>

        <!-- 穿衣建议 -->
        <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-cute shadow-cute p-6 mb-6">
          <h2 class="text-xl font-bold text-pink-800 mb-4">👗 智能穿衣建议</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="suggestion in clothingSuggestions"
              :key="suggestion.range"
              class="bg-white rounded-cute p-4 hover:shadow-cute transition-all"
            >
              <div class="flex items-center gap-3 mb-3">
                <span class="text-3xl">{{ suggestion.icon }}</span>
                <div>
                  <div class="font-bold text-gray-800">{{ suggestion.range }}</div>
                  <div class="text-sm text-gray-500">{{ suggestion.days }}天</div>
                </div>
              </div>
              <div class="text-sm text-gray-700 space-y-1">
                <p><span class="font-semibold">👕 上装：</span>{{ suggestion.top }}</p>
                <p><span class="font-semibold">👖 下装：</span>{{ suggestion.bottom }}</p>
                <p v-if="suggestion.outer"><span class="font-semibold">🧥 外套：</span>{{ suggestion.outer }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 温度趋势图 -->
        <div class="bg-white rounded-cute shadow-cute p-6 mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">📈 温度变化趋势</h2>
          <div class="w-full" style="height: 400px">
            <v-chart :option="tempTrendOption" autoresize />
          </div>
        </div>

        <!-- 温度分布统计 -->
        <div class="bg-white rounded-cute shadow-cute p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">🌡️ 温度分布统计</h2>
          <div class="w-full" style="height: 400px">
            <v-chart :option="tempDistributionOption" autoresize />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">暂无历史数据</h3>
        <p class="text-gray-500">系统会自动收集天气数据，请稍后查看</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { getWeatherStatistics } from '@/api/weather'
import type { WeatherStatistics } from '@/types'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const router = useRouter()
const loading = ref(false)
const statistics = ref<WeatherStatistics | null>(null)

// 计算平均温度
const averageTemp = computed(() => {
  if (!statistics.value || statistics.value.time_series.length === 0) return 0
  const sum = statistics.value.time_series.reduce((acc, item) => acc + item.temperature, 0)
  return Math.round(sum / statistics.value.time_series.length)
})

// 计算温度范围
const tempRange = computed(() => {
  if (!statistics.value || statistics.value.time_series.length === 0) return '-'
  const temps = statistics.value.time_series.map(item => item.temperature)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  return `${Math.round(min)}~${Math.round(max)}°C`
})

// 穿衣建议
const clothingSuggestions = computed(() => {
  if (!statistics.value) return []

  const suggestions = [
    {
      range: '0度以下',
      icon: '❄️',
      days: 0,
      top: '保暖内衣+毛衣+羽绒服',
      bottom: '加绒裤+秋裤',
      outer: '厚羽绒服/棉服'
    },
    {
      range: '0-10度',
      icon: '🧊',
      days: 0,
      top: '长袖+毛衣+外套',
      bottom: '牛仔裤/休闲裤',
      outer: '风衣/棉服'
    },
    {
      range: '10-20度',
      icon: '🍂',
      days: 0,
      top: '长袖T恤+薄外套',
      bottom: '牛仔裤/休闲裤',
      outer: '薄外套/风衣'
    },
    {
      range: '20-30度',
      icon: '☀️',
      days: 0,
      top: '短袖T恤/衬衫',
      bottom: '短裤/薄长裤',
      outer: ''
    },
    {
      range: '30-35度',
      icon: '🔥',
      days: 0,
      top: '短袖T恤/背心',
      bottom: '短裤/短裙',
      outer: ''
    },
    {
      range: '35度以上',
      icon: '🌡️',
      days: 0,
      top: '透气短袖/背心',
      bottom: '短裤/短裙',
      outer: ''
    }
  ]

  // 统计每个温度范围的天数
  statistics.value.temp_distribution.forEach(dist => {
    const suggestion = suggestions.find(s => s.range === dist.name)
    if (suggestion) {
      suggestion.days = dist.count
    }
  })

  // 只返回有天数的建议
  return suggestions.filter(s => s.days > 0)
})

// 温度趋势图配置
const tempTrendOption = computed(() => {
  if (!statistics.value) return {}

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>温度: ${data.value}°C`
      }
    },
    xAxis: {
      type: 'category',
      data: statistics.value.time_series.map(item => item.date),
      axisLabel: {
        rotate: 45,
        interval: Math.floor(statistics.value.time_series.length / 10) || 0
      }
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)',
      axisLabel: {
        formatter: '{value}°C'
      }
    },
    series: [
      {
        name: '温度',
        type: 'line',
        data: statistics.value.time_series.map(item => item.temperature),
        smooth: true,
        itemStyle: {
          color: '#F5A623'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 166, 35, 0.3)' },
              { offset: 1, color: 'rgba(245, 166, 35, 0.05)' }
            ]
          }
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  }
})

// 温度分布图配置
const tempDistributionOption = computed(() => {
  if (!statistics.value) return {}

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}天 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '温度分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{c}天'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: statistics.value.temp_distribution.map(item => ({
          name: item.name,
          value: item.count,
          itemStyle: {
            color: item.color
          }
        }))
      }
    ]
  }
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    loading.value = true
    statistics.value = await getWeatherStatistics()
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStatistics()
})
</script>
