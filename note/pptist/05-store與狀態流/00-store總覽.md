# store 總覽

`PPTist` 的 store 可以分成 5 類：

- `slides store`
- `main store`
- `snapshot store`
- `keyboard store`
- `screen store`

## 它們各自負責什麼

### `slides store`
- 管簡報內容的讀寫與衍生狀態
- 管頁面與元素資料的增刪改查
- 負責內容層資料如何在編輯中更新

### `main store`
- 管選取、畫布、工具、面板、輸入法等互動狀態
- 負責使用者操作當下的畫面狀態切換

### `snapshot store`
- 管 undo / redo 流程
- 管歷史快照數量、游標與版本回復

### `keyboard store`
- 管 Ctrl、Shift、Space 等按鍵是否按下
- 提供快捷鍵與拖曳邏輯使用

### `screen store`
- 管是否進入播放模式
- 幫助區分編輯與簡報播放兩種模式

## 你要記住的關係

- `slides store` 是內容與內容衍生狀態的中心
- `main store` 是編輯器互動狀態的中心
- `snapshot store` 是歷史回復的中心
- `keyboard store` 是按鍵輸入狀態的中心
- `screen store` 是播放模式狀態的中心

如果只想理解「資料結構」，請回到 `01-資料模型`。
如果想理解「資料怎麼被改」，再從這一章往下看 action、getter 與流程。

## 對照

- [`src/store/index.ts`](../../../PPTist-SourceCode/src/store/index.ts)
- [`src/store/slides.ts`](../../../PPTist-SourceCode/src/store/slides.ts)
- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/store/keyboard.ts`](../../../PPTist-SourceCode/src/store/keyboard.ts)
- [`src/store/screen.ts`](../../../PPTist-SourceCode/src/store/screen.ts)
