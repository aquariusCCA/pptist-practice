# `calculateFitZoom()` 的計算邏輯

## 1. 先看實際程式

```ts
const fitZoom = computed(() => {
  return clamp(calculateFitZoom(stageSize, slide.value, 120), MIN_ZOOM, MAX_ZOOM)
})
```

```ts
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function calculateFitZoom(stage: StageSize, slide: Slide, padding = 96) {
  if (stage.width <= 0 || stage.height <= 0) {
    return 1
  }

  const usableWidth = Math.max(stage.width - padding * 2, 320)
  const usableHeight = Math.max(stage.height - padding * 2, 240)

  return Math.min(usableWidth / slide.width, usableHeight / slide.height)
}
```

### 參數意義

- `stage`
  - 目前工作區容器的實際尺寸
  - 由 `WorkspaceStage.vue` 量測後透過 `stage-size` 事件傳回 `App.vue`

- `slide`
  - 目前要顯示的投影片資料
  - 主要會用到 `slide.width` 和 `slide.height`

- `padding`
  - 代表 slide 四周要保留的空白
  - 預設值是 `96`
  - 在這個 demo 裡，`App.vue` 實際傳入的是 `120`

---

# 2. 這段程式到底在做什麼？

這裡其實分成兩層：

## `calculateFitZoom()`

負責計算：

> **如果想讓整張 slide 完整落在可用顯示區域內，理論上應該使用多少 zoom。**

它只負責算出「理論上的 fit 倍率」，**不處理最終縮放上下限**。

---

## `fitZoom`

負責把 `calculateFitZoom()` 算出的理論值，再經過 `clamp()` 限制，變成：

> **實際允許套用的 zoom 值。**

所以要注意：

* `calculateFitZoom()` = **理論 fit 倍率**
* `fitZoom` = **理論 fit 倍率經過 min/max 限制後的最終值**

這兩個概念不能混在一起。

---

# 3. `calculateFitZoom()` 的核心目標

它的目標可以用一句話表示：

> **先扣掉四周 padding，算出真正可用的顯示空間，再求出一個能讓整張 slide 完整放進這個空間的倍率。**

也就是說，它不是單純「放大到最大」，而是：

* 不能超出可用寬度
* 不能超出可用高度
* 要保留四周留白

---

# 4. 計算流程拆解

## 第一步：確認 stage 尺寸是否有效

```ts
if (stage.width <= 0 || stage.height <= 0) {
  return 1
}
```

如果目前 `stage` 的寬或高還沒有量到，直接回傳 `1`。

這樣做的目的有幾個：

* 避免在初始化階段拿到無效尺寸
* 避免後續計算出不合理結果
* 提供一個安全的預設倍率

這裡回傳 `1` 的意思不是「fit 後一定應該是 1 倍」，而是：

> **當前無法正確計算時，先用一個中性的預設值。**

---

## 第二步：扣掉 padding，算出真正可用空間

```ts
const usableWidth = Math.max(stage.width - padding * 2, 320)
const usableHeight = Math.max(stage.height - padding * 2, 240)
```

如果 `padding = 120`，代表：

* 左右各保留 `120`
* 上下各保留 `120`

所以真正可用的區域是：

```ts
usableWidth = stage.width - 240
usableHeight = stage.height - 240
```

但程式沒有直接這樣寫死，而是又加了一層下限：

* 寬至少 `320`
* 高至少 `240`

所以完整意思是：

> 可用區域通常是「stage 扣掉 padding 後的範圍」，但如果扣完太小，就至少保留一個最低可用尺寸。

---

## 第三步：分別計算寬度限制倍率與高度限制倍率

```ts
usableWidth / slide.width
usableHeight / slide.height
```

這兩個值的意思分別是：

### 寬度倍率

```ts
usableWidth / slide.width
```

表示：

> 如果只考慮寬度，slide 最多能放大或縮小到多少倍，才不會超出可用寬度。

---

### 高度倍率

```ts
usableHeight / slide.height
```

表示：

> 如果只考慮高度，slide 最多能放大或縮小到多少倍，才不會超出可用高度。

---

## 第四步：取兩者中較小的那個

```ts
return Math.min(usableWidth / slide.width, usableHeight / slide.height)
```

這是整個 `fit` 計算最關鍵的一步。

因為 slide 要「完整放進去」，代表：

* 寬度不能超出
* 高度也不能超出

所以最後能採用的倍率，必須同時滿足兩個條件。
能同時滿足兩邊限制的做法，就是取**較小值**。

