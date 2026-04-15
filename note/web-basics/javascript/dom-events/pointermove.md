# pointermove：指標移動事件

`pointermove` 會在指標移動時觸發。它常和 `pointerdown`、`pointerup` 一起組成拖曳流程。

## 重點

- 它會非常頻繁地觸發
- 它適合拿來更新座標、拖曳位置或畫布 pan
- 如果有 pointer capture，指標移出元素後仍能持續收到事件

## 常用欄位

| 欄位 | 說明 | 在畫布互動中的用途 |
| --- | --- | --- |
| `event.clientX` / `event.clientY` | 游標在視窗中的座標。以瀏覽器視窗左上角為基準。 | 用來計算目前滑鼠或手指的位置，進一步算出拖曳位移。 |
| `event.movementX` / `event.movementY` | 這次移動相對於上一個 `pointermove` 的差值。 | 可用來做簡單位移，但在縮放或座標換算時通常還是直接用 `clientX/clientY` 比較穩。 |
| `event.pointerId` | 這次指標互動的識別碼。 | 用來確認目前移動是不是屬於同一次拖曳。 |
| `event.pointerType` | 指標型別，常見值是 `mouse`、`touch`、`pen`。 | 可依來源分流處理，例如觸控與滑鼠的互動策略不同。 |

### 這些欄位怎麼一起看

最常見的流程是：

1. 先確認目前拖曳中的 `pointerId`
2. 再用 `clientX/clientY` 算目前位置
3. 用目前位置和起始位置的差值更新 pan 或元素座標

## 範例

對應 demo：

- [pointermove.html](./demos/pointermove.html)

```ts
stage.addEventListener('pointermove', (event) => {
  if (!dragState.active) return

  pan.x = dragState.startPanX + (event.clientX - dragState.startX)
  pan.y = dragState.startPanY + (event.clientY - dragState.startY)
})
```

這種寫法最常見的用途是：

- 追蹤拖曳中的位移
- 更新畫布 pan
- 更新游標所在位置

## 和 `WorkspaceStage.vue` 的對應

在畫布系統中，`pointermove` 是拖曳的中段。`pointerdown` 先記錄起點，`pointermove` 持續算位移，最後由 `pointerup` 或 `pointercancel` 收尾。

