import request from '../utils/request'
import type {
  Outfit,
  CreateOutfitRequest,
  UpdateOutfitRequest,
  AddClothingToOutfitRequest
} from '../types'

// 获取所有穿搭
export const getOutfits = () => {
  return request.get<any, Outfit[]>('/api/outfits')
}

// 获取单个穿搭
export const getOutfit = (id: number) => {
  return request.get<any, Outfit>(`/api/outfits/${id}`)
}

// 创建新穿搭
export const createOutfit = (data: CreateOutfitRequest) => {
  return request.post<any, Outfit>('/api/outfits', data)
}

// 更新穿搭
export const updateOutfit = (id: number, data: UpdateOutfitRequest) => {
  return request.put<any, Outfit>(`/api/outfits/${id}`, data)
}

// 删除穿搭
export const deleteOutfit = (id: number) => {
  return request.delete(`/api/outfits/${id}`)
}

// 向穿搭中添加服装
export const addClothingToOutfit = (outfitId: number, data: AddClothingToOutfitRequest) => {
  return request.post(`/api/outfits/${outfitId}/clothes`, data)
}

// 从穿搭中移除服装
export const removeClothingFromOutfit = (outfitId: number, clothingId: number) => {
  return request.delete(`/api/outfits/${outfitId}/clothes/${clothingId}`)
}
