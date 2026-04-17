# 05-store與狀態流

這一章專門講 `PPTist` 的 store 行為與狀態流。

如果說 `01-資料模型` 是「資料長什麼樣」，那這一章就是「這些資料怎麼被使用、更新、回復與切換模式」。

也就是說：

- `01-資料模型` 看結構
- `05-store與狀態流` 看行為

這一章不再重複完整欄位定義，只會在需要時提到 state 內容來說明流程。

## 章節拆分

1. [store 總覽](./00-store%E7%B8%BD%E8%A6%BD.md)
2. [slides store](./01-slides-store.md)
3. [main store](./02-main-store.md)
4. [snapshot store](./03-snapshot-store.md)
5. [keyboard 與 screen](./04-keyboard%E8%88%87screen.md)

## 這章要先建立的概念

- `slides store` 管簡報內容
- `main store` 管編輯器操作狀態
- `snapshot store` 管 undo / redo
- `keyboard store` 管按鍵狀態
- `screen store` 管播放模式

這裡的重點不是「欄位有哪些」，而是「哪個 store 負責哪些變化」。

## 對照文件

- [`PPTist-SourceCode/src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`PPTist-SourceCode/src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`PPTist-SourceCode/src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`PPTist-SourceCode/src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`PPTist-SourceCode/src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)
- [`PPTist-SourceCode/src/store/index.ts`](../../../PPTist-SourceCode/src/store/index.ts)
- [`PPTist-SourceCode/src/App.vue`](../../../PPTist-SourceCode/src/App.vue)

## 回主索引

- [PPTist Learning Map](../README.md)
