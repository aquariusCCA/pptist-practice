# store 與畫面渲染關係

這一篇整理 `PPTist` 中 **store state 改變後，畫面會怎麼跟著變**。

前面幾篇重點放在：

- store 責任邊界
- action 如何更新狀態
- hook 如何串流程

這一篇要補上另一條線：

```txt
state 改變
→ getter / computed 重新推導
→ component 重新渲染
→ 使用者看到畫面變化
```

---

## 一句話理解

```txt
store 是畫面的資料來源，getter 是畫面需要的衍生資料，component 根據這些狀態重新渲染。
```

在 PPTist 裡，很多畫面不是直接讀原始欄位，而是讀衍生結果。

例如：

```txt
slides + slideIndex
→ currentSlide
→ 畫布顯示目前頁
```

```txt
activeElementIdList + currentSlide.elements
→ activeElementList
→ 選取框與屬性面板顯示目前選取元素
```

---

## 整體渲染模型

可以用這條線理解：

```txt
store state
→ getter / computed
→ component props / template
→ UI 更新
```

但要注意：

```txt
不是所有 state 都是內容資料
```

有些 state 改變會影響簡報內容，有些只影響編輯器 UI。

---

## 1. `slides store` 對畫面的影響

`slides store` 是簡報內容的來源，所以它影響最核心的畫面：

- 編輯畫布
- 左側縮圖
- 播放畫面
- 動畫資料
- 主題樣式
- 目前頁面

### state 與畫面對照

| state / getter | 影響畫面 |
|---|---|
| `title` | 文件標題、導出或保存時的標題資訊 |
| `theme` | 全域主題色、字體、背景、陰影、線條預設樣式 |
| `slides` | 左側縮圖列表、畫布內容、播放內容 |
| `slideIndex` | 目前顯示哪一頁、縮圖選中狀態 |
| `currentSlide` | 編輯畫布目前頁面內容 |
| `currentSlideAnimations` | 目前頁有效動畫資料 |
| `formatedAnimations` | 播放時的動畫序列 |
| `viewportSize` | 畫布基準寬度 |
| `viewportRatio` | 畫布比例，例如 16:9 |
| `templates` | 模板選擇清單 |

---

## `slides` 改變時

### 常見來源

- 新增頁面
- 刪除頁面
- 複製頁面
- 貼上頁面
- 拖曳排序頁面
- 更新元素
- 刪除元素
- undo / redo 回復整份 slides

### 渲染流

```txt
slidesStore.slides 改變
→ currentSlide 可能改變
→ 縮圖列表重新渲染
→ 畫布元素重新渲染
→ 依賴 slides 的面板重新更新
```

### 重要理解

`slides` 是整份簡報的內容資料。

只要它改變，就可能影響：

```txt
縮圖 + 畫布 + 播放 + 匯出
```

---

## `slideIndex` 改變時

### 常見來源

- 使用者點擊縮圖
- 上下方向鍵切換頁面
- PageUp / PageDown
- 新增頁面後自動跳到新頁
- 刪除頁面後修正目前頁
- F5 從第一頁播放
- undo / redo 回復快照 index

### 渲染流

```txt
slidesStore.slideIndex 改變
→ currentSlide = slides[slideIndex]
→ 畫布切換到另一頁
→ 縮圖選中狀態改變
→ activeElementList 依新的 currentSlide 重新推導
```

### 重要理解

`slideIndex` 是「目前頁面指標」。

它本身不是頁面資料，但它會決定整個編輯器正在看哪一頁。

---

## `currentSlide` 改變時

### 渲染流

```txt
slideIndex 改變 或 slides 改變
→ currentSlide getter 重新計算
→ 畫布讀取 currentSlide.elements
→ 縮圖與右側面板跟著更新
```

### 重要理解

`currentSlide` 不是 state，而是 getter。

所以不要去找哪裡直接修改 `currentSlide`。

真正被修改的是：

```txt
slides 或 slideIndex
```

---

## 2. `main store` 對畫面的影響

`main store` 是編輯器互動狀態中心。

它不代表簡報內容，而是代表使用者目前怎麼操作畫面。

### state 與畫面對照

| state / getter | 影響畫面 |
|---|---|
| `activeElementIdList` | 選取框、多選框、工具列狀態 |
| `handleElementId` | 主要操作元素、右側屬性面板目標 |
| `activeGroupElementId` | 群組內獨立操作狀態 |
| `hiddenElementIdList` | 元素是否被隱藏或不可選取 |
| `canvasPercentage` | 畫布可視區縮放百分比 |
| `canvasScale` | 畫布實際縮放比例 |
| `canvasDragged` | 畫布是否處於拖曳偏移狀態 |
| `thumbnailsFocus` | 快捷鍵是否作用於縮圖區 |
| `editorAreaFocus` | 快捷鍵是否作用於編輯區 |
| `disableHotkeys` | 快捷鍵是否暫停 |
| `gridLineSize` | 網格線顯示密度 |
| `showRuler` | 是否顯示標尺 |
| `creatingElement` | 畫布進入插入元素狀態 |
| `toolbarState` | 右側工具列顯示哪個面板 |
| `clipingImageElementId` | 圖片裁切狀態 |
| `richTextAttrs` | 富文本工具列狀態 |
| `selectedTableCells` | 表格儲存格選取狀態 |
| `selectedSlidesIndex` | 縮圖區多選頁面狀態 |
| `dialogForExport` | 導出對話框狀態 |
| `textFormatPainter` | 文字格式刷狀態 |
| `shapeFormatPainter` | 形狀格式刷狀態 |
| `showSearchPanel` | 搜尋面板開關 |
| `showNotesPanel` | 備註面板開關 |
| `showImageLibPanel` | 圖片庫面板開關 |
| `showAIPPTDialog` | AI PPT 對話框狀態 |
| `activeElementList` | 目前選取元素的完整資料 |
| `handleElement` | 目前主要操作元素的完整資料 |

