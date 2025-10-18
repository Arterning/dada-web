import request from '@/utils/request'
import type { Weather, WeatherStatistics } from '@/types'

// 获取当前天气
export const getCurrentWeather = () => {
  return request.get<any, Weather>('/api/weather/current')
}

// 刷新天气数据
export const refreshWeather = () => {
  return request.post<any, { message: string }>('/api/weather/refresh')
}

// 获取历史天气统计
export const getWeatherStatistics = () => {
  return request.get<any, WeatherStatistics>('/api/weather/statistics')
}
