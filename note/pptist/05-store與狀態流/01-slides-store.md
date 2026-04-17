# slides store

`slides store` 是整份簡報內容與內容衍生狀態的中心。

這一篇關心的是它如何更新內容，不再重複 `Slide` 與各元素型別的完整欄位定義。

## state

主要欄位：

- `title`
- `theme`
- `slides`
- `slideIndex`
- `viewportSize`
- `viewportRatio`
- `templates`

## getters

- `currentSlide`
- `currentSlideAnimations`
- `formatedAnimations`

## actions

- `setTitle`
- `setTheme`
- `setViewportSize`
- `setViewportRatio`
- `setSlides`
- `setTemplates`
- `addSlide`
- `updateSlide`
- `removeSlideProps`
- `deleteSlide`
- `updateSlideIndex`
- `addElement`
- `deleteElement`
- `updateElement`
- `removeElementProps`

## 你要懂的事

- `slides` 是內容資料，不是 UI 狀態
- `slideIndex` 代表目前頁面
- `addSlide` 會把新頁插到目前頁面後面
- `deleteSlide` 要處理章節標記的延續
- `currentSlide`、`currentSlideAnimations`、`formatedAnimations` 是從內容資料衍生出來的查詢結果

## 對照

- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/types/slides.ts`](../../../PPTist-SourceCode/src/types/slides.ts)
