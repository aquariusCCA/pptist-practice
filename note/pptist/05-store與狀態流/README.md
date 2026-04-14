# 05-Store 與狀態流

這一章的目標不是背 Pinia 語法，而是看懂 `PPTist` 的狀態是怎麼分層、怎麼流動、又是怎麼被各個畫面消費的。

如果你已經理解了 `03-畫布系統` 和 `04-縮圖系統`，那現在就要把「視圖如何運作」接回「資料從哪裡來、何時改、改完誰會跟著變」。

## 這一章要先抓住的結論

- `slides store` 是文件本體，存投影片資料與目前頁面。
- `main store` 是編輯器 UI 狀態，存選取、面板、工具列、快捷鍵、畫布互動狀態。
- `snapshot store` 是歷史紀錄，負責 Undo / Redo。
- `screen store` 管播放或預覽模式的開關。
- `keyboard store` 管按鍵狀態，讓拖曳、複選、空白鍵等互動可以共用。

最重要的一句話是：

- `slides store` 管「內容」
- `main store` 管「操作內容時的狀態」
- `snapshot store` 管「內容變更歷史」

這三個分開之後，畫布、縮圖、工具列、預覽、匯入匯出才有辦法共用同一份資料，而不會互相打架。

## 建議閱讀順序

1. `src/store/slides.ts`
2. `src/store/main.ts`
3. `src/store/snapshot.ts`
4. `src/App.vue`
5. `src/hooks/useLoadSlides.ts`

這個順序是從「資料核心」走到「啟動流程」，比較容易建立完整心智模型。

## 整體架構

`PPTist` 的狀態可以粗分成兩類。

- 文件狀態：投影片內容、元素、主題、版面、模板。
- 互動狀態：選取狀態、當前工具、畫布縮放、面板是否開啟、是否正在輸入。

文件狀態要求穩定，因為它會被匯出、儲存、還原、播放。
互動狀態要求即時，因為它跟滑鼠、鍵盤、面板、快捷鍵高度相關。

這也是為什麼 `PPTist` 沒把所有東西塞進單一 store。

## `slides store`：文件本體

檔案位置：[`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)

### 它負責什麼

- 存整份簡報的標題、主題、投影片列表。
- 存目前所在的投影片索引 `slideIndex`。
- 存畫布基準尺寸 `viewportSize` 與比例 `viewportRatio`。
- 存模板列表 `templates`。
- 提供所有會改動投影片內容的 action。

### 核心 state

- `title`：簡報標題。
- `theme`：全域主題，例如配色、字體、背景、陰影、外框。
- `slides`：投影片陣列。
- `slideIndex`：目前正在編輯哪一張。
- `viewportSize`：畫布的基準寬度。
- `viewportRatio`：畫布比例，常見值是 `16:9` 的 `0.5625`。
- `templates`：主題模板資料。

### 核心 getter

- `currentSlide`：直接回傳目前投影片。
- `currentSlideAnimations`：只取目前投影片中，仍對應有效元素的動畫。
- `formatedAnimations`：把動畫整理成播放時比較好用的結構。

這裡有一個很實用的設計：

- 投影片上的元素會變動。
- 動畫資料可能還留著舊元素 id。
- getter 先過濾掉不再存在的元素，再提供播放端使用。

也就是說，`getter` 不只是「讀資料」，也在做「資料清理與轉譯」。

### 核心 action

- `setTitle`
- `setTheme`
- `setViewportSize`
- `setViewportRatio`
- `setSlides`
- `setTemplates`
- `addSlide`
- `updateSlide`
- `removeSlideProps`
- `deleteSlide`
- `updateSlideIndex`
- `addElement`
- `deleteElement`
- `updateElement`
- `removeElementProps`

### 你要特別理解的幾個行為

- `addSlide` 會把新投影片插到目前頁面後面，並把 `slideIndex` 移到新頁。
- `deleteSlide` 會處理 section 標記的轉移，避免章節結構被刪壞。
- `updateSlide` 是整張投影片層級的更新。
- `updateElement` 是單個或多個元素的更新。
- `removeElementProps` 與 `removeSlideProps` 會把特定欄位從物件上移除，不只是設成 `undefined`。

### 這個 store 的學習重點

- 這裡是「文件資料」的唯一主要入口。
- 大多數編輯操作最後都會落到 `slidesStore.updateSlide(...)` 或 `slidesStore.updateElement(...)`。
- 畫布上的變化、縮圖上的選頁、工具列上的格式調整，本質上都在改同一份 `slides`。

## `main store`：編輯器互動狀態

檔案位置：[`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)

