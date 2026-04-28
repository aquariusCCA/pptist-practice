# 03-store 與狀態流

這一章專門整理 `PPTist` 的 store 架構與狀態流。

如果說 `01-資料模型` 是看「資料長什麼樣」，那這一章就是看：

- 資料由哪個 store 管理
- 使用者操作如何改變 state
- getter 如何從 state 推導畫面需要的資料
- action 如何更新簡報內容、互動狀態與歷史快照
- hook 如何把多個 store 串成完整操作流程
- store 改變後畫面如何重新渲染

也就是說：

| 章節 | 主要問題 |
|---|---|
| `01-資料模型` | 簡報、頁面、元素、動畫的資料長什麼樣？ |
| `05-store與狀態流` | 這些資料怎麼被使用、更新、回復與切換模式？ |

---

## 這章的定位

這章不是把所有 state 欄位重新抄一次。

這章重點是：

```txt
責任邊界
→ 狀態來源
→ 狀態流向
→ hook 編排
→ 畫面渲染
→ 原始碼追蹤路線
```

讀完這章後，你應該可以回答：

- 新增頁面時，哪些 store 會改變？
- 選取元素時，為什麼 main store 只存 id？
- 移動元素時，為什麼 main store 和 slides store 都會參與？
- undo / redo 回復的是什麼？
- 快捷鍵是在哪裡分流？
- 播放模式為什麼只需要一個 `screening` 狀態？
- 畫面更新時，是哪個 state 或 getter 在驅動？

---

## 章節拆分

1. [store 總覽](./00-store總覽.md)
2. [slides store](./01-slides-store.md)
3. [main store](./02-main-store.md)
4. [snapshot store](./03-snapshot-store.md)
5. [keyboard 與 screen](./04-keyboard與screen.md)
6. [常見狀態流案例](./05-常見狀態流案例.md)
7. [store 與 hooks 關係](./06-store與hooks關係.md)
8. [store 與畫面渲染關係](./07-store與畫面渲染關係.md)
9. [原始碼追蹤路線](./08-原始碼追蹤路線.md)

---

## 五個 store 的核心分工

| store | 核心責任 | 主要關注 |
|---|---|---|
| `slides store` | 簡報內容資料 | 頁面、元素、主題、動畫、目前頁 |
| `main store` | 編輯器互動狀態 | 選取、拖曳、縮放、面板、工具列 |
| `snapshot store` | 歷史版本管理 | undo、redo、快照游標、IndexedDB |
| `keyboard store` | 鍵盤環境狀態 | Ctrl、Shift、Space 是否按下 |
| `screen store` | 播放模式狀態 | 是否正在簡報播放 |

最重要的分工是：

```txt
slides store：簡報本身
main store：使用者正在怎麼操作簡報
snapshot store：簡報能不能回到過去版本
keyboard store：目前鍵盤環境如何
screen store：目前是不是播放模式
```

---

## store 之間的核心關係

### `main store` 依賴 `slides store`

`main store` 不保存完整元素資料。

它保存的是：

```ts
activeElementIdList
handleElementId
activeGroupElementId
```

真正的元素資料在：

```ts
slidesStore.currentSlide.elements
```

所以完整推導是：

```txt
main store 存元素 id
→ slides store 存元素資料
→ getter 把 id 對應成真正元素
```

---

### `snapshot store` 依賴 `slides store`

`snapshot store` 保存的不是操作指令，而是某個時間點的：

```txt
slides + slideIndex
```

所以 undo / redo 時是整批回復簡報版本。

```txt
snapshotStore.unDo() / reDo()
→ slidesStore.setSlides()
→ slidesStore.updateSlideIndex()
→ mainStore.setActiveElementIdList([])
```

---

### `keyboard store` 和 `screen store` 是環境狀態

這兩個 store 不保存簡報內容。

它們提供的是操作環境：

```txt
keyboard store：目前按鍵狀態
screen store：目前是否播放中
```

---

## 建議閱讀順序

### 第一輪：建立責任邊界

```txt
00-store總覽
→ 01-slides-store
→ 02-main-store
→ 03-snapshot-store
→ 04-keyboard與screen
```

這一輪先知道：

- 哪些資料歸誰管
- 哪些是內容狀態
- 哪些是互動狀態
- 哪些是歷史狀態
- 哪些是環境狀態

---

### 第二輪：看跨 store 狀態流

```txt
05-常見狀態流案例
→ 06-store與hooks關係
```

這一輪重點是：

- 使用者操作如何被 hook 接住
- hook 如何呼叫多個 store
- 哪些操作需要 snapshot
- 快捷鍵如何分流

---

### 第三輪：看畫面怎麼被驅動

```txt
07-store與畫面渲染關係
```

