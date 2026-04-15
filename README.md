# PPTist Practice

這個工作區用來整理 `PPTist` 的學習筆記與對照實作。

目前的內容分成三個部分：

- `PPTist-SourceCode/`：原始專案的程式碼閱讀與追蹤
- `note/`：學習筆記與章節整理
- `note/pptist/03-畫布系統/ppt-canvas-workspace/`：`03-畫布系統` 的 Vue 工作區 demo

## 學習順序

1. 先讀 [`note/README.md`](./note/README.md)
2. 再看 `note/pptist/` 底下的章節筆記
3. 對照 `PPTist-SourceCode/` 的程式碼理解實作流程
4. 需要動手驗證時，進入 `note/pptist/03-畫布系統/ppt-canvas-workspace/`

## 目前推薦的閱讀順序

- `note/pptist/00-總覽/`
- `note/pptist/01-資料模型/`
- `note/pptist/02-編輯器骨架/`
- `note/pptist/03-畫布系統/`
- `note/pptist/04-縮圖系統/`
- `note/pptist/05-store與狀態流/`
- `note/pptist/06-匯入匯出/`
- `note/pptist/07-播放與預覽/`

## 對照資源

- `PPTist-SourceCode/doc/DirectoryAndData.md`
- `PPTist-SourceCode/doc/Canvas.md`
- `note/pptist/03-畫布系統/README.md`
- `note/pptist/03-畫布系統/ppt-canvas-workspace/README.md`

## 實作入口

如果你要直接看或修改 `03-畫布系統` 的 demo，請進入：

- [`note/pptist/03-畫布系統/ppt-canvas-workspace/`](./note/pptist/03-畫布系統/ppt-canvas-workspace/)

## 補充說明

- 這個 repo 主要是學習與對照用，不是單一產品專案。
- `ppt-canvas-workspace` 的目標是讓你像操作 PPT 一樣理解畫布、縮放與拖拉視角。
- 如果要往下擴充，可以接著做拖曳、選取框、resize / rotate、store 與 snapshot。
