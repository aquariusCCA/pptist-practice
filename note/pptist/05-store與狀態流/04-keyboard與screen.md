# keyboard 與 screen

這兩個 store 是補充性的狀態 store。

它們不承載簡報內容本體，而是提供互動判斷所需的環境狀態。

## keyboard store

### 欄位

- `ctrlKeyState`
- `shiftKeyState`
- `spaceKeyState`

### 作用

- 記錄按鍵是否按下
- 讓快捷鍵、拖曳、播放控制能正確判斷

## screen store

### 欄位

- `screening`

### 作用

- 記錄是否在播放模式
- 區分編輯模式與簡報模式

## 你要懂的事

- `keyboard store` 是輸入狀態
- `screen store` 是模式狀態
- 它們都不是內容資料，但會影響互動邏輯
- 它們和 `01-資料模型` 的關係是「使用資料」，不是「定義內容」

## 對照

- [`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)
