# setPointerCapture()

`setPointerCapture()` 是 Pointer Events 裡很重要的一個方法。它的作用是：

**把某一個 pointer 的後續事件，暫時交給指定的元素處理。**

你可以把它理解成：

- `pointerdown` 發生後，先把這次互動「鎖」在這個元素上
- 接下來同一次互動的 `pointermove`、`pointerup`、`pointercancel` 盡量都回到這個元素

這在拖曳、繪圖、框選、滑動控制等互動裡非常常見。

## 為什麼需要它

假設你在一個元素上按下開始拖曳，然後手指或滑鼠移出了元素邊界。

如果沒有 `setPointerCapture()`，後續事件可能不再送回這個元素，常見結果是：

- `pointermove` 突然不來了
- `pointerup` 收不到
- `dragging` 狀態卡住
- 互動流程中斷

有了 `setPointerCapture()`，這次互動就會比較穩定，因為元素會持續收到這個 pointer 的後續事件。

## 基本用法

```html
<div id="stage"></div>

<script>
  const stage = document.getElementById('stage')

  stage.addEventListener('pointerdown', (event) => {
    stage.setPointerCapture(event.pointerId)
  })
</script>
```

這段程式的意思是：

1. 使用者按下
2. 元素拿到 `pointerId`
3. 呼叫 `setPointerCapture(pointerId)`
4. 這次 pointer 之後的事件優先回到這個元素

## 它解決的是什麼問題

它解決的是「拖曳中途失聯」。

不是所有事件都適合靠全域監聽來補救。對畫布互動來說，`setPointerCapture()` 通常更直接，因為它把這次手勢的責任明確綁在起始元素上。

## 在 `WorkspaceStage.vue` 裡的用途

`WorkspaceStage.vue` 的流程是：

1. 在 `stageRef.value` 上收到 `pointerdown`
2. 確認是左鍵，而且點在舞台本身
3. 記錄拖曳起點
4. 呼叫 `stageRef.value.setPointerCapture(event.pointerId)`

這樣做之後：

- 拖曳時游標移出元素範圍，仍可持續收到 `pointermove`
- 放開時比較不會漏掉 `pointerup`
- 被系統中斷時也能透過 `pointercancel` 收尾

## 和 `pointerdown` 的關係

`pointerdown` 是開始，`setPointerCapture()` 是接手後續。

更精準地說：

- `pointerdown` 負責判斷要不要開始這次互動
- `setPointerCapture()` 負責把這次互動後面的事件穩定接住

所以它通常會寫在 `pointerdown` 回調裡。

## 和 `pointerdown.md` 的關係

如果你想回頭看這個方法是在哪裡被呼叫的，可以直接回到：

- [pointerdown：指標按下事件](./pointerdown.md)

## 什麼時候特別需要

以下情境幾乎都很適合用：

- 拖動畫布
- 拖曳元件
- 框選區域
- 繪圖
- 滑塊拖曳

共通點是：

- 互動從某個元素開始
- 但過程中指標常常會離開該元素

## 常見誤解

### 1. 它不是讓 `pointerdown` 能觸發

`pointerdown` 本身已經觸發了，`setPointerCapture()` 不是在幫它成立。

它是用來保住後面的事件。

### 2. 它不是把整個頁面的事件都搶過來

它只處理指定的 `pointerId`。

也就是說，它是針對這一次指標互動的捕捉，不是全域攔截。

### 3. 它不是永遠綁住元素

這個捕捉只維持到：

- `pointerup`
- `pointercancel`
- 或你主動釋放

## 釋放捕捉

如果你需要手動釋放，可以用：

```js
stage.releasePointerCapture(pointerId)
```

不過多數時候，正常流程下 `pointerup` 之後這次互動就結束了。

## 小結

`setPointerCapture()` 的核心價值很簡單：

**讓同一次拖曳不要因為游標離開元素而斷掉。**

如果你的互動需要「按下後持續追蹤、放開時正常結束」，它通常就很有用。