這一輪重點是：

- state 改變後畫面如何更新
- getter 如何推導畫面需要的資料
- UI 問題該回頭查哪個 state

---

### 第四輪：實戰追原始碼

```txt
08-原始碼追蹤路線
```

這一輪重點是：

- 遇到功能時從哪個檔案開始看
- 每種功能的追蹤順序
- 常用搜尋關鍵字
- 建議斷點位置

---

## 常見狀態流總覽

### 新增頁面

```txt
useSlideHandler.createSlide()
→ mainStore.setActiveElementIdList([])
→ slidesStore.addSlide(emptySlide)
→ addHistorySnapshot()
```

### 選取元素

```txt
useSelectElement.selectElement(id)
→ mainStore.setActiveElementIdList([id])
→ activeElementList getter 從 slidesStore.currentSlide.elements 找元素
```

### 移動元素

```txt
useGlobalHotkey.move()
→ useMoveElement.moveElement()
→ main store 提供選取 id
→ slides store 更新元素位置
→ snapshot store 記錄快照
```

### 刪除元素

```txt
useDeleteElement.deleteElement()
→ mainStore.setActiveElementIdList([])
→ slidesStore.updateSlide({ elements })
→ addHistorySnapshot()
```

### Undo / Redo

```txt
useHistorySnapshot.undo() / redo()
→ snapshotStore.unDo() / reDo()
→ slidesStore.setSlides()
→ slidesStore.updateSlideIndex()
→ mainStore.setActiveElementIdList([])
```

### 播放模式

```txt
F5
→ slidesStore.updateSlideIndex(0)
→ screenStore.setScreening(true)
```

```txt
Shift + F5
→ screenStore.setScreening(true)
```

---

## 讀原始碼時的心法

不要只看 state 欄位。

更好的閱讀方式是：

```txt
state 看資料放哪裡
getter 看資料怎麼被推導
action 看資料怎麼被改變
hook 看 action 什麼時候被呼叫
component 看 state 如何變成畫面
```

---

## 功能導向閱讀法

如果你想理解某個功能，建議這樣追：

| 想理解的功能 | 建議入口 |
|---|---|
| 新增 / 刪除 / 複製頁面 | `useSlideHandler.ts` |
| 選取元素 | `useSelectElement.ts` |
| 移動元素 | `useMoveElement.ts` |
| 刪除元素 | `useDeleteElement.ts` |
| undo / redo | `useHistorySnapshot.ts` + `snapshot.ts` |
| 快捷鍵 | `useGlobalHotkey.ts` |
| 播放模式 | `useScreening.ts` + `screen.ts` |
| 畫布縮放 | `useScaleCanvas.ts` + `main.ts` |
| 畫面依賴資料 | `store getter` + component |

---

## 對照文件

### store

- [`PPTist-SourceCode/src/store/index.ts`](../../../PPTist-SourceCode/src/store/index.ts)
- [`PPTist-SourceCode/src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`PPTist-SourceCode/src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`PPTist-SourceCode/src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`PPTist-SourceCode/src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`PPTist-SourceCode/src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)

### hooks

- [`PPTist-SourceCode/src/hooks/useSlideHandler.ts`](../../../PPTist-SourceCode/src/hooks/useSlideHandler.ts)
- [`PPTist-SourceCode/src/hooks/useSelectElement.ts`](../../../PPTist-SourceCode/src/hooks/useSelectElement.ts)
- [`PPTist-SourceCode/src/hooks/useMoveElement.ts`](../../../PPTist-SourceCode/src/hooks/useMoveElement.ts)
- [`PPTist-SourceCode/src/hooks/useDeleteElement.ts`](../../../PPTist-SourceCode/src/hooks/useDeleteElement.ts)
- [`PPTist-SourceCode/src/hooks/useHistorySnapshot.ts`](../../../PPTist-SourceCode/src/hooks/useHistorySnapshot.ts)
- [`PPTist-SourceCode/src/hooks/useGlobalHotkey.ts`](../../../PPTist-SourceCode/src/hooks/useGlobalHotkey.ts)
- [`PPTist-SourceCode/src/hooks/useScreening.ts`](../../../PPTist-SourceCode/src/hooks/useScreening.ts)
- [`PPTist-SourceCode/src/hooks/useScaleCanvas.ts`](../../../PPTist-SourceCode/src/hooks/useScaleCanvas.ts)

### utils

- [`PPTist-SourceCode/src/utils/database.ts`](../../../PPTist-SourceCode/src/utils/database.ts)
- [`PPTist-SourceCode/src/utils/fullscreen.ts`](../../../PPTist-SourceCode/src/utils/fullscreen.ts)

---

## 回主索引

- [PPTist Learning Map](../README.md)