---

# 5. 為什麼一定要取 `Math.min()`？

因為較大的那個倍率，會讓其中一個方向溢出。

例如：

* `usableWidth = 1360`
* `usableHeight = 660`
* `slide.width = 1000`
* `slide.height = 800`

則：

```ts
usableWidth / slide.width = 1.36
usableHeight / slide.height = 0.825
```

意思是：

* 如果用 `1.36` 倍，寬度剛好塞滿
* 但高度會變成 `800 * 1.36 = 1088`
* `1088 > 660`，高度就溢出了

所以不能選 `1.36`，只能選 `0.825`。

也就是說：

> **Fit 的本質不是取「能放最大的倍率」，而是取「仍然能完整放進去的最大安全倍率」。**

---

# 6. `clamp()` 在這裡扮演什麼角色？

```ts
const fitZoom = computed(() => {
  return clamp(calculateFitZoom(stageSize, slide.value, 120), MIN_ZOOM, MAX_ZOOM)
})
```

`calculateFitZoom()` 算出來的是理論值。
但系統不一定允許任意倍率直接使用，所以還要再經過：

```ts
clamp(value, MIN_ZOOM, MAX_ZOOM)
```

`clamp()` 的意思是：

* 如果 `value < MIN_ZOOM`，就回傳 `MIN_ZOOM`
* 如果 `value > MAX_ZOOM`，就回傳 `MAX_ZOOM`
* 否則回傳原值

等價於：

```ts
Math.min(Math.max(value, min), max)
```

所以 `fitZoom` 的正確理解應該是：

> **理論 fit 倍率，經過系統允許範圍限制後的最終縮放值。**

---

# 7. 一個很重要的觀念區分

很多人會把這兩句混在一起：

* 「把整張 slide 放進畫面」
* 「最終套用的 zoom 值」

但實際上它們不完全相同。

## `calculateFitZoom()` 保證的是：

> 從數學上算出一個「理論上能 fit」的倍率。

## `fitZoom` 保證的是：

> 在系統允許的縮放範圍內，取一個最接近 fit 的實際值。

因此：

* 如果理論值本來就在 `[MIN_ZOOM, MAX_ZOOM]` 之間，`fitZoom` 就等於理論 fit 值
* 如果理論值超出範圍，`fitZoom` 就會被截斷，這時它**不一定還能完全 fit**

這一點是整段邏輯中最容易被忽略的地方。

---

# 8. 實際例子

假設：

* `stage = 1600 x 900`
* `padding = 120`
* `slide = 1000 x 562.5`

---

## 先算可用區域

```ts
usableWidth = Math.max(1600 - 120 * 2, 320) = 1360
usableHeight = Math.max(900 - 120 * 2, 240) = 660
```

---

## 再算兩個方向的倍率

```ts
widthRatio = 1360 / 1000 = 1.36
heightRatio = 660 / 562.5 = 1.1733...
```

---

## 取較小值作為理論 fit 倍率

```ts
calculateFitZoom(...) = Math.min(1.36, 1.1733...) = 1.1733...
```

這表示：

> 如果要讓整張 slide 完整放進可用區域，理論上最多只能使用約 `1.1733` 倍。

---

## 最後再經過 clamp

假設：

```ts
MIN_ZOOM = 0.4
MAX_ZOOM = 2.4
```

那麼：

```ts
fitZoom = clamp(1.1733..., 0.4, 2.4) = 1.1733...
```

因為它本來就在合法範圍內，所以最終值不變。

---

# 9. 一句話總結

## `calculateFitZoom()` 的本質

> **先扣掉 padding 算出可用空間，再分別求出寬高可接受的最大倍率，最後取較小值，得到理論上的 fit 倍率。**

## `fitZoom` 的本質

> **把理論 fit 倍率再限制在 `MIN_ZOOM ~ MAX_ZOOM` 之間，得到最終可套用的縮放值。**

---

# 10. 最精簡版本（適合回頭複習）

如果之後忘記細節，只要記住這段：

> `calculateFitZoom()` 不是直接算「放多大看起來舒服」，
> 而是算「在扣掉 padding 之後，slide 最多能放到多少，才不會超出可用區域」。
>
> 做法是：
>
> 1. 先算可用寬高
> 2. 再算寬度倍率與高度倍率
> 3. 最後取較小值，確保整張 slide 都放得下
> 4. 再用 `clamp()` 限制成系統真正允許的縮放值

---
