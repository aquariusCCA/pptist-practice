# releasePointerCapture()

`releasePointerCapture()` 是 `setPointerCapture()` 的對應方法，用來釋放 pointer capture。

如果說 `setPointerCapture(pointerId)` 是把某一次 pointer 的後續事件暫時交給某個元素處理，
那 `releasePointerCapture(pointerId)` 就是把這個接管權收回來。

## 它在做什麼

當元素已經捕捉了某個 pointer 之後，它會持續收到這次互動的後續事件。
而 `releasePointerCapture()` 的作用，就是明確告訴瀏覽器：

- 這次捕捉結束了
- 這個元素不再接管這個 pointer 的後續事件

## 什麼時候用

最常見的時機是：

- `pointerup` 時
- `pointercancel` 時
- 你提早結束拖曳流程時

也就是說，只要這次互動不再需要由原本元素持續接管，就可以釋放。

## 基本範例

```ts
stage.addEventListener('pointerdown', (event) => {
  stage.setPointerCapture(event.pointerId)
})

stage.addEventListener('pointerup', (event) => {
  stage.releasePointerCapture(event.pointerId)
})
```

這段程式的意思是：

1. 按下時先捕捉 pointer
2. 放開時把捕捉解除
3. 讓下一次互動回到正常狀態

## 為什麼要釋放

這樣做的好處是：

- 互動流程清楚
- 狀態收尾完整
- 不會讓元素一直維持「還在接管」的語意

對畫布拖曳這種互動來說，`releasePointerCapture()` 通常就是收尾的一部分。

## 和 `setPointerCapture()` 的關係

兩者是一組的：

- `setPointerCapture()`：開始接管
- `releasePointerCapture()`：結束接管

如果沒有釋放，雖然瀏覽器在 `pointerup` 後通常也會隱式結束 capture，但在程式語意上，明確釋放會更容易讀懂。

## 和 `WorkspaceStage.vue` 的關係

在 `WorkspaceStage.vue` 裡，拖曳是從 `pointerdown` 開始，最後在 `pointerup` 收尾。

這時候呼叫 `releasePointerCapture()` 的目的就是：

- 結束這次拖曳的事件接管
- 配合 `dragging = false`
- 讓 `stageRef` 回到一般狀態

## 常見誤解

### 1. 它不是讓 `pointerup` 發生

`pointerup` 本來就會發生。
`releasePointerCapture()` 只是把 capture 放掉，不是負責觸發事件。

### 2. 它不是一定要手動呼叫才會結束

在 `pointerup` 後，瀏覽器通常會隱式釋放 capture。
所以這個方法更多時候是顯式收尾，不是唯一機制。

### 3. 它不是用來清拖曳狀態

拖曳狀態要靠你的變數清理，例如 `dragging = false`。
`releasePointerCapture()` 只負責事件接管權的釋放。

## 小結

`releasePointerCapture()` 的重點很單純：

**把先前捕捉住的 pointer 釋放掉，讓這次互動結束。**

它通常會和 `setPointerCapture()` 成對出現，一個負責接管，一個負責收尾。

