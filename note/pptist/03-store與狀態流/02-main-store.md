# main store

`main store` 是 PPTist 中「編輯器互動狀態」的中心。

它主要負責：

- 記錄目前選取哪些元素
- 記錄目前主要操作中的元素
- 記錄畫布縮放、拖曳、焦點與快捷鍵狀態
- 記錄工具列、面板、格式刷、表格選取等 UI 狀態
- 提供 getter，把「選取 ID」轉成目前頁面中的實際元素資料

這一篇不是重複 `MainState` 每個欄位的完整語義，而是整理 `src/store/main.ts` 如何保存互動狀態，以及它如何和 `slides store` 一起形成編輯器狀態流。

---

## 一句話理解

`main store` 管的是「使用者正在怎麼操作編輯器」。

也就是：

```ts
activeElementIdList
handleElementId
canvasScale
canvasDragged
toolbarState
showSelectPanel
showSearchPanel
showNotesPanel
showImageLibPanel
showAIPPTDialog
```

其中最重要的是：

```ts
activeElementIdList + handleElementId
```

`activeElementIdList` 代表目前被選取的元素 ID 集合。  
`handleElementId` 代表目前主要操作中的元素 ID。

真正的元素內容不在 `main store`，而是在：

```ts
slidesStore.currentSlide.elements
```

所以 `main store` 的核心不是保存內容，而是保存「目前操作狀態」。

---

## 責任邊界

### 它負責什麼

`main store` 負責編輯器互動狀態：

- 元素選取狀態
- 主要操作元素
- 群組內部操作元素
- 隱藏元素 ID
- 畫布縮放比例與拖曳狀態
- 編輯區、縮圖區焦點
- 快捷鍵是否禁用
- 網格線、標尺
- 正在建立的元素
- 正在繪製的自訂形狀
- 右側工具列狀態
- 圖片裁切狀態
- 元素縮放中狀態
- 富文本目前屬性
- 表格儲存格選取狀態
- 多頁選取狀態
- 匯出對話框狀態
- 格式刷狀態
- 各種面板開關
- AI PPT 對話框狀態

### 它不負責什麼

`main store` 不負責：

- 簡報標題
- 簡報主題
- 頁面資料
- 元素實際內容
- 元素實際位置、尺寸、文字、樣式
- 動畫資料
- undo / redo 快照保存
- Ctrl / Shift / Space 按鍵狀態
- 是否進入播放模式

這些分別屬於：

| 狀態 | 負責 store |
|---|---|
| 簡報內容、頁面、元素、動畫 | `slides store` |
| undo / redo、快照游標、IndexedDB 快照 | `snapshot store` |
| Ctrl / Shift / Space 按鍵 | `keyboard store` |
| 播放模式 | `screen store` |

---

## 核心心智模型

讀 `main store` 時，要先建立一個觀念：

> `main store` 通常只保存「ID」與「狀態旗標」，不保存真正內容。

例如：

```ts
activeElementIdList: string[]
handleElementId: string
hiddenElementIdList: string[]
```

這些都只是 ID。  
真正的元素資料仍然在 `slides store`：

```txt
slidesStore.currentSlide.elements
```

所以狀態流通常是：

```txt
使用者操作
→ main store 記錄目前操作狀態
→ getter 根據 slides store 取出實際元素
→ component / hook 根據結果更新 UI 或修改 slides store
```

也就是：

```txt
main store = 操作狀態
slides store = 內容資料
```

---

## state 分類

`MainState` 欄位很多，但可以分成 8 類看。

---

### 1. 選取與操作元素

| state | 用途 | 原始碼閱讀重點 |
|---|---|---|
| `activeElementIdList` | 目前被選取的元素 ID 集合 | 多選時會有多個 ID |
| `handleElementId` | 目前主要操作中的元素 ID | 單選時通常等於被選取元素 ID |
| `activeGroupElementId` | 群組元素內部目前可獨立操作的成員 ID | 移動群組內成員時會優先使用 |
| `hiddenElementIdList` | 被隱藏的元素 ID 集合 | 選取邏輯會避開隱藏元素 |

