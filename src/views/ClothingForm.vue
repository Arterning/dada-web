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
          {{ isEdit ? '编辑服装' : '添加服装' }}
        </h1>
        <div class="w-20"></div>
      </div>

      <!-- 表单卡片 -->
      <div class="bg-white rounded-cute shadow-cute-lg p-6 md:p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 图片上传 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              服装图片
            </label>
            <div class="flex flex-col items-center">
              <!-- 图片预览 -->
              <div class="w-full aspect-square max-w-sm bg-gradient-to-br from-primary-50 to-primary-100 rounded-cute overflow-hidden mb-4 flex items-center justify-center">
                <img
                  v-if="clothingForm.image_url"
                  :src="clothingForm.image_url"
                  alt="预览"
                  class="w-full h-full object-cover"
                />
                <div v-else class="text-6xl text-primary-300">
                  📷
                </div>
              </div>

              <!-- 上传按钮 -->
              <div class="flex gap-3 w-full">
                <label class="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageChange"
                    class="hidden"
                  />
                  <div class="w-full px-4 py-3 border-2 border-primary-300 text-primary-600 rounded-cute hover:bg-primary-50 transition-colors text-center font-semibold">
                    {{ uploading ? '上传中...' : '选择图片' }}
                  </div>
                </label>
                <button
                  v-if="clothingForm.image_url"
                  type="button"
                  @click="clothingForm.image_url = ''"
                  class="px-4 py-3 border-2 border-red-300 text-red-600 rounded-cute hover:bg-red-50 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 名称 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                名称 *
              </label>
              <input
                v-model="clothingForm.name"
                type="text"
                required
                class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
                placeholder="例如：白色T恤"
              />
            </div>

            <!-- 分类 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                分类 *
              </label>
              <select
                v-model="clothingForm.category"
                required
                class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              >
                <option value="">请选择</option>
                <option value="上装">👕 上装</option>
                <option value="下装">👖 下装</option>
                <option value="外套">🧥 外套</option>
                <option value="鞋子">👟 鞋子</option>
                <option value="配饰">👒 配饰</option>
                <option value="其他">👗 其他</option>
              </select>
            </div>
          </div>

          <!-- 购买信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 购买日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                购买日期
              </label>
              <input
                v-model="clothingForm.purchase_date"
                type="date"
                class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            <!-- 价格 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                价格（元）
              </label>
              <input
                v-model.number="clothingForm.price"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- 其他信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 洗涤方式 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                洗涤方式
              </label>
              <input
                v-model="clothingForm.washing_method"
                type="text"
                class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
                placeholder="例如：手洗、机洗"
              />
            </div>

            <!-- 状态 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                v-model="clothingForm.status"
                class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              >
                <option value="">请选择</option>
                <option value="全新">✨ 全新</option>
                <option value="良好">👍 良好</option>
                <option value="一般">👌 一般</option>
                <option value="需要修补">🔧 需要修补</option>
                <option value="待处理">📦 待处理</option>
              </select>
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
              :disabled="loading || uploading"
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
import { createClothing, updateClothing, getClothing, uploadImage } from '@/api/clothing'
import type { CreateClothingRequest } from '@/api/clothing'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const uploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isEdit = ref(false)

const clothingForm = ref<CreateClothingRequest>({
  name: '',
  category: '',
  image_url: '',
  purchase_date: '',
  price: undefined,
  washing_method: '',
  status: '良好',
})

// 如果是编辑模式，加载数据
onMounted(async () => {
  const id = route.params.id
  if (id) {
    isEdit.value = true
    try {
      const clothing = await getClothing(Number(id))
      clothingForm.value = {
        name: clothing.name,
        category: clothing.category,
        image_url: clothing.image_url || '',
        purchase_date: clothing.purchase_date || '',
        price: clothing.price || undefined,
        washing_method: clothing.washing_method || '',
        status: clothing.status || '良好',
      }
    } catch (error: any) {
      errorMessage.value = '加载服装信息失败'
    }
  }
})

// 处理图片上传
const handleImageChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    errorMessage.value = '请选择图片文件'
    return
  }

  // 检查文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = '图片大小不能超过5MB'
    return
  }

  try {
    uploading.value = true
    errorMessage.value = ''

    const response = await uploadImage(file)
    clothingForm.value.image_url = response.url
  } catch (error: any) {
    errorMessage.value = error.message || '图片上传失败'
  } finally {
    uploading.value = false
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    if (isEdit.value && route.params.id) {
      await updateClothing(Number(route.params.id), clothingForm.value)
      successMessage.value = '更新成功！'
    } else {
      await createClothing(clothingForm.value)
      successMessage.value = '保存成功！'
    }

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      router.push('/clothes')
    }, 1000)
  } catch (error: any) {
    errorMessage.value = error.message || '保存失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>
