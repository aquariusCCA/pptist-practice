# PPTist Learning Map

這份地圖的目的不是只列章節，而是把 `PPTist` 拆成可學習、可追蹤、可回查的模組樹。

如果你的目標是「完整掌握 PPTist」，建議把它理解成四層：

1. 先掌握入口、資料模型與狀態怎麼流
2. 再掌握編輯器、畫布、元素怎麼互動
3. 接著掌握縮圖、放映、手機端等多場景渲染差異
4. 最後掌握播放、匯入匯出、AI、擴充機制與二次開發限制

---

## 閱讀順序

先走主線，再補功能索引。這版把原本比較集中的章節拆得更細，目的是讓每一章都能對應一種明確的原始碼閱讀任務。

1. [00-總覽](./00-%E7%B8%BD%E8%A6%BD/README.md)
2. [01-專案入口與模式切換](./01-%E5%B0%88%E6%A1%88%E5%85%A5%E5%8F%A3%E8%88%87%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8F%9B/README.md)
3. [02-資料模型](./02-%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B/README.md)
4. [03-store與狀態流](./03-store%E8%88%87%E7%8B%80%E6%85%8B%E6%B5%81/README.md)
5. [04-編輯器骨架](./04-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%AA%A8%E6%9E%B6/README.md)
6. [05-畫布系統](./05-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/README.md)
7. [06-元素操作系統](./06-%E5%85%83%E7%B4%A0%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%B5%B1/README.md)
8. [07-縮圖系統](./07-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/README.md)
9. [08-多場景渲染系統](./08-%E5%A4%9A%E5%A0%B4%E6%99%AF%E6%B8%B2%E6%9F%93%E7%B3%BB%E7%B5%B1/README.md)
10. [09-文字系統](./09-%E6%96%87%E5%AD%97%E7%B3%BB%E7%B5%B1/README.md)
11. [10-元素類型與樣式面板](./10-%E5%85%83%E7%B4%A0%E9%A1%9E%E5%9E%8B%E8%88%87%E6%A8%A3%E5%BC%8F%E9%9D%A2%E6%9D%BF/README.md)
12. [11-頁面、主題、模板與動畫](./11-%E9%A0%81%E9%9D%A2%E3%80%81%E4%B8%BB%E9%A1%8C%E3%80%81%E6%A8%A1%E6%9D%BF%E8%88%87%E5%8B%95%E7%95%AB/README.md)
13. [12-匯入匯出與資料持久化](./12-%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA%E8%88%87%E8%B3%87%E6%96%99%E6%8C%81%E4%B9%85%E5%8C%96/README.md)
14. [13-播放、預覽與演講者工具](./13-%E6%92%AD%E6%94%BE%E3%80%81%E9%A0%90%E8%A6%BD%E8%88%87%E6%BC%94%E8%AC%9B%E8%80%85%E5%B7%A5%E5%85%B7/README.md)
15. [14-手機端](./14-%E6%89%8B%E6%A9%9F%E7%AB%AF/README.md)
16. [15-AI PPT](./15-AI%20PPT/README.md)
17. [16-快捷鍵、右鍵選單與效率工具](./16-%E5%BF%AB%E6%8D%B7%E9%8D%B5%E3%80%81%E5%8F%B3%E9%8D%B5%E9%81%B8%E5%96%AE%E8%88%87%E6%95%88%E7%8E%87%E5%B7%A5%E5%85%B7/README.md)
18. [17-自訂元素與擴充機制](./17-%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E8%88%87%E6%93%B4%E5%85%85%E6%A9%9F%E5%88%B6/README.md)
19. [18-效能、限制與二次開發注意事項](./18-%E6%95%88%E8%83%BD%E3%80%81%E9%99%90%E5%88%B6%E8%88%87%E4%BA%8C%E6%AC%A1%E9%96%8B%E7%99%BC%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A0%85/README.md)

---

