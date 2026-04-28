# store 總覽

`PPTist` 的 store 可以分成 5 類：

- `slides store`
- `main store`
- `snapshot store`
- `keyboard store`
- `screen store`

## 它們各自負責什麼

### `slides store`
- 管簡報內容的讀寫與衍生狀態
- 管頁面與元素資料的增刪改查
- 負責內容層資料如何在編輯中更新

### `main store`
- 管選取、畫布、工具、面板、輸入法等互動狀態
- 負責使用者操作當下的畫面狀態切換

### `snapshot store`
- 管 undo / redo 流程
- 管歷史快照數量、游標與版本回復

### `keyboard store`
- 管 Ctrl、Shift、Space 等按鍵是否按下
- 提供快捷鍵與拖曳邏輯使用

### `screen store`
- 管是否進入播放模式
- 幫助區分編輯與簡報播放兩種模式

## 你要記住的關係

- `slides store` 是內容與內容衍生狀態的中心
- `main store` 是編輯器互動狀態的中心
- `snapshot store` 是歷史回復的中心
- `keyboard store` 是按鍵輸入狀態的中心
- `screen store` 是播放模式狀態的中心

如果只想理解「資料結構」，請回到 `01-資料模型`。
如果想理解「資料怎麼被改」，再從這一章往下看 action、getter 與流程。

## 對照

- [`src/store/index.ts`](../../../PPTist-SourceCode/src/store/index.ts)
- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)
# store 總覽

這一章要看的是 `PPTist` 的 **store 責任邊界** 與 **狀態流向**。

如果說 `01-資料模型` 是在回答：

> 簡報、頁面、元素、動畫的資料長什麼樣？

那 `05-store與狀態流` 要回答的是：

> 使用者操作時，哪些資料會被哪個 store 管理？  
> 哪些 store 只存內容？哪些 store 只存互動狀態？  
> undo / redo、快捷鍵、播放模式又是怎麼接進來的？

---

## 一句話總覽

`PPTist` 的 store 不是把所有資料塞在一起，而是把狀態拆成五個責任區：

| store | 一句話定位 | 主要負責 |
|---|---|---|
| `slides store` | 簡報內容中心 | 簡報標題、主題、頁面、元素、動畫、模板、目前頁面 |
| `main store` | 編輯器互動中心 | 選取、操作中元素、畫布縮放、焦點、工具列、面板、格式刷 |
| `snapshot store` | 歷史版本中心 | undo / redo、快照游標、快照長度、IndexedDB 快照回復 |
| `keyboard store` | 鍵盤環境中心 | Ctrl、Shift、Space 是否被按下 |
| `screen store` | 播放模式中心 | 是否進入簡報播放模式 |

---

## 原始碼入口

`src/store/index.ts` 只做一件事：把五個 store 匯出。

```ts
useMainStore
useSlidesStore
useSnapshotStore
useKeyboardStore
useScreenStore
```

也就是說，讀 `PPTist` store 時，真正要看的不是 `index.ts`，而是下面五支檔案：

- `src/store/slides.ts`
- `src/store/main.ts`
- `src/store/snapshot.ts`
- `src/store/keyboard.ts`
- `src/store/screen.ts`

---

## 1. `slides store`：內容資料的中心

`slides store` 管的是「簡報本體」。

它包含：

- 簡報標題：`title`
- 簡報主題：`theme`
- 全部頁面：`slides`
- 目前頁面索引：`slideIndex`
- 畫布尺寸基準：`viewportSize`
- 畫布比例：`viewportRatio`
- 簡報模板：`templates`

### 它負責的事情

- 設定簡報標題與主題
- 設定整份 slides
- 新增、刪除、更新 slide
- 新增、刪除、更新 element
- 移除 slide 或 element 的指定屬性
- 取得目前頁面與目前頁面動畫

### 重要理解

`slides store` 是「內容狀態」，不是「畫面操作狀態」。

例如：

- 一個文字元素的位置、大小、內容，屬於 `slides store`
- 目前選到哪個元素，不屬於 `slides store`
- 目前畫布縮放幾倍，不屬於 `slides store`
- 目前正在拖曳或縮放，不屬於 `slides store`

### 特別注意

`slides store` 的 getter 不只是單純取資料：

- `currentSlide`：根據 `slideIndex` 取得目前頁面
- `currentSlideAnimations`：取得目前頁面中仍然對應存在元素的動畫
- `formatedAnimations`：根據動畫觸發方式重新整理動畫序列

`formatedAnimations` 會處理三種動畫觸發邏輯：

| trigger | 意義 |
|---|---|
| `click` | 點擊後執行，形成新的動畫段落 |
| `meantime` | 與上一個動畫同時執行，合併到上一段 |
| `auto` | 上一個動畫之後自動執行，並標記上一段 `autoNext` |

---

## 2. `main store`：編輯器互動狀態的中心

`main store` 管的是「使用者正在怎麼操作編輯器」。

