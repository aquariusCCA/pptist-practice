# 02-編輯器骨架

這一章先不看畫布內部的拖曳、縮放、座標換算與元素操作，而是只看 **PPTist 編輯器外層是怎麼組起來的**。

這一章最重要的結論只有一句：

**`src/App.vue` 決定應用現在要進哪一種頂層模式；`src/views/Editor/index.vue` 則負責把桌面編輯器的外層骨架拼起來。** 

這章會特別聚焦 `Editor`，原因很單純：

* `App.vue` 雖然會分流到 `Screen`、`Editor`、`Mobile`，但它本身只負責入口判斷與啟動初始化
* 真正有「版面骨架、浮層掛載、快捷鍵、貼上事件」這些可拆解結構的，是 `Editor/index.vue`
* `Screen` 和 `Mobile` 在這一章先只提到，是因為它們各自屬於後面的專門章節，不是這一章要展開的主題

如果你接著想追：

* `Screen` 請往後看 [`07-播放與預覽`](../07-播放與預覽/README.md)
* `Mobile` 請往後看 [`11-手機端`](../11-手機端/README.md)

---

## 這一章要先回答的問題

1. 應用啟動後，怎麼決定要進 `Screen`、`Editor` 還是 `Mobile`
2. `Editor` 頁面的固定骨架到底有哪些區塊
3. 哪些面板不是主版面的一部分，而是額外掛上的條件式浮層
4. 編輯器層級的快捷鍵與貼上事件，實際上是在哪裡啟用、又是綁到哪一層事件系統上 

---

## 建議閱讀順序

1. 先看 `src/App.vue`
2. 再看 `src/views/Editor/index.vue`
3. 需要確認浮層來源時，再回頭看 `src/store/main.ts`
4. 想確認「快捷鍵 / 貼上事件」的真實行為時，再看 `src/hooks/useGlobalHotkey.ts` 與 `src/hooks/usePasteEvent.ts` 

---

## 先建立整體地圖

可以先把這一章理解成兩個核心檔案的分工：

### 1. `src/App.vue`

負責應用啟動後的**頂層模式分流**與**初始化流程**。

### 2. `src/views/Editor/index.vue`

負責桌面編輯器的**版面骨架**、**浮層掛載**、以及**編輯器層級全域事件的啟用入口**。 

---

## `App.vue` 在做什麼

### 一、template 先決定要顯示哪個頂層模式

`App.vue` 的 template 非常直接：

* 只有在 `slides.length` 有資料時，才會進入真正的主畫面
* 如果 `screening` 為真，顯示 `Screen`
* 否則如果目前是 PC 環境，顯示 `Editor`
* 再不然就顯示 `Mobile`
* 如果資料還沒準備好，則顯示 `FullscreenSpin`，提示目前正在初始化資料 

也就是說，`App.vue` 不是在做複雜版面，而是在做：

**資料是否準備完成 + 目前處於哪種模式 + 裝置型態判斷**。

---

### 二、script 負責初始化資料與模式切換前置

`App.vue` 裡先取了幾個核心狀態：

* `slidesStore` 的 `slides`
* `screenStore` 的 `screening`
* `mainStore` 的 `databaseId`

`App.vue` 的初始化則很單純，會在 `onMounted()` 時：

1. 用 `api.getMockData('slides')` 取得 mock slides
2. 呼叫 `slidesStore.setSlides(slides)` 寫入資料
3. 呼叫 `deleteDiscardedDB()` 清掉先前標記為廢棄的資料庫
4. 呼叫 `snapshotStore.initSnapshotDatabase()` 初始化 snapshot database 

所以，`App.vue` 不只是頁面入口，也是在做一輪應用啟動初始化。

---

### 三、離開頁面時，記錄這次的 IndexedDB 資料庫 ID

`App.vue` 還做了一件容易被忽略、但很重要的事：

它監聽 `beforeunload`，在頁面離開前，把這次使用的 `databaseId` 寫進 `localStorage` 的 `LOCALSTORAGE_KEY_DISCARDED_DB` 清單中。註解也直接寫明，這是為了之後清除不用的 indexedDB database。

這表示：