## 本版新增與調整重點

### 新增章節

- `01-專案入口與模式切換`：補足 `main.ts`、`App.vue`、router、Editor / Screen / Mobile 之間的入口關係。
- `06-元素操作系統`：把選取、拖曳、縮放、旋轉、對齊、組合、鎖定、隱藏、複製貼上獨立出來。
- `08-多場景渲染系統`：整理同一份元素資料在編輯器、縮圖、放映、手機端如何被不同方式渲染。
- `10-元素類型與樣式面板`：補足右側屬性面板、樣式設定、元素資料欄位修改流程。
- `16-快捷鍵、右鍵選單與效率工具`：整理使用者操作入口如何觸發 hooks、store 更新與 snapshot。
- `18-效能、限制與二次開發注意事項`：整理大型簡報、圖片、縮圖、歷史快照、匯入匯出與客製化開發的限制。

### 拆分與改名

- 原本 `06-匯入匯出` 改成 `12-匯入匯出與資料持久化`，避免只看成格式轉換。
- 原本 `07-播放與預覽` 擴充成 `13-播放、預覽與演講者工具`。
- 原本 `09-元素系統` 拆成 `06-元素操作系統`、`08-多場景渲染系統`、`10-元素類型與樣式面板`。
- 原本 `10-頁面與演示` 改成 `11-頁面、主題、模板與動畫`，播放流程則放到第 13 章。
- 原本 `12-匯入匯出與 AI` 拆成 `12-匯入匯出與資料持久化` 與 `15-AI PPT`。
- 原本 `13-擴充與體驗` 拆成 `16-快捷鍵、右鍵選單與效率工具`、`17-自訂元素與擴充機制`、`18-效能、限制與二次開發注意事項`。

---

## 學習主線

### 1. 先建立整體認知

先回答「PPTist 是什麼、不是什麼、由哪些模式組成」。

- 要看：[00-總覽](./00-%E7%B8%BD%E8%A6%BD/README.md)
- 要懂：
  - 產品定位
  - 桌面編輯 / 播放預覽 / 手機端三種使用情境
  - 這份筆記的主線與功能索引怎麼配合

### 2. 先看專案如何啟動與切換模式

不要一開始就跳到畫布，先知道使用者從哪個入口進來。

- 要看：[01-專案入口與模式切換](./01-%E5%B0%88%E6%A1%88%E5%85%A5%E5%8F%A3%E8%88%87%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8F%9B/README.md)
- 要懂：
  - `main.ts` 如何掛載 App
  - `App.vue` 如何承接路由與全域初始化
  - Editor / Screen / Mobile 三種模式如何分工
  - 哪些資料與元件是跨模式共用，哪些是各模式獨立

### 3. 再看資料長什麼樣

先搞懂資料結構，後面所有章節才有共同語言。

- 要看：[02-資料模型](./02-%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B/README.md)
- 要懂：
  - slide、element、theme、template、viewport、history
  - 每種 element 的共同欄位與差異欄位
  - 為什麼簡報資料要固定成可序列化的結構
  - 匯入、匯出、縮圖、播放為什麼都依賴同一份 slide 資料

### 4. 接著看 store 與狀態流

知道資料長什麼樣之後，要知道誰保存它、誰修改它、誰回復它。

- 要看：[03-store與狀態流](./03-store%E8%88%87%E7%8B%80%E6%85%8B%E6%B5%81/README.md)
- 要懂：
  - `slidesStore`、`mainStore`、`keyboardStore`、`screenStore`、`snapshotStore` 的責任邊界
  - undo / redo、歷史快照怎麼做
  - 哪些操作是直接更新資料，哪些要透過事件、hooks 或 snapshot
  - store 更新後如何驅動畫布、縮圖、側欄與放映畫面同步

### 5. 再看編輯器怎麼組起來

把資料、工具列、畫布、縮圖、側欄串成一個工作區。

