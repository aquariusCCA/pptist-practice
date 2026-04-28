# slides store

`slides store` 是 PPTist 中「簡報內容資料」的中心。

它主要負責：

- 保存整份簡報的內容資料
- 保存目前頁面的索引位置
- 更新頁面與元素資料
- 根據目前頁面衍生出可用的動畫資料
- 提供其他模組查詢目前頁面、目前元素與動畫的資料來源

這一篇不是重複 `Slide`、`PPTElement`、`SlideTheme` 的完整型別欄位，而是整理 `src/store/slides.ts` 如何操作這些資料。

---

## 一句話理解

`slides store` 管的是「簡報本體」。

也就是：

```ts
title
theme
slides
slideIndex
viewportSize
viewportRatio
templates
```

其中最重要的是：

```ts
slides + slideIndex
```

`slides` 是整份簡報的頁面陣列，`slideIndex` 是目前頁面的指標。

所以很多地方不是直接保存 `currentSlide`，而是透過：

```ts
slides[slideIndex]
```

動態取得目前頁面。

---

## 責任邊界

### 它負責什麼

`slides store` 負責內容資料的讀寫：

- 簡報標題
- 全域主題
- 頁面陣列
- 目前頁面索引
- 頁面內元素
- 頁面動畫
- 頁面備註、背景、翻頁方式、章節標記等頁面屬性
- 視口比例與模板資料

### 它不負責什麼

`slides store` 不負責：

- 目前選取了哪些元素
- 拖曳狀態
- 縮放操作中狀態
- 面板開關
- 快捷鍵是否啟用
- undo / redo 的 IndexedDB 快照管理
- 播放模式是否啟用

這些分別屬於：

| 狀態 | 負責 store |
|---|---|
| 選取、拖曳、面板、工具列 | `main store` |
| undo / redo | `snapshot store` |
| Ctrl / Shift / Space 按鍵 | `keyboard store` |
| 播放模式 | `screen store` |

---

## state

`SlidesState` 主要包含 7 個欄位。

| state | 用途 | 原始碼閱讀重點 |
|---|---|---|
| `title` | 簡報標題 | 空字串會被 `setTitle()` 還原成預設標題 |
| `theme` | 全域主題樣式 | 用於預設顏色、字體、陰影、外框等 |
| `slides` | 簡報頁面資料 | 真正的內容核心，每一頁是一個 `Slide` |
| `slideIndex` | 目前頁面索引 | `currentSlide` 由它推導出來 |
| `viewportSize` | 可視區域寬度基數 | 預設 `1000`，和畫布尺寸換算有關 |
| `viewportRatio` | 可視區域比例 | 預設 `0.5625`，也就是 16:9 |
| `templates` | 模板資料 | 存放官方與社群模板資訊 |

---

## `slides` 的資料層級

理解 `slides store` 時，最重要的是看清楚資料層級。

```txt
slides store
└─ slides: Slide[]
   └─ Slide
      ├─ id
      ├─ elements: PPTElement[]
      ├─ notes?
      ├─ remark?
      ├─ background?
      ├─ animations?
      ├─ turningMode?
      ├─ sectionTag?
      └─ type?
```

`slides store` 的多數 action 都是在操作這個結構：

- 頁面層級：新增、刪除、更新 `Slide`
- 元素層級：新增、刪除、更新 `Slide.elements`
- 屬性層級：移除 `Slide` 或 `PPTElement` 的某些欄位

---

## getters

### `currentSlide`

取得目前頁面。

```ts
currentSlide(state) {
  return state.slides[state.slideIndex]
}
```

它不是獨立 state，而是由 `slides` 和 `slideIndex` 推導出來。

這代表：

- `slideIndex` 改變，`currentSlide` 就會改變
- `slides` 改變，`currentSlide` 也會跟著改變
- 其他模組通常會透過它取得目前頁面的元素資料

---

### `currentSlideAnimations`

取得目前頁面有效的動畫。

重點是：它不只是直接回傳 `currentSlide.animations`。

它會先取得目前頁面的元素 ID：

```ts
const elIds = currentSlide.elements.map(el => el.id)
```

然後只保留 `elId` 仍然存在於目前頁面元素中的動畫：

