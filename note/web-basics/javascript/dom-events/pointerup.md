# pointerup：指標放開事件

`pointerup` 會在指標放開時觸發，代表一段正常的互動流程結束。

## 重點

- 它是拖曳流程的收尾
- 它不等於 `click`
- 它常和 `pointercancel` 一起寫

## 常用欄位

| 欄位 | 說明 | 在畫布互動中的用途 |
| --- | --- | --- |
| `event.pointerId` | 這次指標互動的識別碼。 | 用來確認放開的是不是同一個正在拖曳的指標。 |
| `event.pointerType` | 指標型別，常見值是 `mouse`、`touch`、`pen`。 | 可用來判斷是否要做不同的收尾處理。 |
| `event.clientX` / `event.clientY` | 放開時的座標。 | 若需要做點擊落點或最終位置記錄，會用到。 |

### 這些欄位怎麼一起看

最常見的流程是：

1. 用 `pointerId` 確認這次放開對應哪一段拖曳
2. 用 `clientX/clientY` 取得結束點
3. 清掉 dragging 狀態與暫存資料

## 範例

對應 demo：

- [pointerup.html](./demos/pointerup.html)

```ts
stage.addEventListener('pointerup', (event) => {
  if (event.pointerId !== pointerId) return

  stage.releasePointerCapture(pointerId)
  pointerId = null
})
```

這種寫法最常見的用途是：

- 結束拖曳
- 釋放 pointer capture
- 清除暫存狀態

## 和 `WorkspaceStage.vue` 的對應

在畫布系統中，`pointerup` 是正常結束點。它負責把拖曳流程收乾淨，避免畫布卡在「還在拖」的狀態。

## 和 `releasePointerCapture()` 的關係

如果你想知道這裡為什麼要把 capture 放掉，可以看補充筆記：

- [releasePointerCapture()](./releasePointerCapture.md)

