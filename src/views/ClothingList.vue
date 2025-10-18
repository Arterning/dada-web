<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- 头部 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">👔 我的衣橱</h1>
          <p class="text-gray-600">管理你的所有服装</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="router.push('/daily-outfits')"
            class="px-6 py-3 border-2 border-primary-300 text-primary-600 rounded-cute hover:bg-primary-50 transition-all"
          >
            📅 穿搭日记
          </button>
          <button
            @click="router.push('/clothes/new')"
            class="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-cute hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-cute"
          >
            ➕ 添加服装
          </button>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="bg-white rounded-cute shadow-cute p-4 mb-6">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="selectedCategory = cat.value"
            :class="[
              'px-4 py-2 rounded-cute transition-all',
              selectedCategory === cat.value
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-cute'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ cat.emoji }} {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        <p class="text-gray-500 mt-4">加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredClothes.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">👗</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          {{ selectedCategory === 'all' ? '还没有服装' : '该分类下没有服装' }}
        </h3>
        <p class="text-gray-500 mb-6">开始添加你的第一件服装吧！</p>
        <button
          @click="router.push('/clothes/new')"
          class="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-cute hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105"
        >
          ➕ 添加服装
        </button>
      </div>

      <!-- 服装网格 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="clothing in filteredClothes"
          :key="clothing.id"
          class="bg-white rounded-cute shadow-cute hover:shadow-cute-lg transition-all transform hover:-translate-y-1 overflow-hidden"
        >
          <!-- 图片 -->
          <div class="relative aspect-square bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
            <img
              v-if="clothing.image_url"
              :src="clothing.image_url"
              :alt="clothing.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-6xl">
              {{ getCategoryEmoji(clothing.category) }}
            </div>
            <!-- 分类标签 -->
            <div class="absolute top-2 left-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-primary-600">
              {{ clothing.category }}
            </div>
          </div>

          <!-- 信息 -->
          <div class="p-4">
            <h3 class="text-lg font-bold text-gray-800 mb-2 truncate">{{ clothing.name }}</h3>

            <div class="space-y-1 text-sm text-gray-600 mb-4">
              <p v-if="clothing.price" class="flex items-center gap-2">
                <span>💰</span>
                <span>¥{{ clothing.price }}</span>
              </p>
              <p class="flex items-center gap-2">
                <span>👕</span>
                <span>穿过 {{ clothing.wear_count }} 次</span>
              </p>
              <p v-if="clothing.status" class="flex items-center gap-2">
                <span>✨</span>
                <span>{{ clothing.status }}</span>
              </p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <button
                @click="router.push(`/clothes/edit/${clothing.id}`)"
                class="flex-1 px-4 py-2 border-2 border-primary-300 text-primary-600 rounded-cute hover:bg-primary-50 transition-colors text-sm font-semibold"
              >
                编辑
              </button>
              <button
                @click="handleDelete(clothing.id)"
                class="px-4 py-2 border-2 border-red-300 text-red-600 rounded-cute hover:bg-red-50 transition-colors text-sm font-semibold"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getClothes, deleteClothing } from '@/api/clothing'
import type { Clothing } from '@/types'

const router = useRouter()
const loading = ref(false)
const clothes = ref<Clothing[]>([])
const selectedCategory = ref('all')

const categories = [
  { label: '全部', value: 'all', emoji: '👔' },
  { label: '上装', value: '上装', emoji: '👕' },
  { label: '下装', value: '下装', emoji: '👖' },
  { label: '外套', value: '外套', emoji: '🧥' },
  { label: '鞋子', value: '鞋子', emoji: '👟' },
  { label: '配饰', value: '配饰', emoji: '👒' },
  { label: '其他', value: '其他', emoji: '👗' },
]

// 根据分类过滤服装
const filteredClothes = computed(() => {
  if (selectedCategory.value === 'all') {
    return clothes.value
  }
  return clothes.value.filter(c => c.category === selectedCategory.value)
})

// 获取分类对应的 emoji
const getCategoryEmoji = (category: string) => {
  const cat = categories.find(c => c.value === category)
  return cat ? cat.emoji : '👗'
}

// 加载服装列表
const loadClothes = async () => {
  try {
    loading.value = true
    clothes.value = await getClothes()
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

// 删除服装
const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这件服装吗？')) {
    return
  }

  try {
    await deleteClothing(id)
    clothes.value = clothes.value.filter(c => c.id !== id)
  } catch (error) {
    alert('删除失败，请稍后再试')
  }
}

onMounted(() => {
  loadClothes()
})
</script>
