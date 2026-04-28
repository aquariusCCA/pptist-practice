# 07-縮圖系統

這一章聚焦 `PPTist` 的縮圖能力。重點不是單看左側縮圖列表，而是把整個「同一份投影片資料，如何在多個場景被縮小後重用」的鏈路看清楚。

`PPTist` 的縮圖系統可以拆成四層：

1. `slides store` 提供投影片資料與畫布基準尺寸。
2. `ThumbnailSlide` 把單頁投影片渲染成可重用的縮圖 renderer。
3. `ThumbnailElement` 依元素型別切到對應的基礎元件，並用 `target="thumbnail"` 啟用縮圖模式。
4. 各場景元件，例如編輯器左側、播放底部、講者模式、手機預覽、匯出面板，只負責決定縮圖尺寸、排列方式與互動。

這樣的設計很值得學，因為它沒有為每個場景各寫一套縮圖模板，而是把「縮圖其實就是縮小版投影片」這件事落到元件層。

## 本章你會學到什麼

- `ThumbnailSlide` 為什麼只收 `slide`、`size`、`visible` 三個主要輸入
- `size` 為什麼代表寬度，而不是高度
- `scale = size / viewportSize` 如何把大畫布縮成小畫面
- `target="thumbnail"` 如何讓元素元件進入縮圖模式
- `useLoadSlides` 怎麼分批載入縮圖，避免一次渲染太多頁
- 編輯器左側縮圖列表如何處理選取、複選、拖曳排序、聚焦與自動捲動
- 為什麼講者模式與底部縮圖列會寫成 `size / viewportRatio`
- 同一個 `ThumbnailSlide` 為什麼還能拿去做匯出圖片與 PDF 的高解析渲染

## 建議閱讀順序

1. [00-縮圖系統總覽](./00-縮圖系統總覽.md)
2. [01-縮圖渲染元件設計](./01-縮圖渲染元件設計.md)
3. [02-編輯器縮圖列表與互動](./02-編輯器縮圖列表與互動.md)
4. [03-縮圖跨場景共用](./03-縮圖跨場景共用.md)
5. [04-焦點、快捷鍵與多選資料流](./04-焦點、快捷鍵與多選資料流.md)
6. [05-排序、區段與頁面管理規則](./05-排序、區段與頁面管理規則.md)
7. [06-載入策略與效能考量](./06-載入策略與效能考量.md)

## 對照原始碼

- `src/views/components/ThumbnailSlide/index.vue`
- `src/views/components/ThumbnailSlide/ThumbnailElement.vue`
- `src/hooks/useLoadSlides.ts`
- `src/hooks/useGlobalHotkey.ts`
- `src/hooks/useSlideHandler.ts`
- `src/views/Editor/Thumbnails/index.vue`
- `src/views/Editor/Thumbnails/Templates.vue`
- `src/views/Editor/Canvas/LinkDialog.vue`
- `src/views/Screen/PresenterView.vue`
- `src/views/Screen/BottomThumbnails.vue`
- `src/views/Screen/SlideThumbnails.vue`
- `src/views/Mobile/MobilePreview.vue`
- `src/views/Mobile/MobileThumbnails.vue`
- `src/views/Editor/ExportDialog/ExportImage.vue`
- `src/views/Editor/ExportDialog/ExportPDF.vue`
- `src/store/slides.ts`
- `src/store/main.ts`

## 與前後章節的關係

- 先讀 `03-畫布系統`，你會更容易理解 `viewportSize`、`viewportRatio`、`scale` 的來源。
- 再讀 `05-store與狀態流`，可以把縮圖系統依賴的 store 狀態補齊。

## 本章核心地圖

```text
slides store
  -> ThumbnailSlide
    -> ThumbnailElement
      -> BaseXxxElement(target="thumbnail")
  -> 被 Editor / Screen / Mobile / Export / LinkDialog / Templates 重用
```

## 速查結論

- 縮圖不是獨立資料模型，它直接重用 `slides store` 裡的投影片資料。
- `ThumbnailSlide` 的外框尺寸由 `size` 與 `viewportRatio` 決定。
- 內部元素仍用原始畫布尺寸排版，再靠 `transform: scale(...)` 縮小。
- `visible` 配合 `useLoadSlides` 只控制「何時真正渲染內容」，不是控制資料有沒有存在。
- 場景元件大多不碰元素細節，只決定縮圖要多大、怎麼排、點了之後做什麼。
- 匯出圖片與 PDF 本質上也是拿 `ThumbnailSlide` 做大尺寸渲染，不是另一套畫圖邏輯。
