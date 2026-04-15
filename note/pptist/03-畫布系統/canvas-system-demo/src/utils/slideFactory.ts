import type { CanvasPoint, CanvasPreset, Slide } from '@/types/canvas'

export const canvasPresets: CanvasPreset[] = [
  {
    id: 'wide-16-9',
    label: '16:9 Standard',
    viewportWidth: 1000,
    viewportRatio: 9 / 16,
    note: '常見的簡報比例',
  },
  {
    id: 'classic-4-3',
    label: '4:3 Classic',
    viewportWidth: 1000,
    viewportRatio: 3 / 4,
    note: '比較接近早期簡報比例',
  },
  {
    id: 'wide-1280',
    label: '16:9 Large',
    viewportWidth: 1280,
    viewportRatio: 9 / 16,
    note: '更大的畫布，適合觀察 pan 與 zoom',
  },
]

// 根據 preset 建立 demo slide，讓畫布維持固定邏輯尺寸，
// 而外層工作區負責決定怎麼顯示它。
export function createDemoSlide(preset: CanvasPreset): Slide {
  const height = preset.viewportWidth * preset.viewportRatio
  const titleWidth = preset.viewportWidth * 0.56
  const chipWidth = preset.viewportWidth * 0.18

  return {
    width: preset.viewportWidth,
    height,
    ratio: preset.viewportRatio,
    background: 'linear-gradient(135deg, #f7f8fc 0%, #eef2ff 100%)',
    gridSize: 40,
    elements: [
      {
        id: 'title',
        type: 'title',
        left: preset.viewportWidth * 0.08,
        top: height * 0.12,
        width: titleWidth,
        height: 126,
        text: 'Canvas Workspace',
        color: '#101828',
        background: 'rgba(255, 255, 255, 0.84)',
        borderColor: '#dbe2ff',
        zIndex: 3,
      },
      {
        id: 'body',
        type: 'body',
        left: preset.viewportWidth * 0.08,
        top: height * 0.36,
        width: preset.viewportWidth * 0.52,
        height: 192,
        text: '這裡的元素都用邏輯座標排版，螢幕縮放不會改變資料本身。',
        color: '#1d2939',
        background: 'rgba(255, 255, 255, 0.75)',
        borderColor: '#c6d0ff',
        zIndex: 2,
      },
      {
        id: 'chip',
        type: 'chip',
        left: preset.viewportWidth * 0.68,
        top: height * 0.18,
        width: chipWidth,
        height: 88,
        text: 'zoom = camera scale',
        color: '#ffffff',
        background: 'linear-gradient(135deg, #3447e6 0%, #5a78ff 100%)',
        borderColor: '#7f90ff',
        zIndex: 4,
      },
    ],
  }
}

// 讓 debug panel 裡的 pointer 數值比較好讀。
export function roundCanvasPoint(point: CanvasPoint): CanvasPoint {
  return {
    x: Number(point.x.toFixed(2)),
    y: Number(point.y.toFixed(2)),
  }
}