最重要的是 `setActiveElementIdList()`：

```ts
setActiveElementIdList(activeElementIdList: string[]) {
  if (activeElementIdList.length === 1) this.handleElementId = activeElementIdList[0]
  else this.handleElementId = ''

  this.activeElementIdList = activeElementIdList
}
```

這段代表：

- 單選時，`handleElementId` 會自動指向該元素
- 多選時，`handleElementId` 會被清空
- 清空選取時，`activeElementIdList` 和 `handleElementId` 都會回到空狀態

這是 `main store` 裡最值得記住的 action。

---

### 2. 畫布狀態

| state | 用途 | 原始碼閱讀重點 |
|---|---|---|
| `canvasPercentage` | 畫布可視區域百分比 | 預設 `90` |
| `canvasScale` | 畫布縮放比例 | 依據 `slidesStore.viewportSize` 換算 |
| `canvasDragged` | 畫布是否正在被拖曳 | 用於畫布平移狀態 |
| `gridLineSize` | 網格線尺寸 | `0` 代表不顯示網格線 |
| `showRuler` | 是否顯示標尺 | 只管開關狀態 |

注意：

```ts
canvasPercentage
canvasScale
```

兩者不是同一件事。

- `canvasPercentage` 偏向 UI 顯示比例，例如 90%、100%
- `canvasScale` 偏向實際換算比例，會影響元素在畫布上的渲染與操作計算

---

### 3. 焦點與快捷鍵狀態

| state | 用途 | 原始碼閱讀重點 |
|---|---|---|
| `thumbnailsFocus` | 左側縮圖區是否聚焦 | 影響快捷鍵或頁面操作歸屬 |
| `editorAreaFocus` | 編輯區是否聚焦 | 影響快捷鍵或畫布操作歸屬 |
| `disableHotkeys` | 是否禁用快捷鍵 | 例如輸入文字、彈窗開啟時可能需要禁用 |

`main store` 不直接實作快捷鍵行為。  
它只是提供：

```ts
disableHotkeys
thumbnailsFocus
editorAreaFocus
```

真正的快捷鍵判斷通常會在 hooks 或 components 裡完成。

---

### 4. 建立元素與編輯輔助狀態

| state | 用途 | 原始碼閱讀重點 |
|---|---|---|
| `creatingElement` | 正在插入的元素資訊 | 例如文字、形狀、線條等需要繪製插入的元素 |
| `creatingCustomShape` | 是否正在繪製任意多邊形 | 自訂形狀建立流程會用到 |
| `clipingImageElementId` | 目前正在裁切的圖片元素 ID | 原始碼命名是 `cliping`，不是 `clipping` |
| `isScaling` | 是否正在縮放元素 | 用於縮放互動判斷 |
| `richTextAttrs` | 目前富文本屬性狀態 | 預設值來自 `defaultRichTextAttrs` |
| `selectedTableCells` | 目前選取的表格儲存格 | 表格編輯流程使用 |

這些狀態有一個共同點：

> 它們大多不是簡報內容，而是「編輯過程中的臨時狀態」。

例如：

- 文字元素真正的內容在 `slides store`
- 但目前工具列顯示的富文本屬性在 `main store`
- 圖片元素真正的資料在 `slides store`
- 但目前哪張圖片正在裁切，存在 `main store`

---

### 5. 工具列與面板狀態

