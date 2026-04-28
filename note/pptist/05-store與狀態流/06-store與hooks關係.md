# store 與 hooks 關係

這一篇整理 `PPTist` 中 **store** 和 **hooks** 的分工。

前面幾篇已經說明 store 各自管什麼狀態，但真正讀原始碼時，你會發現：

> 很多完整操作不是只寫在 store 裡，而是由 hook 把多個 store 串起來。

所以這篇要回答的是：

- store 負責什麼？
- hook 負責什麼？
- 為什麼讀狀態流時不能只看 store？
- 常見 hook 應該怎麼追？

---

## 一句話理解

```txt
store 是狀態容器，hook 是操作流程編排器。
```

更具體地說：

| 角色 | 責任 |
|---|---|
| `store` | 保存 state、提供 getter、提供 action |
| `hook` | 根據使用者操作，呼叫一個或多個 store action，並補上業務判斷 |
| `component` | 接收使用者事件、渲染 state、觸發 hook |

---

## 為什麼不能只看 store？

因為 store 通常只知道「怎麼改狀態」，但不知道「完整操作流程」。

例如 `slidesStore.addSlide()` 只負責把新頁插入 `slides`，但真正新增一頁時，流程通常還包含：

```txt
清空目前選取元素
→ 新增頁面
→ 記錄歷史快照
```

這些步驟不是全部寫在 `slides store`，而是由 `useSlideHandler.createSlide()` 串起來。

所以讀原始碼時要記住：

```txt
store action 是積木
hook 是把積木組成流程的地方
```

---

## 整體分層

`PPTist` 的互動流程大致可以分成四層：

```txt
使用者操作
→ component 事件
→ hook 編排流程
→ store action 更新狀態
→ getter / computed / component 重新渲染
```

例如移動元素：

```txt
按方向鍵
→ useGlobalHotkey
→ useMoveElement.moveElement()
→ slidesStore.updateSlide()
→ addHistorySnapshot()
→ 畫布重新渲染
```

---

## 核心 hooks 對照表

| hook | 主要職責 | 主要相關 store |
|---|---|---|
| `useSlideHandler` | 頁面新增、刪除、複製、剪下、排序、切換 | `slides store`、`main store`、`snapshot store` |
| `useSelectElement` | 選取單一元素、全選元素 | `main store`、`slides store` |
| `useMoveElement` | 使用方向鍵移動元素 | `main store`、`slides store`、`snapshot store` |
| `useDeleteElement` | 刪除選取元素或刪除全部元素 | `main store`、`slides store`、`snapshot store` |
| `useHistorySnapshot` | 包裝 undo、redo、addSnapshot | `snapshot store` |
| `useGlobalHotkey` | 全域快捷鍵入口 | 幾乎所有核心 store |
| `useScreening` | 進入 / 退出播放模式 | `screen store`、`slides store` |
| `useScaleCanvas` | 畫布縮放與重置 | `main store` |

---

## 1. `useSlideHandler`：頁面操作流程中心

`useSlideHandler` 負責和「頁面」有關的操作。

包含：

- 重置簡報
- 切換目前頁面
- 複製頁面
- 貼上頁面
- 新增空白頁
- 根據模板新增頁
- 複製並貼上目前頁
- 刪除頁面
- 剪下頁面
- 全選頁面
- 拖曳排序頁面

### 它和 store 的關係

| store | 使用方式 |
|---|---|
| `slides store` | 實際新增、刪除、更新頁面資料 |
| `main store` | 清空元素選取、更新縮圖選取狀態 |
| `snapshot store` | 透過 `addHistorySnapshot()` 記錄歷史版本 |

### 代表流程：新增頁面

```txt
useSlideHandler.createSlide()
→ 建立 emptySlide
→ mainStore.setActiveElementIdList([])
→ slidesStore.addSlide(emptySlide)
→ addHistorySnapshot()
```

### 代表流程：刪除頁面

```txt
useSlideHandler.deleteSlide()
→ 判斷是否刪除全部頁面
→ resetSlides() 或 slidesStore.deleteSlide()
→ mainStore.updateSelectedSlidesIndex([])
→ addHistorySnapshot()
```

### 重要理解

頁面操作通常不只改 `slides store`。

它也會處理：

- 元素選取狀態
- 縮圖選取狀態
- 歷史快照
- 章節標記
- 當前頁索引

---

## 2. `useSelectElement`：元素選取規則中心

`useSelectElement` 負責元素選取。

它提供兩個主要方法：

```ts
selectAllElements()
selectElement(id)
```

### 它和 store 的關係

| store | 使用方式 |
|---|---|
| `slides store` | 讀取 `currentSlide.elements` |
| `main store` | 更新 `activeElementIdList` |

### `selectElement(id)` 的流程

```txt
檢查 handleElementId 是否已經是目標 id
→ 檢查元素是否 hidden
→ 檢查元素是否 lock
→ mainStore.setActiveElementIdList([id])
```

