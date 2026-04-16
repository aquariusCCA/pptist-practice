# `setPointerCapture()` 與 `releasePointerCapture()`：開始與結束事件接管

`setPointerCapture()` 和 `releasePointerCapture()` 是 Pointer Events 裡一組很重要的方法。
它們通常不適合分開孤立理解，而應該放在同一條互動流程裡看：

* `setPointerCapture()`：開始接管這次 pointer 的後續事件
* `releasePointerCapture()`：結束這次接管

它們最常出現在這類互動中：

* 拖動畫布
* 拖曳元件
* 框選區域
* 繪圖
* 滑塊拖曳

這些場景的共同點都是：

> **互動從某個元素開始，但指標在移動過程中很可能離開這個元素。**

---

## 核心概念

Pointer capture 的本質不是「把全頁事件搶過來」，而是：

> **讓某個元素在同一次 pointer 互動期間，持續接收這個 pointer 的後續事件。**

也就是說，當某個元素在 `pointerdown` 後呼叫：

```ts
element.setPointerCapture(event.pointerId)
```

接下來同一個 `pointerId` 的後續事件，例如：

* `pointermove`
* `pointerup`
* `pointercancel`

就會優先持續派發到這個元素，即使指標已經移出元素範圍。

而當互動結束後，再透過：

```ts
element.releasePointerCapture(pointerId)
```

把這次事件接管結束，讓事件派發回到一般狀態。

---

## 為什麼需要它

假設你在畫布上按下滑鼠開始拖曳，然後拖一拖，游標移出了畫布元素。

如果**沒有** pointer capture，常見問題是：

* `pointermove` 可能突然收不到
* `pointerup` 可能漏掉
* `dragging` 狀態可能卡住
* 整段拖曳流程可能中斷

也就是說，系統會出現「互動中途失聯」。

而 `setPointerCapture()` 解決的就是這個問題：

> **讓這次互動從哪裡開始，就由哪個元素穩定接住後續事件。**

這也是為什麼它在畫布、白板、地圖、簡報編輯器裡非常常見。

---

## 這一組方法怎麼一起理解

最好的理解方式不是分成兩篇背，而是直接用互動生命週期來看：

1. `pointerdown`
   使用者在元素上開始互動

2. `setPointerCapture(pointerId)`
   元素開始接管這次 pointer 的後續事件

3. `pointermove`
   即使指標移出元素，元素仍能持續收到移動事件

4. `pointerup` / `pointercancel`
   互動正常結束或被中斷

5. `releasePointerCapture(pointerId)`
   元素結束接管，收尾完成

所以它們不是兩個零散 API，而是一組「**開始接管 → 持續追蹤 → 結束接管**」的流程。 

---

## `setPointerCapture()` 在做什麼

`setPointerCapture(pointerId)` 的作用是：

> **把某一次 pointer 互動的後續事件，暫時交給目前這個元素處理。**

你可以把它理解成：

* 互動從這個元素開始
* 這個元素先把這次 pointer「接住」
* 後面的 `pointermove`、`pointerup`、`pointercancel` 盡量都回到它身上

它通常會寫在 `pointerdown` 裡，因為 `pointerdown` 是這次互動開始的時點。

---

## `releasePointerCapture()` 在做什麼

`releasePointerCapture(pointerId)` 的作用是：

> **把先前這次 pointer 的接管結束掉。**

你可以把它理解成：

* 這次拖曳或互動已經結束
* 這個元素不再持續接管該 pointer 的後續事件
* 事件派發回到一般狀態

它通常會出現在：

* `pointerup`
* `pointercancel`
* 提早結束拖曳的流程中

所以它不是在「觸發 `pointerup`」，也不是在「清除拖曳狀態本身」，而是在做**事件接管權的收尾**。

---

## 它們最常見的搭配方式

```ts
stage.addEventListener('pointerdown', (event) => {
  stage.setPointerCapture(event.pointerId)
})

stage.addEventListener('pointerup', (event) => {
  stage.releasePointerCapture(event.pointerId)
})
```

---

## 這段程式在做什麼

這段程式可以拆成兩段理解。

### 1. 按下時開始接管

```ts
stage.setPointerCapture(event.pointerId)
```

這表示：

