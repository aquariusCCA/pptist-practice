# PPTist Learning Map

這份地圖的目的不是只列章節，而是把 `PPTist` 拆成可學習、可追蹤、可回查的模組樹。

如果你的目標是「完整掌握 PPTist」，建議把它理解成三層：

1. 先掌握資料和狀態怎麼流
2. 再掌握編輯器、畫布、元素怎麼互動
3. 最後掌握播放、匯入匯出、手機端、AI、擴充機制

## 閱讀順序

先走主線，再補功能索引。

1. [00-總覽](./00-%E7%B8%BD%E8%A6%BD/README.md)
2. [01-資料模型](./01-%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B/README.md)
3. [02-編輯器骨架](./02-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%AA%A8%E6%9E%B6/README.md)
4. [03-畫布系統](./03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/README.md)
5. [04-縮圖系統](./04-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/README.md)
6. [05-store與狀態流](./05-store%E8%88%87%E7%8B%80%E6%85%8B%E6%B5%81/README.md)
7. [06-匯入匯出](./06-%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA/README.md)
8. [07-播放與預覽](./07-%E6%92%AD%E6%94%BE%E8%88%87%E9%A0%90%E8%A6%BD/README.md)
9. [08-文字系統](./08-%E6%96%87%E5%AD%97%E7%B3%BB%E7%B5%B1/README.md)
10. [09-元素系統](./09-%E5%85%83%E7%B4%A0%E7%B3%BB%E7%B5%B1/README.md)
11. [10-頁面與演示](./10-%E9%A0%81%E9%9D%A2%E8%88%87%E6%BC%94%E7%A4%BA/README.md)
12. [11-手機端](./11-%E6%89%8B%E6%A9%9F%E7%AB%AF/README.md)
13. [12-匯入匯出與 AI](./12-%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA%E8%88%87-AI/README.md)
14. [13-擴充與體驗](./13-%E6%93%B4%E5%85%85%E8%88%87%E9%AB%94%E9%A9%97/README.md)

## 學習主線

### 1. 先建立整體認知
先回答「PPTist 是什麼、不是什麼、由哪些模式組成」。
- 要看：[`00-總覽`](./00-%E7%B8%BD%E8%A6%BD/README.md)
- 要懂：
  - 產品定位
  - 桌面編輯 / 播放預覽 / 手機端三種使用情境
  - 這份筆記的主線與功能索引怎麼配合

### 2. 再看資料長什麼樣
先搞懂資料結構，後面所有章節才有共同語言。
- 要看：[`01-資料模型`](./01-%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B/README.md)
- 要懂：
  - slide、element、theme、template、viewport、history
  - store 如何保存與更新資料
  - 為什麼這些資料要固定成特定格式

### 3. 接著看編輯器怎麼組起來
把資料、工具列、畫布、縮圖、側欄串成一個工作區。
- 要看：[`02-編輯器骨架`](./02-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%AA%A8%E6%9E%B6/README.md)
- 要懂：
  - 編輯器的入口與頁面結構
  - 左右欄、畫布區、工具區如何協作
  - 哪些能力是頁面框架，哪些能力是編輯功能

### 4. 然後進入畫布與互動核心
這是 `PPTist` 的核心操作層。
- 要看：[`03-畫布系統`](./03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/README.md) 和 [`04-縮圖系統`](./04-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/README.md)
- 要懂：
  - 固定座標與縮放怎麼換算
  - 元素如何選取、拖曳、縮放、旋轉
  - 縮圖如何跟主畫面同步

### 5. 再把狀態流補起來
知道畫面怎麼變之後，要知道資料是怎麼被記錄與回復的。
- 要看：[`05-store與狀態流`](./05-store%E8%88%87%E7%8B%80%E6%85%8B%E6%B5%81/README.md)
- 要懂：
  - Pinia store 在整個系統中的角色
  - undo / redo、歷史快照怎麼做
  - 哪些操作是直接改資料，哪些要經過事件或 snapshot

### 6. 最後補資料進出與播放輸出
理解內容如何進來、如何出去、如何被展示。
- 要看：[`06-匯入匯出`](./06-%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA/README.md) 和 [`07-播放與預覽`](./07-%E6%92%AD%E6%94%BE%E8%88%87%E9%A0%90%E8%A6%BD/README.md)
- 要懂：
  - 匯入、匯出、列印的取捨
  - 放映流程與演示模式
  - 這些輸出能力如何反推前面的資料與元素設計

### 7. 再擴展到完整功能面
主線看完後，再回來補完整功能群。
- 要看：[`08-文字系統`](./08-%E6%96%87%E5%AD%97%E7%B3%BB%E7%B5%B1/README.md) 到 [`13-擴充與體驗`](./13-%E6%93%B4%E5%85%85%E8%88%87%E9%AB%94%E9%A9%97/README.md)
- 要懂：
  - 文字、元素、頁面、手機端、AI、自訂擴充、體驗層
  - 這些功能不是獨立存在，而是建立在前面主線之上

