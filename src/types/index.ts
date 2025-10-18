// 用户类型
export interface User {
  id: number
  username: string
  nickname?: string
  created_at: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user_id: number
  username: string
  nickname?: string
}

// 注册请求
export interface RegisterRequest {
  username: string
  password: string
  nickname?: string
}

// 服装类型
export interface Clothing {
  id: number
  name: string
  image_url?: string
  category: string
  purchase_date?: string
  price?: number
  wear_count: number
  washing_method?: string
  status?: string
  created_at: string
  updated_at: string
}

// 每日穿搭类型
export interface DailyOutfit {
  id: number
  date: string
  todays_clothes?: string
  temperature?: string
  weather?: string
  clothing_ids: number[]
  clothes?: Clothing[]
  created_at: string
  updated_at: string
}

// 创建每日穿搭请求
export interface CreateDailyOutfitRequest {
  date: string
  todays_clothes?: string
  temperature?: string
  weather?: string
  clothing_ids?: number[]
}

// 更新每日穿搭请求
export interface UpdateDailyOutfitRequest {
  date?: string
  todays_clothes?: string
  temperature?: string
  weather?: string
  clothing_ids?: number[]
}

// 天气数据类型
export interface Weather {
  id: number
  city: string
  temperature: number
  weather: string
  future_weather: string
  wind_direction: string
  wind_speed: number
  sunrise: string
  sunset: string
  created_at: string
  updated_at: string
}

// 天气统计数据类型
export interface WeatherStatistics {
  time_series: {
    date: string
    temperature: number
    weather: string
  }[]
  temp_distribution: {
    name: string
    count: number
    color: string
  }[]
  total_days: number
}
