// 畫布空間中的點，不是原始螢幕像素。
export type CanvasPoint = {
  x: number
  y: number
}

// preset 定義的是邏輯投影片尺寸與長寬比。
export type CanvasPreset = {
  id: string
  label: string
  viewportWidth: number
  viewportRatio: number
  note: string
}

// 這個 demo 只使用少量元素種類，讓程式保持簡單。
export type SlideElementType = 'title' | 'body' | 'chip'

// 每個元素都用邏輯投影片座標來定位與上色。
export type SlideElement = {
  id: string
  type: SlideElementType
  left: number
  top: number
  width: number
  height: number
  text: string
  color: string
  background: string
  borderColor: string
  zIndex: number
}

// Slide 是邏輯畫布，zoom 和 pan 改變時它本身不變。
export type Slide = {
  width: number
  height: number
  ratio: number
  background: string
  gridSize: number
  elements: SlideElement[]
}

// 舊版 debug 資料結構，保留給教學與相容使用。
export type PointerState = {
  clientX: number
  clientY: number
  localX: number
  localY: number
  canvasX: number
  canvasY: number
}
