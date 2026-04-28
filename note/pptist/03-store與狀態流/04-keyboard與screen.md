# keyboard 與 screen

`keyboard store` 與 `screen store` 都不是內容資料 store。

它們比較像是 PPTist 編輯器的「環境狀態」：

- `keyboard store`：記錄目前有哪些特殊按鍵正在被按住
- `screen store`：記錄目前是否進入簡報播放模式

這兩個 store 的 state 都很少，但它們會影響很多互動邏輯，例如快捷鍵、拖曳、多選、畫布平移、播放模式切換。

這一篇的重點不是欄位數量，而是理解：

> 為什麼這些狀態要被抽成 store？  
> 它們如何被 hooks / components 讀取？  
> 它們和 `main store`、`slides store` 的責任邊界在哪裡？

---

## 一句話理解

`keyboard store` 管的是「目前鍵盤環境」。  
`screen store` 管的是「目前是否處於播放模式」。

也就是：

```ts
ctrlKeyState
shiftKeyState
spaceKeyState
screening
```

它們不保存簡報內容，也不直接修改元素資料。

真正的內容仍然在：

```ts
slides store
```

真正的大部分編輯器互動狀態仍然在：

```ts
main store
```

所以這兩個 store 比較像「全域判斷條件」。

---

## 責任邊界

### `keyboard store` 負責什麼

`keyboard store` 負責保存特殊按鍵是否按下：

- Ctrl / Command 是否按下
- Shift 是否按下
- Space 是否按下
- Ctrl 或 Shift 是否有任一個處於啟用狀態

它提供給其他流程判斷：

- 是否正在多選
- 是否正在進行特殊拖曳
- 是否允許快捷鍵觸發
- 是否進入畫布平移類操作
- 是否要用不同方式處理滑鼠事件

### `keyboard store` 不負責什麼

`keyboard store` 不負責：

- 註冊 `keydown` / `keyup` 事件
- 決定 Ctrl + C 要複製元素還是複製頁面
- 決定 Delete 要刪除元素還是刪除頁面
- 執行 undo / redo
- 移動元素
- 切換頁面
- 判斷焦點在編輯區還是縮圖區

這些通常由 hooks 或其他 store 負責。

例如快捷鍵流程主要會出現在：

```ts
src/hooks/useGlobalHotkey.ts
```

`keyboard store` 只是提供「目前按鍵狀態」。

---

### `screen store` 負責什麼

`screen store` 負責保存目前是否正在播放簡報：

```ts
screening: boolean
```

它讓其他元件可以判斷：

- 現在要顯示編輯器畫面，還是播放畫面
- 現在是否處於簡報放映模式
- 退出播放模式時是否要回到編輯模式

### `screen store` 不負責什麼

`screen store` 不負責：

- 保存目前播放到第幾頁
- 保存 slides 內容
- 保存動畫資料
- 實際呼叫瀏覽器 fullscreen API
- 實際處理播放控制按鈕
- 實際處理 F5 / Shift + F5

目前播放到第幾頁仍然是：

```ts
slidesStore.slideIndex
```

實際進入與退出播放模式的流程通常由：

```ts
src/hooks/useScreening.ts
```

負責串接。

---

## keyboard store

`keyboard store` 是一個非常小的 Pinia store。

它的核心 state 是：

```ts
export interface KeyboardState {
  ctrlKeyState: boolean
  shiftKeyState: boolean
  spaceKeyState: boolean
}
```

對應初始化：

```ts
state: (): KeyboardState => ({
  ctrlKeyState: false,
  shiftKeyState: false,
  spaceKeyState: false,
})
```

---

## keyboard state 分析

| state | 意義 | 常見用途 |
|---|---|---|
| `ctrlKeyState` | Ctrl / Command 是否按下 | 快捷鍵、複選、複製、群組、縮放快捷鍵 |
| `shiftKeyState` | Shift 是否按下 | 多選、反向選取、Shift + F5 從目前頁播放 |
| `spaceKeyState` | Space 是否按下 | 畫布平移、拖曳模式、特殊互動判斷 |

---

### `ctrlKeyState`

`ctrlKeyState` 表面上叫 Ctrl，但在全域快捷鍵流程中，實際會把：

```ts
ctrlKey || metaKey
```

一起視為 Ctrl 類狀態。

也就是說：

- Windows / Linux：Ctrl
- macOS：Command

都可能讓 `ctrlKeyState` 變成 `true`。

這樣可以讓快捷鍵邏輯跨平台，例如：

