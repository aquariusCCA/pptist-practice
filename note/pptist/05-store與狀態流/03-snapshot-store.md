# snapshot store

`snapshot store` 是 PPTist 中「歷史版本管理」的中心。

它主要負責：

- 初始化快照資料庫
- 把目前簡報內容存成一份歷史快照
- 判斷目前是否可以 undo / redo
- 根據歷史游標回復上一個或下一個版本
- 在 undo / redo 後清空目前選取狀態
- 控制快照數量上限，避免歷史資料無限膨脹

這一篇不是只看 `snapshotCursor`、`snapshotLength` 兩個欄位，而是整理 `src/store/snapshot.ts` 如何和 `slides store`、`main store`、`IndexedDB` 一起完成 undo / redo。

---

## 一句話理解

`snapshot store` 管的是「歷史版本」，不是單一元素操作。

也就是說，PPTist 的 undo / redo 不是只記錄：

```txt
把某個元素的 left 從 100 改成 120
```

而是保存一份版本快照：

```ts
{
  index: slidesStore.slideIndex,
  slides: JSON.parse(JSON.stringify(slidesStore.slides)),
}
```

所以回復時，流程是：

```txt
從 IndexedDB 取出某一份 snapshot
→ 用 snapshot.slides 整批替換 slides store 的 slides
→ 用 snapshot.index 還原目前頁面位置
→ 清空 main store 的選取狀態
```

這就是為什麼 `snapshot store` 的 state 很少，但它是 undo / redo 的核心。

---

## 責任邊界

### 它負責什麼

`snapshot store` 負責歷史版本管理：

- 快照游標：`snapshotCursor`
- 快照數量：`snapshotLength`
- 初始化第一份快照
- 新增一份快照
- undo：回到上一份快照
- redo：前進到下一份快照
- 控制 redo 分支被截斷
- 控制快照上限

### 它不負責什麼

`snapshot store` 不負責實際編輯簡報內容。

它不直接處理：

- 新增頁面
- 刪除頁面
- 新增元素
- 移動元素
- 修改文字
- 修改樣式
- 選取元素
- 畫布縮放
- 面板開關

這些分別屬於：

| 狀態或行為 | 負責位置 |
|---|---|
| 簡報內容、頁面、元素 | `slides store` |
| 選取、操作中元素、面板、畫布互動 | `main store` |
| 快捷鍵按鍵狀態 | `keyboard store` |
| 播放模式 | `screen store` |
| 快照保存與回復 | `snapshot store` |

`snapshot store` 只負責在適當時機把「目前簡報內容」保存起來，或把「某個歷史版本」還原回去。

---

## 核心心智模型

讀 `snapshot store` 時，要先建立三個觀念。

### 1. 快照內容不是 diff，而是整份 slides

PPTist 的快照不是操作差異記錄。

它不是：

```txt
operation: updateElement
id: xxx
before: { left: 100 }
after: { left: 120 }
```

而是：

```ts
{
  index: number,
  slides: Slide[],
}
```

也就是保存：

- 當時停在哪一頁
- 當時整份 `slides` 長什麼樣

這種做法的優點是回復邏輯簡單。缺點是每份快照資料量比較大，所以原始碼會限制快照數量。

---

### 2. `snapshotCursor` 是歷史陣列位置，不是資料庫 id

`snapshotCursor` 可以理解成目前站在歷史紀錄的第幾格。

例如：

```txt
快照陣列：    [S0] [S1] [S2] [S3]
游標位置：                 ↑
snapshotCursor = 2
snapshotLength = 4
```

注意：

```txt
snapshotCursor ≠ IndexedDB 裡的 snapshot.id
```

IndexedDB 裡的資料有自增 id。  
但 `snapshotCursor` 是根據 `orderBy('id').toArray()` 取出後的陣列索引來移動。

所以它更像：

```txt
目前位於排序後快照列表的第幾筆
```

不是：

```txt
目前這筆快照的資料庫 id 是多少
```

---

### 3. undo / redo 回復的是內容版本，互動狀態會被清掉

undo / redo 時，原始碼會做兩件重要的事：

```ts
slidesStore.setSlides(slides)
slidesStore.updateSlideIndex(slideIndex)
```

這會回復內容。

接著還會做：

```ts
mainStore.setActiveElementIdList([])
```

這會清空選取狀態。

所以使用者 undo / redo 後，簡報內容會回到歷史版本，但目前選到的元素會被清掉。

原因是：

- 回復後的元素可能已經不是原本那個元素
- 原本選取的 ID 可能已經不存在
- 清空選取能避免 UI 顯示錯誤狀態

---

## state

