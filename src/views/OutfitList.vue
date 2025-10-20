<template>
  <MainLayout>
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <!-- 头部 -->
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              我的搭配 ✨
            </h1>
            <p class="text-gray-600 mt-2">创建和管理你的服装搭配方案</p>
          </div>
          <button
            @click="router.push('/outfits/new')"
            class="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-cute hover:shadow-cute-lg transition-all duration-300 font-medium"
          >
            ➕ 创建新搭配
          </button>
        </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>

      <!-- 搭配列表 -->
      <div v-else-if="outfits.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="outfit in outfits"
          :key="outfit.id"
          class="bg-white rounded-cute shadow-cute hover:shadow-cute-lg transition-all duration-300 overflow-hidden group"
        >
          <!-- 预览图 -->
          <div class="relative aspect-[3/4] bg-gradient-to-br from-cute-pink/10 to-cute-lavender/10 overflow-hidden">
            <div v-if="outfit.image_url" class="w-full h-full">
              <img
                :src="outfit.image_url"
                :alt="outfit.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div v-else class="w-full h-full flex items-center justify-center relative">
              <!-- 显示搭配中的服装 -->
              <div
                v-for="item in outfit.clothes.slice(0, 4)"
                :key="item.clothing_id"
                class="absolute"
                :style="{
                  left: (item.x / 6) + '%',
                  top: (item.y / 8) + '%',
                  transform: `translate(-50%, -50%) rotate(${item.angle}deg) scale(${item.scale * 0.8})`
                }"
              >
                <img
                  v-if="item.image_url"
                  :src="item.image_url"
                  :alt="item.name"
                  class="max-w-[80px] max-h-[80px] drop-shadow-md"
                />
              </div>
              <div v-if="outfit.clothes.length === 0" class="text-gray-300 text-4xl">
                👗
              </div>
            </div>

            <!-- 悬停操作按钮 -->
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <router-link
                :to="`/outfits/edit/${outfit.id}`"
                class="px-4 py-2 bg-white text-primary-600 rounded-full hover:bg-primary-50 transition-colors"
              >
                ✏️ 编辑
              </router-link>
              <button
                @click="handleDelete(outfit.id)"
                class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                🗑️ 删除
              </button>
            </div>
          </div>

          <!-- 搭配信息 -->
          <div class="p-4">
            <h3 class="font-semibold text-lg text-gray-800 mb-2">{{ outfit.name }}</h3>
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>{{ outfit.clothes.length }} 件服装</span>
              <span>{{ formatDate(outfit.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">👗</div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">还没有搭配</h3>
        <p class="text-gray-500 mb-6">开始创建你的第一个服装搭配吧！</p>
        <router-link
          to="/outfits/new"
          class="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full hover:shadow-cute-lg transition-all duration-300"
        >
          创建第一个搭配
        </router-link>
      </div>
    </div>
  </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOutfits, deleteOutfit } from '../api/outfit'
import type { Outfit } from '../types'
import MainLayout from '../components/MainLayout.vue'

const router = useRouter()
const outfits = ref<Outfit[]>([])
const loading = ref(true)

// 加载搭配列表
const loadOutfits = async () => {
  try {
    loading.value = true
    outfits.value = await getOutfits()
  } catch (error) {
    console.error('加载搭配列表失败:', error)
    alert('加载搭配列表失败')
  } finally {
    loading.value = false
  }
}

// 删除搭配
const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这个搭配吗?')) {
    return
  }

  try {
    await deleteOutfit(id)
    outfits.value = outfits.value.filter(o => o.id !== id)
  } catch (error) {
    console.error('删除搭配失败:', error)
    alert('删除搭配失败')
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadOutfits()
})
</script>