- 要看：[04-編輯器骨架](./04-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%AA%A8%E6%9E%B6/README.md)
- 要懂：
  - 編輯器的入口與頁面結構
  - 左側縮圖、中央畫布、右側面板、上方工具列如何協作
  - 哪些能力是頁面框架，哪些能力是編輯功能
  - 使用者操作通常從哪幾個 UI 入口進入

### 6. 進入畫布與元素操作核心

這是 PPTist 最核心的互動層。

- 要看：[05-畫布系統](./05-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/README.md)、[06-元素操作系統](./06-%E5%85%83%E7%B4%A0%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%B5%B1/README.md)
- 要懂：
  - 固定座標與縮放怎麼換算
  - 元素如何選取、拖曳、縮放、旋轉
  - 對齊、排序、組合、鎖定、隱藏、複製貼上如何修改資料
  - 哪些操作會產生 history snapshot

### 7. 補上縮圖與多場景渲染

同一份 slide 資料不只會出現在主畫布，也會出現在縮圖、放映、手機端。

- 要看：[07-縮圖系統](./07-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/README.md)、[08-多場景渲染系統](./08-%E5%A4%9A%E5%A0%B4%E6%99%AF%E6%B8%B2%E6%9F%93%E7%B3%BB%E7%B5%B1/README.md)
- 要懂：
  - 縮圖如何跟主畫面同步
  - 編輯器畫布和縮圖的渲染差異
  - 放映模式和編輯模式的渲染差異
  - 手機端是否共用桌面端的 element renderer

### 8. 補文字、元素類型與樣式面板

看完互動後，再看各種元素本身如何被編輯。

- 要看：[09-文字系統](./09-%E6%96%87%E5%AD%97%E7%B3%BB%E7%B5%B1/README.md)、[10-元素類型與樣式面板](./10-%E5%85%83%E7%B4%A0%E9%A1%9E%E5%9E%8B%E8%88%87%E6%A8%A3%E5%BC%8F%E9%9D%A2%E6%9D%BF/README.md)
- 要懂：
  - 富文字內容怎麼編輯、保存與套樣式
  - text、image、shape、line、chart、table、latex 等元素差異
  - 右側樣式面板如何根據選中元素切換
  - 修改樣式時是改 element 哪些欄位

### 9. 再看頁面、主題、模板與動畫

這一層是從「單個元素」提高到「整份簡報」。

- 要看：[11-頁面、主題、模板與動畫](./11-%E9%A0%81%E9%9D%A2%E3%80%81%E4%B8%BB%E9%A1%8C%E3%80%81%E6%A8%A1%E6%9D%BF%E8%88%87%E5%8B%95%E7%95%AB/README.md)
- 要懂：
  - 頁面新增、刪除、複製、排序、分組
  - theme、background、template 如何影響 slide
  - 頁面轉場與元素動畫如何保存與播放
  - 備註、批註、選擇面板等簡報輔助能力

### 10. 補資料進出與播放輸出

理解內容如何進來、如何出去、如何被展示。

- 要看：[12-匯入匯出與資料持久化](./12-%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA%E8%88%87%E8%B3%87%E6%96%99%E6%8C%81%E4%B9%85%E5%8C%96/README.md)、[13-播放、預覽與演講者工具](./13-%E6%92%AD%E6%94%BE%E3%80%81%E9%A0%90%E8%A6%BD%E8%88%87%E6%BC%94%E8%AC%9B%E8%80%85%E5%B7%A5%E5%85%B7/README.md)
- 要懂：
  - 匯入、匯出、列印的取捨
  - IndexedDB / localStorage / mock data / services 的資料來源差異
  - 放映流程、全螢幕、翻頁、批註、演講者視圖
  - 輸出能力如何反推前面的資料與元素設計

### 11. 最後補手機端、AI、擴充與效能限制

主線看完後，再補完整功能群。