```ts
currentSlide.animations.filter(animation => elIds.includes(animation.elId))
```

這樣可以避免元素已經被刪掉，但動畫資料還殘留時，畫面或播放流程讀到「孤兒動畫」。

---

### `formatedAnimations`

> 原始碼命名是 `formatedAnimations`，不是 `formattedAnimations`。

它負責把目前頁面的動畫轉成播放流程需要的格式。

動畫觸發方式有三種：

| trigger | 意思 | getter 的處理方式 |
|---|---|---|
| `click` | 點擊後播放 | 建立一個新的動畫段落 |
| `meantime` | 與上一動畫同時播放 | 合併到上一個動畫段落 |
| `auto` | 上一動畫之後自動播放 | 把上一段標記為 `autoNext: true`，再建立新段落 |

整理後的格式大致是：

```ts
{
  animations: PPTAnimation[]
  autoNext: boolean
}
```

所以這個 getter 不只是查詢資料，而是在做動畫播放序列的整理。

---

## actions 分類

`slides store` 的 actions 可以分成 5 類。

| 類型 | actions | 用途 |
|---|---|---|
| 基本設定 | `setTitle`、`setTheme`、`setViewportSize`、`setViewportRatio`、`setTemplates` | 更新簡報層級設定 |
| 整份簡報 | `setSlides` | 載入或整批替換頁面資料 |
| 頁面操作 | `addSlide`、`updateSlide`、`removeSlideProps`、`deleteSlide`、`updateSlideIndex` | 新增、更新、刪除頁面 |
| 元素操作 | `addElement`、`deleteElement`、`updateElement`、`removeElementProps` | 新增、更新、刪除元素 |
| 衍生流程配合 | 搭配 `snapshot store`、`main store` 使用 | action 本身只改內容，不直接管理歷史或選取狀態 |

---

## action 細節

### `setTitle(title)`

設定簡報標題。

如果傳入空值，會回到預設標題：

```ts
未命名演示文稿
```

這代表標題欄位不會長期維持空字串。

---

### `setTheme(themeProps)`

使用淺合併更新主題。

```ts
this.theme = {
  ...this.theme,
  ...themeProps,
}
```

注意這是淺層合併，不是深層合併。

例如只傳入：

```ts
{ shadow: { blur: 4 } }
```

會替換整個 `shadow` 物件，而不是只改 `shadow.blur`。

---

### `setSlides(slides, themeProps?)`

整批設定簡報頁面。

```ts
this.slides = slides
```

如果有傳入 `themeProps`，會順便呼叫 `setTheme(themeProps)`。

這通常會出現在：

- 載入檔案
- 匯入資料
- undo / redo 回復版本
- 套用某些整批頁面資料

---

### `addSlide(slide)`

新增一頁或多頁。

它支援：

```ts
Slide
Slide[]
```

流程是：

```txt
傳入 Slide 或 Slide[]
→ 統一轉成陣列
→ 如果新頁帶有 sectionTag，先刪除 sectionTag
→ 插入到目前頁面後方
→ slideIndex 指向新增頁位置
```

關鍵點：

```ts
const addIndex = this.slideIndex + 1
this.slides.splice(addIndex, 0, ...slides)
this.slideIndex = addIndex
```

所以 `addSlide()` 不是加到最後一頁，而是加到目前頁面後面。

另外，新增時會刪掉新頁的 `sectionTag`，避免複製頁面或插入模板時，把原本的章節標記一起帶進來造成章節結構混亂。

---

### `updateSlide(props, slideId?)`

更新頁面屬性。

如果有傳入 `slideId`，就更新指定頁面；如果沒有，就更新目前頁面。

```txt
有 slideId
→ 找出該 slide 的 index
→ 更新指定頁

沒有 slideId
→ 使用目前 slideIndex
→ 更新目前頁
```

更新方式是淺合併：

```ts
this.slides[slideIndex] = {
  ...this.slides[slideIndex],
  ...props,
}
```

常見用途：

- 更新背景
- 更新備註
- 更新動畫
- 更新翻頁效果
- 更新章節標記
- 更新頁面類型

---

### `removeSlideProps(data)`

移除某一頁的指定屬性。

資料格式：

