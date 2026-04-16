<script setup lang="ts">
// 從 Vue 匯入響應式工具，用來處理狀態、計算值和監聽變化。
import { computed, ref, watch } from 'vue'
// 匯入實際負責渲染白板內容的子元件。
import CanvasBoard from './CanvasBoard.vue'
// 匯入一個會追蹤容器尺寸的 composable。
import { useViewportSize } from '@/composables/useViewportSize'
// 匯入縮放與數值限制相關的工具函式。
import { clamp, zoomAroundPoint } from '@/utils/workspaceMath'
// 匯入這個元件會用到的型別，讓 props / event 更清楚。
import type { CanvasPoint, Slide, SlideElement } from '@/types/canvas'

// 定義父層傳入的資料。
const props = defineProps<{
  // 目前要顯示的投影片資料。
  slide: Slide
  // 現在的縮放倍率。
  zoom: number
  // 畫布相對視窗的水平位移。
  panX: number
  // 畫布相對視窗的垂直位移。
  panY: number
  // 目前被選取的元素 id。
  selectedElementId: string | null
  // 目前滑鼠/指標在畫布上的座標。
  pointer: CanvasPoint | null
}>()

// 定義這個元件會往外送出的事件。
const emit = defineEmits<{
  // 更新平移位置。
  (event: 'update:pan', value: { x: number; y: number }): void
  // 更新縮放倍率。
  (event: 'update:zoom', value: number): void
  // 更新畫布座標中的 pointer 位置。
  (event: 'pointer-change', point: CanvasPoint | null): void
  // 更新目前選取的元素。
  (event: 'select-element', element: SlideElement | null): void
  // 回報舞台尺寸，供外部做 fit zoom 或排版計算。
  (event: 'stage-size', value: { width: number; height: number }): void
}>()

// 取得 stage DOM 節點的參考。
const stageRef = ref<HTMLElement | null>(null)
// 記錄目前是否正在拖曳空白區域。
const dragging = ref(false)
// 記錄拖曳開始時的狀態，方便計算 pan 的增量。
const dragState = ref<{
  // 拖曳起點的 clientX。
  startX: number
  // 拖曳起點的 clientY。
  startY: number
  // 拖曳起點的 panX。
  startPanX: number
  // 拖曳起點的 panY。
  startPanY: number
  // 目前使用的 pointer id，用來做 pointer capture。
  pointerId: number
} | null>(null)

// 監聽 stage 容器的寬高變化。
const { width: stageWidth, height: stageHeight } = useViewportSize(stageRef)

// 當 stage 寬高變動時，把尺寸往外通知父層。
watch(
  [stageWidth, stageHeight],
  () => {
    emit('stage-size', {
      width: stageWidth.value,
      height: stageHeight.value,
    })
  },
  { immediate: true },
)

// 將 zoom / pan 寫入 CSS 變數，讓 template 的樣式可以直接使用。
const stageStyle = computed(() => ({
  '--zoom': String(props.zoom),
  '--pan-x': `${props.panX}px`,
  '--pan-y': `${props.panY}px`,
}))

// 使用滑鼠左鍵按下空白處時，開始拖曳整個畫布。
function startPan(event: PointerEvent) {
  // 只接受左鍵，避免右鍵或其他按鍵觸發拖曳。
  if (event.button !== 0) {
    return
  }

  // 取出 stage DOM。
  const stageEl = stageRef.value

  // 只有點在 stage 本身空白處，才開始拖曳。
  if (!stageEl || event.target !== stageEl) {
    return
  }

  // 標記目前正在拖曳。
  dragging.value = true
  // 保存拖曳起點與當下 pan 值。
  dragState.value = {
    startX: event.clientX,
    startY: event.clientY,
    startPanX: props.panX,
    startPanY: props.panY,
    pointerId: event.pointerId,
  }

  // 鎖定這個 pointer，避免拖曳時游標移出元素就失去事件。
  stageEl.setPointerCapture(event.pointerId)
}

// 滑鼠/手指移動時，根據起點和當前位置更新 pan。
function movePan(event: PointerEvent) {
  // 如果沒有拖曳狀態，就忽略。
  if (!dragState.value) {
    return
  }

  // 用起點加上位移差，計算最新的 pan。
  emit('update:pan', {
    x: dragState.value.startPanX + (event.clientX - dragState.value.startX),
    y: dragState.value.startPanY + (event.clientY - dragState.value.startY),
  })
}