`snapshot store` 的 state 很少，只有兩個。

| state | 初始值 | 用途 | 原始碼閱讀重點 |
|---|---:|---|---|
| `snapshotCursor` | `-1` | 目前歷史快照游標 | 初始化前是 `-1`，建立第一份快照後變成 `0` |
| `snapshotLength` | `0` | 目前有效快照數量 | 用來判斷 redo 邊界與快照尾端位置 |

---

## 原始碼命名注意

`src/store/snapshot.ts` 裡的 state interface 命名是：

```ts
export interface ScreenState {
  snapshotCursor: number
  snapshotLength: number
}
```

這個名稱看起來像 `screen store`，但實際上它是在 `snapshot.ts` 裡描述 snapshot store 的 state。

閱讀時可以把它理解成：

```ts
SnapshotState
```

比較不會被名稱干擾。

---

## getters

### `canUndo`

判斷目前是否可以 undo。

```ts
canUndo(state) {
  return state.snapshotCursor > 0
}
```

意思是：

- 游標在第一份快照時，不能再往前 undo
- 游標大於 `0` 時，代表前面還有歷史版本可以回復

例如：

```txt
[S0] [S1] [S2]
 ↑
 cursor = 0
 canUndo = false
```

```txt
[S0] [S1] [S2]
      ↑
 cursor = 1
 canUndo = true
```

---

### `canRedo`

判斷目前是否可以 redo。

```ts
canRedo(state) {
  return state.snapshotCursor < state.snapshotLength - 1
}
```

意思是：

- 游標在最後一份快照時，不能 redo
- 游標還沒到最後一份快照時，可以往後 redo

例如：

```txt
[S0] [S1] [S2]
      ↑
 cursor = 1
 length = 3
 canRedo = true
```

```txt
[S0] [S1] [S2]
           ↑
 cursor = 2
 length = 3
 canRedo = false
```

---

## 快照資料存在 IndexedDB

`snapshot store` 本身只存：

```ts
snapshotCursor
snapshotLength
```

真正的快照內容存在 IndexedDB。

在 `src/utils/database.ts` 中，`Snapshot` 的資料結構是：

```ts
export interface Snapshot {
  id: number
  index: number
  slides: Slide[]
}
```

其中：

| 欄位 | 意義 |
|---|---|
| `id` | IndexedDB 自增主鍵 |
| `index` | 快照當下的 `slideIndex` |
| `slides` | 快照當下的整份簡報頁面資料 |

IndexedDB store 的設定是：

```ts
snapshots: '++id'
```

代表 `snapshots` 表使用自增 id。

---

## 為什麼不用 localStorage？

這份筆記不用過度展開瀏覽器儲存技術，但要知道：

- 快照可能很大
- 每一份快照包含整份 `slides`
- `slides` 裡可能有很多頁、很多元素、很多圖片或樣式資料

所以快照內容放在 IndexedDB，比放在 Pinia state 或 localStorage 更合理。

Pinia state 只保留游標與長度，避免把大量歷史內容直接塞進記憶體狀態中。

---

## actions 分類

`snapshot store` 的 actions 可以分成 4 類。

| 類型 | actions | 用途 |
|---|---|---|
| 基本設定 | `setSnapshotCursor`、`setSnapshotLength` | 直接更新游標與長度 |
| 初始化 | `initSnapshotDatabase` | 建立第一份快照 |
| 新增歷史 | `addSnapshot` | 在使用者完成有效操作後新增一份快照 |
| 歷史回復 | `unDo`、`reDo` | 回復上一份或下一份快照 |

---

## action 細節

### `setSnapshotCursor(cursor)`

更新目前快照游標。

```ts
setSnapshotCursor(cursor: number) {
  this.snapshotCursor = cursor
}
```

它只改游標，不會改 IndexedDB 裡的資料。

---

### `setSnapshotLength(length)`

更新目前有效快照數量。

```ts
setSnapshotLength(length: number) {
  this.snapshotLength = length
}
```

它只改長度記錄，不會新增或刪除快照。

真正新增、刪除快照是在 `addSnapshot()` 裡完成。

---

### `initSnapshotDatabase()`

初始化第一份快照。

流程：

```txt
取得 slides store
→ 讀取目前 slideIndex
→ 深拷貝目前 slides
→ 寫入 IndexedDB snapshots
→ snapshotCursor 設為 0
→ snapshotLength 設為 1
```

原始碼核心概念：

```ts
const newFirstSnapshot = {
  index: slidesStore.slideIndex,
  slides: JSON.parse(JSON.stringify(slidesStore.slides)),
}

await db.snapshots.add(newFirstSnapshot)
this.setSnapshotCursor(0)
this.setSnapshotLength(1)
```