```ts
{
  id: string
  propName: string | string[]
}
```

內部使用 `lodash` 的 `omit()`。

適合用在「某個欄位不只是要設成空，而是要從物件上移除」的情境，例如移除 `background`、`remark`、`sectionTag` 等可選欄位。

---

### `deleteSlide(slideId)`

刪除一頁或多頁。

它支援：

```ts
string
string[]
```

流程是：

```txt
slideId 統一轉成陣列
→ 深拷貝 slides
→ 逐一找出要刪除的頁面 index
→ 如果被刪頁有 sectionTag，嘗試把 sectionTag 轉移給下一頁
→ 刪除頁面
→ 計算新的 slideIndex
→ 回寫 slides
```

比較重要的細節是章節標記延續。

如果被刪除的頁面有 `sectionTag`：

```txt
被刪頁有 sectionTag
→ 檢查下一頁是否存在
→ 檢查下一頁是否沒有 sectionTag
→ 把 sectionTag 轉移到下一頁
```

這代表 `deleteSlide()` 不只是刪資料，也有維護章節結構的責任。

刪除後目前頁面會更新成：

```ts
Math.min(...deleteSlidesIndex)
```

如果刪的是最後一頁，會修正成最後一個合法索引。

---

### `updateSlideIndex(index)`

切換目前頁面。

它只做一件事：

```ts
this.slideIndex = index
```

所以頁面切換的核心不是改 `currentSlide`，而是改 `slideIndex`。

---

### `addElement(element)`

新增一個或多個元素到目前頁面。

它支援：

```ts
PPTElement
PPTElement[]
```

流程是：

```txt
傳入元素
→ 統一轉成陣列
→ 取得目前頁面的 elements
→ append 到 elements 後方
→ 回寫目前頁面的 elements
```

關鍵點是：它只會新增到目前頁面，不支援指定 `slideId`。

---

### `deleteElement(elementId)`

刪除目前頁面中的一個或多個元素。

它支援：

```ts
string
string[]
```

流程是：

```txt
elementId 統一轉成陣列
→ 取得目前頁面 elements
→ filter 掉要刪除的元素
→ 回寫目前頁面 elements
```

重要細節：

`deleteElement()` 只刪 `elements`，不會主動清除 `animations` 中對應的動畫。

所以 `currentSlideAnimations` 和 `formatedAnimations` 才會過濾掉 `elId` 已經不存在的動畫，避免殘留動畫影響播放。

---

### `updateElement(data)`

更新元素屬性。

資料格式：

```ts
{
  id: string | string[]
  props: Partial<PPTElement>
  slideId?: string
}
```

它支援三種能力：

1. 更新單一元素
2. 一次更新多個元素
3. 指定其他頁面的元素

流程是：

```txt
id 統一轉成陣列
→ 如果有 slideId，找指定頁面
→ 如果沒有 slideId，使用目前頁面
→ map elements
→ id 命中的元素做淺合併
→ 回寫 elements
```

更新方式是：

```ts
return elIdList.includes(el.id) ? { ...el, ...props } : el
```

所以這也是淺層合併。

例如更新：

```ts
{
  left: 100,
  top: 100,
}
```

會覆蓋元素的 `left`、`top`。

但如果更新巢狀物件，例如 `outline`、`shadow`、`text`，要注意可能會替換整個巢狀物件。

---

### `removeElementProps(data)`

移除目前頁面中指定元素的指定屬性。

資料格式：

```ts
{
  id: string
  propName: string | string[]
}
```

內部同樣使用 `omit()`。

它和 `updateElement()` 不同：

| action | 行為 |
|---|---|
| `updateElement()` | 更新或覆蓋欄位 |
| `removeElementProps()` | 從元素物件上移除欄位 |

適合用在移除可選屬性，例如：

- `shadow`
- `outline`
- `link`
- `groupId`
- `lock`

---

## 狀態流案例

### 案例一：切換頁面

```txt
使用者點擊左側縮圖
→ 呼叫 slidesStore.updateSlideIndex(index)
→ slideIndex 改變
→ currentSlide 重新指向 slides[index]
→ 編輯畫布、元素列表、動畫列表跟著更新
```

關鍵觀念：

