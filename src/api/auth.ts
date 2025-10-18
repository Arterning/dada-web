import request from '@/utils/request'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types'

// 登录
export const login = (data: LoginRequest) => {
  return request.post<any, LoginResponse>('/api/login', data)
}

// 注册
export const register = (data: RegisterRequest) => {
  return request.post<any, LoginResponse>('/api/register', data)
}

// 登出
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
