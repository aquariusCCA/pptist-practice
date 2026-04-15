<script setup lang="ts">
// Debug panel 是唯讀的：它只用來展示目前工作區狀態。
import type { CanvasPoint, Slide, SlideElement } from '@/types/canvas'
import type { PanPoint, StageSize } from '@/utils/workspaceMath'

defineProps<{
  slide: Slide
  zoom: number
  pan: PanPoint
  stageSize: StageSize
  pointer: CanvasPoint | null
  selectedElement: SlideElement | null
}>()
</script>

<template>
  <!-- 右側面板，直接顯示畫布背後的即時資料。 -->
  <aside class="panel">
    <div class="header">
      <p class="eyebrow">Workspace debug</p>
      <h3>畫布資訊</h3>
    </div>

    <!-- 顯示投影片、鏡頭與 stage 的摘要數值。 -->
    <div class="metrics">
      <div class="metric">
        <span>slide</span>
        <strong>{{ slide.width }} ? {{ slide.height.toFixed(2) }}</strong>
      </div>
      <div class="metric">
        <span>zoom</span>
        <strong>{{ Math.round(zoom * 100) }}%</strong>
      </div>
      <div class="metric">
        <span>pan</span>
        <strong>{{ pan.x.toFixed(0) }}, {{ pan.y.toFixed(0) }}</strong>
      </div>
      <div class="metric">
        <span>stage</span>
        <strong>{{ stageSize.width.toFixed(0) }} ? {{ stageSize.height.toFixed(0) }}</strong>
      </div>
    </div>

    <!-- 最後一次點到的邏輯畫布座標。 -->
    <section class="card">
      <h4>Pointer</h4>
      <p v-if="pointer">
        canvas: <strong>{{ pointer.x.toFixed(1) }}, {{ pointer.y.toFixed(1) }}</strong>
      </p>
      <p v-else>目前還沒有 pointer 資訊</p>
    </section>

    <!-- 目前被選取的投影片元素（如果有）。 -->
    <section class="card">
      <h4>Selection</h4>
      <template v-if="selectedElement">
        <p><strong>{{ selectedElement.text }}</strong></p>
        <p>{{ selectedElement.left }}, {{ selectedElement.top }}</p>
      </template>
      <p v-else>目前還沒有選取任何元素</p>
    </section>
  </aside>
</template>

<style scoped>
/* Debug panel 外框。 */
.panel {
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 42px rgba(2, 6, 23, 0.08);
}

.header h3 {
  margin: 0;
  font-size: 22px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* 摘要數值的格線。 */
.metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric,
.card {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.metric span {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric strong {
  display: block;
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 16px;
}

.card h4 {
  margin: 0 0 10px;
  font-size: 15px;
}

.card p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  line-height: 1.6;
  word-break: break-word;
}

.card strong {
  color: var(--text-primary);
}

@media (max-width: 1100px) {
  .metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
