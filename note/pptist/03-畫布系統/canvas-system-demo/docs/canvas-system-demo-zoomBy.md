# `canvas-system-demo` 的 `zoomBy()` 計算方式

這份文件對應到：

- [`note/pptist/03-畫布系統/canvas-system-demo/src/App.vue`](../note/pptist/03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/canvas-system-demo/src/App.vue)

## 核心公式

`zoomBy()` 的核心寫法是：

```ts
const nextZoom = clamp(
  zoom.value * (direction > 0 ? ZOOM_STEP : 1 / ZOOM_STEP),
  MIN_ZOOM,
  MAX_ZOOM,
)
```

在這個 demo 裡：

- `ZOOM_STEP = 1.12`
- `MIN_ZOOM = 0.4`
- `MAX_ZOOM = 2.4`

所以：

- `zoomBy(1)` = 目前倍率 `* 1.12`
- `zoomBy(-1)` = 目前倍率 `* (1 / 1.12)`

## 為什麼用乘法

`zoom` 表示的是「倍率」，不是「位移量」。

所以縮放要用「乘上某個比例」來更新，而不是每次加減固定數字。

例如：

- `0.9 * 1.12 = 1.008`
- `1.008 * (1 / 1.12) = 0.9`

這樣放大一次再縮小一次，可以回到原值附近。

## 為什麼縮小要用 `1 / ZOOM_STEP`

這樣做是為了讓放大和縮小互為反操作。

如果放大用 `* 1.12`，那縮小就應該用 `* (1 / 1.12)`，而不是隨便再乘一個固定小於 `1` 的值。

好處是：

- 放大和縮小是對稱的
- 來回操作時不容易累積誤差
- 比較符合「倍率」的直覺

## `clamp` 的作用

算完之後會再包一層 `clamp()`：

```ts
clamp(nextZoom, 0.4, 2.4)
```

目的很直接：

- 不讓畫布縮得太小，導致幾乎看不到
- 不讓畫布放得太大，超出 demo 預期範圍

## 實際數字範例

以下用 `App.vue` 的預設值 `zoom = 0.9` 來算。

### 一次 `zoomBy(1)`

```ts
0.9 * 1.12 = 1.008
```

結果：

- `zoom = 1.008`

### 接著一次 `zoomBy(-1)`

```ts
1.008 * (1 / 1.12) = 0.9
```

結果：

- `zoom = 0.9`

### 連續 5 次 zoom in，再連續 5 次 zoom out

| 步驟 | 動作 | 結果 |
|---|---|---:|
| 0 | 起始 | 0.9000 |
| 1 | zoom in | 1.0080 |
| 2 | zoom in | 1.1290 |
| 3 | zoom in | 1.2644 |
| 4 | zoom in | 1.4152 |
| 5 | zoom in | 1.5850 |
| 6 | zoom out | 1.4152 |
| 7 | zoom out | 1.2644 |
| 8 | zoom out | 1.1290 |
| 9 | zoom out | 1.0080 |
| 10 | zoom out | 0.9000 |

## 這個函式不做什麼

`zoomBy()` 只負責更新倍率，不負責：

- 以滑鼠位置為中心縮放
- 更新 pan
- 計算游標錨點

那些邏輯是在 [`WorkspaceStage.vue`](../note/pptist/03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/canvas-system-demo/src/components/WorkspaceStage.vue) 的 `handleWheel()` 和 `zoomAroundPoint()` 做的。

## 一句話總結

`zoomBy()` 做的是：

```ts
新的縮放倍率 = 目前倍率 × 縮放步進
```

其中：

- 放大：`× 1.12`
- 縮小：`× (1 / 1.12)`
- 最後再用 `clamp()` 限制上下限