- 要看：[14-手機端](./14-%E6%89%8B%E6%A9%9F%E7%AB%AF/README.md) 到 [18-效能、限制與二次開發注意事項](./18-%E6%95%88%E8%83%BD%E3%80%81%E9%99%90%E5%88%B6%E8%88%87%E4%BA%8C%E6%AC%A1%E9%96%8B%E7%99%BC%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A0%85/README.md)
- 要懂：
  - 手機端保留了哪些能力、省略了哪些能力
  - AI 如何參與大綱、模板、內容與圖片替換
  - 快捷鍵、右鍵選單、搜尋、貼上、格式刷等效率工具
  - 如何新增自訂元素、指令、元件與產品能力
  - 二次開發時最容易踩到哪些坑

---

## 完整模組地圖

### 1. 專案入口與模式切換

- [`src/main.ts`](../../PPTist-SourceCode/src/main.ts)
- [`src/App.vue`](../../PPTist-SourceCode/src/App.vue)
- [`src/router/*`](../../PPTist-SourceCode/src/router)
- [`src/views/Editor`](../../PPTist-SourceCode/src/views/Editor)
- [`src/views/Screen`](../../PPTist-SourceCode/src/views/Screen)
- [`src/views/Mobile`](../../PPTist-SourceCode/src/views/Mobile)
- 你要知道：桌面編輯、播放、手機端怎麼分工，以及它們如何共用資料與元件。

### 2. 資料模型與狀態

- [`src/types/slides.ts`](../../PPTist-SourceCode/src/types/slides.ts)
- [`src/store/slides.ts`](../../PPTist-SourceCode/src/store/slides.ts)
- [`src/store/main.ts`](../../PPTist-SourceCode/src/store/main.ts)
- [`src/store/screen.ts`](../../PPTist-SourceCode/src/store/screen.ts)
- [`src/store/keyboard.ts`](../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/store/snapshot.ts`](../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/store/index.ts`](../../PPTist-SourceCode/src/store/index.ts)
- [`src/configs/*`](../../PPTist-SourceCode/src/configs)
- 你要知道：資料長什麼樣、誰在改它、改完怎麼同步。

### 3. 編輯器骨架

- [`src/views/Editor`](../../PPTist-SourceCode/src/views/Editor)
- [`src/views/Editor/Canvas`](../../PPTist-SourceCode/src/views/Editor/Canvas)
- [`src/views/Editor/EditorHeader`](../../PPTist-SourceCode/src/views/Editor/EditorHeader)
- [`src/views/Editor/Thumbnails`](../../PPTist-SourceCode/src/views/Editor/Thumbnails)
- [`src/views/Editor/Toolbar`](../../PPTist-SourceCode/src/views/Editor/Toolbar)
- [`src/views/Editor/Panel`](../../PPTist-SourceCode/src/views/Editor/Panel)
- 你要知道：編輯器畫面如何分區，每個區塊負責觸發哪些操作。

### 4. 畫布縮放與座標系統

- [`src/hooks/useScaleCanvas.ts`](../../PPTist-SourceCode/src/hooks/useScaleCanvas.ts)
- [`src/hooks/useSlideHandler.ts`](../../PPTist-SourceCode/src/hooks/useSlideHandler.ts)
- [`src/utils/element.ts`](../../PPTist-SourceCode/src/utils/element.ts)
- [`doc/Canvas.md`](../../PPTist-SourceCode/doc/Canvas.md)
- 你要知道：畫布縮放、視口尺寸、固定比例、滑鼠座標轉換如何影響元素操作。

### 5. 元素操作系統