### 它負責什麼

- 管元素選取狀態。
- 管畫布互動狀態。
- 管工具列與側邊面板。
- 管快捷鍵與輸入相關旗標。
- 管某些只存在於編輯器介面的暫時狀態。

### 核心 state

這個 store 的欄位很多，但可以分成幾組看。

- 選取相關：`activeElementIdList`、`handleElementId`、`activeGroupElementId`、`hiddenElementIdList`
- 畫布相關：`canvasPercentage`、`canvasScale`、`canvasDragged`、`gridLineSize`、`showRuler`
- 鍵盤與焦點：`thumbnailsFocus`、`editorAreaFocus`、`disableHotkeys`
- 操作狀態：`creatingElement`、`creatingCustomShape`、`isScaling`、`clipingImageElementId`
- 內容格式：`richTextAttrs`、`selectedTableCells`
- 輔助工具：`toolbarState`、`textFormatPainter`、`shapeFormatPainter`
- 面板顯示：`showSelectPanel`、`showSearchPanel`、`showNotesPanel`、`showSymbolPanel`、`showMarkupPanel`、`showAIPPTDialog`
- 匯出與資料庫：`dialogForExport`、`databaseId`

### 核心 getter

- `activeElementList`：根據 `activeElementIdList`，從目前投影片抓出對應元素。
- `handleElement`：根據 `handleElementId`，找出目前被操作的單一元素。

這兩個 getter 很重要，因為它們把「UI 選取狀態」和「真正的元素資料」連起來。

### 為什麼 `handleElementId` 和 `activeElementIdList` 要分開

- `activeElementIdList` 代表目前多選到哪些元素。
- `handleElementId` 代表目前主要操作對象。
- 當只選到一個元素時，兩者通常一致。
- 當多選時，`activeElementIdList` 會有多筆，但 `handleElementId` 可能是空字串或維持主要控制對象。

這樣設計的原因是：

- 框選、Ctrl 多選、群組編輯、快捷鍵操作，需求不一樣。
- 有些工具需要「多個元素集合」。
- 有些工具只需要「一個主要元素」。

### 核心 action

- `setActiveElementIdList`
- `setHandleElementId`
- `setActiveGroupElementId`
- `setHiddenElementIdList`
- `setCanvasPercentage`
- `setCanvasScale`
- `setCanvasDragged`
- `setThumbnailsFocus`
- `setEditorareaFocus`
- `setDisableHotkeysState`
- `setGridLineSize`
- `setRulerState`
- `setCreatingElement`
- `setCreatingCustomShapeState`
- `setToolbarState`
- `setClipingImageElementId`
- `setRichtextAttrs`
- `setSelectedTableCells`
- `setScalingState`
- `updateSelectedSlidesIndex`
- `setDialogForExport`
- `setTextFormatPainter`
- `setShapeFormatPainter`
- `setSelectPanelState`
- `setSearchPanelState`
- `setNotesPanelState`
- `setSymbolPanelState`
- `setMarkupPanelState`
- `setAIPPTDialogState`

### 這個 store 的學習重點

- 它不是投影片資料庫。
- 它是「編輯器當下正在發生什麼事」的狀態櫃。
- 只要是會讓畫布、工具列、面板、快捷鍵需要同步的資訊，大多都會在這裡。

