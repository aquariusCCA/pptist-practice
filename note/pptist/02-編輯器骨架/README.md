# 02-編輯器骨架

本章只處理一件事：`PPTist` 的桌面編輯器外殼是怎麼被組起來的。

這裡先不深入畫布內部的座標換算、元素拖曳、選取與縮放，那些會放到下一章 `03-畫布系統`。  
本章要先回答的是：

- 應用啟動後，為什麼會進到編輯器
- 編輯器頁面有哪些固定區塊
- 哪些區塊是常駐的，哪些是條件式浮層
- 編輯器骨架如何把資料模型與互動功能接起來

## 建議閱讀順序

1. [骨架總覽](./00-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%AA%A8%E6%9E%B6%E7%B8%BD%E8%A6%BD.md)
2. [編輯器入口與全域分流](./01-%E7%B7%A8%E8%BC%AF%E5%99%A8%E5%85%A5%E5%8F%A3%E8%88%87%E5%85%A8%E5%9F%9F%E5%88%86%E6%B5%81.md)
3. [編輯器頁面骨架](./02-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%A0%81%E9%9D%A2%E9%AA%A8%E6%9E%B6.md)
4. [骨架區塊拆解](./03-%E9%AA%A8%E6%9E%B6%E5%8D%80%E5%A1%8A%E6%8B%86%E8%A7%A3.md)
5. [浮層與全域能力](./04-%E6%B5%AE%E5%B1%A4%E8%88%87%E5%85%A8%E5%9F%9F%E8%83%BD%E5%8A%9B.md)

## 本章的重點

- `src/App.vue` 負責最外層應用分流與初始化
- `src/views/Editor/index.vue` 負責編輯器主框架
- `EditorHeader`、`Thumbnails`、`CanvasTool`、`Canvas`、`Remark`、`Toolbar` 是固定骨架
- `SelectPanel`、`SearchPanel`、`NotesPanel`、`MarkupPanel`、`SymbolPanel`、`ExportDialog`、`AIPPTDialog` 是條件式浮層
- `useGlobalHotkey()` 與 `usePasteEvent()` 是掛在編輯器骨架層的全域行為入口

## 快速回查入口

- 想看應用怎麼分流，先看：[編輯器入口與全域分流](./01-%E7%B7%A8%E8%BC%AF%E5%99%A8%E5%85%A5%E5%8F%A3%E8%88%87%E5%85%A8%E5%9F%9F%E5%88%86%E6%B5%81.md)
- 想看頁面怎麼排版，先看：[編輯器頁面骨架](./02-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%A0%81%E9%9D%A2%E9%AA%A8%E6%9E%B6.md)
- 想看每個區塊做什麼，先看：[骨架區塊拆解](./03-%E9%AA%A8%E6%9E%B6%E5%8D%80%E5%A1%8A%E6%8B%86%E8%A7%A3.md)
- 想看右側面板與彈窗，先看：[浮層與全域能力](./04-%E6%B5%AE%E5%B1%A4%E8%88%87%E5%85%A8%E5%9F%9F%E8%83%BD%E5%8A%9B.md)

## 對照原始碼

- [`src/App.vue`](../../PPTist-SourceCode/src/App.vue)
- [`src/views/Editor/index.vue`](../../PPTist-SourceCode/src/views/Editor/index.vue)
- [`src/views/Editor/EditorHeader/index.vue`](../../PPTist-SourceCode/src/views/Editor/EditorHeader/index.vue)
- [`src/views/Editor/Thumbnails/index.vue`](../../PPTist-SourceCode/src/views/Editor/Thumbnails/index.vue)
- [`src/views/Editor/CanvasTool/index.vue`](../../PPTist-SourceCode/src/views/Editor/CanvasTool/index.vue)
- [`src/views/Editor/Canvas/index.vue`](../../PPTist-SourceCode/src/views/Editor/Canvas/index.vue)
- [`src/views/Editor/Remark/index.vue`](../../PPTist-SourceCode/src/views/Editor/Remark/index.vue)
- [`src/views/Editor/Toolbar/index.vue`](../../PPTist-SourceCode/src/views/Editor/Toolbar/index.vue)