## 完整模組地圖

### 1. 整體入口
- [`src/main.ts`](../../PPTist-SourceCode/src/main.ts)
- [`src/App.vue`](../../PPTist-SourceCode/src/App.vue)
- [`src/views/Editor`](../../PPTist-SourceCode/src/views)
- [`src/views/Screen`](../../PPTist-SourceCode/src/views/Screen)
- [`src/views/Mobile`](../../PPTist-SourceCode/src/views/Mobile)
- 你要知道：桌面編輯、播放、手機端怎麼分工。

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

### 3. 編輯器與畫布互動
- [`src/hooks/useScaleCanvas.ts`](../../PPTist-SourceCode/src/hooks/useScaleCanvas.ts)
- [`src/hooks/useSlideHandler.ts`](../../PPTist-SourceCode/src/hooks/useSlideHandler.ts)
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

### 4. 文字系統
- [`src/utils/prosemirror/*`](../../PPTist-SourceCode/src/utils/prosemirror)
- [`src/views/components/element/ProsemirrorEditor.vue`](../../PPTist-SourceCode/src/views/components/element/ProsemirrorEditor.vue)
- [`src/components/OutlineEditor.vue`](../../PPTist-SourceCode/src/components/OutlineEditor.vue)
- [`src/components/TextArea.vue`](../../PPTist-SourceCode/src/components/TextArea.vue)
- [`src/components/TextColorButton.vue`](../../PPTist-SourceCode/src/components/TextColorButton.vue)
- 你要知道：富文字內容怎麼編輯、怎麼存、怎麼套樣式。

### 5. 元素類型系統
- [`src/views/components/element/*`](../../PPTist-SourceCode/src/views/components/element)
- [`src/configs/element.ts`](../../PPTist-SourceCode/src/configs/element.ts)
- [`src/configs/shapes.ts`](../../PPTist-SourceCode/src/configs/shapes.ts)
- [`src/configs/lines.ts`](../../PPTist-SourceCode/src/configs/lines.ts)
- [`src/configs/chart.ts`](../../PPTist-SourceCode/src/configs/chart.ts)
- [`src/configs/latex.ts`](../../PPTist-SourceCode/src/configs/latex.ts)
- [`src/configs/imageClip.ts`](../../PPTist-SourceCode/src/configs/imageClip.ts)
- [`src/utils/element.ts`](../../PPTist-SourceCode/src/utils/element.ts)
- 你要知道：每種元素的資料、渲染和編輯責任在哪裡。

### 6. 頁面、主題、模板、縮圖
- [`src/hooks/useSlideTheme.ts`](../../PPTist-SourceCode/src/hooks/useSlideTheme.ts)
- [`src/hooks/useSlideBackgroundStyle.ts`](../../PPTist-SourceCode/src/hooks/useSlideBackgroundStyle.ts)
- [`src/hooks/useSectionHandler.ts`](../../PPTist-SourceCode/src/hooks/useSectionHandler.ts)
- [`src/hooks/useAddSlidesOrElements.ts`](../../PPTist-SourceCode/src/hooks/useAddSlidesOrElements.ts)
- [`src/hooks/useLoadSlides.ts`](../../PPTist-SourceCode/src/hooks/useLoadSlides.ts)
- [`src/configs/theme.ts`](../../PPTist-SourceCode/src/configs/theme.ts)
- [`src/configs/storage.ts`](../../PPTist-SourceCode/src/configs/storage.ts)
- [`src/views/components/ThumbnailSlide/*`](../../PPTist-SourceCode/src/views/components/ThumbnailSlide)
- 你要知道：頁面怎麼管理、外觀怎麼套、縮圖怎麼同步。

### 7. 播放與簡報模式
- [`src/views/Screen/*`](../../PPTist-SourceCode/src/views/Screen)
- [`src/hooks/useScreening.ts`](../../PPTist-SourceCode/src/hooks/useScreening.ts)
- [`src/utils/fullscreen.ts`](../../PPTist-SourceCode/src/utils/fullscreen.ts)
- [`src/utils/print.ts`](../../PPTist-SourceCode/src/utils/print.ts)
- [`src/components/WritingBoard.vue`](../../PPTist-SourceCode/src/components/WritingBoard.vue)
- 你要知道：如何進入放映、如何控制播放、如何做批註與演講者視圖。