- Ctrl / Command + C
- Ctrl / Command + V
- Ctrl / Command + Z
- Ctrl / Command + A
- Ctrl / Command + G

概念上都走同一套判斷。

---

### `shiftKeyState`

`shiftKeyState` 保存 Shift 是否按下。

它常見用途包括：

- 多選或加選
- 群組 / 取消群組快捷鍵判斷
- Shift + F5：從目前頁開始播放
- 某些拖曳或選取流程中的輔助判斷

要注意的是：

```ts
shiftKeyState
```

本身不決定「要做什麼」。

它只是告訴外部流程：

> 現在 Shift 正在被按住。

真正的行為仍然由呼叫端決定。

---

### `spaceKeyState`

`spaceKeyState` 保存 Space 是否按下。

在類似 PPT / 設計工具 / 編輯器的互動中，Space 常被拿來做：

- 畫布平移
- 暫時切換拖曳模式
- 特殊滑鼠互動狀態

PPTist 把它放進 store，是因為 Space 狀態不一定只被單一元件使用。

比較重要的一點是：

```ts
spaceKeyState
```

通常是「滑鼠互動的輔助條件」，不是內容資料。

---

## keyboard getter

`keyboard store` 有一個很重要的 getter：

```ts
ctrlOrShiftKeyActive(state) {
  return state.ctrlKeyState || state.shiftKeyState
}
```

它的意思是：

> Ctrl / Command 或 Shift，只要有任一個被按下，就視為特殊選取狀態啟用。

這個 getter 的價值是把常見判斷封裝起來。

如果很多地方都要寫：

```ts
ctrlKeyState || shiftKeyState
```

就容易重複，也容易寫漏。

封裝成：

```ts
ctrlOrShiftKeyActive
```

後，其他元件只需要關心：

> 現在是否有多選 / 特殊選取輔助鍵被啟用？

而不需要每次都自己組合 Ctrl 與 Shift。

---

## keyboard actions

`keyboard store` 的 actions 都是單純 setter：

```ts
setCtrlKeyState(active: boolean) {
  this.ctrlKeyState = active
}

setShiftKeyState(active: boolean) {
  this.shiftKeyState = active
}

setSpaceKeyState(active: boolean) {
  this.spaceKeyState = active
}
```

它們的角色很單純：

| action | 做什麼 |
|---|---|
| `setCtrlKeyState()` | 更新 Ctrl / Command 是否按下 |
| `setShiftKeyState()` | 更新 Shift 是否按下 |
| `setSpaceKeyState()` | 更新 Space 是否按下 |

這裡沒有複雜業務邏輯。

真正的邏輯通常在：

```ts
useGlobalHotkey.ts
Canvas 相關元件
選取 / 拖曳相關 hooks
```

---

## keyboard 狀態流

### 1. 按下 Ctrl / Command

```txt
使用者按下 Ctrl / Command
→ document keydown
→ useGlobalHotkey.ts 判斷 ctrlKey 或 metaKey
→ keyboardStore.setCtrlKeyState(true)
→ 其他流程可以讀取 ctrlKeyState / ctrlOrShiftKeyActive
```

這時候 store 只是記錄狀態。

例如後續使用者點選元素時，選取流程可以根據目前是否按住 Ctrl / Shift 來決定：

- 取代選取
- 加入選取
- 取消選取
- 進入特殊選取模式

---

### 2. 按下 Shift

```txt
使用者按下 Shift
→ document keydown
→ useGlobalHotkey.ts 判斷 shiftKey
→ keyboardStore.setShiftKeyState(true)
→ ctrlOrShiftKeyActive 變成 true
```

Shift 狀態可能影響：

- 多選
- 快捷鍵組合
- Shift + F5 播放
- 拖曳 / 選取流程

---

### 3. 按下 Space

```txt
使用者按下 Space
→ document keydown
→ useGlobalHotkey.ts 判斷 key === SPACE
→ 如果快捷鍵沒有被禁用
→ keyboardStore.setSpaceKeyState(true)
→ 其他互動流程可以讀取 spaceKeyState
```

這裡有一個細節：

```ts
spaceKeyState
```

通常會受到：

```ts
disableHotkeys
```

影響。

也就是說，當使用者正在輸入文字或某些情境下快捷鍵被禁用，Space 不應該被當成全域操作鍵，否則使用者打空白會觸發畫布互動，體驗會壞掉。

---

### 4. 放開按鍵

```txt
使用者放開按鍵
→ document keyup
→ useGlobalHotkey.ts 重置鍵盤狀態
→ ctrlKeyState / shiftKeyState / spaceKeyState 回到 false
```