```txt
切換頁面 = 改 slideIndex
```

不是把某一頁複製到另一個 `currentSlide` state。

---

### 案例二：新增頁面

```txt
使用者新增頁面
→ 呼叫 slidesStore.addSlide(newSlide)
→ 新頁插入到 slideIndex + 1
→ slideIndex 指向新頁
→ currentSlide 變成新增頁
→ 呼叫端通常再搭配 snapshotStore.addSnapshot()
```

注意：

`slides store` 本身不負責呼叫 `snapshotStore.addSnapshot()`。

是否記錄歷史，是由外部流程決定。

---

### 案例三：刪除頁面

```txt
使用者刪除頁面
→ 呼叫 slidesStore.deleteSlide(slideId)
→ 如果被刪頁有 sectionTag，嘗試轉移給下一頁
→ 從 slides 移除該頁
→ 重新計算 slideIndex
→ currentSlide 指向新的目前頁
→ 呼叫端通常再搭配 snapshotStore.addSnapshot()
```

這裡要特別注意：

`deleteSlide()` 有處理章節標記，所以它不是單純 `filter` 掉頁面而已。

---

### 案例四：新增元素

```txt
使用者插入文字 / 圖片 / 形狀
→ 建立新的 PPTElement
→ 呼叫 slidesStore.addElement(element)
→ 元素 append 到目前頁面的 elements
→ currentSlide.elements 更新
→ main store 可能再更新選取狀態
→ snapshot store 可能再記錄快照
```

分工關係：

| store | 責任 |
|---|---|
| `slides store` | 把元素放進頁面資料 |
| `main store` | 決定是否選取新元素 |
| `snapshot store` | 決定是否記錄歷史 |

---

### 案例五：移動元素

```txt
使用者拖曳元素
→ 拖曳過程可能由 hook / component 計算新座標
→ 呼叫 slidesStore.updateElement({ id, props: { left, top } })
→ 目前頁面中對應元素被淺合併更新
→ 畫布重新渲染元素位置
```

關鍵觀念：

`slides store` 不知道「拖曳事件」本身。

它只接收最後要更新的資料：

```ts
left
top
width
height
rotate
...
```

---

### 案例六：刪除元素與動畫殘留

```txt
使用者刪除元素
→ 呼叫 slidesStore.deleteElement(elementId)
→ elements 移除該元素
→ animations 可能仍然保留該元素的動畫資料
→ currentSlideAnimations 過濾掉 elId 不存在的動畫
→ formatedAnimations 也只處理有效動畫
```

所以動畫 getter 有一個保護作用：

```txt
只讓仍然存在於 elements 中的元素動畫進入播放流程
```

---

## 和其他 store 的關係

### 和 `main store`

`main store` 會保存目前選取的元素 ID，例如：

```ts
activeElementIdList
handleElementId
```

但真正的元素資料在 `slides store` 裡。

所以典型關係是：

```txt
main store 存 ID
slides store 存元素內容
main store getter 透過 slidesStore.currentSlide.elements 找出元素
```

這是 PPTist 狀態設計中很重要的切分：

```txt
互動狀態歸 main store
內容資料歸 slides store
```

---

### 和 `snapshot store`

`snapshot store` 的快照內容主要來自：

```txt
slides
slideIndex
```

也就是說，undo / redo 回復時，本質上是在回復 `slides store` 的內容版本。

但 `slides store` 本身不處理 IndexedDB，也不管理快照游標。

```txt
slides store = 內容資料
snapshot store = 歷史版本
```

---

### 和 `keyboard store`

`keyboard store` 不直接改 `slides store`。

它通常影響外部操作判斷，例如：

- 是否多選
- 是否等比例縮放
- 是否觸發快捷鍵

最後如果操作造成內容變化，才會透過 `slides store` action 更新內容。

---

### 和 `screen store`

`screen store` 控制是否進入播放模式。

播放時可能會讀取：

- `slides`
- `slideIndex`
- `currentSlide`
- `formatedAnimations`

但播放模式本身不屬於 `slides store`。

---

## 閱讀原始碼時要特別注意的點

### 1. `currentSlide` 是 getter，不是 state

不要找：

```ts
state.currentSlide
```

