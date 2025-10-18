<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- 可爱的标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-600 mb-2">👗 搭搭</h1>
        <p class="text-gray-600">记录你的每日穿搭</p>
      </div>

      <!-- 登录卡片 -->
      <div class="bg-white rounded-cute shadow-cute-lg p-8">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">登录</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- 用户名输入 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              v-model="loginForm.username"
              type="text"
              required
              class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              placeholder="请输入用户名"
            />
          </div>

          <!-- 密码输入 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              v-model="loginForm.password"
              type="password"
              required
              class="w-full px-4 py-3 border-2 border-cute-pink/30 rounded-cute focus:outline-none focus:border-primary-400 transition-colors"
              placeholder="请输入密码"
            />
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="bg-red-50 border-2 border-red-200 rounded-cute p-3">
            <p class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 rounded-cute hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span v-if="!loading">登录 ✨</span>
            <span v-else>登录中...</span>
          </button>
        </form>

        <!-- 注册链接 -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            还没有账号？
            <router-link to="/register" class="text-primary-500 hover:text-primary-600 font-semibold">
              立即注册
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
import { login } from '@/api/auth'
import type { LoginRequest } from '@/types'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')

const loginForm = ref<LoginRequest>({
  username: '',
  password: '',
})

const handleLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const response = await login(loginForm.value)

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
    errorMessage.value = error.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>