- [`src/hooks/useSelectElement.ts`](../../PPTist-SourceCode/src/hooks/useSelectElement.ts)
- [`src/hooks/useMoveElement.ts`](../../PPTist-SourceCode/src/hooks/useMoveElement.ts)
- [`src/hooks/useCreateElement.ts`](../../PPTist-SourceCode/src/hooks/useCreateElement.ts)
- [`src/hooks/useDeleteElement.ts`](../../PPTist-SourceCode/src/hooks/useDeleteElement.ts)
- [`src/hooks/useOrderElement.ts`](../../PPTist-SourceCode/src/hooks/useOrderElement.ts)
- [`src/hooks/useAlignElementToCanvas.ts`](../../PPTist-SourceCode/src/hooks/useAlignElementToCanvas.ts)
- [`src/hooks/useAlignActiveElement.ts`](../../PPTist-SourceCode/src/hooks/useAlignActiveElement.ts)
- [`src/hooks/useCombineElement.ts`](../../PPTist-SourceCode/src/hooks/useCombineElement.ts)
- [`src/hooks/useLockElement.ts`](../../PPTist-SourceCode/src/hooks/useLockElement.ts)
- [`src/hooks/useHideElement.ts`](../../PPTist-SourceCode/src/hooks/useHideElement.ts)
- [`src/hooks/useCopyAndPasteElement.ts`](../../PPTist-SourceCode/src/hooks/useCopyAndPasteElement.ts)
- [`src/hooks/useHistorySnapshot.ts`](../../PPTist-SourceCode/src/hooks/useHistorySnapshot.ts)
- 你要知道：元素如何被操作，哪些操作會進歷史紀錄。

### 6. 縮圖與多場景渲染

- [`src/views/components/ThumbnailSlide/*`](../../PPTist-SourceCode/src/views/components/ThumbnailSlide)
- [`src/views/components/element/*`](../../PPTist-SourceCode/src/views/components/element)
- [`src/views/Screen/*`](../../PPTist-SourceCode/src/views/Screen)
- [`src/views/Mobile/*`](../../PPTist-SourceCode/src/views/Mobile)
- 你要知道：同一份 element 資料在主畫布、縮圖、放映、手機端是否使用同一套渲染邏輯。

### 7. 文字系統

- [`src/utils/prosemirror/*`](../../PPTist-SourceCode/src/utils/prosemirror)
- [`src/views/components/element/ProsemirrorEditor.vue`](../../PPTist-SourceCode/src/views/components/element/ProsemirrorEditor.vue)
- [`src/components/OutlineEditor.vue`](../../PPTist-SourceCode/src/components/OutlineEditor.vue)
- [`src/components/TextArea.vue`](../../PPTist-SourceCode/src/components/TextArea.vue)
- [`src/components/TextColorButton.vue`](../../PPTist-SourceCode/src/components/TextColorButton.vue)
- 你要知道：富文字內容怎麼編輯、怎麼存、怎麼套樣式。

### 8. 元素類型與樣式面板

- [`src/views/components/element/*`](../../PPTist-SourceCode/src/views/components/element)
- [`src/configs/element.ts`](../../PPTist-SourceCode/src/configs/element.ts)
- [`src/configs/shapes.ts`](../../PPTist-SourceCode/src/configs/shapes.ts)
- [`src/configs/lines.ts`](../../PPTist-SourceCode/src/configs/lines.ts)
- [`src/configs/chart.ts`](../../PPTist-SourceCode/src/configs/chart.ts)
- [`src/configs/latex.ts`](../../PPTist-SourceCode/src/configs/latex.ts)
- [`src/configs/imageClip.ts`](../../PPTist-SourceCode/src/configs/imageClip.ts)
- [`src/views/Editor/Panel`](../../PPTist-SourceCode/src/views/Editor/Panel)
- 你要知道：每種元素的資料、渲染、編輯面板與樣式更新責任在哪裡。

### 9. 頁面、主題、模板與動畫

