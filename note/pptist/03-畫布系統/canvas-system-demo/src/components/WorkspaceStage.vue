<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CanvasBoard from './CanvasBoard.vue'
import { useViewportSize } from '@/composables/useViewportSize'
import { clamp, zoomAroundPoint } from '@/utils/workspaceMath'
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
  (event: 'update:pan', value: { x: number; y: number }): void
  (event: 'update:zoom', value: number): void
  (event: 'pointer-change', point: CanvasPoint | null): void
  (event: 'select-element', element: SlideElement | null): void
  (event: 'stage-size', value: { width: number; height: number }): void
}>()

const stageRef = ref<HTMLElement | null>(null)
const dragging = ref(false)
const dragState = ref<{
  startX: number
  startY: number
  startPanX: number
  startPanY: number
  pointerId: number
} | null>(null)

const { width: stageWidth, height: stageHeight } = useViewportSize(stageRef)

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

const stageStyle = computed(() => ({
  '--zoom': String(props.zoom),
  '--pan-x': `${props.panX}px`,
  '--pan-y': `${props.panY}px`,
}))

function startPan(event: PointerEvent) {
  if (event.button !== 0) {
    return
  }

  const stageEl = stageRef.value

  if (!stageEl || event.target !== stageEl) {
    return
  }

  dragging.value = true
  dragState.value = {
    startX: event.clientX,
    startY: event.clientY,
    startPanX: props.panX,
    startPanY: props.panY,
    pointerId: event.pointerId,
  }

  stageEl.setPointerCapture(event.pointerId)
}

function movePan(event: PointerEvent) {
  if (!dragState.value) {
    return
  }

  emit('update:pan', {
    x: dragState.value.startPanX + (event.clientX - dragState.value.startX),
    y: dragState.value.startPanY + (event.clientY - dragState.value.startY),
  })
}

function endPan() {
  if (!dragState.value) {
    return
  }

  const stageEl = stageRef.value

  if (stageEl?.hasPointerCapture(dragState.value.pointerId)) {
    stageEl.releasePointerCapture(dragState.value.pointerId)
  }

  dragging.value = false
  dragState.value = null
}

function handleWheel(event: WheelEvent) {
  const stageEl = stageRef.value

  if (!stageEl) {
    return
  }

  const delta = event.deltaY < 0 ? 1.08 : 0.92
  const nextZoom = clamp(props.zoom * delta, 0.4, 2.4)
  const stageRect = stageEl.getBoundingClientRect()
  const anchor = {
    x: event.clientX - stageRect.left,
    y: event.clientY - stageRect.top,
  }
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

  emit('update:pan', nextPan)
  emit('update:zoom', nextZoom)
}

function handleCanvasPointerChange(point: CanvasPoint | null) {
  emit('pointer-change', point)
}

function handleCanvasSelectElement(element: SlideElement | null) {
  emit('select-element', element)
}
</script>

<template>
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
    <div class="stage-hint">
      <span>Drag empty space</span>
      <span>Wheel to zoom</span>
    </div>

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

.stage.dragging {
  cursor: grabbing;
}

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

.stage-hint {
  position: absolute;
  left: 18px;
  top: 18px;
  z-index: 2;
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stage-hint span {
  padding: 8px 12px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.86);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  font-size: 12px;
}

@media (max-width: 960px) {
  .stage {
    min-height: 60vh;
  }
}
</style>
