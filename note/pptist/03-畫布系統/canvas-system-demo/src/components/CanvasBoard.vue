<script setup lang="ts">
// board 保持投影片的邏輯尺寸。
// pan 和 zoom 只會改變這張邏輯畫布在螢幕上的呈現方式。
import { computed, ref } from 'vue'
import CanvasElement from './CanvasElement.vue'
import { clientToCanvasPoint } from '@/utils/workspaceMath'
import { roundCanvasPoint } from '@/utils/slideFactory'
import type { CanvasPoint, Slide, SlideElement } from '@/types/canvas'

const props = defineProps<{
  slide: Slide
  zoom: number
  panX: number
  panY: number
  selectedElementId: string | null
  pointer: CanvasPoint | null
}>()

const emit = defineEmits<{
  (event: 'pointer-change', point: CanvasPoint | null): void
  (event: 'select-element', element: SlideElement | null): void
}>()

// boardRef 指向邏輯畫布本體。
const boardRef = ref<HTMLElement | null>(null)

// 這些數值來自 slide 的邏輯尺寸，顯示時再疊上 pan / zoom。
const boardStyle = computed(() => ({
  width: `${props.slide.width}px`,
  height: `${props.slide.height}px`,
  transform: `translate3d(calc(-50% + ${props.panX}px), calc(-50% + ${props.panY}px), 0) scale(${props.zoom})`,
}))

// 把滑鼠座標從螢幕空間轉回邏輯畫布空間。
function toCanvasPoint(event: PointerEvent) {
  const board = boardRef.value

  if (!board) {
    return null
  }

  return roundCanvasPoint(clientToCanvasPoint(event.clientX, event.clientY, board.getBoundingClientRect(), props.zoom))
}

// 點到空白區時，更新 pointer，並清除選取。
function handleBoardPointerDown(event: PointerEvent) {
  const point = toCanvasPoint(event)

  if (!point) {
    return
  }

  emit('pointer-change', point)
  emit('select-element', null)
}

// 點到元素時，更新 pointer，並把元素選起來。
function handleElementPointerDown(event: PointerEvent, element: SlideElement) {
  const point = toCanvasPoint(event)

  if (point) {
    emit('pointer-change', point)
  }

  emit('select-element', element)
}

function isSelected(id: string) {
  return props.selectedElementId === id
}
</script>

<template>
  <div
    ref="boardRef"
    class="board"
    :style="boardStyle"
    @pointerdown="handleBoardPointerDown"
  >
    <div class="grid"></div>

    <div class="surface" :style="{ background: slide.background }">
      <CanvasElement
        v-for="element in slide.elements"
        :key="element.id"
        :element="element"
        :selected="isSelected(element.id)"
        @pointerdown.stop="handleElementPointerDown($event, element)"
      />

      <div
        v-if="pointer"
        class="pointer-dot"
        :style="{ left: `${pointer.x}px`, top: `${pointer.y}px` }"
      />
    </div>
  </div>
</template>

<style scoped>
/* board 本身。 */
.board {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 22px;
  transform-origin: center center;
  box-shadow:
    0 24px 44px rgba(2, 6, 23, 0.26),
    inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  user-select: none;
}

.grid {
  position: absolute;
  inset: -220px;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  border-radius: 24px;
}

.surface {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 22px;
}

.pointer-dot {
  position: absolute;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border-radius: 999px;
  border: 2px solid #3447e6;
  background: rgba(52, 71, 230, 0.16);
  pointer-events: none;
  box-shadow: 0 0 0 6px rgba(52, 71, 230, 0.08);
}
</style>