| state | 用途 | 原始碼閱讀重點 |
|---|---|---|
| `toolbarState` | 右側工具列目前狀態 | 預設為 `ToolbarStates.SLIDE_DESIGN` |
| `dialogForExport` | 目前匯出對話框狀態 | 匯出 PDF、圖片、PPTX 等流程會用到 |
| `showSelectPanel` | 是否開啟選擇面板 | 面板開關狀態 |
| `showSearchPanel` | 是否開啟查找替換面板 | 面板開關狀態 |
| `showNotesPanel` | 是否開啟批註 / 備註面板 | 面板開關狀態 |
| `showSymbolPanel` | 是否開啟符號面板 | 面板開關狀態 |
| `showMarkupPanel` | 是否開啟類型標註面板 | 面板開關狀態 |
| `showImageLibPanel` | 是否開啟圖片庫面板 | 容易漏掉的欄位 |
| `showAIPPTDialog` | 是否開啟 AI PPT 建立視窗 | 型別是 `boolean | 'running'` |

特別注意：

```ts
showAIPPTDialog: boolean | 'running'
```

它不只是 `true / false`，還有 `'running'` 狀態。

另外，這些面板 action 大多只是單純設定開關：

```ts
setSearchPanelState(show: boolean) {
  this.showSearchPanel = show
}
```

store 本身通常不負責「開 A 面板時自動關 B 面板」。  
如果有互斥邏輯，通常會在呼叫端處理。

---

### 6. 多頁選取與匯出相關

| state | 用途 | 原始碼閱讀重點 |
|---|---|---|
| `selectedSlidesIndex` | 目前被選取的頁面索引集合 | 用於縮圖區多選，不等於 `slidesStore.slideIndex` |
| `dialogForExport` | 匯出面板類型 | 只保存目前開啟哪種匯出對話框 |

要特別區分：

```ts
slidesStore.slideIndex
mainStore.selectedSlidesIndex
```

兩者不同。

| 狀態 | 意義 |
|---|---|
| `slidesStore.slideIndex` | 目前正在編輯哪一頁 |
| `mainStore.selectedSlidesIndex` | 縮圖區目前選取哪些頁面 |

單頁編輯時常常只看 `slideIndex`。  
但複製、刪除、多選頁面時，會用到 `selectedSlidesIndex`。

---

### 7. 格式刷狀態

| state | 用途 | 原始碼閱讀重點 |
|---|---|---|
| `textFormatPainter` | 文字格式刷狀態 | 保存要套用的文字格式資訊 |
| `shapeFormatPainter` | 形狀格式刷狀態 | 保存要套用的形狀格式資訊 |

格式刷不是直接改內容。  
它是先把「要複製的格式」暫存在 `main store`，等使用者點選其他元素時，再由相關操作邏輯把格式套用到 `slides store` 的元素資料。

---

### 8. IndexedDB 識別資料

| state | 用途 | 原始碼閱讀重點 |
|---|---|---|
| `databaseId` | 當前應用的 IndexedDB 資料庫識別 ID | 由 `nanoid(10)` 產生 |

`databaseId` 不是簡報內容，也不是頁面 ID。  
它是目前應用實例用來識別 IndexedDB 資料庫的 ID。

---

## getters

`main store` 有兩個 getter：

- `activeElementList`
- `handleElement`

它們都是根據 `slides store` 的目前頁面推導出來。

---

### `activeElementList`

取得目前被選取的實際元素資料。

邏輯是：

```txt
讀取 slidesStore.currentSlide
→ 取得 currentSlide.elements
→ 篩選 id 有出現在 activeElementIdList 的元素
→ 回傳 PPTElement[]
```

也就是：

```ts
currentSlide.elements.filter(element =>
  state.activeElementIdList.includes(element.id)
)
```

所以：

```ts
activeElementIdList
```

只是 ID 集合，而：

```ts
activeElementList
```

才是實際元素資料集合。

如果目前沒有頁面，或頁面沒有元素，getter 會回傳空陣列。

---

### `handleElement`

取得目前主要操作中的實際元素資料。

邏輯是：

```txt
讀取 slidesStore.currentSlide
→ 取得 currentSlide.elements
→ 找到 id 等於 handleElementId 的元素
→ 找不到就回傳 null
```

