# PPT Canvas Workspace

這個專案是 `PPTist` 筆記中 `03-畫布系統` 的工作區版示範。

它的目標不是重做完整編輯器，而是把投影片編輯器最直觀的使用感做出來：

- 中間有一張固定比例的畫布
- 畫布外層可以拖拉平移視角
- 可以用按鈕或滑鼠滾輪縮放
- 畫布中的元素依然使用固定邏輯座標

## 實作規格

- 技術棧：`Vue 3 + Vite + TypeScript`
- 畫布基準：預設 `1000 x 562.5`，維持 `16:9`
- 座標模型：所有元素都以邏輯座標保存，不直接依賴 DOM 像素
- 視角模型：`zoom` 只影響觀看倍率，`pan` 只影響視角偏移
- 互動目標：
  - 拖曳空白區平移工作區
  - 用按鈕或滑鼠滾輪縮放
  - 點擊元素選取
  - 點擊空白處顯示 pointer 座標
  - 顯示 zoom、pan、stage size、selection 狀態
- 非目標：
  - 不做拖曳元素
  - 不做 resize / rotate
  - 不做 store
  - 不做匯入匯出
  - 不做縮圖系統
  - 不做播放模式

## 檔案結構

```txt
src/
  App.vue
  main.ts
  components/
    CanvasBoard.vue
    CanvasDebugPanel.vue
    CanvasElement.vue
    WorkspaceStage.vue
    WorkspaceToolbar.vue
  composables/
    useViewportSize.ts
  styles/
    base.css
    tokens.css
  types/
    canvas.ts
  utils/
    slideFactory.ts
    workspaceMath.ts
```

### 檔案責任

- `App.vue`
  - 組裝整個頁面
  - 管理 preset、zoom、pan、選取元素與 pointer

- `components/WorkspaceToolbar.vue`
  - 控制縮放
  - 切換 slide preset
  - 提供 fit / center 動作

- `components/WorkspaceStage.vue`
  - 主要工作區
  - 處理拖拉平移與 wheel 縮放
  - 把 stage size 回報給 App

- `components/CanvasBoard.vue`
  - 渲染中央畫布
  - 處理畫布點擊與元素選取

- `components/CanvasElement.vue`
  - 單一元素的視覺呈現

- `components/CanvasDebugPanel.vue`
  - 顯示 zoom、pan、stage size、pointer、selection 等資訊

- `composables/useViewportSize.ts`
  - 監聽容器尺寸變化

- `utils/slideFactory.ts`
  - 產生 demo 用 slide 與 preset 資料

- `utils/workspaceMath.ts`
  - zoom / pan / fit / 座標換算工具

- `types/canvas.ts`
  - 放置畫布相關型別

- `styles/base.css`
  - 全域樣式與基礎排版

- `styles/tokens.css`
  - 色彩與視覺變數

## 使用方式

```bash
npm install
npm run dev
```

建置：

```bash
npm run build
```

## 這個 demo 在看什麼

1. 畫布本體是固定邏輯尺寸，不是螢幕像素。
2. `zoom` 只是在改變你看畫布的倍率。
3. `pan` 只是在改變你看畫布的中心位置。
4. 你在工作區拖拉或縮放時，畫布內容資料本身不會被改寫。

## 延伸閱讀

- [Fit 倍率計算：`calculateFitZoom()`](./docs/canvas-system-demo-calculateFitZoom.md)
- [滾輪縮放設計：`handleWheel()`](./docs/canvas-system-demo-handleWheel.md)
- [以滑鼠為中心縮放：`zoomAroundPoint()`](./docs/canvas-system-demo-zoomAroundPoint.md)
- [按鈕縮放步進：`zoomBy()`](./docs/canvas-system-demo-zoomBy.md)

## 對照原筆記

這個專案對應到 `note/pptist/03-畫布系統` 的三個重點：

- 概念篇
- 實作對照篇
- demo 驗證

如果你要再往下做，可以在這個工作區上接著補：

- 以游標為中心縮放
- 畫布尺規
- 元素拖曳
- 選取框
- resize / rotate
- store 與 snapshot
