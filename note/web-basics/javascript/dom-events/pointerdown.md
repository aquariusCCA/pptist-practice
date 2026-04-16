# pointerdown：指標按下事件

`pointerdown` 是指標**開始接觸目標元素**時觸發的原生事件。  
這個指標可以來自滑鼠、手指或手寫筆，因此它是畫布互動、拖曳、縮放、繪圖等操作的常見起點。

## 它是什麼

在 Pointer Events 裡，`pointerdown` 代表「這一次指標互動正式開始」。

只要使用者把滑鼠按下、手指碰到螢幕、或手寫筆接觸感應區，就會觸發這個事件。  
因此在畫布系統中，它通常負責做互動初始化，例如：

- 確認是否要處理這次操作
- 記錄起始座標
- 鎖定目前這一次指標互動
- 進入 dragging 或 drawing 狀態
- 準備接收後續的 `pointermove` 與 `pointerup`

## 它不是 `click`

`pointerdown` 和 `click` 很容易混淆，但兩者的時機不同：

- `pointerdown`：**按下當下**就會觸發
- `click`：通常要等到**按下再放開**後才會觸發

這個差異很重要。  
因為拖曳、畫線、框選這類互動，必須從「按下的瞬間」就開始記錄狀態，所以通常會使用 `pointerdown`，而不是 `click`。

## 為什麼畫布系統常從 `pointerdown` 開始

畫布互動通常不是單一事件，而是一段連續流程：

1. `pointerdown`：開始互動，記錄起點，進入操作狀態
2. `pointermove`：根據移動持續更新位置、位移或圖形
3. `pointerup` / `pointercancel`：結束互動，清除狀態

所以可以把 `pointerdown` 理解成整段拖曳或繪圖流程的起點。

## 常用欄位

| 欄位 | 說明 | 在畫布互動中的用途 |
| --- | --- | --- |
| `event.pointerId` | 這次指標互動的唯一識別碼。從按下到放開或取消之前，通常都維持不變。 | 用來鎖定同一次拖曳或繪圖流程，避免多指操作時混掉。 |
| `event.pointerType` | 指標型別，常見值有 `mouse`、`touch`、`pen`。 | 用來判斷輸入來源，方便針對滑鼠、手指、手寫筆做不同處理。 |
| `event.clientX` / `event.clientY` | 指標在視窗中的座標，以瀏覽器視窗左上角為基準。 | 用來記錄起點，後續可計算拖曳位移，或再換算成畫布座標。 |
| `event.button` | 滑鼠按下的是哪個按鍵，左鍵通常是 `0`。 | 常用來過濾非左鍵操作，避免右鍵或中鍵也進入拖曳流程。 |
| `event.isPrimary` | 這是不是主要指標。多指觸控時可用來判斷主操作來源。 | 在只允許單一主要指標的互動中很有用，可避免次要觸點干擾。 |

## 這些欄位通常怎麼一起使用

在實作拖曳時，常見判斷流程如下：

1. 先看 `event.button`，確認是不是要處理的按鍵
2. 再看 `event.pointerType`，判斷輸入來源
3. 視需求檢查 `event.isPrimary`，避免多指干擾
4. 用 `event.pointerId` 鎖定這一次互動
5. 用 `event.clientX` / `event.clientY` 記錄起始座標
6. 進入 dragging 或 drawing 狀態
7. 必要時呼叫 `setPointerCapture()`，確保後續事件不會丟失

## 範例

對應 demo：

- [pointerdown.html](./demos/pointerdown.html)

```html
<div id="pad">按下我</div>

<script>
  const pad = document.getElementById('pad')

  let isDragging = false
  let startX = 0
  let startY = 0
  let activePointerId = null

  pad.addEventListener('pointerdown', (event) => {
    // 只處理滑鼠左鍵
    if (event.pointerType === 'mouse' && event.button !== 0) return

    activePointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    isDragging = true

    // 讓後續 move / up 即使移出元素也能持續派發到 pad
    pad.setPointerCapture(event.pointerId)
  })
</script>
```

這段程式的重點不是「按下後做一件事」，而是「初始化整段互動流程」：

* 記錄這次互動的 `pointerId`
* 記錄起始座標
* 進入 dragging 狀態
* 捕捉後續移動與結束事件

## 和 `WorkspaceStage.vue` 的對應

在畫布系統中，`pointerdown` 往往就是拖曳的第一步。

以 `WorkspaceStage.vue` 這類元件來看，常見邏輯通常是：

1. 確認是不是可處理的按鍵或輸入來源
2. 記錄當前指標資訊與起始座標
3. 把這次操作綁定到目前的畫布或 stage 元素
4. 呼叫 `setPointerCapture(event.pointerId)`

這樣做的目的，是讓後續的 `pointermove` 和 `pointerup` 即使發生在元素邊界外，仍然能被目前這個 stage 持續接收。
否則拖曳途中一旦游標離開元素，事件可能中斷，導致整段互動流程不完整。

## 和 `setPointerCapture()` 的關係

`pointerdown` 很常和 `setPointerCapture()` 一起出現，因為它正好是「開始捕捉這次指標互動」的最佳時機。

一旦在 `pointerdown` 裡呼叫：

```js
element.setPointerCapture(event.pointerId)
```

代表後續和這個 `pointerId` 有關的事件，會優先派發到目前這個元素。
這對拖曳、畫圖、框選等連續互動非常重要。

如果你想進一步理解這個機制，可以接著看補充筆記：

* [setPointerCapture()](./setPointerCapture.md)

## 一句話總結

`pointerdown` 不是單純的「按下事件」，而是整段指標互動流程的起點。
在畫布系統裡，它的核心任務通常是：**確認是否處理、記錄起點、鎖定指標、進入互動狀態，並準備接管後續事件。**