這代表初始化完成後，歷史狀態會變成：

```txt
[S0]
 ↑
cursor = 0
length = 1
```

此時：

```txt
canUndo = false
canRedo = false
```

因為只有一份初始快照。

---

### `addSnapshot()`

新增一份歷史快照。

這是 `snapshot store` 最重要的 action。

它不是單純 `db.snapshots.add()`，而是還處理了三件事：

1. 如果目前游標不在最後，刪除 redo 分支
2. 新增目前版本快照
3. 如果超過快照上限，刪除最舊快照

---

## `addSnapshot()` 的完整狀態流

### 第一步：取得目前所有快照 id

```ts
const allKeys = await db.snapshots.orderBy('id').keys()
```

這裡拿到的是 IndexedDB 裡依照 `id` 排序後的 key。

---

### 第二步：判斷是否要刪掉 redo 分支

如果使用者已經 undo 到中間版本：

```txt
[S0] [S1] [S2] [S3]
      ↑
   cursor = 1
```

接著又做了新操作，就不能再 redo 到 `S2`、`S3`。

所以原始碼會刪除游標後方的快照：

```ts
if (this.snapshotCursor >= 0 && this.snapshotCursor < allKeys.length - 1) {
  needDeleteKeys = allKeys.slice(this.snapshotCursor + 1)
}
```

狀態會變成：

```txt
原本： [S0] [S1] [S2] [S3]
              ↑

新操作後： [S0] [S1] [S4]
                    ↑
```

這就是常見編輯器的 undo / redo 行為。

---

### 第三步：新增目前快照

新增的快照內容是：

```ts
const snapshot = {
  index: slidesStore.slideIndex,
  slides: JSON.parse(JSON.stringify(slidesStore.slides)),
}

await db.snapshots.add(snapshot)
```

注意這裡用了：

```ts
JSON.parse(JSON.stringify(...))
```

這是在做深拷貝。

目的：

- 避免快照裡的 `slides` 繼續和目前 store state 共用同一份物件引用
- 確保之後 `slides store` 被修改時，不會污染已經保存的歷史快照

---

### 第四步：計算新的快照長度

```ts
let snapshotLength = allKeys.length - needDeleteKeys.length + 1
```

意思是：

```txt
新的快照數量
= 原本快照數量
- 準備刪除的 redo 快照數量
+ 新增的這一份快照
```

---

### 第五步：控制快照上限

原始碼限制快照最多保留 20 筆：

```ts
const snapshotLengthLimit = 20
```

如果超過 20 筆，就刪除最舊的一筆：

```ts
if (snapshotLength > snapshotLengthLimit) {
  needDeleteKeys.push(allKeys[0])
  snapshotLength--
}
```

因此歷史資料不會無限增加。

你可以把它想成：

```txt
最多只保留最近 20 個版本
```

---

### 第六步：維持 undo 後的頁面焦點

原始碼有一段容易忽略：

```ts
if (snapshotLength >= 2) {
  db.snapshots.update(allKeys[snapshotLength - 2] as number, {
    index: slidesStore.slideIndex,
  })
}
```

這段是為了讓「撤回操作後維持頁面焦點不變」。

直覺理解：

- 使用者在某一頁做操作
- 操作完成後新增快照
- 程式會把倒數第二份快照的 `index` 更新成目前頁面索引
- 這樣 undo 回去時，畫面仍然盡量停留在使用者操作的那一頁

這是為了改善使用者體驗，不只是資料保存。

---

### 第七步：真正刪除不需要的快照

```ts
await db.snapshots.bulkDelete(needDeleteKeys as number[])
```

會刪掉：

- undo 後被截斷的 redo 分支
- 超過 20 筆時最舊的快照

---

### 第八步：更新游標與長度

```ts
this.setSnapshotCursor(snapshotLength - 1)
this.setSnapshotLength(snapshotLength)
```

新增快照後，游標會移到最後一份快照。

```txt
[S0] [S1] [S2] [S3]
                ↑
          cursor = length - 1
```

---

## `unDo()`

`unDo()` 負責回到上一份快照。

### 防呆條件

```ts
if (this.snapshotCursor <= 0) return
```

如果游標已經在第一份快照，就不能再 undo。

---

### 狀態流

```txt
檢查是否可以 undo
→ snapshotCursor - 1
→ 從 IndexedDB 依 id 排序取出所有快照
→ 取得上一份快照
→ 取出 index 與 slides
→ 修正 slideIndex 不可超出 slides 範圍
→ slidesStore.setSlides(slides)
→ slidesStore.updateSlideIndex(slideIndex)
→ 更新 snapshotCursor
→ mainStore.setActiveElementIdList([])
```

