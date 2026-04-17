# 01-資料模型

這一節只講 `pptist` 的**資料長什麼樣**，重點放在型別與資料結構，不先談操作流程。

換句話說，這一節關心的是：

- 有哪些資料結構
- 每個結構有哪些欄位
- 欄位之間的巢狀關係是什麼
- 哪些是簡報內容資料，哪些是編輯器狀態資料

對照原始碼主要看：

- `PPTist-SourceCode/src/types/slides.ts`
- `PPTist-SourceCode/src/store/slides.ts`

---

## 先建立整體觀念

閱讀 `pptist` 的資料模型時，先分成兩層看會比較清楚：

### 1. 簡報內容資料
這一層是實際會被保存、載入、匯出或編輯的內容，例如：

- 簡報中的每一頁
- 每一頁上的元素
- 背景
- 動畫
- 註解
- 分段標記

這一層主要會看到：

- `Slide`
- `PPTElement`
- `PPTAnimation`
- `SlideBackground`
- `Note`
- `SectionTag`

### 2. 簡報整體狀態資料
這一層是簡報的根狀態，包含目前文件本身與編輯器需要的全域資訊，例如：

- 簡報標題
- 主題樣式
- 投影片列表
- 目前頁面索引
- 畫布尺寸與比例
- 範本清單

這一層主要會看到：

- `SlidesState`
- `slides store` 裡的 state 與 derived getters

所以可以先用一句話理解：

> `Slide` 與 `PPTElement` 是內容本體；`SlidesState` 是包住整份簡報的根狀態。

---

## 內容順序

1. [資料模型總覽](./00-資料模型總覽.md)
2. [簡報與頁面資料](./01-簡報與頁面資料.md)
3. [元素資料](./02-元素資料.md)

---

## 這一節的閱讀路線

建議照下面順序看：

1. 先看 `SlidesState`，知道整份簡報在 store 裡怎麼被保存
2. 再看 `Slide`，知道一頁投影片怎麼被表示
3. 再看 `PPTElement`，知道頁面上的元素怎麼被表示
4. 最後再看 `PPTAnimation`、`SlideBackground`、`Note`、`SectionTag` 等補充型別

如果一開始就把所有型別一起看，通常會覺得很多、很散。
但如果照「整份簡報 → 單頁 → 頁面元素 → 補充資料」的順序看，會比較容易建立整體模型。

---

## 型別之間的大致關係

可以先用下面這張簡化關係圖建立印象：

```text
SlidesState
├─ title
├─ theme
├─ slides: Slide[]
├─ slideIndex
├─ viewportSize
├─ viewportRatio
└─ templates

Slide
├─ id
├─ elements: PPTElement[]
├─ notes?: Note[]
├─ remark?: string
├─ background?: SlideBackground
├─ animations?: PPTAnimation[]
├─ turningMode?: TurningMode
├─ sectionTag?: SectionTag
└─ type?: SlideType

PPTElement
├─ 共用基底欄位
└─ 各種子型別
   ├─ text
   ├─ image
   ├─ shape
   ├─ line
   ├─ chart
   ├─ table
   ├─ latex
   ├─ video
   └─ audio
```

這張圖的重點不是取代原始碼，而是先抓住主幹：

- `SlidesState` 管整份簡報
- `Slide` 管單頁內容
- `PPTElement` 管頁面元素

---

## 這一節會提到哪些 store

本節會提到：

- `slides store`

這是因為資料模型本身就被放進對應的 state 裡。

但本節**不展開**下面這些東西：

- action 的實作細節
- getter 的完整流程
- 事件流
- undo / redo
- 狀態同步流程

那些內容比較適合放到後續的 `05-store與狀態流` 再看。

---

## 本節的核心重點

閱讀完這一節後，最好要能回答三件事：

1. `SlidesState` 與 `Slide` 的差別是什麼？
2. `Slide` 下面有哪些頁面層級的資料？
3. `PPTElement` 為什麼要設計成多個子型別的 union？

如果這三件事都能答得出來，表示你已經不只是背欄位，而是真的看懂 `pptist` 的資料模型骨架了。

---

## 直接對照原始碼時，優先確認這些欄位

### `SlidesState`
原始碼中的 `SlidesState` 在 `src/store/slides.ts` 內，實際包含：

- `title: string`
- `theme: SlideTheme`
- `slides: Slide[]`
- `slideIndex: number`
- `viewportSize: number`
- `viewportRatio: number`
- `templates: SlideTemplate[]`

### `Slide`
原始碼中的 `Slide` 在 `src/types/slides.ts` 內，實際包含：

- `id: string`
- `elements: PPTElement[]`
- `notes?: Note[]`
- `remark?: string`
- `background?: SlideBackground`
- `animations?: PPTAnimation[]`
- `turningMode?: TurningMode`
- `sectionTag?: SectionTag`
- `type?: SlideType`

### `SlideTheme`
原始碼中的 `SlideTheme` 實際包含：

- `backgroundColor: string`
- `themeColors: string[]`
- `fontColor: string`
- `fontName: string`
- `outline: PPTElementOutline`
- `shadow: PPTElementShadow`

### `SlideBackground`
原始碼中的 `SlideBackground` 實際包含：

- `type: 'solid' | 'image' | 'gradient'`
- `color?: string`
- `image?: { src: string; size: 'cover' | 'contain' | 'repeat' }`
- `gradient?: Gradient`

---

## 補充：原始碼裡的幾個關鍵型別

### `PPTElement`
`PPTElement` 是多個元素型別的 union：

- `PPTTextElement`
- `PPTImageElement`
- `PPTShapeElement`
- `PPTLineElement`
- `PPTChartElement`
- `PPTTableElement`
- `PPTLatexElement`
- `PPTVideoElement`
- `PPTAudioElement`

這代表頁面上的元素不是單一結構，而是依照元素類型拆成不同資料形狀。

### `PPTAnimation`
動畫資料是掛在 `Slide.animations` 上，而不是掛在元素本體裡。每筆動畫都會包含：

- `id`
- `elId`
- `effect`
- `type`
- `duration`
- `trigger`

### `Note`
註解資料本體包含：

- `id`
- `content`
- `time`
- `user`
- `elId?`
- `replies?`

### `SectionTag`
分段標記非常簡單，只有：

- `id`
- `title?`

---

## 閱讀建議

- `Slide` 與 `PPTElement` 是本節最核心的兩個型別。
- 先看 `slides.ts` 的型別定義，再看 `slides store` 的 state。
- 比對筆記與原始碼時，優先確認：
  - 欄位名稱
  - 欄位是否可選
  - union 值
  - 巢狀型別
- 如果你想理解「資料怎麼變」，請移到 `05-store與狀態流`，不要在本節把資料模型與操作流程混在一起看。
