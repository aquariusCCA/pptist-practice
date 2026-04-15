# pointerdown：指標按下事件

`pointerdown` 是指標第一次按下時觸發的原生事件。它可以來自滑鼠、手指或手寫筆。

## 重點

- 它是 Pointer Events 的起點
- 它不是 `click`
- 它通常用來啟動拖曳或繪圖流程

## 常用欄位

| 欄位 | 說明 | 在畫布互動中的用途 |
| --- | --- | --- |
| `event.pointerId` | 這次指標互動的識別碼。從按下到放開或取消之前，通常都維持不變。 | 用來鎖定同一次拖曳，避免多指操作時混掉。 |
| `event.pointerType` | 指標型別，常見值是 `mouse`、`touch`、`pen`。 | 用來判斷來源，方便針對滑鼠、手指、手寫筆做不同處理。 |
| `event.clientX` / `event.clientY` | 游標在視窗中的座標。以瀏覽器視窗左上角為基準。 | 用來記錄起點座標，後續可換算拖曳位移或畫布座標。 |
| `event.button` | 滑鼠按下的是哪個按鍵，左鍵通常是 `0`。 | 常用來過濾非左鍵操作，避免右鍵或中鍵也觸發拖曳。 |
| `event.isPrimary` | 這是不是主要指標。多指觸控時可用來判斷主操作來源。 | 在只允許單一主要指標的互動裡很有用。 |

### 這些欄位怎麼一起看

最常見的流程是：

1. 先看 `event.button`，確認是不是要處理的按鍵
2. 再看 `event.pointerType`，判斷輸入來源
3. 用 `event.pointerId` 鎖定這一次互動
4. 用 `event.clientX` / `event.clientY` 記錄起點座標

## 範例

對應 demo：

- [pointerdown.html](./demos/pointerdown.html)

```html
<div id="pad">按下我</div>

<script>
  pad.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    pad.setPointerCapture(event.pointerId)
  })
</script>
```

這類寫法最常見的用途是：

- 記錄起始座標
- 開啟 dragging 狀態
- 捕捉後續移動事件

## 和 `WorkspaceStage.vue` 的對應

在畫布系統中，`pointerdown` 通常是拖曳的第一步。它先確認左鍵，再把當前指標鎖定到 `stageRef` 對應的元素上，避免拖到邊界時失去後續事件。

## 和 `setPointerCapture()` 的關係

如果你想知道為什麼這裡會寫 `setPointerCapture()`，可以直接看補充筆記：

- [setPointerCapture()](./setPointerCapture.md)

