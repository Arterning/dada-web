import request from '@/utils/request'
import type { Clothing } from '@/types'

// 创建服装请求类型
export interface CreateClothingRequest {
  name: string
  category: string
  image_url?: string
  purchase_date?: string
  price?: number
  washing_method?: string
  status?: string
}

// 更新服装请求类型
export interface UpdateClothingRequest {
  name?: string
  category?: string
  image_url?: string
  purchase_date?: string
  price?: number
  washing_method?: string
  status?: string
}

// 获取所有服装
export const getClothes = () => {
  return request.get<any, Clothing[]>('/api/clothes')
}

// 获取单个服装
export const getClothing = (id: number) => {
  return request.get<any, Clothing>(`/api/clothes/${id}`)
}

// 创建服装
export const createClothing = (data: CreateClothingRequest) => {
  return request.post<any, Clothing>('/api/clothes', data)
}

// 更新服装
export const updateClothing = (id: number, data: UpdateClothingRequest) => {
  return request.put<any, { message: string }>(`/api/clothes/${id}`, data)
}

// 删除服装
export const deleteClothing = (id: number) => {
  return request.delete<any, { message: string }>(`/api/clothes/${id}`)
}

// 上传图片
export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<any, { url: string }>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
