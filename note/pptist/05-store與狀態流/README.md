# 05-store 與狀態流

這一章專門整理 `PPTist` 的 store 架構與狀態流。

如果說 `01-資料模型` 是看「資料長什麼樣」，那這一章就是看：

- 資料由哪個 store 管理
- 使用者操作如何改變 state
- getter 如何從 state 推導畫面需要的資料
- action 如何更新簡報內容、互動狀態與歷史快照
- 不同 store 之間如何互相配合

也就是說：

- `01-資料模型`：看資料結構
- `05-store與狀態流`：看資料行為
- `store`：連接「資料模型」與「使用者操作」的中間層

這一章不會重複完整型別欄位，而是聚焦在：

- 責任邊界
- 狀態來源
- 狀態流向
- 原始碼閱讀入口

---

## 章節拆分

1. [store 總覽](./00-store總覽.md)
2. [slides store](./01-slides-store.md)
3. [main store](./02-main-store.md)
4. [snapshot store](./03-snapshot-store.md)
5. [keyboard 與 screen](./04-keyboard與screen.md)

---

## 這章要先建立的核心觀念

`PPTist` 的 store 可以先分成五類：

| store | 核心責任 | 主要關注 |
|---|---|---|
| `slides store` | 簡報內容資料 | 頁面、元素、主題、動畫、目前頁 |
| `main store` | 編輯器互動狀態 | 選取、拖曳、縮放、面板、工具列 |
| `snapshot store` | 歷史版本管理 | undo、redo、快照游標、IndexedDB |
| `keyboard store` | 鍵盤環境狀態 | Ctrl、Shift、Space 是否按下 |
| `screen store` | 播放模式狀態 | 是否正在簡報播放 |

最重要的分工是：

- `slides store` 管「簡報本身」
- `main store` 管「使用者正在怎麼操作簡報」
- `snapshot store` 管「簡報歷史版本」
- `keyboard store` 管「鍵盤修飾狀態」
- `screen store` 管「目前是否進入播放模式」

---

## store 之間的關係

### `main store` 依賴 `slides store`

`main store` 本身不保存完整元素資料。

例如：

- `activeElementIdList` 只存目前選取的元素 ID
- `handleElementId` 只存目前主要操作中的元素 ID

真正的元素資料仍然存在 `slides store.currentSlide.elements`。

所以：

```txt
main store 存互動 ID
→ slides store 存元素資料
→ getter 把 ID 對應成真正的元素