它不直接保存簡報內容，而是保存操作過程中的 UI 狀態。

例如：

- 目前選取哪些元素：`activeElementIdList`
- 目前主要操作中的元素：`handleElementId`
- 目前是否正在拖動畫布：`canvasDragged`
- 畫布縮放百分比與比例：`canvasPercentage`、`canvasScale`
- 編輯區或縮圖區是否聚焦：`editorAreaFocus`、`thumbnailsFocus`
- 是否禁用快捷鍵：`disableHotkeys`
- 目前工具列狀態：`toolbarState`
- 是否正在裁切圖片、縮放元素、建立元素
- 各種面板是否開啟，例如選擇面板、搜尋面板、備註面板、圖片庫面板、AI PPT 面板

### 它負責的事情

- 管理選取狀態
- 管理畫布互動狀態
- 管理編輯焦點與快捷鍵開關
- 管理工具列與側邊面板
- 管理格式刷、表格選取、圖片裁切等編輯輔助狀態

### 重要理解

`main store` 常常只存「ID」或「狀態旗標」，不存真正的元素資料。

例如：

```ts
activeElementIdList: string[]
handleElementId: string
```

真正的元素資料仍然在 `slides store` 的 `currentSlide.elements` 裡。

所以 `main store` 的 getter 會去讀 `slides store`：

- `activeElementList`：根據 `activeElementIdList`，從目前頁面元素中找出被選取的元素
- `handleElement`：根據 `handleElementId`，從目前頁面元素中找出正在操作的元素

### 關鍵觀念

`main store` 負責「目前操作誰」，  
`slides store` 負責「那個東西實際長什麼樣」。

這是讀 PPTist 狀態流時最重要的分工。

---

## 3. `snapshot store`：undo / redo 的中心

`snapshot store` 管的是歷史版本，不是單一操作。

它的 state 很少：

- `snapshotCursor`
- `snapshotLength`

但它的責任很重：

- 初始化快照資料庫
- 新增快照
- 判斷是否可以 undo
- 判斷是否可以 redo
- 回復上一個快照
- 前進到下一個快照

### 快照保存什麼？

快照主要保存：

```ts
{
  index: slideIndex,
  slides: slides
}
```

也就是：

- 當時停在哪一頁
- 當時整份簡報內容長什麼樣

### 重要理解

undo / redo 不是只回復某個元素。

它是回復一整份歷史版本：

```txt
snapshot
→ slidesStore.setSlides()
→ slidesStore.updateSlideIndex()
→ mainStore.setActiveElementIdList([])
```

所以 undo / redo 後，簡報內容會被整份替換，並且目前選取元素會被清空。

### 特別注意

`snapshot store` 有幾個容易忽略的細節：

- 快照存在 IndexedDB
- 快照最多保留 20 筆
- 如果使用者 undo 後又做新操作，原本 redo 方向的快照會被刪除
- `snapshotCursor` 只是歷史游標，不是內容本身
- `snapshotLength` 只是快照數量，不是 slides 數量

---

## 4. `keyboard store`：鍵盤輸入狀態的中心

`keyboard store` 很小，但在互動邏輯中很常被用到。

它記錄：

- `ctrlKeyState`
- `shiftKeyState`
- `spaceKeyState`

### 它負責的事情

- 判斷 Ctrl 是否按下
- 判斷 Shift 是否按下
- 判斷 Space 是否按下
- 提供拖曳、框選、快捷鍵、播放控制等邏輯使用

### getter

`keyboard store` 還有一個重要 getter：

```ts
ctrlOrShiftKeyActive
```

它用來判斷：

```ts
ctrlKeyState || shiftKeyState
```

也就是「目前是否正在按 Ctrl 或 Shift」。

### 重要理解

`keyboard store` 不是快捷鍵系統本身。

它只是記錄鍵盤環境狀態。  
真正的快捷鍵判斷通常會在 hooks、components 或其他事件邏輯中使用這些狀態。

---

## 5. `screen store`：播放模式狀態的中心

`screen store` 是最簡單的 store。

它只記錄一件事：

```ts
screening
```

也就是目前是否進入簡報播放模式。

### 它負責的事情

- 設定是否進入播放模式
- 讓編輯模式與播放模式可以被區分

### 重要理解

`screen store` 不管簡報內容。  
它只管目前應用程式是不是處於「播放狀態」。

---

## store 之間的關係

五個 store 不是完全獨立的。

它們的關係可以這樣看：

```txt
slides store
  └─ 保存簡報內容
      ↑
      │ main store 的 getter 會讀目前頁面元素
      │
main store
  └─ 保存目前操作狀態

snapshot store
  ├─ 讀取 slides store 產生快照
  ├─ 回復快照時更新 slides store
  └─ undo / redo 後清空 main store 的選取狀態

keyboard store
  └─ 提供按鍵狀態給互動邏輯判斷

screen store
  └─ 提供播放模式狀態給畫面與操作邏輯判斷
```