- [`src/hooks/useSlideTheme.ts`](../../PPTist-SourceCode/src/hooks/useSlideTheme.ts)
- [`src/hooks/useSlideBackgroundStyle.ts`](../../PPTist-SourceCode/src/hooks/useSlideBackgroundStyle.ts)
- [`src/hooks/useSectionHandler.ts`](../../PPTist-SourceCode/src/hooks/useSectionHandler.ts)
- [`src/hooks/useAddSlidesOrElements.ts`](../../PPTist-SourceCode/src/hooks/useAddSlidesOrElements.ts)
- [`src/hooks/useLoadSlides.ts`](../../PPTist-SourceCode/src/hooks/useLoadSlides.ts)
- [`src/configs/theme.ts`](../../PPTist-SourceCode/src/configs/theme.ts)
- [`src/configs/storage.ts`](../../PPTist-SourceCode/src/configs/storage.ts)
- 你要知道：頁面怎麼管理、外觀怎麼套、模板怎麼載入、動畫資料怎麼保存。

### 10. 匯入、匯出、列印與資料持久化

- [`src/hooks/useImport.ts`](../../PPTist-SourceCode/src/hooks/useImport.ts)
- [`src/hooks/useExport.ts`](../../PPTist-SourceCode/src/hooks/useExport.ts)
- [`src/utils/print.ts`](../../PPTist-SourceCode/src/utils/print.ts)
- [`src/services/*`](../../PPTist-SourceCode/src/services)
- [`src/utils/database.ts`](../../PPTist-SourceCode/src/utils/database.ts)
- 你要知道：資料怎麼進出系統，哪些格式是完整支援，哪些只是近似支援。

### 11. 播放、預覽與演講者工具

- [`src/views/Screen/*`](../../PPTist-SourceCode/src/views/Screen)
- [`src/hooks/useScreening.ts`](../../PPTist-SourceCode/src/hooks/useScreening.ts)
- [`src/utils/fullscreen.ts`](../../PPTist-SourceCode/src/utils/fullscreen.ts)
- [`src/components/WritingBoard.vue`](../../PPTist-SourceCode/src/components/WritingBoard.vue)
- 你要知道：如何進入放映、如何控制播放、如何做批註與演講者視圖。

### 12. 手機端

- [`src/views/Mobile/*`](../../PPTist-SourceCode/src/views/Mobile)
- [`src/views/Mobile/MobileEditor/*`](../../PPTist-SourceCode/src/views/Mobile/MobileEditor)
- 你要知道：手機端保留了哪些能力，省略了哪些能力，以及哪些邏輯和桌面端共用。

### 13. AI PPT

- [`src/hooks/useAIPPT.ts`](../../PPTist-SourceCode/src/hooks/useAIPPT.ts)
- [`src/types/AIPPT.ts`](../../PPTist-SourceCode/src/types/AIPPT.ts)
- [`public/mocks/AIPPT*.json`](../../PPTist-SourceCode/public/mocks)
- [`public/mocks/AIPPT_Outline.md`](../../PPTist-SourceCode/public/mocks/AIPPT_Outline.md)
- [`doc/AIPPT.md`](../../PPTist-SourceCode/doc/AIPPT.md)
- 你要知道：AI 如何參與大綱、模板、內容與圖片替換。

### 14. 快捷鍵、右鍵選單與效率工具

- [`src/hooks/useGlobalHotkey.ts`](../../PPTist-SourceCode/src/hooks/useGlobalHotkey.ts)
- [`src/hooks/usePasteEvent.ts`](../../PPTist-SourceCode/src/hooks/usePasteEvent.ts)
- [`src/hooks/usePasteTextClipboardData.ts`](../../PPTist-SourceCode/src/hooks/usePasteTextClipboardData.ts)
- [`src/hooks/useSearch.ts`](../../PPTist-SourceCode/src/hooks/useSearch.ts)
- [`src/hooks/useLink.ts`](../../PPTist-SourceCode/src/hooks/useLink.ts)
- [`src/hooks/useTextFormatPainter.ts`](../../PPTist-SourceCode/src/hooks/useTextFormatPainter.ts)
- [`src/hooks/useShapeFormatPainter.ts`](../../PPTist-SourceCode/src/hooks/useShapeFormatPainter.ts)
- [`src/hooks/useUniformDisplayElement.ts`](../../PPTist-SourceCode/src/hooks/useUniformDisplayElement.ts)
- 你要知道：哪些是功能核心，哪些是提高效率和一致性的體驗層。