也就是：

```ts
currentSlide.elements.find(element =>
  state.handleElementId === element.id
) || null
```

`handleElement` 通常用於：

- 單一元素操作
- 屬性面板顯示
- 控制點操作
- 判斷目前主要操作對象

---

## getter 的關鍵觀念

`main store` 的 getter 有一個很重要的設計：

```ts
const slidesStore = useSlidesStore()
const currentSlide = slidesStore.currentSlide
```

這代表 `main store` 會讀取 `slides store`。

但這不代表 `main store` 擁有元素資料。

比較精準地說：

```txt
main store 保存「選取誰」
slides store 保存「那個元素的內容」
getter 負責把兩者接起來
```

這是 `main store` 最核心的狀態流。

---

## actions 分類

`main store` 的 actions 幾乎都是 setter，但不要因此小看它。  
這些 setter 是 hooks 與 components 操作互動狀態的入口。

| 類型 | actions | 用途 |
|---|---|---|
| 選取相關 | `setActiveElementIdList`、`setHandleElementId`、`setActiveGroupElementId`、`setHiddenElementIdList` | 管理目前選取、操作、群組內操作與隱藏元素 |
| 畫布相關 | `setCanvasPercentage`、`setCanvasScale`、`setCanvasDragged`、`setGridLineSize`、`setRulerState` | 管理畫布縮放、拖曳、網格、標尺 |
| 焦點與快捷鍵 | `setThumbnailsFocus`、`setEditorareaFocus`、`setDisableHotkeysState` | 管理編輯區、縮圖區焦點與快捷鍵開關 |
| 建立與編輯輔助 | `setCreatingElement`、`setCreatingCustomShapeState`、`setClipingImageElementId`、`setScalingState`、`setRichtextAttrs`、`setSelectedTableCells` | 管理正在建立、裁切、縮放、富文本、表格選取狀態 |
| 工具列與格式刷 | `setToolbarState`、`setTextFormatPainter`、`setShapeFormatPainter` | 管理右側工具列與格式刷狀態 |
| 多頁與匯出 | `updateSelectedSlidesIndex`、`setDialogForExport` | 管理縮圖多選與匯出對話框 |
| 面板開關 | `setSelectPanelState`、`setSearchPanelState`、`setNotesPanelState`、`setSymbolPanelState`、`setMarkupPanelState`、`setImageLibPanelState`、`setAIPPTDialogState` | 管理各種 UI 面板開關 |

---

## action 細節

### `setActiveElementIdList(activeElementIdList)`

這是 `main store` 中最重要的 action。

它不只是設定 `activeElementIdList`，還會同步處理 `handleElementId`：

```txt
如果只選一個元素
→ handleElementId = 該元素 ID

如果選多個元素
→ handleElementId = ''

最後更新 activeElementIdList
```

這代表：

- 單選時，系統知道主要操作對象是誰
- 多選時，沒有單一主要操作對象
- 清空選取時，也會清空主要操作對象

---

### `setHandleElementId(handleElementId)`

只設定主要操作中的元素 ID。

它不會自動更新 `activeElementIdList`。  
所以使用時要注意：

```txt
handleElementId 是操作焦點
activeElementIdList 是選取集合
```

兩者通常相關，但不是完全等價。

---

### `setActiveGroupElementId(activeGroupElementId)`

設定群組元素內部目前可獨立操作的成員 ID。

在部分群組操作中，使用者可能不是移動整個群組，而是移動群組內的某個成員。

這時候其他 hooks 會優先看：

```ts
activeGroupElementId
```

例如元素移動邏輯中：

```txt
如果 activeGroupElementId 有值
→ 移動群組內該成員
否則
→ 移動 activeElementIdList 中的元素
```

---

### `setHiddenElementIdList(hiddenElementIdList)`

設定目前被隱藏的元素 ID 集合。

在選取流程中，隱藏元素會被跳過。

