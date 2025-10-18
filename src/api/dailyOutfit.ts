import request from '@/utils/request'
import type { DailyOutfit, CreateDailyOutfitRequest, UpdateDailyOutfitRequest } from '@/types'

// 获取每日穿搭列表
export const getDailyOutfits = (params?: { start_date?: string; end_date?: string }) => {
  return request.get<any, DailyOutfit[]>('/api/daily-outfits', { params })
}

// 获取单个每日穿搭
export const getDailyOutfit = (id: number) => {
  return request.get<any, DailyOutfit>(`/api/daily-outfits/${id}`)
}

// 创建每日穿搭
export const createDailyOutfit = (data: CreateDailyOutfitRequest) => {
  return request.post<any, DailyOutfit>('/api/daily-outfits', data)
}

// 更新每日穿搭
export const updateDailyOutfit = (id: number, data: UpdateDailyOutfitRequest) => {
  return request.put<any, DailyOutfit>(`/api/daily-outfits/${id}`, data)
}

// 删除每日穿搭
export const deleteDailyOutfit = (id: number) => {
  return request.delete(`/api/daily-outfits/${id}`)
}