### 15. 自訂與擴充

- [`src/plugins/*`](../../PPTist-SourceCode/src/plugins)
- [`src/plugins/directive/*`](../../PPTist-SourceCode/src/plugins/directive)
- [`doc/CustomElement.md`](../../PPTist-SourceCode/doc/CustomElement.md)
- [`src/components/*`](../../PPTist-SourceCode/src/components)
- 你要知道：怎麼擴充元素、指令、元件與產品能力。

### 16. 效能、限制與二次開發注意事項

- [`src/hooks/useHistorySnapshot.ts`](../../PPTist-SourceCode/src/hooks/useHistorySnapshot.ts)
- [`src/views/components/ThumbnailSlide/*`](../../PPTist-SourceCode/src/views/components/ThumbnailSlide)
- [`src/utils/database.ts`](../../PPTist-SourceCode/src/utils/database.ts)
- [`src/hooks/useExport.ts`](../../PPTist-SourceCode/src/hooks/useExport.ts)
- [`src/hooks/useImport.ts`](../../PPTist-SourceCode/src/hooks/useImport.ts)
- 你要知道：大型簡報、圖片資源、縮圖渲染、歷史快照、匯入匯出和二次開發的成本在哪裡。

---

## 建議每章固定筆記格式

每一章建議都用同一種格式，後面回查會比較快。

```md
# 章節名稱

## 這章解決什麼問題

## 對應原始碼

## 核心流程

## 關鍵資料結構

## 重要 hooks / components / store

## 一次操作的完整流向

## 容易誤解的地方

## 我能不能自己做出簡化版
```

---

## 學習層級

### 第一輪：主線理解

- 先把 `00` 到 `08` 讀完
- 目標：能說清楚入口、資料、store、畫布、元素操作、縮圖與多場景渲染

### 第二輪：功能完整性

- 補 `09` 到 `15`
- 目標：能說清楚文字、元素、頁面、模板、匯入匯出、播放、手機端與 AI

### 第三輪：操作流與二次開發

- 補 `16` 到 `18`
- 回頭對照 `PPTist-SourceCode` 的 `README_zh.md`、`doc/DirectoryAndData.md`、`doc/Canvas.md`、`doc/CustomElement.md`、`doc/AIPPT.md`、`doc/Q&A.md`
- 目標：把「知道有什麼」變成「知道怎麼做出來」

---

## 對照文件

- [`PPTist-SourceCode/README_zh.md`](../../PPTist-SourceCode/README_zh.md)
- [`PPTist-SourceCode/doc/DirectoryAndData.md`](../../PPTist-SourceCode/doc/DirectoryAndData.md)
- [`PPTist-SourceCode/doc/Canvas.md`](../../PPTist-SourceCode/doc/Canvas.md)
- [`PPTist-SourceCode/doc/CustomElement.md`](../../PPTist-SourceCode/doc/CustomElement.md)
- [`PPTist-SourceCode/doc/AIPPT.md`](../../PPTist-SourceCode/doc/AIPPT.md)
- [`PPTist-SourceCode/doc/Q&A.md`](../../PPTist-SourceCode/doc/Q%26A.md)

---

## 這份地圖的使用原則

- `00-總覽` 是第一章，不是主索引
- `README.md` 是主索引，不是單一章節內容
- 主線負責順序，功能索引負責完整性
- 不要把「閱讀順序」和「功能總表」混在同一層，否則很快會失去導航性
- 每一章最好都能回答：「這章處理哪一類使用者操作？它修改了哪份資料？它如何觸發畫面更新？它是否需要 snapshot？」
