<script setup lang="ts">
// App 是最上層協調者：
// 它負責持有共用狀態，並把資料往下傳給子元件。
import { computed, nextTick, reactive, ref } from 'vue'
import CanvasDebugPanel from './components/CanvasDebugPanel.vue'
import WorkspaceStage from './components/WorkspaceStage.vue'
import WorkspaceToolbar from './components/WorkspaceToolbar.vue'
import { canvasPresets, createDemoSlide } from './utils/slideFactory'
import { calculateFitZoom, clamp, type PanPoint, type StageSize } from './utils/workspaceMath'
import type { CanvasPoint, CanvasPreset, SlideElement } from './types/canvas'

// 這個縮放範圍用來避免畫面太小或太大，讓 demo 保持可操作。
const MIN_ZOOM = 0.4
const MAX_ZOOM = 2.4
const ZOOM_STEP = 1.12

// 目前選到的 preset 會決定邏輯畫布的大小。
const selectedPresetId = ref(canvasPresets[0]!.id)
// zoom 代表鏡頭縮放，不是投影片本身變大。
const zoom = ref(0.9)
// pan 代表鏡頭偏移量，以螢幕座標來看。
const pan = reactive<PanPoint>({ x: 0, y: 0 })
// stageSize 是螢幕上實際可見的 frame 尺寸。
const stageSize = reactive<StageSize>({ width: 0, height: 0 })
// 用 id 記錄選取狀態，避免 slide 重新計算後參照失效。
const selectedElementId = ref<string | null>(null)
// 最後一次點到的邏輯畫布座標。
const lastPointer = ref<CanvasPoint | null>(null)

// 根據 id 找出目前啟用的 preset 物件。
const activePreset = computed<CanvasPreset>(() => {
  return canvasPresets.find((preset) => preset.id === selectedPresetId.value) ?? canvasPresets[0]!
})

// 依照目前 preset 產生 demo slide。
const slide = computed(() => createDemoSlide(activePreset.value))
// 把選取的 id 對回實際元素物件，方便 debug panel 顯示。
const selectedElement = computed<SlideElement | null>(() => {
  return slide.value.elements.find((element) => element.id === selectedElementId.value) ?? null
})

// fitZoom 代表「把整張投影片完整放進 frame 裡」所需的縮放倍率。
const fitZoom = computed(() => {
  return clamp(calculateFitZoom(stageSize, slide.value, 120), MIN_ZOOM, MAX_ZOOM)
})

// 集中更新 pan，確保所有呼叫者都用同一種資料形狀。
function setPan(value: PanPoint) {
  pan.x = value.x
  pan.y = value.y
}

// 把 zoom 限制在允許範圍內。
function setZoom(value: number) {
  zoom.value = clamp(value, MIN_ZOOM, MAX_ZOOM)
}

// 把鏡頭偏移重設回中心。
function resetPan() {
  setPan({ x: 0, y: 0 })
}

// 先縮放到剛好可見整張 slide，再把視角置中。
function fitView() {
  setZoom(fitZoom.value)
  resetPan()
}

// 以固定倍率做放大或縮小。
function zoomBy(direction: 1 | -1) {
  const nextZoom = clamp(zoom.value * (direction > 0 ? ZOOM_STEP : 1 / ZOOM_STEP), MIN_ZOOM, MAX_ZOOM)
  setZoom(nextZoom)
}

// 切換 preset 後，等 DOM 更新完再重新 fit。
function handlePresetChange(nextPresetId: string) {
  selectedPresetId.value = nextPresetId
  selectedElementId.value = null
  lastPointer.value = null

  nextTick(() => {
    fitView()
  })
}

// WorkspaceStage 會把量到的實際像素尺寸回報到這裡。
function handleStageSize(value: StageSize) {
  stageSize.width = value.width
  stageSize.height = value.height

  // 如果 demo 剛掛載且還在預設縮放值，就自動 fit 一次。
  if (stageSize.width > 0 && stageSize.height > 0 && zoom.value === 0.9) {
    fitView()
  }
}