* `databaseId` 是這次應用執行所使用的資料庫識別值
* 頁面關閉後，不是當場直接清
* 而是先記錄為「待清理」
* 下一次啟動時，再透過 `deleteDiscardedDB()` 做清理 

---

### 四、`App.vue` 的定位

如果只看 `App.vue` 的職責，可以把它理解成：

> **應用層入口 + 模式分流器 + 初始化協調者**

它不負責桌面編輯器的細部版面，也不處理畫布操作；它主要是在回答：

**「現在這個應用應該進哪個模式？資料是不是準備好了？」** 

---

## `Editor/index.vue` 在做什麼

如果說 `App.vue` 決定「進哪裡」，那 `Editor/index.vue` 做的事就是：

**把桌面編輯器整個外層骨架拼出來。** 

---

### 一、主版面固定骨架

從 template 來看，`Editor/index.vue` 的主版面結構非常清楚：

```text
pptist-editor
├─ EditorHeader
└─ layout-content
   ├─ Thumbnails
   ├─ center
   │  ├─ CanvasTool
   │  ├─ Canvas
   │  └─ Remark
   └─ Toolbar
```

也就是：

* 上方：`EditorHeader`
* 左側：`Thumbnails`
* 中間：`CanvasTool`、`Canvas`、`Remark`
* 右側：`Toolbar` 

這些才是桌面編輯器**一直存在的固定骨架**。

---

### 二、中間欄不是單一畫布，而是三段式結構

中間欄不是只有 `Canvas`，而是由三個區塊組成：

1. `CanvasTool`
2. `Canvas`
3. `Remark`

而且高度分配不是交給子元件自己決定，而是由 `Editor/index.vue` 這個父層做外部協調。

其中：

* `remarkHeight` 在父層用 `ref(40)` 建立，預設值是 `40`
* `Remark` 用 `v-model:height="remarkHeight"` 和父層同步高度
* `Canvas` 的高度不是固定值，而是：

```ts
calc(100% - ${remarkHeight + 40}px)
```

這裡的 `40` 指的是上方 `CanvasTool` 的高度。

所以更精準地說：

> `Editor/index.vue` 不是只負責「把元件放進去」，它還負責**中間主工作區的尺寸協調**。 

---

### 三、最外層尺寸關係

從 style 可以直接看出這份骨架的基本尺寸規則：

* `.pptist-editor` 高度 `100%`
* `.layout-header` 高度 `40px`
* `.layout-content` 高度 `calc(100% - 40px)`，也就是扣掉 header
* 左側 `.layout-content-left` 寬 `160px`
* 右側 `.layout-content-right` 寬 `260px`
* 中間 `.layout-content-center` 寬度是 `calc(100% - 160px - 260px)`
* 中間欄的 `.center-top`，也就是 `CanvasTool`，高度 `40px` 

這組樣式非常重要，因為它直接說明：

**Editor 這一層就已經把桌面編輯器的版面切割規則定好了。** 

---

## 哪些不是主骨架，而是條件式浮層

在 `Editor/index.vue` 裡，主版面結束之後，還額外掛了很多元件。這些元件不屬於固定骨架，而是由 store 狀態控制顯示時機的**條件式浮層 / 附加面板**。這裡的「浮層」可以先理解成：不佔主版面固定欄位、但會依條件疊在編輯器外層顯示的面板或視窗。

目前直接掛在 `Editor` 外層的有：

* `SelectPanel`
* `SearchPanel`
* `NotesPanel`
* `MarkupPanel`
* `SymbolPanel`

另外還有兩個透過 `Modal` 包起來的視窗：

* `ExportDialog`
* `AIPPTDialog` 

---

### 這些浮層對應哪些 store 狀態

這些顯示條件不是寫死在元件內，而是來自 `useMainStore()` 的 state。`Editor/index.vue` 透過 `storeToRefs(mainStore)` 取出：

* `dialogForExport`
* `showSelectPanel`
* `showSearchPanel`
* `showNotesPanel`
* `showSymbolPanel`
* `showMarkupPanel`
* `showAIPPTDialog` 

而在 `src/store/main.ts` 裡，也真的有對應狀態與 setter：

* `showSelectPanel`
* `showSearchPanel`
* `showNotesPanel`
* `showSymbolPanel`
* `showMarkupPanel`
* `showAIPPTDialog`
* `dialogForExport` 