### 依賴關係重點

| store | 會讀取誰 | 目的 |
|---|---|---|
| `main store` | `slides store` | 根據目前頁面元素，推導選取元素與操作元素 |
| `snapshot store` | `slides store` | 建立快照、回復 slides 與 slideIndex |
| `snapshot store` | `main store` | undo / redo 後清空選取狀態 |
| `keyboard store` | 無明顯 store 依賴 | 提供鍵盤狀態 |
| `screen store` | 無明顯 store 依賴 | 提供播放模式狀態 |

---

## 常見狀態流

### 新增頁面

```txt
使用者新增頁面
→ slidesStore.addSlide()
→ 新頁插入到目前頁面後方
→ slideIndex 更新到新頁
→ currentSlide 指向新頁
→ 畫面重新渲染
→ snapshotStore.addSnapshot()
```

### 選取元素

```txt
使用者點擊元素
→ mainStore.setActiveElementIdList()
→ 更新 activeElementIdList
→ 如果只選一個元素，同時更新 handleElementId
→ activeElementList getter 從 slidesStore.currentSlide.elements 找出元素資料
→ 外框、工具列、屬性面板更新
```

### 更新元素

```txt
使用者拖曳、縮放或修改元素
→ slidesStore.updateElement()
→ 更新 currentSlide.elements 中對應元素
→ 畫面根據 slides 重新渲染
→ snapshotStore.addSnapshot()
```

### undo

```txt
使用者觸發 undo
→ snapshotStore.unDo()
→ snapshotCursor 往前移
→ 從 IndexedDB 取出上一份 snapshot
→ slidesStore.setSlides()
→ slidesStore.updateSlideIndex()
→ mainStore.setActiveElementIdList([])
→ 畫面回到上一個版本
```

### redo

```txt
使用者觸發 redo
→ snapshotStore.reDo()
→ snapshotCursor 往後移
→ 從 IndexedDB 取出下一份 snapshot
→ slidesStore.setSlides()
→ slidesStore.updateSlideIndex()
→ mainStore.setActiveElementIdList([])
→ 畫面前進到下一個版本
```

### 進入播放模式

```txt
使用者開始播放
→ screenStore.setScreening(true)
→ 應用程式進入播放模式
→ 編輯模式相關操作被切換或隱藏
```

---

## 最容易混淆的地方

### 1. `slides store` 和 `main store` 的差別

不要把「目前選到哪個元素」理解成內容資料。

| 問題 | 屬於哪個 store |
|---|---|
| 元素的文字內容是什麼？ | `slides store` |
| 元素的位置在哪裡？ | `slides store` |
| 目前選到哪個元素？ | `main store` |
| 目前正在操作哪個元素？ | `main store` |
| 目前畫布縮放多少？ | `main store` |

---

### 2. `snapshot store` 不保存目前畫面狀態

`snapshot store` 保存的是歷史版本定位與快照資料。

它不是目前簡報內容的主要來源。

目前內容仍然以 `slides store` 為主。

---

### 3. `keyboard store` 不是快捷鍵處理器

`keyboard store` 只記錄按鍵是否按下。

快捷鍵邏輯通常還要看：

- 目前焦點在哪裡
- 是否禁用快捷鍵
- 是否正在輸入文字
- 是否正在播放
- 是否正在拖曳或縮放

這些判斷會和 `main store`、`screen store`、hooks、components 一起工作。

---

## 閱讀原始碼的建議順序

讀 `PPTist` store 時，可以照這個順序：

1. 先看 `src/store/index.ts`
   - 確認有哪些 store
2. 再看 `src/store/slides.ts`
   - 先理解簡報內容如何被新增、修改、刪除
3. 再看 `src/store/main.ts`
   - 理解使用者操作狀態如何被保存
4. 再看 `src/store/snapshot.ts`
   - 理解 undo / redo 如何保存與回復整份 slides
5. 最後看 `src/store/keyboard.ts`、`src/store/screen.ts`
   - 理解鍵盤狀態與播放模式如何支援互動流程
6. 回頭追 hooks / components
   - 例如選取、拖曳、縮放、快捷鍵、播放等具體操作是怎麼呼叫 store action 的

---

## 這章要記住的關係

- `slides store` 是簡報內容與內容衍生狀態的中心
- `main store` 是編輯器互動狀態的中心
- `snapshot store` 是歷史版本與 undo / redo 的中心
- `keyboard store` 是鍵盤輸入環境狀態的中心
- `screen store` 是播放模式狀態的中心

更精簡地說：

```txt
slides store：資料本體
main store：操作狀態
snapshot store：歷史版本
keyboard store：鍵盤環境
screen store：播放模式
```

---

## 對照

- [`src/store/index.ts`](../../../PPTist-SourceCode/src/store/index.ts)
- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)

---

## 回主索引

- [05-store與狀態流](./README.md)
- [PPTist Learning Map](../README.md)

---