* 這次互動已經開始
* 後續這個 `pointerId` 的事件，盡量交給 `stage` 處理
* 即使游標離開元素，也不容易中途失聯

### 2. 放開時結束接管

```ts
stage.releasePointerCapture(event.pointerId)
```

這表示：

* 這次互動已經收尾
* 不再需要這個元素持續接住後續事件
* 事件派發恢復一般模式

---

## 它真正解決的問題是什麼

這組方法真正解決的，不是「如何讓事件觸發」，而是：

> **如何讓一段需要持續追蹤的互動，不會因為指標離開元素而斷掉。**

這在畫布系統裡特別重要，因為使用者很容易：

* 從畫布內按下
* 拖到畫布外
* 再放開

如果沒有 pointer capture，整段流程就可能不完整。
如果有 pointer capture，流程就會穩定很多。

---

## 在畫布系統中的角色

在畫布或編輯器中，這組方法通常扮演這樣的角色：

* `pointerdown`：確認互動要開始
* `setPointerCapture()`：保住這次互動的後續事件
* `pointermove`：持續更新 pan、元素位置或框選範圍
* `pointerup` / `pointercancel`：結束互動
* `releasePointerCapture()`：把接管結束掉

所以它們的價值，不是在於「有沒有多寫兩行 API」，而是在於：

> **讓整個拖曳流程穩、完整、可收尾。**

---

## 和拖曳狀態的關係

這裡很容易混淆一件事：

* `setPointerCapture()` / `releasePointerCapture()`
  負責的是**事件接管**
* `dragging = true / false`、起始座標、暫存資料
  負責的是**你的互動狀態**

也就是說：

* capture 不是拖曳狀態本身
* release 也不是在幫你自動清掉所有拖曳變數

例如這樣的收尾才比較完整：

```ts
stage.addEventListener('pointerup', (event) => {
  if (event.pointerId !== dragState.pointerId) return

  stage.releasePointerCapture(event.pointerId)
  dragState.active = false
  dragState.pointerId = null
})
```

這樣才是兩件事都做到了：

1. 結束事件接管
2. 清掉互動狀態

---

## 常見誤解

### 1. 它不是讓 `pointerdown` 或 `pointerup` 才能觸發

不是。
`pointerdown`、`pointerup` 本來就是事件。
capture 做的是**穩定後續事件派發**，不是幫事件「成立」。

### 2. 它不是把整個頁面的事件都搶過來

不是。
它只針對**指定的 `pointerId`** 生效。
所以它是「這一次互動的事件接管」，不是全域攔截。

### 3. 它不是永久綁住元素

不是。
它只維持到：

* `pointerup`
* `pointercancel`
* 或你主動 `releasePointerCapture()`

### 4. `releasePointerCapture()` 不是拖曳收尾的全部

不是。
它只是在釋放 capture。
真正的拖曳收尾，還包括：

* `dragging = false`
* 清起始座標
* 清暫存狀態
* 重設目前追蹤的 `pointerId`

---

## 要不要一定手動 `releasePointerCapture()`？

不一定。

在正常流程下，`pointerup` 後瀏覽器通常會隱式結束這次 capture。
但在程式語意上，**明確手動釋放通常更好讀、也更容易維護**，因為它讓整個流程變得很清楚：

* 這裡開始接管
* 這裡結束接管

所以手動 `releasePointerCapture()` 的價值，往往不只是功能需要，也是為了讓程式的互動邏輯更明確。

---

## 和 `WorkspaceStage.vue` 的對應

如果放到畫布系統裡理解，這組方法的語意可以整理成：

* 在 `pointerdown` 時，確認這次拖曳要開始
* 然後用 `setPointerCapture()` 把後續事件穩定接住
* 拖曳過程中持續透過 `pointermove` 更新畫布狀態
* 最後在 `pointerup` 或 `pointercancel` 時收尾
* 再用 `releasePointerCapture()` 把這次事件接管正式結束

所以它們的角色不是主角運算，而是**確保整段畫布互動不會中途掉事件**。 

---

## 一句話總結

`setPointerCapture()` 和 `releasePointerCapture()` 是一組「**開始接管 / 結束接管**」的方法。
它們的核心價值是讓同一次 pointer 互動在拖曳、繪圖、框選等場景中，不會因為指標離開元素而中斷，並且能在結束時把整個流程收得更完整。

---