// pointer 座標會存成邏輯畫布座標。
function handlePointerChange(point: CanvasPoint | null) {
  lastPointer.value = point
}

// 選取狀態用 id 儲存，不直接存物件參照。
function handleSelectElement(element: SlideElement | null) {
  selectedElementId.value = element?.id ?? null
}

// zoom 的更新可能來自工具列按鈕或滑鼠滾輪。
function handleZoomUpdate(nextZoom: number) {
  setZoom(nextZoom)
}
</script>

<template>
  <div class="app-shell">
    <!-- 頁首說明這個 demo 在示範什麼。 -->
    <header class="hero">
      <div>
        <p class="eyebrow">PPT Canvas Workspace</p>
        <h1>03 - 畫布系統</h1>
        <p class="hero-copy">
          這是一個把 PowerPoint 畫布概念拆開來看的示範。
          你可以把它當成「固定座標畫布 + 外層視角控制」的練習場。
        </p>
      </div>

      <!-- 右上角摘要卡，提醒這是一個鏡頭 / 工作區示範。 -->
      <div class="hero-card">
        <span>Focus</span>
        <strong>center canvas, drag workspace, zoom the camera</strong>
      </div>
    </header>

    <!-- Toolbar 只負責發出動作，狀態仍由 App 持有。 -->
    <WorkspaceToolbar
      :active-preset-id="selectedPresetId"
      :presets="canvasPresets"
      :zoom="zoom"
      :can-zoom-in="zoom < MAX_ZOOM"
      :can-zoom-out="zoom > MIN_ZOOM"
      @change-preset="handlePresetChange"
      @zoom-in="zoomBy(1)"
      @zoom-out="zoomBy(-1)"
      @fit-view="fitView"
      @reset-pan="resetPan"
    />

    <!-- 兩欄版面：左邊是互動工作區，右邊是即時狀態。 -->
    <section class="workspace-layout">
      <WorkspaceStage
        :slide="slide"
        :zoom="zoom"
        :pan-x="pan.x"
        :pan-y="pan.y"
        :selected-element-id="selectedElementId"
        :pointer="lastPointer"
        @stage-size="handleStageSize"
        @update:pan="setPan"
        @update:zoom="handleZoomUpdate"
        @pointer-change="handlePointerChange"
        @select-element="handleSelectElement"
      />

      <!-- Debug panel 用來直接查看驅動畫布的實際狀態。 -->
      <CanvasDebugPanel
        :slide="slide"
        :zoom="zoom"
        :pan="pan"
        :stage-size="stageSize"
        :pointer="lastPointer"
        :selected-element="selectedElement"
      />
    </section>
  </div>
</template>

<style scoped>
/* 整頁外框，留出呼吸空間。 */
.app-shell {
  min-height: 100vh;
  padding: 32px;
  color: var(--text-primary);
}

/* 頁面上方的 hero 區塊。 */
.hero {
  display: flex;
  gap: 24px;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 20px;
}

/* 小型大寫標籤。 */
.eyebrow {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  font-size: 12px;
}

/* 主標題。 */
h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.75rem);
  line-height: 0.95;
}

/* 補充說明文字。 */
.hero-copy {
  max-width: 760px;
  margin: 16px 0 0;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.7;
}

/* 摘要卡片。 */
.hero-card {
  min-width: 280px;
  padding: 18px 20px;
  border-radius: 18px;
  background: rgba(11, 15, 26, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 54px rgba(0, 0, 0, 0.22);
}

/* 卡片中的標籤。 */
.hero-card span {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* 卡片中的重點文字。 */
.hero-card strong {
  font-size: 16px;
  line-height: 1.5;
}

/* 主版面採左右兩欄。 */
.workspace-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 1180px) {
  .workspace-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .app-shell {
    padding: 20px;
  }

  .hero {
    flex-direction: column;
    align-items: start;
  }

  .hero-card {
    width: 100%;
  }
}
</style>
