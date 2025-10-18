import request from '@/utils/request'
import type { Weather } from '@/types'

// 获取当前天气
export const getCurrentWeather = () => {
  return request.get<any, Weather>('/api/weather/current')
}

// 刷新天气数据
export const refreshWeather = () => {
  return request.post<any, { message: string }>('/api/weather/refresh')
}
