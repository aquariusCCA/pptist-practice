# pointercancel：指標取消事件

`pointercancel` 表示這次指標互動被瀏覽器、系統或裝置中斷了，不能再把它當成正常結束流程處理。

## 重點

- 它不是正常結束
- 它是異常中斷
- 它通常要做保底清理

## 常用欄位

| 欄位 | 說明 | 在畫布互動中的用途 |
| --- | --- | --- |
| `event.pointerId` | 這次指標互動的識別碼。 | 用來確認被取消的是哪一段拖曳或操作。 |
| `event.pointerType` | 指標型別，常見值是 `mouse`、`touch`、`pen`。 | 在觸控裝置上更容易遇到取消，因此有助於做差異處理。 |
| `event.clientX` / `event.clientY` | 取消當下的座標。 | 若要記錄中斷點或除錯位置會用到。 |

### 這些欄位怎麼一起看

最常見的流程是：

1. 用 `pointerId` 找到目前是哪個互動被打斷
2. 用 `pointerType` 判斷來源
3. 不再繼續拖曳，直接清理狀態

## 範例

對應 demo：

- [pointercancel.html](./demos/pointercancel.html)

```ts
function reset(reason) {
  dragging = false
  pointerId = null
}

stage.addEventListener('pointerup', () => reset('pointerup'))
stage.addEventListener('pointercancel', () => reset('pointercancel'))
```

這種寫法最常見的用途是：

- 清掉 dragging 狀態
- 釋放 pointer capture
- 避免介面卡死

## 和 `WorkspaceStage.vue` 的對應

在畫布互動裡，`pointercancel` 和 `pointerup` 通常要一起處理。前者負責意外中斷時的清理，後者負責正常結束。