也就是：

```ts
if (ctrlKeyState.value) keyboardStore.setCtrlKeyState(false)
if (shiftKeyState.value) keyboardStore.setShiftKeyState(false)
if (spaceKeyState.value) keyboardStore.setSpaceKeyState(false)
```

這裡不是只重置單一 key，而是把目前可能啟用的特殊鍵狀態都清掉。

---

### 5. 視窗失焦時重置

這是非常重要的細節。

```txt
使用者按住 Ctrl / Shift / Space
→ 切換視窗或瀏覽器失焦
→ keyup 事件可能不會正常觸發
→ window blur
→ 重置 keyboard store
```

如果沒有這個流程，可能會發生：

```txt
使用者已經放開 Ctrl
但系統仍然以為 Ctrl 被按住
```

結果就會造成：

- 點選元素行為錯亂
- 快捷鍵判斷錯亂
- 拖曳模式殘留
- Space 平移狀態卡住

所以 `blur` 時重置按鍵狀態，是編輯器類產品很重要的防呆。

---

## keyboard store 與 main store 的關係

`keyboard store` 和 `main store` 很容易混淆，因為它們都跟互動有關。

但兩者責任不同：

| store | 負責 |
|---|---|
| `keyboard store` | 目前鍵盤特殊鍵是否按下 |
| `main store` | 目前編輯器互動狀態，例如焦點、選取、面板、快捷鍵是否禁用 |

例如：

```ts
keyboardStore.ctrlKeyState
mainStore.disableHotkeys
mainStore.editorAreaFocus
mainStore.thumbnailsFocus
```

它們會一起決定快捷鍵行為。

但分工是：

```txt
keyboard store：現在有沒有按 Ctrl / Shift / Space
main store：現在編輯器允不允許快捷鍵、焦點在哪裡
hook：根據兩邊狀態決定要做什麼
```

例如 Ctrl + C：

```txt
keydown Ctrl + C
→ keyboard store 記錄 Ctrl 狀態
→ useGlobalHotkey.ts 檢查 disableHotkeys
→ 檢查 activeElementIdList / thumbnailsFocus
→ 如果有選取元素，複製元素
→ 如果縮圖區聚焦，複製頁面
```

所以不要把快捷鍵全部理解成 `keyboard store` 的責任。

`keyboard store` 只是快捷鍵系統的一小塊基礎狀態。

---

## keyboard store 與 slides store 的關係

`keyboard store` 不直接讀寫 `slides store`。

但快捷鍵流程可能會因為鍵盤狀態，間接修改簡報內容。

例如：

```txt
方向鍵
→ useGlobalHotkey.ts 判斷目前是否選到元素
→ 如果有選到元素
→ useMoveElement.moveElement()
→ slides store 更新元素位置
→ snapshot store 新增歷史快照
```

在這條流程中：

- `keyboard store`：只保存按鍵狀態
- `main store`：提供目前選取的元素 ID
- `slides store`：真正更新元素座標
- `snapshot store`：保存歷史版本

所以 `keyboard store` 是操作入口的輔助條件，不是內容修改者。

---

# screen store

`screen store` 比 `keyboard store` 更小。

它只有一個 state：

```ts
export interface ScreenState {
  screening: boolean
}
```

初始化：

```ts
state: (): ScreenState => ({
  screening: false,
})
```

---

## screen state 分析

| state | 意義 |
|---|---|
| `screening` | 是否處於簡報播放模式 |

當：

```ts
screening === false
```

代表使用者在編輯模式。

當：

```ts
screening === true
```

代表使用者進入簡報播放模式。

---

## screen actions

`screen store` 只有一個 action：

```ts
setScreening(screening: boolean) {
  this.screening = screening
}
```

它只做一件事：

> 設定目前是否進入播放模式。

---

## screen 狀態流

### 1. 從第一頁開始播放

常見流程是：

```txt
使用者按 F5
→ useGlobalHotkey.ts 捕捉 F5
→ useScreening.enterScreeningFromStart()
→ slidesStore.updateSlideIndex(0)
→ enterFullscreen()
→ screenStore.setScreening(true)
→ UI 切換成播放模式
```

這裡要注意：

```ts
screen store
```

只保存「是否正在播放」。

它不保存目前第幾頁。

目前第幾頁仍然由：

```ts
slidesStore.slideIndex
```

管理。

---

### 2. 從目前頁開始播放

常見流程是：