所以這裡的核心觀念是：

> **主骨架固定存在；面板與視窗則由 main store 控制開關。** 

---

## `ExportDialog` 和 `AIPPTDialog` 不是普通 `v-if` 面板

這兩個和其他面板還有一點不同。

### `ExportDialog`

它被包在 `Modal` 裡，`visible` 綁的是 `!!dialogForExport`，關閉時呼叫：

```ts
mainStore.setDialogForExport('')
```

代表它的開關不只是布林值，而是透過 `dialogForExport` 這個狀態來表示目前是否有匯出對話框、以及可能是哪一類匯出。

### `AIPPTDialog`

它同樣被包在 `Modal` 裡，但設定更多：

* `visible` 綁的是 `showAIPPTDialog`
* `closeOnClickMask` 為 `false`
* `closeOnEsc` 為 `false`
* 關閉時呼叫 `mainStore.setAIPPTDialogState(false)` 

而 `store/main.ts` 也把 `showAIPPTDialog` 的型別定成：

```ts
boolean
```

這說明它就是單純的開 / 關兩態。

---

## 快捷鍵與貼上事件，是怎麼掛上的

`Editor/index.vue` 的 script 最後有三個很重要的動作：

* 建立 `remarkHeight`
* 呼叫 `useGlobalHotkey()`
* 呼叫 `usePasteEvent()` 

這表示 Editor 層除了負責版面，也負責啟用編輯器層級的全域互動能力。

---

### `useGlobalHotkey()` 的角色

`useGlobalHotkey.ts` 裡，真正綁的是：

* `document.addEventListener('keydown', keydownListener)`
* `document.addEventListener('keyup', keyupListener)`
* `window.addEventListener('blur', keyupListener)` ([GitHub][4])

它處理的內容很多，包括：

* 匯出快捷鍵
* 播放模式切換
* 查找面板開關
* 畫布縮放
* 元素 / 頁面的複製、剪下、刪除
* undo / redo
* 全選
* 鎖定
* 組合 / 取消組合
* 圖層順序
* 方向鍵移動
* PageUp / PageDown
* Enter 新增頁面
* Tab 切換當前元素
* 甚至是直接用快捷鍵建立文字、矩形、圓形、線段等元素 ([GitHub][4])

所以 `useGlobalHotkey()` 不是單純「監聽快捷鍵」而已，而是 Editor 層非常核心的**全域操作入口**。

---

### `usePasteEvent()` 的角色

`usePasteEvent.ts` 在 mounted 時對 `document` 綁定 `paste` 事件，在 unmounted 時移除。

但它不是看到 paste 就處理，而是先檢查：

* `editorAreaFocus`
* `thumbnailsFocus`
* `disableHotkeys`

只有在**編輯區或縮圖區有焦點**，而且**快捷鍵功能沒有被停用**時，才會繼續處理。

之後它會先判斷剪貼簿內容是不是圖片，若是就把圖片轉成 dataURL 後建立圖片元素；如果不是圖片，且第一個 item 是 `text/plain`，才交給文字貼上處理。

所以更精準地說：

> `Editor/index.vue` 不是直接寫快捷鍵邏輯與貼上邏輯，而是把這些「文件級互動能力」在 Editor 層啟用。 

---

## 這一章的邊界要切清楚

這一章只處理：

* 頂層模式怎麼分流
* Editor 骨架怎麼組
* 哪些是固定區塊
* 哪些是條件式浮層
* 全域快捷鍵與貼上事件是在哪一層被啟用 

這一章**不要混進去**的內容包括：

* 畫布內部的拖曳、縮放、旋轉、選取
* `Canvas` 元素座標與縮放換算
* `Thumbnails`、`Canvas`、`Toolbar` 彼此之間更細的狀態同步
* 各個 store action 的完整行為細節 

因為那些已經不是「骨架」，而是骨架之下的互動實作層。

---

## 最後用一句話收斂

如果要用一句最準的話描述這一章，可以寫成：

> **`App.vue` 負責應用入口、模式分流與初始化；`Editor/index.vue` 負責桌面編輯器骨架、浮層掛載，以及全域快捷鍵 / 貼上事件的啟用入口。** 

---