---

## `activeElementIdList` 改變時

### 常見來源

- 點擊元素
- 全選元素
- Tab 切換元素
- 切換頁面時清空
- 刪除元素後清空
- undo / redo 後清空

### 渲染流

```txt
mainStore.activeElementIdList 改變
→ activeElementList getter 重新推導
→ 選取框更新
→ 工具列可用狀態更新
→ 右側屬性面板目標更新
```

### 重要理解

`activeElementIdList` 只保存 id。

畫面真正需要的元素資料來自：

```txt
slidesStore.currentSlide.elements
```

所以它的完整推導是：

```txt
activeElementIdList + currentSlide.elements
→ activeElementList
```

---

## `handleElementId` 改變時

### 常見來源

- 單選元素
- Tab 切換元素
- 多選時清空
- 手動設定主要操作元素

### 渲染流

```txt
mainStore.handleElementId 改變
→ handleElement getter 重新推導
→ 右側屬性面板切換目標
→ 工具列根據元素類型更新
```

### 重要理解

單選和多選的行為不同。

`setActiveElementIdList()` 裡有一個關鍵邏輯：

```txt
如果只選一個元素：handleElementId = 該元素 id
如果選多個元素：handleElementId = ''
```

---

## `canvasPercentage` / `canvasScale` 改變時

### 常見來源

- Ctrl + `+`
- Ctrl + `-`
- Ctrl + `0`
- 自適應畫布大小
- 使用者縮放畫布

### 渲染流

```txt
canvasPercentage 改變
→ canvasScale 可能重新計算
→ 畫布以新的比例顯示
→ 元素視覺大小跟著縮放
```

### 重要理解

畫布縮放不會改變簡報內容。

元素的 `left`、`top`、`width`、`height` 沒有因為畫布縮放而改變。

改變的是編輯器顯示比例。

---

## `creatingElement` 改變時

### 常見來源

- 點擊工具列插入文字、形狀、線條
- 按快捷鍵 `T`、`R`、`O`、`L`

### 渲染流

```txt
mainStore.creatingElement 改變
→ 畫布進入元素建立模式
→ 使用者在畫布拖曳或點擊
→ 完成後才真正寫入 slidesStore.currentSlide.elements
```

### 重要理解

`creatingElement` 是「準備建立」，不是「已經建立」。

所以它屬於 `main store`，不是 `slides store`。

---

## 面板狀態改變時

### 常見來源

- 點擊面板按鈕
- Ctrl + F 開關搜尋
- 開啟圖片庫
- 開啟 AI PPT 對話框

### 渲染流

```txt
showXXXPanel 改變
→ 對應面板顯示或隱藏
→ 其他資料不一定改變
```

### 重要理解

面板開關通常只改變 UI 狀態，不改變簡報內容。

因此它們在 `main store`。

---

## 3. `snapshot store` 對畫面的影響

`snapshot store` 本身不直接描述畫面內容。

它影響的是：

- undo / redo 按鈕是否可用
- undo / redo 後整份簡報回復到哪個版本

### state / getter 與畫面對照

| state / getter | 影響畫面 |
|---|---|
| `snapshotCursor` | 目前位於歷史版本中的哪個位置 |
| `snapshotLength` | 歷史快照總數 |
| `canUndo` | undo 按鈕是否可用 |
| `canRedo` | redo 按鈕是否可用 |

---

## Undo / Redo 對畫面的影響

### 渲染流

```txt
snapshotStore.unDo() / reDo()
→ 從 IndexedDB 取出目標 snapshot
→ slidesStore.setSlides(snapshot.slides)
→ slidesStore.updateSlideIndex(snapshot.index)
→ mainStore.setActiveElementIdList([])
→ 畫布、縮圖、選取狀態一起更新
```

### 重要理解

Undo / Redo 看起來像是 `snapshot store` 的功能，但實際畫面變化主要來自：

```txt
slides store 被整批覆蓋
```

`snapshot store` 是歷史控制器，不是畫面內容本身。

---

## 4. `keyboard store` 對畫面的影響

`keyboard store` 通常不直接改畫面內容。

它比較像「操作環境狀態」。

### state / getter 與畫面對照