例如 `useSelectElement()` 中的選取邏輯會檢查：

```txt
如果 id 在 hiddenElementIdList 中
→ 不選取
```

所以這個 state 會影響「哪些元素能被選」。

---

### `setCanvasPercentage(percentage)` 與 `setCanvasScale(scale)`

這兩個都和畫布縮放有關，但層級不同。

```txt
canvasPercentage：使用者看到或操作的縮放百分比
canvasScale：實際渲染與換算用的比例
```

讀畫布相關程式時，不要把兩者混在一起。

---

### `setThumbnailsFocus(isFocus)` 與 `setEditorareaFocus(isFocus)`

這兩個 state 用來區分目前焦點在哪裡。

焦點不同，快捷鍵或操作語義可能不同。

例如：

```txt
焦點在縮圖區
→ Delete 可能是刪除頁面

焦點在編輯區
→ Delete 可能是刪除元素
```

實際刪除邏輯不在 `main store`，但 `main store` 提供判斷焦點的狀態。

---

### `setDisableHotkeysState(disable)`

設定是否禁用快捷鍵。

常見使用場景：

- 正在輸入文字
- 正在操作表單欄位
- 開啟彈窗
- 某些互動流程中暫時不希望快捷鍵生效

`main store` 只保存是否禁用，真正要不要攔截快捷鍵通常在事件處理邏輯中判斷。

---

### `setCreatingElement(element)`

設定目前正在建立的元素資訊。

例如使用者選擇插入文字、形狀、線條時，可能會先把「準備建立的元素類型與初始資訊」放進 `creatingElement`。

接著使用者在畫布上拖曳或點擊，才會真正建立元素並寫入 `slides store`。

狀態流大致是：

```txt
選擇插入工具
→ mainStore.setCreatingElement(...)
→ 使用者在畫布繪製
→ slidesStore.addElement(...)
→ mainStore.setCreatingElement(null)
```

---

### `setClipingImageElementId(elId)`

設定目前正在裁切的圖片元素 ID。

注意原始碼命名是：

```ts
clipingImageElementId
```

不是英文常見拼法 `clippingImageElementId`。

讀原始碼時要照原始名稱搜尋。

---

### `setRichtextAttrs(attrs)`

設定目前富文本屬性狀態。

它通常和文字工具列、文字選區、ProseMirror 編輯狀態有關。

要注意：

```txt
richTextAttrs 是目前編輯器互動狀態
文字元素真正的內容與樣式仍然在 slides store 的元素資料中
```

---

### `updateSelectedSlidesIndex(selectedSlidesIndex)`

更新縮圖區目前選取的頁面索引集合。

它和 `slidesStore.updateSlideIndex()` 不同：

| action | 負責 |
|---|---|
| `slidesStore.updateSlideIndex(index)` | 切換目前正在編輯的頁面 |
| `mainStore.updateSelectedSlidesIndex(indexList)` | 記錄縮圖區選取了哪些頁面 |

這是讀頁面多選、刪除、複製時常見的分工。

---

## 常見狀態流

---

### 狀態流 1：單選元素

```txt
使用者點擊某個元素
→ useSelectElement().selectElement(id)
→ 檢查該元素是否已經是 handleElement
→ 檢查該元素是否被 hiddenElementIdList 隱藏
→ 檢查該元素是否 lock
→ mainStore.setActiveElementIdList([id])
→ activeElementIdList = [id]
→ handleElementId = id
→ activeElementList getter 取得實際元素
→ handleElement getter 取得主要操作元素
→ 選取框、控制點、右側工具列更新
```

這個流程說明：

```txt
點擊元素時，main store 先改選取 ID，實際元素資料仍然從 slides store 取。
```

---

### 狀態流 2：全選元素

```txt
使用者執行全選
→ useSelectElement().selectAllElements()
→ 取得 currentSlide.elements
→ 過濾 lock 元素
→ 過濾 hiddenElementIdList 中的元素
→ 取得可選元素 ID
→ mainStore.setActiveElementIdList(newActiveElementIdList)
```