---

### 為什麼要修正 `slideIndex`？

原始碼有這段：

```ts
const slideIndex = index > slides.length - 1 ? slides.length - 1 : index
```

這是為了避免快照中的 `index` 超過當前回復版本的頁面數量。

例如：

```txt
原本在第 5 頁
但回復後那份快照只有 3 頁
```

這時如果還用 `index = 4`，就會讀不到頁面。

所以原始碼會把它修正成最後一頁：

```txt
slides.length - 1
```

---

### 為什麼 undo 後要清空選取？

```ts
mainStore.setActiveElementIdList([])
```

因為 undo 會整批替換 `slides`。

原本選取的元素可能：

- 已經不存在
- 位置或內容已經不同
- 所在頁面已經改變
- 多選狀態已經不合理

所以回復版本後，先清空選取狀態是比較安全的做法。

---

## `reDo()`

`reDo()` 負責前進到下一份快照。

它和 `unDo()` 幾乎對稱。

### 防呆條件

```ts
if (this.snapshotCursor >= this.snapshotLength - 1) return
```

如果游標已經在最後一份快照，就不能 redo。

---

### 狀態流

```txt
檢查是否可以 redo
→ snapshotCursor + 1
→ 從 IndexedDB 依 id 排序取出所有快照
→ 取得下一份快照
→ 取出 index 與 slides
→ 修正 slideIndex 不可超出 slides 範圍
→ slidesStore.setSlides(slides)
→ slidesStore.updateSlideIndex(slideIndex)
→ 更新 snapshotCursor
→ mainStore.setActiveElementIdList([])
```

---

## 常見狀態流案例

### 案例 1：初始化簡報

```txt
App 初始化
→ slides store 載入初始 slides
→ snapshotStore.initSnapshotDatabase()
→ IndexedDB 新增第一份 snapshot
→ snapshotCursor = 0
→ snapshotLength = 1
```

結果：

```txt
[S0]
 ↑
```

---

### 案例 2：移動元素後新增快照

```txt
使用者拖曳元素
→ main store 記錄目前選取 / 操作中的元素
→ slides store 更新元素 left / top
→ snapshotStore.addSnapshot()
→ IndexedDB 新增一份 slides 快照
→ snapshotCursor 移到最後
```

狀態：

```txt
[S0] [S1]
      ↑
```

注意：

- `main store` 管「目前操作哪個元素」
- `slides store` 管「元素位置真的變了」
- `snapshot store` 管「操作後保存成歷史版本」

---

### 案例 3：連續 undo

```txt
目前狀態：
[S0] [S1] [S2] [S3]
                ↑
```

按一次 undo：

```txt
[S0] [S1] [S2] [S3]
           ↑
```

再按一次 undo：

```txt
[S0] [S1] [S2] [S3]
      ↑
```

每次 undo 都會：

```txt
取出上一份 snapshot
→ 整批替換 slides
→ 更新 slideIndex
→ 清空選取狀態
```

---

### 案例 4：undo 後做新操作

原本：

```txt
[S0] [S1] [S2] [S3]
                ↑
```

undo 兩次：

```txt
[S0] [S1] [S2] [S3]
      ↑
```

此時如果做新操作並新增快照：

```txt
[S0] [S1] [S4]
           ↑
```

`S2`、`S3` 會被刪掉。

這代表 redo 分支被截斷。

這是大多數編輯器共同的歷史管理行為。

---

### 案例 5：超過 20 筆快照

假設已經有 20 筆快照：

```txt
[S0] [S1] [S2] ... [S19]
                      ↑
```

再新增一份：

```txt
新增 S20
→ 超過上限 20
→ 刪除最舊的 S0
→ 保留最近 20 筆
```

結果可以理解成：

```txt
[S1] [S2] ... [S20]
                 ↑
```

所以使用者不能無限 undo，只能回到最近保留的歷史範圍。

---

## 與其他 store 的關係

### 與 `slides store`

`snapshot store` 最依賴的是 `slides store`。

新增快照時，它讀取：

```ts
slidesStore.slideIndex
slidesStore.slides
```

回復快照時，它寫回：

```ts
slidesStore.setSlides(slides)
slidesStore.updateSlideIndex(slideIndex)
```

所以：

```txt
slides store = 內容來源與回復目標
snapshot store = 歷史版本管理者
```

---

### 與 `main store`

`snapshot store` 不保存選取狀態。

但 undo / redo 後，它會呼叫：

```ts
mainStore.setActiveElementIdList([])
```

原因是版本回復後，原本的選取狀態可能失效。

