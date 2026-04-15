# DOM Events

這一組筆記專注在 `WorkspaceStage.vue` 裡用到的幾個原生互動事件。

## 事件索引

1. [pointerdown](./pointerdown.md)
2. [pointermove](./pointermove.md)
3. [pointerup](./pointerup.md)
4. [pointercancel](./pointercancel.md)
5. [wheel](./wheel.md)

## 補充筆記

- [setPointerCapture()](./setPointerCapture.md)
- [releasePointerCapture()](./releasePointerCapture.md)

## 範例索引

- [demos](./demos/README.md)

## 學習重點

- `pointerId` 用來識別同一次指標互動
- `pointerType` 用來分辨 `mouse`、`touch`、`pen`
- `setPointerCapture()` 用來保住拖曳過程中的後續事件
- `releasePointerCapture()` 用來結束 capture
- `preventDefault()` 用來阻止預設捲動或頁面行為

## 和 `WorkspaceStage.vue` 的關係

`WorkspaceStage.vue` 把這些事件掛在 `<section ref="stageRef">` 上，用來做兩件事：

- 拖動畫布
- 用滑鼠滾輪縮放

這些事件不是孤立知識，而是畫布互動的核心。

