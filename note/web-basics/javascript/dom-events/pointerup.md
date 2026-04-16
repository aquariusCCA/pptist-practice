# `pointerup`：指標放開事件

`pointerup` 會在**指標解除按壓或接觸時觸發**，代表這次指標互動進入正常收尾階段。

這裡的指標不只包含滑鼠，也可能是手指或觸控筆，所以 `pointerup` 不只是「滑鼠放開」，而是更通用的 **Pointer Events 結束事件**。

在畫布互動中，`pointerup` 很常和 `pointerdown`、`pointermove`、`pointercancel` 一起出現，組成完整流程：

* `pointerdown`：建立互動、記錄起點
* `pointermove`：持續更新位移或狀態
* `pointerup`：正常結束互動並收尾
* `pointercancel`：互動被中斷時進行補救收尾

---

## 核心概念

`pointerup` 的重點不是「有一個放開事件發生了」，而是：

> **一次指標互動在這裡正常結束，系統應該把互動狀態收乾淨。**

在畫布系統裡，它通常不是拿來做主要邏輯計算，而是拿來做**收尾**：

* 結束拖曳
* 停止移動
* 清除暫存狀態
* 釋放 pointer capture
* 避免系統卡在「仍在互動中」的狀態

---

## 重點

* `pointerup` 是拖曳流程的正常結束點
* 它不等於 `click`
* 它通常和 `pointercancel` 一起實作
* 它的核心任務不是更新位移，而是**收尾與清理狀態**
* 如果拖曳期間有使用 pointer capture，通常會在這裡釋放

---

## `pointerup` 不等於 `click`

這兩者很容易被混淆，但概念並不一樣：

* `pointerup`：指標互動結束
* `click`：一次符合條件的點擊行為成立

也就是說，`pointerup` 比較偏向**底層互動事件**，
而 `click` 比較偏向**較高層的語意事件**。

在畫布系統中，我們更常依賴 `pointerdown / pointermove / pointerup` 來控制拖曳流程，
而不是依賴 `click`。

---

## 為什麼常和 `pointercancel` 一起寫

因為不是每一次互動都會「正常走到 `pointerup`」。

有些情況下，互動可能會被系統中斷，例如：

* 觸控流程被瀏覽器接管
* 裝置狀態改變
* 當前指標互動被取消
* 某些平台或輸入條件下，事件序列無法正常結束

所以實務上通常會這樣理解：

* `pointerup`：**正常結束**
* `pointercancel`：**非正常中斷，但仍然要收尾**

這也是為什麼畫布系統常常會把兩者的清理邏輯寫得很像。

---

## 常用欄位

| 欄位                                | 說明                              | 在畫布互動中的用途              |
| --------------------------------- | ------------------------------- | ---------------------- |
| `event.pointerId`                 | 這次指標互動的識別碼                      | 用來確認現在放開的是不是同一個正在互動的指標 |
| `event.pointerType`               | 指標型別，常見值為 `mouse`、`touch`、`pen` | 可依不同輸入來源決定是否做不同收尾策略    |
| `event.clientX` / `event.clientY` | 指標放開時在視窗中的座標                    | 若要記錄結束點、點擊落點或最終位置，會用到  |

---

## 這些欄位怎麼一起理解

在實務中，`pointerup` 最常見的處理流程通常是：

1. 先確認這次 `pointerup` 是否屬於目前正在追蹤的那個指標
   通常會用 `pointerId` 比對

2. 如有需要，讀取結束時的座標
   例如 `clientX / clientY`

3. 清除互動狀態
   例如：

   * dragging 狀態
   * 起始座標
   * 暫存 pan
   * 當前 `pointerId`

4. 如果之前有做 pointer capture，就在這裡釋放

---

## 範例

對應 demo：

* [pointerup.html](./demos/pointerup.html)

```ts
stage.addEventListener('pointerup', (event) => {
  if (event.pointerId !== pointerId) return

  stage.releasePointerCapture(pointerId)
  pointerId = null
})
```

---

## 這段程式在做什麼

這段程式主要在做兩件事：

### 1. 確認是不是同一次互動

```ts
if (event.pointerId !== pointerId) return
```

這一步是為了避免處理到不是目前這段拖曳流程的事件。
在多指觸控或複雜互動中，這個判斷很重要。

### 2. 結束 capture 並清掉追蹤狀態

```ts
stage.releasePointerCapture(pointerId)
pointerId = null
```

這代表：

* 不再強制由這個元素接收後續指標事件
* 目前這段互動已經正式結束
* 系統不再追蹤這個指標

---

## 這段程式還可以怎麼理解

這種寫法的重點不是「收到 `pointerup` 就做某件事」，而是：

> **只要互動正常結束，就把這次互動留下來的狀態全部收掉。**

因此在更完整的實作裡，除了 `pointerId = null`，通常還會一起清掉：

* `dragState.active = false`
* 起始座標
* 起始 pan
* 暫存選取資訊
* 其他與本次互動有關的中間狀態

也就是說，範例展示的是**收尾核心**，不是全部收尾內容。

---

## 和 `releasePointerCapture()` 的關係

如果在 `pointerdown` 時有呼叫 `setPointerCapture()`，
那麼後續的 `pointermove`、`pointerup` 等事件，即使指標移出元素範圍，仍然會持續派發到這個元素。

這對拖曳來說很重要，因為可以避免拖到元素外面時流程中斷。

但當互動結束後，就要把這個 capture 放掉，原因是：

* 這次互動已經結束
* 不應該再由這個元素持續接管後續事件
* 事件派發目標應恢復正常

所以在 `pointerup` 裡呼叫 `releasePointerCapture()`，本質上就是在做：

> **把這次拖曳期間暫時建立的事件控制權還回去。**

---

## 在畫布系統中的角色

在畫布系統裡，`pointerup` 可以理解為拖曳流程的**正常終點**。

它的主要責任不是運算，而是確保整個流程有正確收尾：

* 不再更新畫布位移
* 不再追蹤目前指標
* 不再維持 dragging 狀態
* 不再持有 pointer capture
* 讓系統回到乾淨、可開始下一次互動的狀態

如果少了這一步，畫布很容易出現這類問題：

* 明明已經放開，系統卻還以為在拖
* 後續移動仍然被誤判為拖曳
* 暫存資料沒有被清掉，導致下次互動異常

---

## 和 `WorkspaceStage.vue` 的對應

在畫布系統中，這段流程通常可以這樣理解：

* `pointerdown`：記錄互動起點，啟動拖曳狀態
* `pointermove`：依照指標變化持續更新 pan 或元素位置
* `pointerup`：正常結束流程，清理拖曳狀態
* `pointercancel`：如果流程被中斷，也要做類似清理

所以 `pointerup` 雖然不像 `pointermove` 那麼顯眼，
但它其實是讓整個畫布互動「收得乾淨」的關鍵一環。

---

## 一句話總結

`pointerup` 代表的是**一次指標互動的正常結束**。
在畫布系統中，它最重要的任務不是計算，而是把拖曳、capture 與暫存狀態正確收尾，讓系統回到可安全開始下一次互動的狀態。

---