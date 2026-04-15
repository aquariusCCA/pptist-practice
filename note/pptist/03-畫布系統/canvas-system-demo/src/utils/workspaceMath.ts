import type { CanvasPoint, Slide } from '@/types/canvas'

export type PanPoint = {
  x: number
  y: number
}

export type StageSize = {
  width: number
  height: number
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function calculateFitZoom(stage: StageSize, slide: Slide, padding = 96) {
  if (stage.width <= 0 || stage.height <= 0) {
    return 1
  }

  const usableWidth = Math.max(stage.width - padding * 2, 320)
  const usableHeight = Math.max(stage.height - padding * 2, 240)

  return Math.min(usableWidth / slide.width, usableHeight / slide.height)
}

export function zoomAroundPoint(
  currentPan: PanPoint,
  currentZoom: number,
  nextZoom: number,
  anchor: CanvasPoint,
  stageSize: StageSize,
) {
  const stageCenterX = stageSize.width / 2
  const stageCenterY = stageSize.height / 2
  const anchorOffsetX = anchor.x - stageCenterX
  const anchorOffsetY = anchor.y - stageCenterY
  const zoomRatio = nextZoom / (currentZoom || 1)

  return {
    x: currentPan.x + (anchorOffsetX - currentPan.x) * (1 - zoomRatio),
    y: currentPan.y + (anchorOffsetY - currentPan.y) * (1 - zoomRatio),
  }
}

export function clientToCanvasPoint(
  clientX: number,
  clientY: number,
  boardRect: DOMRect,
  zoom: number,
): CanvasPoint {
  const safeZoom = zoom > 0 ? zoom : 1

  return {
    x: (clientX - boardRect.left) / safeZoom,
    y: (clientY - boardRect.top) / safeZoom,
  }
}
