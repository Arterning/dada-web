<template>
  <div class="outfit-canvas-container">
    <!-- 画布 -->
    <div
      ref="canvasRef"
      class="canvas-area bg-white rounded-cute shadow-cute relative overflow-hidden"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      @mousedown="handleCanvasMouseDown"
      @mousemove="handleCanvasMouseMove"
      @mouseup="handleCanvasMouseUp"
      @mouseleave="handleCanvasMouseUp"
    >
      <!-- 网格背景 -->
      <div class="absolute inset-0 opacity-10"
        style="background-image: linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px); background-size: 20px 20px;">
      </div>

      <!-- 服装项 -->
      <div
        v-for="item in clothingItems"
        :key="item.clothing_id"
        :class="['clothing-item', { 'selected': selectedItem?.clothing_id === item.clothing_id }]"
        :style="{
          left: item.x + 'px',
          top: item.y + 'px',
          transform: `translate(-50%, -50%) rotate(${item.angle}deg) scale(${item.scale})`
        }"
        @mousedown.stop="handleItemMouseDown($event, item)"
      >
        <img
          :src="item.image_url"
          :alt="item.name"
          class="clothing-image"
          draggable="false"
        />

        <!-- 选中时的控制点 -->
        <template v-if="selectedItem?.clothing_id === item.clothing_id">
          <!-- 旋转控制点 -->
          <div
            class="control-point rotate-handle"
            @mousedown.stop="handleRotateStart($event, item)"
          >
            ↻
          </div>

          <!-- 缩放控制点 -->
          <div
            class="control-point scale-handle"
            @mousedown.stop="handleScaleStart($event, item)"
          >
            ⤡
          </div>

          <!-- 删除按钮 -->
          <button
            class="control-point delete-button"
            @click.stop="removeItem(item)"
          >
            ×
          </button>
        </template>
      </div>

      <!-- 空状态提示 -->
      <div v-if="clothingItems.length === 0" class="absolute inset-0 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <p class="text-lg mb-2">👗</p>
          <p>从左侧衣橱选择服装添加到画布</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OutfitClothingItem } from '../types'

// Props
interface Props {
  modelValue: OutfitClothingItem[]
  canvasWidth?: number
  canvasHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  canvasWidth: 600,
  canvasHeight: 800
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [items: OutfitClothingItem[]]
}>()

// Refs
const canvasRef = ref<HTMLElement | null>(null)
const selectedItem = ref<OutfitClothingItem | null>(null)

// 计算属性
const clothingItems = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 拖拽状态
const dragState = ref<{
  isDragging: boolean
  startX: number
  startY: number
  itemStartX: number
  itemStartY: number
} | null>(null)

// 旋转状态
const rotateState = ref<{
  isRotating: boolean
  startAngle: number
  itemStartAngle: number
  centerX: number
  centerY: number
} | null>(null)

// 缩放状态
const scaleState = ref<{
  isScaling: boolean
  startDistance: number
  itemStartScale: number
  centerX: number
  centerY: number
} | null>(null)

// 添加服装到画布
const addClothing = (clothing: { id: number; name: string; image_url: string; category: string }) => {
  const newItem: OutfitClothingItem = {
    clothing_id: clothing.id,
    name: clothing.name,
    image_url: clothing.image_url,
    category: clothing.category,
    x: props.canvasWidth / 2,
    y: props.canvasHeight / 2,
    angle: 0,
    scale: 1
  }

  clothingItems.value = [...clothingItems.value, newItem]
  selectedItem.value = newItem
}

// 移除服装
const removeItem = (item: OutfitClothingItem) => {
  clothingItems.value = clothingItems.value.filter(i => i.clothing_id !== item.clothing_id)
  if (selectedItem.value?.clothing_id === item.clothing_id) {
    selectedItem.value = null
  }
}

// 画布点击事件（取消选择）
const handleCanvasMouseDown = (e: MouseEvent) => {
  if (e.target === canvasRef.value || (e.target as HTMLElement).classList.contains('canvas-area')) {
    selectedItem.value = null
  }
}

// 服装项鼠标按下（开始拖拽）
const handleItemMouseDown = (e: MouseEvent, item: OutfitClothingItem) => {
  selectedItem.value = item

  dragState.value = {
    isDragging: true,
    startX: e.clientX,
    startY: e.clientY,
    itemStartX: item.x,
    itemStartY: item.y
  }
}