```txt
使用者按 Shift + F5
→ useGlobalHotkey.ts 捕捉 Shift + F5
→ useScreening.enterScreening()
→ enterFullscreen()
→ screenStore.setScreening(true)
→ 從目前 slideIndex 進入播放
```

這和 F5 的差異在於：

| 操作 | 行為 |
|---|---|
| F5 | 先把 `slideIndex` 改成 `0`，再播放 |
| Shift + F5 | 不改 `slideIndex`，從目前頁播放 |

---

### 3. 退出播放模式

退出流程通常是：

```txt
使用者退出播放
→ useScreening.exitScreening()
→ screenStore.setScreening(false)
→ 如果目前瀏覽器仍在 fullscreen，呼叫 exitFullscreen()
→ UI 回到編輯模式
```

也就是：

```txt
screening: true
→ screening: false
```

---

## screen store 與 slides store 的關係

`screen store` 不保存播放頁面。

播放頁面仍然由：

```ts
slidesStore.slideIndex
```

決定。

所以播放模式其實是兩個狀態一起運作：

```txt
screenStore.screening：現在是不是播放模式
slidesStore.slideIndex：現在播放 / 編輯到第幾頁
```

例如：

```txt
從第一頁播放
→ slidesStore.updateSlideIndex(0)
→ screenStore.setScreening(true)
```

這樣設計的好處是：

- 播放模式只需要管模式切換
- 頁面索引仍然由原本的內容 store 管理
- 編輯模式和播放模式可以共用同一個 `slideIndex`

---

## screen store 與 fullscreen API 的關係

`screen store` 不直接操作瀏覽器 fullscreen API。

實際 fullscreen 流程通常封裝在：

```ts
src/utils/fullscreen.ts
```

再由：

```ts
src/hooks/useScreening.ts
```

呼叫。

所以它們的分工是：

```txt
screen store：保存是否播放
useScreening：串接播放流程
fullscreen utils：操作瀏覽器 fullscreen API
slides store：保存目前頁面索引
```

這樣可以避免 store 直接混入瀏覽器副作用。

---

## keyboard 與 screen 的共同特性

`keyboard store` 與 `screen store` 都有幾個共同點：

| 特性 | 說明 |
|---|---|
| state 少 | 都只有少量 boolean 狀態 |
| 不是內容資料 | 不保存 slide / element / animation |
| 偏環境狀態 | 代表目前操作環境，而不是簡報本體 |
| 被其他流程使用 | 通常由 hooks / components 讀取後決定行為 |
| actions 很單純 | 幾乎都是 setter |

---

## 常見誤區

### 誤區 1：以為 keyboard store 負責所有快捷鍵

不正確。

`keyboard store` 只保存按鍵狀態。

快捷鍵要做什麼，通常由：

```ts
useGlobalHotkey.ts
```

決定。

例如 Ctrl + Z 觸發 undo，真正流程會進到歷史快照相關邏輯，不是由 `keyboard store` 自己執行。

---

### 誤區 2：以為 Ctrl / Shift / Space 都應該放在 main store

可以放，但 PPTist 把它們抽成獨立的 `keyboard store` 更清楚。

因為這些狀態不是「編輯器選取狀態」，而是「鍵盤環境狀態」。

這樣分開後：

```txt
main store：編輯器互動狀態
keyboard store：鍵盤輸入狀態
```

責任比較乾淨。

---

### 誤區 3：以為 screen store 負責整個播放系統

不正確。

`screen store` 只保存：

```ts
screening
```

真正播放系統還會牽涉：

- `slidesStore.slideIndex`
- 播放元件
- fullscreen utils
- 播放控制 hooks
- 動畫播放流程

所以它只是播放模式的全域旗標，不是完整播放引擎。

---

### 誤區 4：以為 screening 代表目前播放頁

不正確。

```ts
screening
```

只代表是否在播放模式。

目前頁面仍然是：

```ts
slideIndex
```

---

### 誤區 5：忽略 blur 重置按鍵狀態

這是讀鍵盤互動時很容易漏掉的細節。

如果只監聽 `keyup`，使用者切換視窗時可能造成按鍵狀態卡住。

所以全域鍵盤狀態通常需要在：

```ts
window blur
```

時重置。

---

## 狀態流案例

### 案例 1：Ctrl + Z 執行 undo

```txt
使用者按 Ctrl / Command + Z
→ useGlobalHotkey.ts 捕捉 keydown
→ keyboardStore.setCtrlKeyState(true)
→ 檢查 mainStore.disableHotkeys
→ 執行 undo()
→ snapshot store 讀取上一份快照
→ slides store 回復 slides 與 slideIndex
→ main store 清空選取元素
```