### 8. 手機端
- [`src/views/Mobile/*`](../../PPTist-SourceCode/src/views/Mobile)
- [`src/views/Mobile/MobileEditor/*`](../../PPTist-SourceCode/src/views/Mobile/MobileEditor)
- 你要知道：手機端保留了哪些能力，省略了哪些能力。

### 9. 匯入、匯出、列印
- [`src/hooks/useImport.ts`](../../PPTist-SourceCode/src/hooks/useImport.ts)
- [`src/hooks/useExport.ts`](../../PPTist-SourceCode/src/hooks/useExport.ts)
- [`src/utils/print.ts`](../../PPTist-SourceCode/src/utils/print.ts)
- [`src/services/*`](../../PPTist-SourceCode/src/services)
- [`src/utils/database.ts`](../../PPTist-SourceCode/src/utils/database.ts)
- 你要知道：資料怎麼進出系統，哪些格式是完整支援，哪些只是近似支援。

### 10. AI PPT
- [`src/hooks/useAIPPT.ts`](../../PPTist-SourceCode/src/hooks/useAIPPT.ts)
- [`src/types/AIPPT.ts`](../../PPTist-SourceCode/src/types/AIPPT.ts)
- [`public/mocks/AIPPT*.json`](../../PPTist-SourceCode/public/mocks)
- [`public/mocks/AIPPT_Outline.md`](../../PPTist-SourceCode/public/mocks/AIPPT_Outline.md)
- [`doc/AIPPT.md`](../../PPTist-SourceCode/doc/AIPPT.md)
- 你要知道：AI 如何參與大綱、模板、內容與圖片替換。

### 11. 自訂與擴充
- [`src/plugins/*`](../../PPTist-SourceCode/src/plugins)
- [`src/plugins/directive/*`](../../PPTist-SourceCode/src/plugins/directive)
- [`doc/CustomElement.md`](../../PPTist-SourceCode/doc/CustomElement.md)
- [`src/components/*`](../../PPTist-SourceCode/src/components)
- 你要知道：怎麼擴充元素、指令、元件與產品能力。

### 12. 體驗與效率工具
- [`src/hooks/useSearch.ts`](../../PPTist-SourceCode/src/hooks/useSearch.ts)
- [`src/hooks/useGlobalHotkey.ts`](../../PPTist-SourceCode/src/hooks/useGlobalHotkey.ts)
- [`src/hooks/usePasteEvent.ts`](../../PPTist-SourceCode/src/hooks/usePasteEvent.ts)
- [`src/hooks/usePasteTextClipboardData.ts`](../../PPTist-SourceCode/src/hooks/usePasteTextClipboardData.ts)
- [`src/hooks/useLink.ts`](../../PPTist-SourceCode/src/hooks/useLink.ts)
- [`src/hooks/useTextFormatPainter.ts`](../../PPTist-SourceCode/src/hooks/useTextFormatPainter.ts)
- [`src/hooks/useShapeFormatPainter.ts`](../../PPTist-SourceCode/src/hooks/useShapeFormatPainter.ts)
- [`src/hooks/useUniformDisplayElement.ts`](../../PPTist-SourceCode/src/hooks/useUniformDisplayElement.ts)
- 你要知道：哪些是功能核心，哪些是提高效率和一致性的體驗層。

## 學習層級

### 第一輪
- 先把 `01` 到 `08` 讀完
- 目標：能說清楚資料、畫布、元素、播放、匯入匯出

### 第二輪
- 補 `09` 到 `13`
- 目標：能說清楚 `PPTist` 的完整功能面與擴充方式

### 第三輪
- 回頭對照 `PPTist-SourceCode` 的 `README_zh.md`、`doc/DirectoryAndData.md`、`doc/Canvas.md`、`doc/Q&A.md`
- 目標：把「知道有什麼」變成「知道怎麼做出來」

## 對照文件

- [`PPTist-SourceCode/README_zh.md`](../../PPTist-SourceCode/README_zh.md)
- [`PPTist-SourceCode/doc/DirectoryAndData.md`](../../PPTist-SourceCode/doc/DirectoryAndData.md)
- [`PPTist-SourceCode/doc/Canvas.md`](../../PPTist-SourceCode/doc/Canvas.md)
- [`PPTist-SourceCode/doc/CustomElement.md`](../../PPTist-SourceCode/doc/CustomElement.md)
- [`PPTist-SourceCode/doc/AIPPT.md`](../../PPTist-SourceCode/doc/AIPPT.md)
- [`PPTist-SourceCode/doc/Q&A.md`](../../PPTist-SourceCode/doc/Q%26A.md)

## 這份地圖的使用原則

- `00-總覽` 是第一章，不是主索引
- `README.md` 是主索引，不是單一章節內容
- 主線負責順序，功能索引負責完整性
- 不要把「閱讀順序」和「功能總表」混在同一層，否則很快會失去導航性
