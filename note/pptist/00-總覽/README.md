# 00-總覽

本章用來記錄 `PPTist` 的整體地圖、啟動流程、閱讀路線，以及目前學到哪裡。

## 目前學習進度

- 已整理：`note/` 倉庫結構與章節導航
- 已完成：`PPTist-SourceCode` 本機啟動
- 已閱讀：`doc/DirectoryAndData.md`
- 已閱讀：`doc/Canvas.md`
- 已整理：畫布系統入門筆記
- 正在理解：畫布系統中的固定座標、縮放渲染與滑鼠座標回寫

## 目前已理解

- `PPTist` 的畫布不是直接使用 DOM 真實尺寸當資料座標
- `viewportSize = 1000`、`viewportRatio = 0.5625` 定義了投影片的邏輯尺寸
- `canvasScale` 決定這張投影片目前在畫面上被放大或縮小多少
- 縮圖和主畫布本質上共用同一套資料模型，只是顯示倍率不同

## 目前還在卡的點

- 為什麼螢幕上的滑鼠位移要除以 `canvasScale`
- `viewport-wrapper` 和 `viewport` 分層後，各自負責什麼
- 為什麼元素元件本身不用自己乘 `canvasScale`

## 下一步閱讀

1. `src/views/Editor/Canvas/index.vue`
2. `src/views/Editor/Canvas/hooks/useViewportSize.ts`
3. `src/views/Editor/Canvas/hooks/useMouseSelection.ts`
4. `src/views/Editor/Canvas/hooks/useRotateElement.ts`
5. `src/views/components/ThumbnailSlide/index.vue`

## 建議閱讀順序

1. 先看 [03-畫布系統](../03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/README.md)
2. 再看 [04-縮圖系統](../04-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/README.md)
3. 接著補 [01-資料模型](../01-%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B/README.md)
4. 最後展開 `Editor` 骨架與其他模組

## 後續可擴充

- 專案目錄總覽
- `main.ts -> App.vue -> Editor` 的入口流程
- 一份高層模組地圖

## 返回上層

- [回到 PPTist 導航](../README.md)
