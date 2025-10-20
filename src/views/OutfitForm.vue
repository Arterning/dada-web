<template>
  <div class="min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 头部 -->
      <div class="mb-6">
        <div class="flex items-center gap-4 mb-4">
          <button
            @click="router.back()"
            class="px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            ← 返回
          </button>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
            {{ isEditMode ? '编辑搭配' : '创建搭配' }} 🎨
          </h1>
        </div>

        <!-- 搭配名称 -->
        <div class="max-w-md">
          <input
            v-model="outfitName"
            type="text"
            placeholder="给你的搭配起个名字..."
            class="w-full px-4 py-3 border-2 border-primary-200 rounded-full focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <!-- 主要内容区 -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 衣橱侧边栏 -->
        <div class="lg:col-span-1 bg-white rounded-cute shadow-cute p-4 max-h-[900px] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-800">我的衣橱 👔</h2>
            <button
              @click="loadClothes"
              class="text-sm text-primary-600 hover:text-primary-700"
              title="刷新"
            >
              🔄
            </button>
          </div>

          <!-- 分类筛选 -->
          <div class="mb-4">
            <select
              v-model="selectedCategory"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
            >
              <option value="">全部分类</option>
              <option value="上装">👕 上装</option>
              <option value="下装">👖 下装</option>
              <option value="外套">🧥 外套</option>
              <option value="鞋子">👟 鞋子</option>
              <option value="配饰">👜 配饰</option>
              <option value="其他">📦 其他</option>
            </select>
          </div>

          <!-- 服装列表 -->
          <div v-if="loadingClothes" class="text-center py-8 text-gray-400">
            加载中...
          </div>
          <div v-else-if="filteredClothes.length === 0" class="text-center py-8 text-gray-400">
            <p class="mb-2">没有服装</p>
            <router-link to="/clothes/new" class="text-primary-600 text-sm hover:underline">
              去添加
            </router-link>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="clothing in filteredClothes"
              :key="clothing.id"
              class="group cursor-pointer border-2 border-transparent hover:border-primary-300 rounded-lg p-2 transition-all"
              @click="addClothingToCanvas(clothing)"
            >
              <div class="flex items-center gap-3">
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    v-if="clothing.image_url"
                    :src="clothing.image_url"
                    :alt="clothing.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-2xl">
                    {{ getCategoryEmoji(clothing.category) }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-sm text-gray-800 truncate">{{ clothing.name }}</h3>
                  <p class="text-xs text-gray-500">{{ clothing.category }}</p>
                </div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity text-primary-600">
                  ➕
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 画布区域 -->
        <div class="lg:col-span-3">
          <div class="bg-gradient-to-br from-cute-pink/5 to-cute-lavender/5 rounded-cute shadow-cute p-6">
            <!-- 工具栏 -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">
                  {{ clothingItems.length }} 件服装
                </span>
                <button
                  v-if="clothingItems.length > 0"
                  @click="clearCanvas"
                  class="text-sm text-red-500 hover:text-red-600 ml-4"
                >
                  🗑️ 清空画布
                </button>
              </div>

              <!-- 保存按钮 -->
              <button
                @click="handleSave"
                :disabled="saving || !outfitName"
                class="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full hover:shadow-cute-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ saving ? '保存中...' : '💾 保存搭配' }}
              </button>
            </div>

            <!-- 画布提示 -->
            <div class="mb-4 p-3 bg-white/80 rounded-lg text-sm text-gray-600">
              <p class="mb-1"><strong>操作提示:</strong></p>
              <ul class="list-disc list-inside space-y-1 text-xs">
                <li>点击左侧衣橱中的服装添加到画布</li>
                <li>拖拽服装可以移动位置</li>
                <li>使用顶部的旋转按钮(↻)旋转服装</li>
                <li>使用右下角的缩放按钮(⤡)调整大小</li>
                <li>点击右上角的×按钮删除服装</li>
              </ul>
            </div>

            <!-- 画布组件 -->
            <div class="flex justify-center">
              <OutfitCanvas
                ref="canvasRef"
                v-model="clothingItems"
                :canvas-width="600"
                :canvas-height="800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getClothes } from '../api/clothing'
import { getOutfit, createOutfit, updateOutfit } from '../api/outfit'
import OutfitCanvas from '../components/OutfitCanvas.vue'
import type { Clothing, OutfitClothingItem } from '../types'

const router = useRouter()
const route = useRoute()

// 状态
const outfitName = ref('')
const clothingItems = ref<OutfitClothingItem[]>([])
const allClothes = ref<Clothing[]>([])
const selectedCategory = ref('')
const loadingClothes = ref(false)
const saving = ref(false)
const canvasRef = ref<InstanceType<typeof OutfitCanvas> | null>(null)

// 判断是否为编辑模式
const isEditMode = computed(() => !!route.params.id)
const outfitId = computed(() => parseInt(route.params.id as string))

// 过滤后的服装列表
const filteredClothes = computed(() => {
  if (!selectedCategory.value) {
    return allClothes.value
  }
  return allClothes.value.filter(c => c.category === selectedCategory.value)
})

// 加载服装列表
const loadClothes = async () => {
  try {
    loadingClothes.value = true
    allClothes.value = await getClothes()
  } catch (error) {
    console.error('加载服装列表失败:', error)
    alert('加载服装列表失败')
  } finally {
    loadingClothes.value = false
  }
}

// 加载搭配数据(编辑模式)
const loadOutfit = async () => {
  if (!isEditMode.value) return

  try {
    const outfit = await getOutfit(outfitId.value)
    outfitName.value = outfit.name
    clothingItems.value = outfit.clothes
  } catch (error) {
    console.error('加载搭配失败:', error)
    alert('加载搭配失败')
    router.push('/outfits')
  }
}

// 添加服装到画布
const addClothingToCanvas = (clothing: Clothing) => {
  // 检查是否已经添加
  const exists = clothingItems.value.some(item => item.clothing_id === clothing.id)
  if (exists) {
    alert('该服装已在画布中')
    return
  }

  if (canvasRef.value && clothing.image_url) {
    canvasRef.value.addClothing({
      id: clothing.id,
      name: clothing.name,
      image_url: clothing.image_url,
      category: clothing.category
    })
  }
}

// 清空画布
const clearCanvas = () => {
  if (confirm('确定要清空画布吗?')) {
    clothingItems.value = []
  }
}

// 保存搭配
const handleSave = async () => {
  if (!outfitName.value.trim()) {
    alert('请输入搭配名称')
    return
  }

  try {
    saving.value = true

    const data = {
      name: outfitName.value.trim(),
      clothes: clothingItems.value
    }

    if (isEditMode.value) {
      await updateOutfit(outfitId.value, data)
      alert('搭配更新成功!')
    } else {
      await createOutfit(data)
      alert('搭配创建成功!')
    }

    router.push('/outfits')
  } catch (error) {
    console.error('保存搭配失败:', error)
    alert('保存搭配失败')
  } finally {
    saving.value = false
  }
}

// 获取分类emoji
const getCategoryEmoji = (category: string) => {
  const emojiMap: Record<string, string> = {
    '上装': '👕',
    '下装': '👖',
    '外套': '🧥',
    '鞋子': '👟',
    '配饰': '👜',
    '其他': '📦'
  }
  return emojiMap[category] || '👔'
}

onMounted(async () => {
  await loadClothes()
  if (isEditMode.value) {
    await loadOutfit()
  }
})
</script>