這個案例可以看出：

```txt
keyboard store 只是快捷鍵入口狀態
snapshot store 才是真正處理 undo / redo 的地方
```

---

### 案例 2：方向鍵移動元素

```txt
使用者按方向鍵
→ useGlobalHotkey.ts 捕捉 Arrow key
→ 判斷 mainStore.activeElementIdList 是否有選取元素
→ 如果有元素，呼叫 moveElement()
→ slides store 更新元素位置
→ snapshot store 新增歷史快照
```

這裡 `keyboard store` 不一定是主要角色。

但整體鍵盤事件仍然是從全域快捷鍵流程進入。

---

### 案例 3：按住 Ctrl / Shift 後框選元素

```txt
使用者按住 Ctrl / Shift
→ keyboardStore 更新 ctrlKeyState / shiftKeyState
→ ctrlOrShiftKeyActive 變成 true
→ 框選或點選流程讀取 ctrlOrShiftKeyActive
→ 判斷是否加選 / 保留既有選取
→ main store 更新 activeElementIdList
```

這個案例可以看出：

```txt
keyboard store：提供輔助鍵狀態
main store：保存選取結果
slides store：保存元素內容
```

---

### 案例 4：按 Space 進入畫布平移類互動

```txt
使用者按下 Space
→ useGlobalHotkey.ts 確認快捷鍵沒有被禁用
→ keyboardStore.setSpaceKeyState(true)
→ Canvas 相關流程讀取 spaceKeyState
→ 進入畫布拖曳 / 平移類互動
→ 放開 Space 或視窗失焦時重置
```

這裡要注意：

```txt
Space 是操作環境狀態，不是內容狀態
```

所以它不應該寫進 `slides store`。

---

### 案例 5：F5 從第一頁播放

```txt
使用者按 F5
→ useGlobalHotkey.ts 捕捉 F5
→ useScreening.enterScreeningFromStart()
→ slidesStore.updateSlideIndex(0)
→ enterFullscreen()
→ screenStore.setScreening(true)
→ 播放畫面出現
```

這個案例可以看出：

```txt
screen store：控制是否播放
slides store：控制從第幾頁開始
```

---

### 案例 6：Shift + F5 從目前頁播放

```txt
使用者按 Shift + F5
→ useGlobalHotkey.ts 捕捉 Shift + F5
→ useScreening.enterScreening()
→ enterFullscreen()
→ screenStore.setScreening(true)
→ 從目前 slideIndex 播放
→ keyboardStore.setShiftKeyState(false)
```

這裡有一個小細節：

Shift + F5 進入播放後，流程會把 Shift 狀態重置，避免播放模式開始後還殘留 Shift 按下狀態。

---

## 原始碼閱讀順序

如果你要追這兩個 store，不建議只看 store 檔案。

建議順序是：

```txt
src/store/keyboard.ts
→ src/hooks/useGlobalHotkey.ts
→ 搜尋 ctrlKeyState / shiftKeyState / spaceKeyState / ctrlOrShiftKeyActive
→ 看 Canvas、選取、拖曳相關元件如何使用
```

接著看 screen：

```txt
src/store/screen.ts
→ src/hooks/useScreening.ts
→ 搜尋 screening
→ 看 App.vue 或播放相關元件如何根據 screening 切換畫面
```

---

## 讀完這篇要記住的事

- `keyboard store` 是鍵盤環境狀態，不是快捷鍵執行器
- `screen store` 是播放模式旗標，不是播放引擎
- Ctrl / Command、Shift、Space 的狀態會被全域快捷鍵與互動流程使用
- `ctrlOrShiftKeyActive` 是對 Ctrl / Shift 輔助鍵狀態的封裝
- `screening` 只代表是否在播放模式，不代表目前頁面
- 目前頁面仍然由 `slidesStore.slideIndex` 管理
- `useGlobalHotkey.ts` 是理解 keyboard 狀態流的關鍵入口
- `useScreening.ts` 是理解播放模式切換的關鍵入口
- 這兩個 store 的 actions 很單純，真正的重點在「誰讀取它們，以及讀取後做什麼」

---

## 對照

- [`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)
- [`src/hooks/useGlobalHotkey.ts`](../../../PPTist-SourceCode/src/hooks/useGlobalHotkey.ts)
- [`src/hooks/useScreening.ts`](../../../PPTist-SourceCode/src/hooks/useScreening.ts)