// 画布鼠标移动
const handleCanvasMouseMove = (e: MouseEvent) => {
  // 拖拽
  if (dragState.value?.isDragging && selectedItem.value) {
    const dx = e.clientX - dragState.value.startX
    const dy = e.clientY - dragState.value.startY

    const newX = dragState.value.itemStartX + dx
    const newY = dragState.value.itemStartY + dy

    updateItemPosition(selectedItem.value, newX, newY)
  }

  // 旋转
  if (rotateState.value?.isRotating && selectedItem.value) {
    const dx = e.clientX - rotateState.value.centerX
    const dy = e.clientY - rotateState.value.centerY
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const deltaAngle = angle - rotateState.value.startAngle

    updateItemAngle(selectedItem.value, rotateState.value.itemStartAngle + deltaAngle)
  }

  // 缩放
  if (scaleState.value?.isScaling && selectedItem.value) {
    const dx = e.clientX - scaleState.value.centerX
    const dy = e.clientY - scaleState.value.centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const scaleRatio = distance / scaleState.value.startDistance
    const newScale = Math.max(0.1, Math.min(3, scaleState.value.itemStartScale * scaleRatio))

    updateItemScale(selectedItem.value, newScale)
  }
}

// 画布鼠标松开
const handleCanvasMouseUp = () => {
  dragState.value = null
  rotateState.value = null
  scaleState.value = null
}

// 开始旋转
const handleRotateStart = (e: MouseEvent, item: OutfitClothingItem) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return

  const centerX = rect.left + item.x
  const centerY = rect.top + item.y

  const dx = e.clientX - centerX
  const dy = e.clientY - centerY
  const startAngle = Math.atan2(dy, dx) * 180 / Math.PI

  rotateState.value = {
    isRotating: true,
    startAngle,
    itemStartAngle: item.angle,
    centerX,
    centerY
  }
}

// 开始缩放
const handleScaleStart = (e: MouseEvent, item: OutfitClothingItem) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return

  const centerX = rect.left + item.x
  const centerY = rect.top + item.y

  const dx = e.clientX - centerX
  const dy = e.clientY - centerY
  const startDistance = Math.sqrt(dx * dx + dy * dy)

  scaleState.value = {
    isScaling: true,
    startDistance,
    itemStartScale: item.scale,
    centerX,
    centerY
  }
}

// 更新服装位置
const updateItemPosition = (item: OutfitClothingItem, x: number, y: number) => {
  clothingItems.value = clothingItems.value.map(i =>
    i.clothing_id === item.clothing_id
      ? { ...i, x, y }
      : i
  )
  if (selectedItem.value?.clothing_id === item.clothing_id) {
    selectedItem.value = { ...selectedItem.value, x, y }
  }
}

// 更新服装角度
const updateItemAngle = (item: OutfitClothingItem, angle: number) => {
  clothingItems.value = clothingItems.value.map(i =>
    i.clothing_id === item.clothing_id
      ? { ...i, angle }
      : i
  )
  if (selectedItem.value?.clothing_id === item.clothing_id) {
    selectedItem.value = { ...selectedItem.value, angle }
  }
}

// 更新服装缩放
const updateItemScale = (item: OutfitClothingItem, scale: number) => {
  clothingItems.value = clothingItems.value.map(i =>
    i.clothing_id === item.clothing_id
      ? { ...i, scale }
      : i
  )
  if (selectedItem.value?.clothing_id === item.clothing_id) {
    selectedItem.value = { ...selectedItem.value, scale }
  }
}

// 暴露方法给父组件
defineExpose({
  addClothing
})
</script>

<style scoped>
.outfit-canvas-container {
  position: relative;
}

.canvas-area {
  cursor: crosshair;
  user-select: none;
}

.clothing-item {
  position: absolute;
  cursor: move;
  transition: box-shadow 0.2s;
}

.clothing-item.selected {
  z-index: 1000;
}

.clothing-image {
  max-width: 150px;
  max-height: 150px;
  pointer-events: none;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

.clothing-item.selected .clothing-image {
  filter: drop-shadow(0 4px 12px rgba(255, 182, 193, 0.5));
}

.control-point {
  position: absolute;
  width: 28px;
  height: 28px;
  background: white;
  border: 2px solid #FFB6C1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: #FFB6C1;
  transition: all 0.2s;
  z-index: 10;
}

.control-point:hover {
  background: #FFB6C1;
  color: white;
  transform: scale(1.1);
}

.rotate-handle {
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  cursor: grab;
}

.rotate-handle:active {
  cursor: grabbing;
}

.scale-handle {
  bottom: -40px;
  right: -40px;
  cursor: nwse-resize;
}

.delete-button {
  top: -40px;
  right: -40px;
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
  font-size: 20px;
  line-height: 1;
}

.delete-button:hover {
  background: #ff5252;
  border-color: #ff5252;
}
</style>
