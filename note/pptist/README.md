# PPTist Learning Map

這份目錄是 `PPTist` 的閱讀路線圖。

順序原則：

1. 先看懂資料結構
2. 再看懂畫面怎麼建立
3. 接著看懂狀態怎麼流動
4. 最後再深入每個功能模組

## 主線順序

### 0. 總覽

- [overview](./00-%E7%B8%BD%E8%A6%BD/README.md)

先建立全局視角，知道這個專案主要在解什麼問題。

### 1. 資料模型

- [data-model](./01-%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B/README.md)

先看懂 `slide`、`element`、`theme`、`animation` 這些核心資料怎麼組成。

### 2. 編輯器骨架

- [editor-skeleton](./02-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%AA%A8%E6%9E%B6/README.md)

先知道整個 editor 怎麼掛起來，哪些區塊負責什麼。

### 3. 畫布系統

- [canvas-system](./03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/README.md)
- [canvas-intro](./03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/pptist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
- [canvas-concepts](./03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)
- [canvas-compare](./03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/PPTist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%AF%A6%E4%BD%9C%E5%B0%8D%E7%85%A7%E7%AF%87%EF%BC%88viewport-wrapper%E3%80%81viewport%E3%80%81canvasScale%EF%BC%89.md)

理解固定座標、縮放、滑鼠座標換算之後，後面很多互動才會通。

### 4. 縮圖系統

- [thumbnail-system](./04-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/README.md)
- [thumbnail-notes](./04-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/%E7%B8%AE%E5%9C%96%E5%85%83%E4%BB%B6%E8%A8%AD%E8%A8%88%E7%AD%86%E8%A8%98.md)

這一章會把 `ThumbnailSlide` 怎麼共用同一份投影片資料講清楚。

### 5. Store 與狀態流

- [store-flow](./05-store%E8%88%87%E7%8B%80%E6%85%8B%E6%B5%81/README.md)

這一章是 `PPTist` 的狀態中樞。

### 6. 匯入匯出

- [import-export](./06-%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA/README.md)

這一章會把外部檔案怎麼進來、內部資料怎麼出去補起來。

### 7. 播放與預覽

- [play-preview](./07-%E6%92%AD%E6%94%BE%E8%88%87%E9%A0%90%E8%A6%BD/README.md)

最後看播放頁、演講者模式、行動版預覽。

## 建議學習節奏

### 第一輪

1. `00-總覽`
2. `01-資料模型`
3. `02-編輯器骨架`
4. `03-畫布系統`
5. `04-縮圖系統`
6. `05-store與狀態流`
7. `06-匯入匯出`
8. `07-播放與預覽`

### 第二輪

1. 先拆選取、拖曳、縮放、旋轉
2. 再拆文字、圖片、形狀、線段、表格、圖表
3. 再拆搜尋、註解、標記、版面、主題
4. 最後看播放、匯入匯出、AIPPT 與歷史機制

### 第三輪

每讀完一個章節，回到原始碼對照一次：

- `src/views/Editor/*`
- `src/views/Screen/*`
- `src/views/Mobile/*`
- `src/store/*`
- `src/hooks/*`
- `src/components/element/*`
- `src/utils/*`

## 進階模組地圖

### A. 編輯器入口與骨架

- `src/App.vue`
- `src/views/Editor/index.vue`
- `src/views/Editor/EditorHeader/index.vue`
- `src/views/Editor/Toolbar/index.vue`
- `src/views/Editor/Canvas/index.vue`
- `src/views/Editor/Thumbnails/index.vue`

### B. 選取與操作

- `src/views/Editor/Canvas/hooks/useSelectElement.ts`
- `src/views/Editor/Canvas/hooks/useMouseSelection.ts`
- `src/views/Editor/Canvas/hooks/useDragElement.ts`
- `src/views/Editor/Canvas/hooks/useScaleElement.ts`
- `src/views/Editor/Canvas/hooks/useRotateElement.ts`
- `src/views/Editor/Canvas/Operate/*`

### C. 元素建立與編輯

- `src/hooks/useCreateElement.ts`
- `src/hooks/useDeleteElement.ts`
- `src/hooks/useMoveElement.ts`
- `src/hooks/useOrderElement.ts`
- `src/hooks/useLockElement.ts`
- `src/hooks/useHideElement.ts`
- `src/hooks/useCombineElement.ts`
- `src/hooks/useAlignActiveElement.ts`
- `src/hooks/useAlignElementToCanvas.ts`

### D. 文字系統

- `src/views/components/element/TextElement/*`
- `src/views/Editor/Toolbar/common/RichTextBase.vue`
- `src/utils/prosemirror/*`
- `src/utils/htmlParser/*`

### E. 圖片、裁切與樣式

- `src/views/components/element/ImageElement/*`
- `src/views/Editor/Toolbar/common/ElementFilter.vue`
- `src/views/Editor/Toolbar/common/ElementShadow.vue`
- `src/views/Editor/Toolbar/common/ElementOutline.vue`
- `src/views/Editor/Toolbar/common/ElementColorMask.vue`
- `src/views/Editor/Toolbar/common/ElementFlip.vue`

### F. 形狀、線段、表格、圖表、公式

- `src/views/components/element/ShapeElement/*`
- `src/views/components/element/LineElement/*`
- `src/views/components/element/TableElement/*`
- `src/views/components/element/ChartElement/*`
- `src/views/components/element/LatexElement/*`
- `src/views/Editor/CanvasTool/*`
- `src/views/Editor/Toolbar/ElementStylePanel/*`

### G. 音訊、影片、連結、章節

- `src/views/components/element/AudioElement/*`
- `src/views/components/element/VideoElement/*`
- `src/views/Editor/Canvas/LinkDialog.vue`
- `src/hooks/useLink.ts`
- `src/hooks/useSectionHandler.ts`

### H. 主題、版面、動畫

- `src/hooks/useSlideTheme.ts`
- `src/views/Editor/Toolbar/SlideDesignPanel/*`
- `src/views/Editor/Toolbar/SlideAnimationPanel.vue`
- `src/views/Editor/Toolbar/ElementAnimationPanel.vue`
- `src/views/Editor/Toolbar/ElementPositionPanel.vue`

### I. 搜尋、註解、標記

- `src/hooks/useSearch.ts`
- `src/views/Editor/SearchPanel.vue`
- `src/views/Editor/NotesPanel.vue`
- `src/views/Editor/MarkupPanel.vue`
- `src/views/Editor/SymbolPanel.vue`
- `src/views/Editor/SelectPanel.vue`

### J. 快捷鍵、剪貼簿、歷史

- `src/hooks/useGlobalHotkey.ts`
- `src/hooks/usePasteEvent.ts`
- `src/hooks/usePasteTextClipboardData.ts`
- `src/hooks/useCopyAndPasteElement.ts`
- `src/hooks/useHistorySnapshot.ts`
- `src/store/snapshot.ts`

### K. 播放、預覽與行動版

- `src/views/Screen/*`
- `src/views/Screen/hooks/*`
- `src/views/Mobile/*`
- `src/hooks/useScreening.ts`
- `src/utils/fullscreen.ts`

### L. 匯入、匯出與格式轉換

- `src/hooks/useImport.ts`
- `src/hooks/useExport.ts`
- `src/utils/crypto.ts`
- `src/utils/database.ts`
- `src/utils/image.ts`
- `src/utils/print.ts`
- `src/utils/svgPathParser.ts`
- `src/utils/svg2Base64.ts`
- `src/utils/textParser.ts`
- `src/utils/clipboard.ts`

### M. AIPPT 與模板生成

- `src/hooks/useAIPPT.ts`
- `src/views/Editor/AIPPTDialog.vue`
- `public/mocks/AIPPT_Outline.md`

## 核心狀態層

如果你只想先抓大骨架，可以把整個專案想成五個狀態層：

1. `slides store`
2. `main store`
3. `snapshot store`
4. `screen store`
5. `keyboard store`

它們分別處理：

- 文件內容
- 編輯器互動狀態
- 歷史紀錄
- 播放模式
- 按鍵狀態

## 閱讀建議

- 如果你剛開始看，先不要碰 `AIPPT`、`匯出 PPTX`、`播放模式`。
- 如果你已經看懂 `03` 和 `04`，下一步最該補的是 `01`、`05`、`02`。
- 如果你想直接進入實作細節，就從 `src/store/slides.ts`、`src/store/main.ts`、`src/views/Editor/Canvas/index.vue` 開始。

## 學習方式

每完成一個章節，我都會先帶你做一次對應的簡易版實作，再回頭對照 `PPTist` 原始碼。

這樣的順序是：

1. 先把章節概念釐清
2. 再做 `mini version`
3. 用簡易版驗證核心機制
4. 最後回頭看 `PPTist` 的真實實作

這個流程會套用到後續每個章節，包含畫布、縮圖、store、匯入匯出、播放預覽。

## 返回上層

- [back-to-note-root](../README.md)
