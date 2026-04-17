# 01-資料模型

這一節只講 `pptist` 的「資料長什麼樣」，不講資料怎麼被操作。

換句話說，這裡關心的是：

- 有哪些資料結構
- 每個結構有哪些欄位
- 欄位型別與巢狀關係是什麼
- 哪些欄位屬於簡報內容，哪些欄位屬於編輯器狀態

對照原始碼主要看這幾個位置：

- `PPTist-SourceCode/src/types/slides.ts`
- `PPTist-SourceCode/src/store/slides.ts`

## 內容順序

1. [資料模型總覽](./00-資料模型總覽.md)
2. [簡報與頁面資料](./01-簡報與頁面資料.md)
3. [元素資料](./02-元素資料.md)

## 這一節會看到的 store

- `slides store`

這裡提到 `store`，是因為 `pptist` 的資料結構本身就被放進對應的 state 裡。
但本節不討論 action、getter、事件流程或 undo / redo 的操作細節，那些會放在 `05-store與狀態流`。

本節的重點是把 `slides store` 對應的資料模型看清楚，並理解它如何承載簡報內容與頁面資料。
`main store`、`snapshot store`、`keyboard store`、`screen store` 會在後續章節再展開，尤其是 `05-store與狀態流`。

## 閱讀建議

- `Slide` 與 `PPTElement` 是本節兩個核心資料結構。
- 先看 `slides.ts` 的型別定義，再看 `slides store` 的 state。
- 如果你在比對筆記與原始碼，優先確認欄位名稱、可選性、union 值與巢狀型別。
- 如果你想理解「資料怎麼變」，請移到 `05-store與狀態流`，不要在這一節混在一起看。
