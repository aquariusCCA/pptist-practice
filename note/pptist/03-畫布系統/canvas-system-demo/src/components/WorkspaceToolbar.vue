<script setup lang="ts">
// 工具列只負責發出命令，真正的狀態由 App.vue 持有。
import type { CanvasPreset } from '@/types/canvas'

defineProps<{
  activePresetId: string
  presets: CanvasPreset[]
  zoom: number
  canZoomIn: boolean
  canZoomOut: boolean
}>()

defineEmits<{
  (event: 'change-preset', presetId: string): void
  (event: 'zoom-in'): void
  (event: 'zoom-out'): void
  (event: 'fit-view'): void
  (event: 'reset-pan'): void
}>()
</script>

<template>
  <!-- 這一區把說明文字、鏡頭按鈕和 preset 集中在一起。 -->
  <section class="toolbar">
    <div class="copy">
      <!-- 教學 demo 的小標題。 -->
      <p class="eyebrow">PPT Canvas Workspace</p>
      <h2>PowerPoint 畫布系統</h2>
      <p>這個 demo 只示範畫布、縮放、平移和座標換算，不做完整編輯器。</p>
    </div>

    <!-- 鏡頭控制：放大、縮小、fit、置中。 -->
    <div class="actions">
      <div class="zoom-group">
        <!-- 到達最小縮放後就不能再縮小。 -->
        <button type="button" :disabled="!canZoomOut" @click="$emit('zoom-out')">-</button>
        <!-- 把 zoom 顯示成比較好讀的百分比。 -->
        <span>{{ Math.round(zoom * 100) }}%</span>
        <!-- 到達最大縮放後就不能再放大。 -->
        <button type="button" :disabled="!canZoomIn" @click="$emit('zoom-in')">+</button>
      </div>

      <div class="action-row">
        <!-- Fit 的意思是把整張投影片完整放進 frame。 -->
        <button type="button" class="ghost" @click="$emit('fit-view')">Fit</button>
        <!-- Center 的意思是把 pan 重設回原點。 -->
        <button type="button" class="ghost" @click="$emit('reset-pan')">Center</button>
      </div>
    </div>

    <!-- preset 會改變邏輯投影片的大小與比例。 -->
    <div class="preset-group">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="preset"
        :class="{ active: preset.id === activePresetId }"
        @click="$emit('change-preset', preset.id)"
      >
        <span>{{ preset.label }}</span>
        <small>{{ preset.note }}</small>
      </button>
    </div>
  </section>
</template>

<style scoped>
/* 工具列卡片外框。 */
.toolbar {
  display: grid;
  gap: 18px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 18px 42px rgba(2, 6, 23, 0.08);
  backdrop-filter: blur(16px);
}

/* 上方說明區。 */
.copy h2 {
  margin: 0;
  font-size: 28px;
}

.copy p {
  margin: 10px 0 0;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* 上方的小標籤。 */
.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* 鏡頭控制列。 */
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

/* 縮放按鈕和百分比放在同一組。 */
.zoom-group {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 16px;
  background: rgba(17, 24, 39, 0.04);
}

.zoom-group span {
  min-width: 56px;
  text-align: center;
  font-weight: 700;
  color: var(--text-primary);
}

button {
  appearance: none;
  border: 0;
  font: inherit;
}

.zoom-group button,
.ghost,
.preset {
  cursor: pointer;
}

.zoom-group button {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: white;
  color: var(--text-primary);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.zoom-group button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

/* Fit / center 按鈕。 */
.action-row {
  display: flex;
  gap: 10px;
}

.ghost {
  height: 36px;
  padding: 0 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(17, 24, 39, 0.1);
}

/* preset 的響應式格線。 */
.preset-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px;
}

/* 單一 preset 卡片。 */
.preset {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(17, 24, 39, 0.08);
  text-align: left;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;
}

/* 滑過時稍微抬起。 */
.preset:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

/* 高亮目前選中的 preset。 */
.preset.active {
  border-color: rgba(52, 71, 230, 0.42);
  box-shadow: 0 16px 32px rgba(52, 71, 230, 0.15);
}

/* preset 標題。 */
.preset span {
  display: block;
  font-weight: 700;
  color: var(--text-primary);
}

/* preset 說明。 */
.preset small {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  line-height: 1.4;
}

@media (max-width: 720px) {
  .copy h2 {
    font-size: 22px;
  }
}
</style>