## `snapshot store`：Undo / Redo 歷史

檔案位置：[`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)

### 它負責什麼

- 維護歷史快照的游標。
- 維護快照總長度。
- 把投影片狀態存進 IndexedDB。
- Undo / Redo 時把狀態從 IndexedDB 還原回來。

### 核心 state

- `snapshotCursor`：目前停在哪一筆快照。
- `snapshotLength`：快照總數。

### 核心 getter

- `canUndo`
- `canRedo`

### 核心 action

- `setSnapshotCursor`
- `setSnapshotLength`
- `initSnapshotDatabase`
- `addSnapshot`
- `unDo`
- `reDo`

### 這個 store 最重要的觀念

`PPTist` 的 Undo / Redo 不是只記錄差異，而是保存整份投影片狀態快照。

也就是說：

- 每次需要紀錄歷史時，會把 `slidesStore.slides` 深拷貝後存入資料庫。
- Undo / Redo 時，直接把整份 `slides` 與 `slideIndex` 還原。

這種做法的優點是實作直觀，還原穩定。
代價是資料量較大，所以它有快照上限與裁切邏輯。

### `initSnapshotDatabase`

- 首次建立快照資料。
- 會把目前畫面的投影片與索引存成第一筆快照。
- 之後 `snapshotCursor = 0`，`snapshotLength = 1`。

### `addSnapshot`

這是歷史機制的核心。

- 先讀出所有現有快照 key。
- 如果目前游標不在最後，代表使用者曾經 Undo 過，這時候要刪掉游標後面的分支歷史。
- 再新增當前狀態為新快照。
- 若快照數超過上限，會刪掉最舊的資料。
- 最後更新游標與長度。

你可以把它理解成：

- Undo 後再做新操作，舊的未來分支會被截斷。
- 這和一般編輯器的歷史模型一致。

### `unDo` 與 `reDo`

- 先確認游標是否可移動。
- 從 IndexedDB 讀出對應快照。
- 還原 `slidesStore.setSlides(...)`。
- 還原 `slideIndex`。
- 清空 `mainStore.activeElementIdList`。

這裡值得注意的是：

- 還原內容之後，選取狀態不能沿用舊的。
- 否則元素 id 可能對得上，但 UI 狀態會不一致。

## `screen store`：播放模式開關

檔案位置：[`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)

這個 store 很單純。

- `screening`：目前是不是進入播放或預覽模式。
- `setScreening`：切換狀態。

它的角色是模式切換，不是核心資料。

## `keyboard store`：鍵盤狀態

