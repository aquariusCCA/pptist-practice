# `pointermove`：指標移動事件

`pointermove` 會在**指標位置發生改變時持續觸發**。
這裡的指標可以是滑鼠、手指或觸控筆，因此它是一個比 `mousemove` 更通用的事件。

在畫布互動中，`pointermove` 很常和 `pointerdown`、`pointerup`、`pointercancel` 搭配使用，組成完整的拖曳流程：

* `pointerdown`：記錄互動起點
* `pointermove`：持續更新位移
* `pointerup` / `pointercancel`：結束互動並清理狀態

---

## 核心概念

`pointermove` 的本質不是「拖曳事件」，而是：

> **只要指標位置改變，就會持續派發的移動事件。**

拖曳只是它最常見的用途之一。
除了拖曳之外，它也常被用在：

* 更新畫布的 pan
* 追蹤游標位置
* 繪圖
* 框選
* 縮放過程中的輔助計算
* 顯示 hover 座標或輔助線

---

## 重點

* `pointermove` 會非常頻繁地觸發
* 很適合用來持續更新座標、位移或畫面狀態
* 在拖曳場景中，通常會和一個「互動狀態」物件一起使用
* 如果元素取得了 **pointer capture**，即使指標移出元素範圍，後續的移動事件仍會持續派發到這個元素

---

## 常用欄位

| 欄位                                    | 說明                              | 在畫布互動中的用途            |
| ------------------------------------- | ------------------------------- | -------------------- |
| `event.clientX` / `event.clientY`     | 指標在瀏覽器視窗中的座標，以視窗左上角為基準          | 取得當前指標位置，進一步計算拖曳位移   |
| `event.movementX` / `event.movementY` | 相對於上一個移動事件的位移差值                 | 可用於簡單位移計算，但不適合複雜座標換算 |
| `event.pointerId`                     | 這次指標互動的唯一識別碼                    | 用來確認事件是否屬於同一次互動      |
| `event.pointerType`                   | 指標型別，常見值為 `mouse`、`touch`、`pen` | 可根據不同輸入來源採用不同互動策略    |

---

## 這些欄位怎麼一起理解

在實務上，`pointermove` 最常見的使用方式不是單看某個欄位，而是把它放回整個互動流程裡理解：

1. 在 `pointerdown` 時記錄起始資料
   例如起始指標位置、起始 pan、目前是否進入拖曳狀態、當前 `pointerId`

2. 在 `pointermove` 時先確認目前是否仍處於有效互動中
   例如：

   * 是否正在拖曳
   * `pointerId` 是否一致

3. 再用目前位置和起始位置做比較
   通常會以 `clientX/clientY` 和 `startX/startY` 的差值來計算位移

4. 把位移套用到畫布狀態
   例如更新 pan、元素座標或選取框範圍

---

## 為什麼通常優先用 `clientX / clientY`

`movementX / movementY` 看起來很方便，因為它直接提供「這一次移動了多少」。
但在畫布系統裡，很多情況仍然會優先使用 `clientX / clientY`，原因是：

* 它代表的是**當前的絕對位置**
* 比較適合和「起始位置」做差值計算
* 在縮放、平移、座標轉換時比較容易推導
* 更適合重算，而不只是累加

也就是說：

* `movementX / movementY`：偏向「事件與事件之間的增量」
* `clientX / clientY`：偏向「目前指標的實際位置」

如果只是做很單純的移動，`movementX / movementY` 可能夠用；
但只要牽涉到縮放、容器偏移、畫布座標換算，通常還是以 `clientX / clientY` 為主會更穩定。

---

## 在畫布系統中特別要注意的事

`clientX / clientY` 是**瀏覽器視窗座標**，它還不是畫布真正使用的內部座標。

因此在畫布系統中，常見流程通常不是：

> 直接把 `clientX / clientY` 當成元素座標

而是：

1. 先取得指標在視窗中的位置
2. 扣掉畫布容器在視窗中的偏移
3. 再根據目前縮放比例做換算
4. 最後得到畫布座標或世界座標

這也是為什麼在簡單 demo 裡看起來只要用 `clientX/clientY` 就可以，
但在像 PPTist 這種有縮放、平移、畫布容器的系統中，往往還要多一層座標轉換。

---

## 範例

對應 demo：

* [pointermove.html](./demos/pointermove.html)

```ts
stage.addEventListener('pointermove', (event) => {
  if (!dragState.active) return

  pan.x = dragState.startPanX + (event.clientX - dragState.startX)
  pan.y = dragState.startPanY + (event.clientY - dragState.startY)
})
```

---

## 這段程式在做什麼

這段程式的邏輯可以拆成三步：

1. 先確認目前是否處於拖曳中
2. 用「目前指標位置 - 拖曳起點位置」算出位移
3. 把這個位移加回起始 pan，得到目前 pan

也就是說，它不是每次都在「累加位移」，而是：

> **根據起點重新計算當前位置**

這種寫法的好處是邏輯穩定，也比較不容易因為事件頻繁觸發而累積誤差。

---

## 這種寫法最常見的用途

* 拖曳整個畫布
* 更新畫布 pan
* 移動元素
* 更新框選區域
* 顯示目前游標位置

---

## 和 `WorkspaceStage.vue` 的對應

在畫布系統中，`pointermove` 可以理解為拖曳流程的「中段」：

* `pointerdown`：建立互動狀態，記錄起點
* `pointermove`：根據目前位置持續更新位移
* `pointerup` / `pointercancel`：結束互動，清理狀態

如果搭配 **pointer capture**，那麼在拖曳過程中，即使指標移出畫布元素，後續事件仍會持續送回原本的互動目標，讓整個拖曳流程更穩定、不容易中斷。

---

## 一句話總結

`pointermove` 提供的是**指標持續移動時的最新位置資訊**。
在畫布系統裡，它的價值不只是「知道滑鼠有在動」，而是讓我們能夠根據這些位置變化，持續更新 pan、元素位置與互動狀態。

---