如果最後選到多個元素：

```txt
activeElementIdList = 多個 ID
handleElementId = ''
```

因為多選狀態下沒有單一主要操作元素。

---

### 狀態流 3：用方向鍵移動元素

```txt
使用者按方向鍵
→ useMoveElement().moveElement(command, step)
→ 讀取 mainStore.activeElementIdList
→ 讀取 mainStore.activeGroupElementId
→ 讀取 slidesStore.currentSlide.elements
→ 根據方向更新元素 left / top
→ slidesStore.updateSlide({ elements: newElementList })
→ addHistorySnapshot()
```

這個流程很重要，因為它清楚展現兩個 store 的分工：

| 階段 | 負責 |
|---|---|
| 目前要移動誰 | `main store` |
| 元素實際位置如何改 | `slides store` |
| 操作後加入歷史紀錄 | `snapshot store` / `useHistorySnapshot` |

也就是：

```txt
main store 決定操作對象
slides store 更新內容
snapshot store 保存歷史
```

---

### 狀態流 4：群組內元素移動

```txt
使用者選取群組內某個元素
→ mainStore.setActiveGroupElementId(id)
→ 執行移動操作
→ useMoveElement() 先檢查 activeGroupElementId
→ 如果 activeGroupElementId 有值，只移動該成員
→ 否則移動 activeElementIdList 中的元素
```

這代表 `activeGroupElementId` 的優先級高於一般選取集合。

---

### 狀態流 5：開關面板

```txt
使用者點擊搜尋面板按鈕
→ mainStore.setSearchPanelState(true)
→ showSearchPanel = true
→ 對應面板顯示
```

再例如圖片庫：

```txt
使用者打開圖片庫
→ mainStore.setImageLibPanelState(true)
→ showImageLibPanel = true
```

面板開關通常只是 UI flag。  
store 本身不一定處理複雜的面板互斥規則。

---

### 狀態流 6：undo / redo 後清空選取

undo / redo 的主流程在 `snapshot store`，但會影響 `main store`。

流程大致是：

```txt
使用者執行 undo / redo
→ snapshot store 從 IndexedDB 取出歷史版本
→ slidesStore.setSlides(snapshot.slides)
→ slidesStore.updateSlideIndex(snapshot.index)
→ mainStore.setActiveElementIdList([])
```

為什麼要清空選取？

因為 undo / redo 後，原本被選取的元素可能已經不存在，或內容版本已經改變。  
清空選取可以避免 `main store` 留著過期的元素 ID。

---

## 和其他 store 的關係

---

### 和 `slides store` 的關係

這是最重要的關係。

```txt
main store：保存目前操作誰
slides store：保存那個元素真正的資料
```

例如：

```txt
activeElementIdList = ['el-1']
```

只代表目前選到 `el-1`。  
`el-1` 的位置、大小、文字、樣式仍然在：

```ts
slidesStore.currentSlide.elements
```

---

### 和 `snapshot store` 的關係

`snapshot store` 在 undo / redo 時會清空 `main store` 的選取狀態。

也就是：

```ts
mainStore.setActiveElementIdList([])
```

這代表歷史回復後，互動狀態會被重置一部分，避免殘留過期選取。

---

### 和 `keyboard store` 的關係

`main store` 不保存 Ctrl、Shift、Space 是否按下。  
這些是 `keyboard store` 的責任。

但快捷鍵流程通常會同時參考：

```txt
keyboard store：現在按了哪些鍵
main store：目前焦點在哪裡、快捷鍵是否禁用、目前選取誰
slides store：實際要改哪些內容
```

---

### 和 `screen store` 的關係

`screen store` 負責是否進入播放模式。

`main store` 則主要是編輯器操作狀態。

播放模式下，很多編輯器互動狀態可能不再被使用，但它們仍然屬於編輯器環境，而不是播放模式本身。