檔案位置：[`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)

### 它負責什麼

- 記住 Ctrl、Shift、Space 是否按下。
- 提供 `ctrlOrShiftKeyActive` 這種組合型 getter。

### 為什麼要獨立出來

因為很多操作都需要共用按鍵狀態，例如：

- 多選元素
- 拖曳輔助
- 縮放或平移
- 快捷鍵判斷

如果把這些邏輯散在各個元件裡，整個編輯器會很難維護。

## `App.vue`：啟動流程入口

檔案位置：[`src/App.vue`](../../../PPTist-SourceCode/src/App.vue)

### 啟動順序

1. `main.ts` 建立 Vue app。
2. `createPinia()` 掛上 Pinia。
3. `App.vue` `onMounted` 時，先取得 mock slides。
4. `slidesStore.setSlides(slides)`。
5. 刪除過期的資料庫。
6. `snapshotStore.initSnapshotDatabase()`。

### 這裡代表什麼

- 一開始先把文件資料塞進 `slides store`。
- 然後再建立歷史快照。
- 所以「文件內容」是先存在，Undo / Redo 才有意義。

## `useLoadSlides`：大量投影片分批載入

檔案位置：[`src/hooks/useLoadSlides.ts`](../../../PPTist-SourceCode/src/hooks/useLoadSlides.ts)

這個 hook 不是資料庫，而是載入策略。

### 它在做什麼

- 監聽目前 `slides` 長度。
- 如果投影片數超過門檻，就分批提高 `slidesLoadLimit`。
- 讓大量投影片不要一次全量渲染。

### 你可以把它理解成

- `slides store` 提供資料。
- `useLoadSlides` 控制渲染節奏。

這是典型的「資料層」和「呈現層」分離。

## 實際狀態流：幾個最常見的場景

### 1. 啟動簡報

- `App.vue` 先載入投影片。
- `slidesStore` 收到初始資料。
- `snapshotStore` 建立第一筆快照。

### 2. 點選投影片元素

- 畫布或縮圖事件更新 `mainStore.activeElementIdList`。
- `mainStore.handleElementId` 會跟著更新或被 getter 消費。
- `mainStore.activeElementList` 與 `mainStore.handleElement` 會從 `slidesStore.currentSlide` 找到實際資料。

### 3. 修改元素屬性

- 例如改文字、顏色、陰影、外框、透明度。
- 元件或工具列最後都會呼叫 `slidesStore.updateElement(...)`。
- 如果是結構性變動，可能會改 `updateSlide(...)`。
- 若需要保留歷史，就再呼叫 `snapshotStore.addSnapshot()`。

### 4. 新增或刪除元素

- 新增元素通常走 `slidesStore.addElement(...)`。
- 刪除元素通常走 `slidesStore.deleteElement(...)`。
- 這些動作都在 `slides store` 裡完成，其他元件只負責發送操作意圖。

### 5. Undo / Redo

- 先從 `snapshot store` 找到前一筆或下一筆快照。
- 再把整份 `slides` 還原回去。
- 同時清空選取狀態。

### 6. 匯入簡報

- 匯入流程常會直接更新 `slidesStore.setSlides(...)`。
- 若匯入的是完整投影片資料，也可能同步更新 `theme`、`viewportSize`。
- 之後依需要重新初始化快照。

## 最容易混淆的幾組欄位

### `slideIndex` vs `currentSlide`

- `slideIndex` 是數字索引。
- `currentSlide` 是由 getter 算出來的當前投影片物件。

### `viewportSize` vs `viewportRatio`

- `viewportSize` 是基準寬度。
- `viewportRatio` 是高寬比例。

### `activeElementIdList` vs `handleElementId`

- `activeElementIdList` 是目前選到的所有元素 id。
- `handleElementId` 是目前主要操作的元素 id。

### `slides` vs `main`

- `slides` 是內容。
- `main` 是編輯器狀態。

### `snapshotCursor` vs `snapshotLength`

- `snapshotCursor` 是現在站在哪一筆。
- `snapshotLength` 是總共有幾筆。

## 學習這一章時要建立的心智模型

你可以把整個 `PPTist` 想成三層。

### 第一層：文件層

- `slides store`
- 保存簡報本體

### 第二層：互動層

- `main store`
- 保存目前編輯器在做什麼

### 第三層：歷史層

- `snapshot store`
- 保存過去發生過什麼

在這三層之上，還有模式輔助狀態：

- `screen store`
- `keyboard store`

這樣分層後，畫布、縮圖、工具列、匯入匯出、播放預覽，才可以各自只關心自己那一層。

## 你讀程式碼時可以直接對照的檔案

- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)
- [`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/App.vue`](../../../PPTist-SourceCode/src/App.vue)
- [`src/hooks/useLoadSlides.ts`](../../../PPTist-SourceCode/src/hooks/useLoadSlides.ts)

## 一句話總結

`PPTist` 的狀態流不是「元件直接互相傳值」，而是：

- 元件發出操作意圖
- store 統一更新資料
- getter 轉出可消費狀態
- 畫布、縮圖、工具列、播放畫面自動跟著同步

如果你把這章看懂，後面讀 `02-編輯器骨架`、`06-匯入匯出`、`07-播放與預覽` 會順很多。