因為沒有這個 state。

要看：

```ts
slides[slideIndex]
```

---

### 2. 頁面更新和元素更新是分開的

頁面層級：

```ts
updateSlide()
removeSlideProps()
deleteSlide()
```

元素層級：

```ts
addElement()
deleteElement()
updateElement()
removeElementProps()
```

不要把 `Slide` 和 `PPTElement` 混在一起看。

---

### 3. 多數更新都是淺合併

`setTheme()`、`updateSlide()`、`updateElement()` 都是淺合併。

這代表巢狀物件要小心：

```txt
傳入 shadow
→ 可能替換整個 shadow

傳入 outline
→ 可能替換整個 outline

傳入 text
→ 可能替換整個 text
```

---

### 4. `deleteElement()` 不清動畫

元素刪掉後，動畫資料不一定同步刪掉。

因此 getter 會過濾掉不存在元素的動畫。

這是讀 `currentSlideAnimations` 和 `formatedAnimations` 時必須理解的原因。

---

### 5. `addSlide()` 會移除新頁的 `sectionTag`

這個細節容易忽略。

它代表新增頁面時，PPTist 不希望新頁直接沿用原本的章節標記。

---

### 6. `deleteSlide()` 有章節標記轉移邏輯

刪除頁面時，如果該頁有 `sectionTag`，會嘗試轉移給下一頁。

所以 `deleteSlide()` 是「刪除頁面 + 維護章節結構」。

---

### 7. `updateElement()` 可以跨頁更新

因為它支援 `slideId`：

```ts
updateElement({
  id,
  props,
  slideId,
})
```

如果有傳 `slideId`，它會更新指定頁面的元素；沒有傳時才更新目前頁面。

---

## 常見誤解

### 誤解一：`slides store` 管所有畫面狀態

不對。

它只管簡報內容與內容衍生資料。

像是選取框、面板開關、快捷鍵禁用、拖曳狀態都不在這裡。

---

### 誤解二：刪除元素會自動刪除動畫

不完全是。

`deleteElement()` 只移除元素。

動畫資料是否清掉，不是在這個 action 中完成。

getter 會負責過濾掉已不存在元素的動畫。

---

### 誤解三：新增頁面會加到最後

不一定。

`addSlide()` 是插入到目前頁面後方：

```ts
slideIndex + 1
```

---

### 誤解四：`updateElement()` 是深層更新

不是。

它是淺合併。

更新巢狀欄位時，要由呼叫端準備好完整物件。

---

## 這篇要記住的核心

- `slides store` 是簡報內容中心
- `slides` 是整份簡報頁面資料
- `slideIndex` 是目前頁面的指標
- `currentSlide` 是由 `slides[slideIndex]` 推導出來
- 頁面資料與元素資料都存在 `slides` 裡
- `currentSlideAnimations` 會排除已不存在元素的動畫
- `formatedAnimations` 會把動畫整理成播放序列
- 新增頁面會插在目前頁後方
- 刪除頁面會處理 `sectionTag` 延續
- 新增、刪除、更新元素都只操作目前頁面，除了 `updateElement()` 可用 `slideId` 指定頁面
- `slides store` 不負責選取狀態，也不負責 undo / redo 的快照管理

---

## 建議原始碼閱讀順序

1. 先看 `SlidesState`
2. 看 `state()` 預設值
3. 看 `currentSlide`
4. 看 `currentSlideAnimations`
5. 看 `formatedAnimations`
6. 看頁面操作：
   - `addSlide`
   - `updateSlide`
   - `deleteSlide`
7. 看元素操作：
   - `addElement`
   - `deleteElement`
   - `updateElement`
   - `removeElementProps`
8. 最後再回頭看 `types/slides.ts` 的 `Slide`、`PPTElement`、`PPTAnimation`

---

## 對照

- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/types/slides.ts`](../../../PPTist-SourceCode/src/types/slides.ts)
- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)

---

## 回到本章

- [store 總覽](./00-store%E7%B8%BD%E8%A6%BD.md)
- [main store](./02-main-store.md)
- [snapshot store](./03-snapshot-store.md)
- [keyboard 與 screen](./04-keyboard%E8%88%87screen.md)

---