### `selectAllElements()` 的流程

```txt
讀取 currentSlide.elements
→ 過濾 lock 元素
→ 過濾 hidden 元素
→ 取得可選元素 id
→ mainStore.setActiveElementIdList(newActiveElementIdList)
```

### 重要理解

`useSelectElement` 不只是呼叫 setter。

它還封裝了選取規則：

- 不能選 hidden 元素
- 不能選 locked 元素
- 全選只選目前頁可操作元素

---

## 3. `useMoveElement`：元素移動流程中心

`useMoveElement` 負責使用方向鍵移動元素。

### 它和 store 的關係

| store | 使用方式 |
|---|---|
| `main store` | 讀取 `activeElementIdList`、`activeGroupElementId` |
| `slides store` | 更新目前頁的 `elements` |
| `snapshot store` | 透過 `addHistorySnapshot()` 記錄移動結果 |

### 狀態流

```txt
moveElement(command, step)
→ 根據 command 修改 left / top
→ 如果 activeGroupElementId 存在，移動群組內成員
→ 否則移動 activeElementIdList 中的元素
→ slidesStore.updateSlide({ elements: newElementList })
→ addHistorySnapshot()
```

### 重要理解

`useMoveElement` 不是直接呼叫 `slidesStore.updateElement()`。

它會重新 map 目前頁的整個 `elements` 陣列，產生 `newElementList`，再用：

```ts
slidesStore.updateSlide({ elements: newElementList })
```

整批更新目前頁的元素列表。

---

## 4. `useDeleteElement`：元素刪除流程中心

`useDeleteElement` 負責刪除元素。

包含：

```ts
deleteElement()
deleteAllElements()
```

### 它和 store 的關係

| store | 使用方式 |
|---|---|
| `main store` | 讀取與清空元素選取狀態 |
| `slides store` | 更新目前頁的 `elements` |
| `snapshot store` | 記錄刪除後的歷史版本 |

### `deleteElement()` 流程

```txt
檢查 activeElementIdList 是否為空
→ 如果 activeGroupElementId 存在，刪除群組內目前操作元素
→ 否則刪除 activeElementIdList 中的所有元素
→ mainStore.setActiveElementIdList([])
→ slidesStore.updateSlide({ elements: newElementList })
→ addHistorySnapshot()
```

### 重要理解

刪除元素後會清空選取狀態，避免 `main store` 保留不存在的元素 id。

---

## 5. `useHistorySnapshot`：歷史操作包裝層

`useHistorySnapshot` 是 `snapshot store` 的一層包裝。

它提供：

```ts
addHistorySnapshot()
undo()
redo()
```

### 它和 store 的關係

| store | 使用方式 |
|---|---|
| `snapshot store` | 呼叫 `addSnapshot()`、`unDo()`、`reDo()` |

### 特別注意

`addHistorySnapshot()` 使用 debounce。

`undo()` 和 `redo()` 使用 throttle。

這表示：

- 快照新增不是每次呼叫都立刻無限制執行
- undo / redo 不會因為按鍵太快而過度觸發

### 重要理解

如果你在找「某個操作為什麼可以 undo」，不要只看 `snapshot store`。

你要找操作流程中有沒有呼叫：

```ts
addHistorySnapshot()
```

---

## 6. `useGlobalHotkey`：快捷鍵總入口

`useGlobalHotkey` 是全域快捷鍵的入口。

它會：

- 監聽 `keydown`
- 監聽 `keyup`
- 監聽 `window blur`
- 更新 keyboard store
- 根據快捷鍵呼叫不同 hook
- 根據焦點狀態決定操作對象

### 它和 store 的關係

| store | 使用方式 |
|---|---|
| `keyboard store` | 更新 Ctrl、Shift、Space 狀態 |
| `main store` | 讀取焦點、選取、禁用快捷鍵狀態；開關面板 |
| `slides store` | 讀取目前頁面資料 |
| `snapshot store` | 透過 `useHistorySnapshot` 做 undo / redo |
| `screen store` | 透過 `useScreening` 進入播放模式 |

### 代表流程：Ctrl + A

```txt
按 Ctrl + A
→ 如果 editorAreaFocus：selectAllElements()
→ 如果 thumbnailsFocus：selectAllSlide()
```

### 代表流程：Delete

```txt
按 Delete
→ 如果 activeElementIdList 有資料：deleteElement()
→ 否則如果 thumbnailsFocus：deleteSlide()
```

### 代表流程：方向鍵

```txt
按方向鍵
→ 如果有選取元素：moveElement()
→ 否則 UP / DOWN 切換頁面
```

### 重要理解

`useGlobalHotkey` 是非常重要的「分流器」。

同一個快捷鍵可能因為狀態不同而導向不同流程。

---

## 7. `useScreening`：播放模式流程中心

`useScreening` 負責進入與退出播放模式。