---

## 常見誤區

---

### 誤區 1：以為 `main store` 裡有真正的元素資料

沒有。

`main store` 主要存的是：

```ts
activeElementIdList
handleElementId
activeGroupElementId
hiddenElementIdList
```

真正元素資料在 `slides store`。

---

### 誤區 2：以為 `activeElementIdList` 和 `activeElementList` 是同一件事

不是。

| 名稱 | 意義 |
|---|---|
| `activeElementIdList` | 選取元素 ID 陣列，是 state |
| `activeElementList` | 根據 ID 從目前頁面找出的元素資料，是 getter |

---

### 誤區 3：以為多選時一定有 `handleElementId`

不一定。

原始碼中：

```txt
只選一個元素 → handleElementId = 該元素 ID
選多個元素 → handleElementId = ''
```

所以多選時應該主要看 `activeElementIdList`，不要只看 `handleElementId`。

---

### 誤區 4：把 `selectedSlidesIndex` 當成目前頁面

不對。

```ts
selectedSlidesIndex
```

是縮圖區選取頁面的集合。

目前正在編輯哪一頁，要看：

```ts
slidesStore.slideIndex
```

---

### 誤區 5：以為 action 會完成完整業務流程

`main store` 的 actions 大多只是 setter。

完整業務流程通常在：

- hooks
- components
- keyboard handlers
- context menu handlers
- canvas event handlers

例如移動元素不是只靠 `main store`，而是：

```txt
main store 提供選取 ID
slides store 更新元素位置
snapshot store 保存歷史
```

---

## 原始碼閱讀順序

建議按照這個順序讀：

### 1. 先讀 `src/store/main.ts`

先理解：

- `MainState` 有哪些欄位
- 哪些欄位是 ID
- 哪些欄位是 boolean flag
- 哪些欄位是面板或工具狀態
- getter 如何讀 `slides store`

### 2. 再讀 `src/hooks/useSelectElement.ts`

重點看：

- `selectElement(id)` 如何選取單一元素
- 如何排除隱藏元素
- 如何排除鎖定元素
- `selectAllElements()` 如何取得可選元素
- 最後如何呼叫 `mainStore.setActiveElementIdList()`

### 3. 再讀 `src/hooks/useMoveElement.ts`

重點看：

- 如何讀 `activeElementIdList`
- 如何讀 `activeGroupElementId`
- 如何根據方向更新 `left` / `top`
- 為什麼真正更新內容時呼叫的是 `slidesStore.updateSlide()`
- 為什麼最後要 `addHistorySnapshot()`

### 4. 最後回頭看 components

看 components 時，你會比較容易分辨：

```txt
這段是在改 main store 的互動狀態
還是在改 slides store 的內容資料
還是在呼叫 snapshot store 保存歷史
```

---

## 這篇要記住的重點

- `main store` 是編輯器互動狀態中心
- 它不保存簡報內容本體
- 選取狀態主要存 ID，不存元素物件
- 真正元素資料在 `slides store.currentSlide.elements`
- `activeElementList` 和 `handleElement` 是從 `slides store` 衍生出來的 getter
- `setActiveElementIdList()` 會同步處理 `handleElementId`
- 單選時有主要操作元素，多選時 `handleElementId` 會清空
- `selectedSlidesIndex` 是縮圖多選，不是目前頁面
- 面板狀態大多只是 boolean flag
- 大多數 actions 是 setter，完整狀態流要到 hooks / components 裡看
- 移動元素時，`main store` 決定移動誰，`slides store` 實際改元素位置，`snapshot store` 保存歷史

---

## 對照

- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)
- [`src/hooks/useSelectElement.ts`](../../../PPTist-SourceCode/src/hooks/useSelectElement.ts)
- [`src/hooks/useMoveElement.ts`](../../../PPTist-SourceCode/src/hooks/useMoveElement.ts)

---