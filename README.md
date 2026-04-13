# PPTist Practice

這個倉庫用來學習 `PPTist`，包含原始碼閱讀、最小實驗專案與整理後的學習筆記。

## 這個工作區在做什麼

這裡不是單純 fork 後直接開發的主倉庫，而是我自己用來拆解 `PPTist` 的學習工作區。

目前的目標有三個：

- 讀懂 `PPTist` 的核心資料模型與編輯器結構
- 用最小實驗驗證畫布、縮圖、狀態流等關鍵機制
- 把閱讀過程整理成可以回查的筆記

## 目錄說明

### `PPTist-SourceCode/`

`PPTist` 主專案原始碼。  
用來閱讀實際實作、追功能流程、對照官方文件與資料結構。

### `PPTist-Demo/`

最小實驗專案。  
用來重做單一機制、驗證想法、縮小理解範圍，不直接承擔完整功能。

### `note/`

學習筆記區。  
已經按學習對象分成：

- `note/pptist/`：專案閱讀筆記
- `note/web-basics/`：為了讀懂專案而補的前端基礎筆記
- `note/libraries/`：第三方套件速查入口

## 建議閱讀順序

1. 先看 [note/README.md](./note/README.md)
2. 再看 `PPTist-SourceCode/doc/` 內的官方文件
3. 接著追 `PPTist-SourceCode/src/main.ts`、`PPTist-SourceCode/src/App.vue`
4. 然後讀 `PPTist-SourceCode/src/store/slides.ts`
5. 最後展開 `views/Editor/`、畫布系統、縮圖系統與其他模組

## 目前推薦的主線

如果目標是先建立整體理解，優先看：

- `note/pptist/03-畫布系統/`
- `note/pptist/04-縮圖系統/`
- `PPTist-SourceCode/doc/DirectoryAndData.md`
- `PPTist-SourceCode/doc/Canvas.md`

## 目前進度

- 已完成：整理 `note/` 結構，建立 `pptist / web-basics / libraries` 三條主軸
- 已完成：啟動 `PPTist-SourceCode` 開發伺服器，確認本機可跑
- 已完成：補 `PPTist` 畫布系統入門筆記與畫布章節導航
- 正在進行：理解 `PPTist` 畫布系統，特別是固定邏輯座標、`canvasScale` 與事件座標回寫
- 目前卡點：對「資料座標」和「螢幕顯示座標」之間的映射還不夠直覺

## 下一步

1. 用實際畫面對照 `Canvas/index.vue` 與 `useViewportSize.ts`
2. 追 `PPTist` 的滑鼠框選、雙擊新增文字、旋轉如何把螢幕座標換回邏輯座標
3. 接著學縮圖系統，驗證同一套邏輯如何重用到縮圖

## 使用方式

- 想看真實專案實作：進 `PPTist-SourceCode/`
- 想做小型驗證：進 `PPTist-Demo/`
- 想回查整理過的理解：進 `note/`
