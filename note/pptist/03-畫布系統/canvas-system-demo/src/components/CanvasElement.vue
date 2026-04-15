<script setup lang="ts">
// 單一投影片元素會被渲染成絕對定位的按鈕。
import { computed } from 'vue'
import type { SlideElement } from '@/types/canvas'

const props = defineProps<{
  element: SlideElement
  selected: boolean
}>()

// 這個元件會把原始 pointerdown 事件往上丟，讓父層決定怎麼處理。
defineEmits<{
  (event: 'pointerdown', pointerEvent: PointerEvent): void
}>()

// 把邏輯座標轉成行內樣式。
const elementStyle = computed(() => ({
  left: `${props.element.left}px`,
  top: `${props.element.top}px`,
  width: `${props.element.width}px`,
  height: `${props.element.height}px`,
  zIndex: props.element.zIndex,
  color: props.element.color,
  background: props.element.background,
  borderColor: props.element.borderColor,
}))
</script>

<template>
  <!-- 用 button 語意可以支援鍵盤 focus 與點擊選取。 -->
  <button
    class="element"
    :class="[`type-${element.type}`, { selected }]"
    type="button"
    :style="elementStyle"
    @pointerdown.stop="$emit('pointerdown', $event)"
  >
    <!-- 小型 type 標籤，方便辨識元素類型。 -->
    <span class="element-tag">{{ element.type }}</span>
    <!-- 元素內的主要文字內容。 -->
    <strong>{{ element.text }}</strong>
  </button>
</template>

<style scoped>
/* 所有投影片元素共用的卡片外觀。 */
.element {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 8px;
  padding: 18px 20px;
  appearance: none;
  border: 1px solid transparent;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  text-align: left;
  transition:
    transform 140ms ease,
    box-shadow 140ms ease,
    border-color 140ms ease;
}

/* hover 時稍微抬起。 */
.element:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.16);
}

/* 鍵盤操作時的 focus 外框。 */
.element:focus-visible {
  outline: 3px solid rgba(52, 71, 230, 0.32);
  outline-offset: 2px;
}

/* 被選取時加上更明顯的外框與光暈。 */
.element.selected {
  border-color: #3447e6;
  box-shadow: 0 0 0 4px rgba(52, 71, 230, 0.16), 0 20px 40px rgba(15, 23, 42, 0.12);
}

/* 元素類型的小徽章。 */
.element-tag {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: rgba(15, 23, 42, 0.68);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* 主要文字大小。 */
.element strong {
  font-size: clamp(16px, 2vw, 28px);
  line-height: 1.15;
}

/* chip 變體使用深色背景與白字。 */
.type-chip {
  color: #fff;
}

.type-chip .element-tag {
  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.84);
}

.type-chip strong {
  font-size: clamp(14px, 1.6vw, 18px);
}

.type-body strong {
  font-size: clamp(15px, 1.8vw, 22px);
  line-height: 1.5;
}
</style>