| state / getter | 可能影響 |
|---|---|
| `ctrlKeyState` | 多選、快捷鍵、拖曳邏輯 |
| `shiftKeyState` | 等比例縮放、多選、播放快捷鍵 |
| `spaceKeyState` | 空白鍵拖動畫布或暫停快捷鍵判斷 |
| `ctrlOrShiftKeyActive` | 判斷目前是否有修飾鍵按下 |

### 重要理解

`keyboard store` 本身不執行快捷鍵。

它只是保存鍵盤狀態。

真正的快捷鍵分流在：

```txt
useGlobalHotkey.ts
```

---

## 5. `screen store` 對畫面的影響

`screen store` 只保存一個核心狀態：

```ts
screening
```

### state 與畫面對照

| state | 影響畫面 |
|---|---|
| `screening: true` | 進入播放模式 |
| `screening: false` | 回到編輯模式 |

### 渲染流

```txt
screenStore.screening 改變
→ App 或播放相關 component 判斷目前模式
→ 顯示播放畫面或編輯畫面
```

### 重要理解

`screen store` 不是播放引擎。

它只是告訴畫面：

```txt
現在是不是播放模式
```

---

## 常見 UI 問題追蹤方式

### 問題 1：畫布內容沒有更新

先查：

```txt
slidesStore.slides 是否真的改變？
slidesStore.slideIndex 是否正確？
currentSlide 是否指向正確頁面？
```

閱讀順序：

```txt
觸發操作的 hook
→ slides store action
→ currentSlide getter
→ 畫布 component
```

---

### 問題 2：元素資料改了，但選取框不對

先查：

```txt
activeElementIdList 是否正確？
handleElementId 是否正確？
該 id 是否存在於 currentSlide.elements？
```

閱讀順序：

```txt
main store
→ slides store
→ activeElementList / handleElement getter
→ 選取框 component
```

---

### 問題 3：刪除元素後還殘留選取狀態

先查：

```txt
刪除流程是否有呼叫 mainStore.setActiveElementIdList([])？
```

閱讀順序：

```txt
useDeleteElement
→ main store
→ slides store
```

---

### 問題 4：快捷鍵沒有反應

先查：

```txt
disableHotkeys 是否為 true？
editorAreaFocus / thumbnailsFocus 是否正確？
ctrlKeyState / shiftKeyState 是否正常重置？
```

閱讀順序：

```txt
useGlobalHotkey
→ keyboard store
→ main store focus state
→ 對應 hook
```

---

### 問題 5：Undo / Redo 後畫面不對

先查：

```txt
snapshotCursor 是否正確？
snapshotLength 是否正確？
IndexedDB 中的 snapshot 是否正確？
slidesStore.setSlides() 是否被呼叫？
slideIndex 是否超出範圍？
activeElementIdList 是否清空？
```

閱讀順序：

```txt
useHistorySnapshot
→ snapshot store
→ utils/database
→ slides store
→ main store
```

---

## 狀態與畫面的總表

| 類型 | 主要 store | 代表 state | 主要影響 |
|---|---|---|---|
| 內容資料 | `slides store` | `slides`、`slideIndex` | 畫布、縮圖、播放內容 |
| 選取狀態 | `main store` | `activeElementIdList`、`handleElementId` | 選取框、工具列、屬性面板 |
| 畫布狀態 | `main store` | `canvasPercentage`、`canvasScale` | 畫布縮放與位置 |
| 面板狀態 | `main store` | `showXXXPanel` | 面板顯示與隱藏 |
| 歷史狀態 | `snapshot store` | `snapshotCursor`、`snapshotLength` | undo / redo 可用性與版本回復 |
| 鍵盤狀態 | `keyboard store` | `ctrlKeyState`、`shiftKeyState`、`spaceKeyState` | 快捷鍵與拖曳判斷 |
| 模式狀態 | `screen store` | `screening` | 編輯模式 / 播放模式切換 |

---

## 這篇的核心總結

讀 `PPTist` 的畫面更新，不要只問：

```txt
這個畫面在哪個 component？
```

更應該問：

```txt
這個畫面依賴哪個 store state？
這個 state 是直接 state 還是 getter？
誰改了這個 state？
改完後是否需要 snapshot？
```

最重要的三條線是：

```txt
slides store → 畫布內容
main store → 編輯互動
snapshot store → 歷史版本回復
```

---

## 對照文件

- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)
- [`src/hooks/useSlideHandler.ts`](../../../PPTist-SourceCode/src/hooks/useSlideHandler.ts)
- [`src/hooks/useSelectElement.ts`](../../../PPTist-SourceCode/src/hooks/useSelectElement.ts)
- [`src/hooks/useMoveElement.ts`](../../../PPTist-SourceCode/src/hooks/useMoveElement.ts)
- [`src/hooks/useDeleteElement.ts`](../../../PPTist-SourceCode/src/hooks/useDeleteElement.ts)
- [`src/hooks/useHistorySnapshot.ts`](../../../PPTist-SourceCode/src/hooks/useHistorySnapshot.ts)
- [`src/hooks/useGlobalHotkey.ts`](../../../PPTist-SourceCode/src/hooks/useGlobalHotkey.ts)
- [`src/hooks/useScreening.ts`](../../../PPTist-SourceCode/src/hooks/useScreening.ts)