// 拖曳結束時，解除 pointer capture 並清空狀態。
function endPan() {
  // 沒有拖曳中的資料就不用處理。
  if (!dragState.value) {
    return
  }

  // 再取一次 stage DOM，準備釋放 pointer capture。
  const stageEl = stageRef.value

  // 如果目前元素還握有這個 pointer，就把它釋放掉。
  if (stageEl?.hasPointerCapture(dragState.value.pointerId)) {
    stageEl.releasePointerCapture(dragState.value.pointerId)
  }

  // 清掉拖曳狀態，並把 dragging 關掉。
  dragging.value = false
  dragState.value = null
}

// 處理滑鼠滾輪，讓使用者可以以游標位置為中心縮放畫布。
function handleWheel(event: WheelEvent) {
  // 取得 stage DOM，因為縮放要依照實際容器大小計算。
  const stageEl = stageRef.value

  // 如果節點不存在，就直接跳過。
  if (!stageEl) {
    return
  }

  // 滾輪向上放大，向下縮小。
  const delta = event.deltaY < 0 ? 1.08 : 0.92
  // 先把新縮放值限制在合理範圍內。
  const nextZoom = clamp(props.zoom * delta, 0.4, 2.4)
  // 讀取舞台目前的像素範圍。
  const stageRect = stageEl.getBoundingClientRect()
  // 把滑鼠位置轉成舞台內部座標，作為縮放錨點。
  const anchor = {
    x: event.clientX - stageRect.left,
    y: event.clientY - stageRect.top,
  }
  // 根據錨點、當前 pan 與新縮放值，計算縮放後應維持的 pan。
  const nextPan = zoomAroundPoint(
    { x: props.panX, y: props.panY },
    props.zoom,
    nextZoom,
    anchor,
    {
      width: stageRect.width,
      height: stageRect.height,
    },
  )

  // 把新的 pan 與 zoom 往外送，讓父層同步更新狀態。
  emit('update:pan', nextPan)
  emit('update:zoom', nextZoom)
}

// 收到 CanvasBoard 回報指標位置時，直接轉發給父層。
function handleCanvasPointerChange(point: CanvasPoint | null) {
  emit('pointer-change', point)
}

// 收到 CanvasBoard 回報選取元素時，直接轉發給父層。
function handleCanvasSelectElement(element: SlideElement | null) {
  emit('select-element', element)
}
</script>

<template>
  <!-- 最外層舞台，負責拖曳、縮放與承接整個畫布區域。 -->
  <section
    ref="stageRef"
    class="stage"
    :class="{ dragging }"
    :style="stageStyle"
    @pointerdown="startPan"
    @pointermove="movePan"
    @pointerup="endPan"
    @pointercancel="endPan"
    @wheel.prevent="handleWheel"
  >
    <!-- 左上角提示，告訴使用者如何操作舞台。 -->
    <div class="stage-hint">
      <!-- 提示可拖曳空白處平移。 -->
      <span>Drag empty space</span>
      <!-- 提示可使用滾輪縮放。 -->
      <span>Wheel to zoom</span>
    </div>

    <!-- 實際渲染投影片與元素的子元件。 -->
    <CanvasBoard
      :slide="slide"
      :zoom="zoom"
      :pan-x="panX"
      :pan-y="panY"
      :selected-element-id="selectedElementId"
      :pointer="pointer"
      @pointer-change="handleCanvasPointerChange"
      @select-element="handleCanvasSelectElement"
    />
  </section>
</template>

<style scoped>
/* 舞台外框本體，負責容器、背景與滑鼠樣式。 */
.stage {
  position: relative;
  min-height: 70vh;
  overflow: hidden;
  border-radius: 30px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.14), transparent 40%),
    linear-gradient(180deg, rgba(17, 24, 39, 0.96), rgba(11, 15, 26, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 28px 60px rgba(2, 6, 23, 0.24);
  cursor: grab;
  touch-action: none;
}

/* 拖曳中切換成 grabbing 游標。 */
.stage.dragging {
  cursor: grabbing;
}

/* 舞台上的網格與光暈背景疊層。 */
.stage::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.08), transparent 32%),
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: auto, 56px 56px, 56px 56px;
  pointer-events: none;
}

/* 左上角的操作提示區。 */
.stage-hint {
  position: absolute;
  left: 18px;
  top: 18px;
  z-index: 2;
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 提示標籤的外觀設定。 */
.stage-hint span {
  padding: 8px 12px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.86);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  font-size: 12px;
}

/* 螢幕較小時，降低舞台高度。 */
@media (max-width: 960px) {
  .stage {
    min-height: 60vh;
  }
}
</style>