它提供：

```ts
enterScreening()
enterScreeningFromStart()
exitScreening()
```

### 它和 store 的關係

| store | 使用方式 |
|---|---|
| `screen store` | 設定 `screening` |
| `slides store` | 從第一頁播放時更新 `slideIndex` |

### 狀態流

```txt
enterScreening()
→ enterFullscreen()
→ screenStore.setScreening(true)
```

```txt
enterScreeningFromStart()
→ slidesStore.updateSlideIndex(0)
→ enterScreening()
```

```txt
exitScreening()
→ screenStore.setScreening(false)
→ 如果是 fullscreen，exitFullscreen()
```

### 重要理解

`screen store` 只是播放模式旗標。

真正進入全螢幕的動作在 `useScreening` 裡面透過 fullscreen 工具函式完成。

---

## 8. `useScaleCanvas`：畫布縮放流程中心

`useScaleCanvas` 負責畫布縮放。

它提供：

```ts
scaleCanvas(command)
setCanvasScalePercentage(value)
resetCanvas()
```

### 它和 store 的關係

| store | 使用方式 |
|---|---|
| `main store` | 讀寫 `canvasPercentage`、`canvasScale`、`canvasDragged` |

### 狀態流

```txt
scaleCanvas('+') / scaleCanvas('-')
→ 計算新的 percentage
→ mainStore.setCanvasPercentage(percentage)
```

```txt
resetCanvas()
→ mainStore.setCanvasPercentage(90)
→ 如果 canvasDragged 為 true，設為 false
```

### 重要理解

畫布縮放不會改變簡報內容。

它只改變編輯器的視覺狀態，所以歸 `main store`。

---

## hooks 和 store 的常見組合模式

### 模式 1：讀 main store 的互動狀態，改 slides store 的內容

典型例子：移動元素、刪除元素。

```txt
main store：現在選了誰
slides store：真正修改元素資料
snapshot store：記錄修改後版本
```

---

### 模式 2：讀 slides store 的內容，改 main store 的互動狀態

典型例子：選取元素、全選元素、Tab 切換元素。

```txt
slides store：提供目前頁元素資料
main store：保存目前選取 ID
```

---

### 模式 3：store 更新後再補 snapshot

典型例子：新增頁面、刪除頁面、移動元素、刪除元素。

```txt
更新 slides
→ addHistorySnapshot()
→ snapshotStore.addSnapshot()
```

---

### 模式 4：快捷鍵根據焦點分流

典型例子：Ctrl + A、Delete、方向鍵。

```txt
editorAreaFocus / thumbnailsFocus / activeElementIdList
→ 決定操作元素、操作頁面，還是切換頁面
```

---

## 讀原始碼的建議順序

如果你想追一個功能，不要從 store 開始一路亂看。

建議用這個順序：

```txt
1. 先找使用者操作入口
2. 找到對應 hook
3. 看 hook 讀了哪些 store state
4. 看 hook 呼叫了哪些 store action
5. 看 action 改了哪些 state
6. 看有沒有 addHistorySnapshot()
7. 回頭看 getter / component 怎麼重新渲染
```

例如要追「方向鍵移動元素」：

```txt
useGlobalHotkey.ts
→ useMoveElement.ts
→ main store
→ slides store
→ useHistorySnapshot.ts
→ snapshot store
```

---

## 這篇的核心總結

`PPTist` 的 store 不應該孤立閱讀。

更好的理解方式是：

```txt
store 定義狀態能力
hook 定義操作流程
component 呈現狀態結果
```

所以當你讀到某個 store action 時，要繼續追問：

1. 誰呼叫它？
2. 呼叫前做了哪些判斷？
3. 呼叫後有沒有記錄 snapshot？
4. 哪些 getter 或畫面會依賴這個 state？

---

## 對照文件

- [`src/hooks/useSlideHandler.ts`](../../../PPTist-SourceCode/src/hooks/useSlideHandler.ts)
- [`src/hooks/useSelectElement.ts`](../../../PPTist-SourceCode/src/hooks/useSelectElement.ts)
- [`src/hooks/useMoveElement.ts`](../../../PPTist-SourceCode/src/hooks/useMoveElement.ts)
- [`src/hooks/useDeleteElement.ts`](../../../PPTist-SourceCode/src/hooks/useDeleteElement.ts)
- [`src/hooks/useHistorySnapshot.ts`](../../../PPTist-SourceCode/src/hooks/useHistorySnapshot.ts)
- [`src/hooks/useGlobalHotkey.ts`](../../../PPTist-SourceCode/src/hooks/useGlobalHotkey.ts)
- [`src/hooks/useScreening.ts`](../../../PPTist-SourceCode/src/hooks/useScreening.ts)
- [`src/hooks/useScaleCanvas.ts`](../../../PPTist-SourceCode/src/hooks/useScaleCanvas.ts)
- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)
