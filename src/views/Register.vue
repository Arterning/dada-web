<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- 可爱的标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-600 mb-2">👗 搭搭</h1>
        <p class="text-gray-600">开始记录你的穿搭之旅</p>
      </div>

      <!-- 注册卡片 -->
      <div class="bg-white rounded-cute shadow-cute-lg p-8">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">注册</h2>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- 用户名输入 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              用户名 *
            </label>
            <input
              v-model="registerForm.username"
              type="text"
              required
              class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              placeholder="请输入用户名"
            />
          </div>

          <!-- 昵称输入 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              昵称
            </label>
            <input
              v-model="registerForm.nickname"
              type="text"
              class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              placeholder="请输入昵称（可选）"
            />
          </div>

          <!-- 密码输入 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              密码 *
            </label>
            <input
              v-model="registerForm.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              placeholder="请输入密码（至少6位）"
            />
          </div>

          <!-- 确认密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              确认密码 *
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              placeholder="请再次输入密码"
            />
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="bg-red-50 border-2 border-red-200 rounded-cute p-3">
            <p class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
          </div>

          <!-- 注册按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 rounded-cute hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span v-if="!loading">注册 🎉</span>
            <span v-else>注册中...</span>
          </button>
        </form>

        <!-- 登录链接 -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            已有账号？
            <router-link to="/login" class="text-primary-500 hover:text-primary-600 font-semibold">
              立即登录
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'
import type { RegisterRequest } from '@/types'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const confirmPassword = ref('')

const registerForm = ref<RegisterRequest>({
  username: '',
  password: '',
  nickname: '',
})

const handleRegister = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    // 验证密码一致性
    if (registerForm.value.password !== confirmPassword.value) {
      errorMessage.value = '两次输入的密码不一致'
      return
    }

    const response = await register(registerForm.value)

    // 保存 token 和用户信息
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify({
      id: response.user_id,
      username: response.username,
      nickname: response.nickname
    }))

    // 跳转到首页
    router.push('/daily-outfits')
  } catch (error: any) {
    errorMessage.value = error.message || '注册失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>