所以：

```txt
snapshot store 負責回復內容
main store 負責清空互動狀態
```

---

### 與 `keyboard store`

`keyboard store` 本身不直接被 `snapshot store` 使用。

但使用者按下快捷鍵時，可能會觸發：

```txt
Ctrl + Z → snapshotStore.unDo()
Ctrl + Y / Ctrl + Shift + Z → snapshotStore.reDo()
```

所以兩者的關係是：

```txt
keyboard store 提供快捷鍵狀態
snapshot store 執行歷史回復
```

---

### 與 `screen store`

`screen store` 主要管播放模式。

`snapshot store` 通常用在編輯模式，因為 undo / redo 是編輯器操作的一部分。

兩者沒有強依賴關係。

---

## 什麼內容會被 undo / redo？

根據目前 `snapshot.ts`，快照保存的是：

```ts
index
slides
```

所以會被回復的是：

- 頁面陣列
- 頁面內元素
- 頁面內動畫
- 頁面備註、背景、翻頁方式等存在 `Slide` 裡的資料
- 當時的目前頁面索引

但不會直接回復：

- `main store` 的選取狀態
- `main store` 的面板開關
- `main store` 的畫布縮放
- `keyboard store` 的按鍵狀態
- `screen store` 的播放模式
- `snapshot store` 自己的歷史列表以外狀態

另外，因為快照物件沒有直接保存 `title`、`theme`，所以閱讀原始碼時要注意：

> `snapshot store` 主要保存 `slides` 與 `slideIndex`，不是把所有 Pinia store 狀態都存起來。

---

## 常見誤區

### 誤區 1：以為 undo 是反向執行 action

不是。

PPTist 不是保存每一步操作的反向動作，而是回復歷史快照。

```txt
不是：updateElement 的反向操作
而是：把 slides 整批換回上一份版本
```

---

### 誤區 2：以為 `snapshotCursor` 是資料庫 id

不是。

`snapshotCursor` 是排序後快照陣列的位置。

資料庫 id 是 `Snapshot.id`，由 IndexedDB 自增產生。

---

### 誤區 3：以為所有 UI 狀態都會被快照保存

不是。

快照主要保存內容資料。

選取、面板、畫布縮放、快捷鍵、播放模式這些 UI 或環境狀態不會作為 snapshot 內容保存。

---

### 誤區 4：以為可以無限 undo

不是。

原始碼限制最多保留 20 份快照。

超過後會刪掉最舊快照。

---

### 誤區 5：以為 undo 後 redo 分支永遠存在

不是。

如果 undo 到中間後做新操作，後方 redo 分支會被刪除。

這是 `addSnapshot()` 裡 `needDeleteKeys = allKeys.slice(this.snapshotCursor + 1)` 的核心作用。

---

## 原始碼閱讀順序

建議照這個順序讀：

1. `src/utils/database.ts`
   - 先看 `Snapshot` 型別
   - 再看 `snapshots: '++id'`
   - 了解快照實際存在 IndexedDB

2. `src/store/snapshot.ts` 的 state
   - 看 `snapshotCursor`
   - 看 `snapshotLength`

3. `canUndo` / `canRedo`
   - 先理解游標邊界

4. `initSnapshotDatabase()`
   - 看第一份快照如何建立

5. `addSnapshot()`
   - 重點看 redo 分支刪除
   - 重點看快照上限 20
   - 重點看倒數第二份快照 index 更新

6. `unDo()`
   - 看如何取上一份 snapshot
   - 看如何寫回 `slides store`
   - 看如何清空 `main store` 選取

7. `reDo()`
   - 和 `unDo()` 對照著看

---

## 讀這份 store 時要記住的句子

- `snapshot store` 管的是歷史版本，不是單一元素操作。
- 快照內容主要是 `slides` 與 `slideIndex`。
- `snapshotCursor` 是歷史游標，不是 IndexedDB id。
- `snapshotLength` 是目前有效快照數，不是 slides 數量。
- undo / redo 會整批替換 `slides store` 的內容。
- undo / redo 後會清空 `main store` 的選取狀態。
- undo 後做新操作，redo 分支會被刪掉。
- 快照最多保留 20 筆。
- 快照存在 IndexedDB，不是存在 Pinia state 裡。

---

## 對照

- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/utils/database.ts`](../../../PPTist-SourceCode/src/utils/database.ts)
- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)

## 回到本章

- [store 總覽](./00-store%E7%B8%BD%E8%A6%BD.md)
- [slides store](./01-slides-store.md)
- [main store](./02-main-store.md)
- [keyboard 與 screen](./04-keyboard%E8%88%87screen.md)
