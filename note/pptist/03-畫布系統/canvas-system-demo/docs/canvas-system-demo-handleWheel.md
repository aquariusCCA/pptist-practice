# `canvas-system-demo` 中 `handleWheel()` 的放大與縮小設計

這篇筆記在說 `src/components/WorkspaceStage.vue` 裡的 `handleWheel()` 到底在做什麼。

它不是單純把 `zoom` 放大或縮小，而是把「滑鼠滾輪」翻譯成一個完整的視角操作：

- 依滾輪方向決定要放大還是縮小
- 把 `zoom` 限制在安全範圍
- 以滑鼠所在位置當作縮放錨點
- 同步修正 `pan`，避免畫面跳動

相關檔案：

- [`src/components/WorkspaceStage.vue`](../src/components/WorkspaceStage.vue)
- [`src/utils/workspaceMath.ts`](../src/utils/workspaceMath.ts)
- [`src/App.vue`](../src/App.vue)

## 這個方法的目的

如果只改 `zoom`，畫面通常會往某個方向「滑走」。

例如：

- 你把游標指在畫布中間某個元素上
- 滾輪往上放大
- 如果沒有補 `pan`，那個元素不會維持在游標下方

所以 `handleWheel()` 的設計目標是：

1. 讓滾輪縮放有明確的倍率規則
2. 讓縮放以滑鼠位置為中心
3. 讓使用者感覺是在操作鏡頭，而不是操作 DOM 縮放

## 核心流程

`handleWheel()` 的流程可以拆成 5 步：

1. 檢查 `stageRef` 是否存在
2. 根據 `event.deltaY` 算出倍率 `delta`
3. 用 `clamp()` 限制下一個 `zoom`
4. 算出滑鼠在 stage 內的錨點 `anchor`
5. 用 `zoomAroundPoint()` 同時算出新的 `pan`

對應程式：

```ts
function handleWheel(event: WheelEvent) {
  if (!stageRef.value) {
    return
  }

  const delta = event.deltaY < 0 ? 1.08 : 0.92
  const nextZoom = clamp(props.zoom * delta, 0.4, 2.4)

  const stageRect = stageRef.value.getBoundingClientRect()
  const anchor = {
    x: event.clientX - stageRect.left,
    y: event.clientY - stageRect.top,
  }

  const nextPan = zoomAroundPoint(
    { x: props.panX, y: props.panY },
    props.zoom,
    nextZoom,
    anchor,
    {
      width: stageRect.width,
      height: stageRect.height,
    },
  )

  emit('update:pan', nextPan)
  emit('update:zoom', nextZoom)
}
```

## 第一步：依滾輪方向決定倍率

```ts
const delta = event.deltaY < 0 ? 1.08 : 0.92
```

這裡的意思是：

- `event.deltaY < 0`，通常代表往上滾，做放大
- `event.deltaY > 0`，通常代表往下滾，做縮小

因此：

- 放大時乘 `1.08`
- 縮小時乘 `0.92`

這兩個值都很接近 `1`，代表每次只調整一小步。
這種設計比較像編輯器的「細步進縮放」，而不是一次跳很多。

### 為什麼不是更大的數字

如果倍率太大：

- 一次滾輪就會跨很多層級
- 使用者不容易精準停在想要的倍率
- 縮放體感會比較粗

所以這裡偏向「小步、可控」。

### 這組數字的特性

`1.08` 和 `0.92` 不是互為反比。

也就是說：

- `1.08 * 0.92 != 1`
- 放大一次再縮小一次，不會完全回到原倍率

這代表它比較像是手感調參，而不是嚴格數學對稱。

## 第二步：限制 zoom 範圍

```ts
const nextZoom = clamp(props.zoom * delta, 0.4, 2.4)
```

這一步是在避免縮放失控。

如果沒有上限和下限：

- 你可能縮到幾乎看不見
- 或者放大到畫面很難操作

`clamp()` 的作用就是把結果限制在安全區間內：

- 最小 `0.4`
- 最大 `2.4`

這裡的限制跟 `App.vue` 的全局 zoom 範圍一致。

## 第三步：找出縮放錨點

```ts
const stageRect = stageRef.value.getBoundingClientRect()
const anchor = {
  x: event.clientX - stageRect.left,
  y: event.clientY - stageRect.top,
}
```

`event.clientX / clientY` 是螢幕座標。

但 `handleWheel()` 需要的是「滑鼠在 stage 裡的相對位置」，所以要扣掉 stage 左上角座標。

算出來的 `anchor` 就是：

- 這次縮放要盡量維持不動的位置
- 也是 `zoomAroundPoint()` 的基準點

如果沒有這一步，縮放通常會以畫面中心為中心，操作感會比較像傳統縮放，不像編輯器。

## 第四步：修正 pan

```ts
const nextPan = zoomAroundPoint(
  { x: props.panX, y: props.panY },
  props.zoom,
  nextZoom,
  anchor,
  {
    width: stageRect.width,
    height: stageRect.height,
  },
)
```

這是 `handleWheel()` 最重要的部分。

它的意思不是「算出新 zoom 就好」，而是要一起算：

- 新的 `zoom`
- 新的 `pan`

因為畫面縮放後，如果不補償 `pan`，滑鼠下方的內容就會偏移。

`zoomAroundPoint()` 做的事可以理解成：

1. 看目前 `zoom` 和下一個 `zoom` 的比例
2. 依照游標位置和 stage 中心的距離
3. 反推 pan 應該要偏移多少

結果就是：

- 你把滑鼠指在哪裡
- 那附近的內容就會盡量維持在原位

## 第五步：把結果交回 App

```ts
emit('update:pan', nextPan)
emit('update:zoom', nextZoom)
```

`WorkspaceStage.vue` 不直接改自己的狀態。

它只是把結果往上通知 `App.vue`，由 `App.vue` 統一持有：

- `zoom`
- `pan`
- stage size
- selection
- pointer

這樣做的好處是：

- 狀態來源單一
- 元件之間比較好協調
- 後續要加 `fit view`、`reset pan`、`debug panel` 都比較乾淨

## 跟 `zoomBy()` 的關係

`handleWheel()` 和 `zoomBy()` 都是在改 zoom，但用途不同。

### `zoomBy()`

`zoomBy()` 是按鈕縮放：

- 放大：`* 1.12`
- 縮小：`* (1 / 1.12)`

它的重點是固定步進和對稱性。

### `handleWheel()`

`handleWheel()` 是滾輪縮放：

- 放大：`* 1.08`
- 縮小：`* 0.92`

它的重點是操作手感，以及配合錨點修正 `pan`。

兩者都在控制視角，但不是同一個互動模式。

## 這個設計的結果

這種做法最後會得到一個很像編輯器的體驗：

- 滾輪是局部縮放，不是整頁跳動
- 滑鼠指到哪裡，哪裡就盡量維持在視野中
- 畫布內容本身不變，改變的是觀看位置與倍率

換句話說，`handleWheel()` 做的其實是「鏡頭操作」，不是「內容變形」。

## 如果要改成和 `zoomBy()` 一樣

如果想讓滾輪縮放和按鈕縮放完全一致，可以把倍率改成：

```ts
const ZOOM_STEP = 1.12
const delta = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
```

這樣就會變成：

- 向上滾：`* 1.12`
- 向下滾：`* (1 / 1.12)`

不過這樣改之後，體感會比原本稍微更「硬」一點，因為單次縮放幅度更大。

## 如果拿掉 `pan` 補償會怎樣

如果你想直接體驗「沒有補 `pan`」的效果，可以把 `handleWheel()` 裡這段整個拿掉：

```ts
const stageRect = stageRef.value.getBoundingClientRect()
const anchor = {
  x: event.clientX - stageRect.left,
  y: event.clientY - stageRect.top,
}

const nextPan = zoomAroundPoint(
  { x: props.panX, y: props.panY },
  props.zoom,
  nextZoom,
  anchor,
  {
    width: stageRect.width,
    height: stageRect.height,
  },
)

emit('update:pan', nextPan)
```

只保留：

```ts
emit('update:zoom', nextZoom)
```

這樣會看到的效果是：

- 畫面還是會縮放
- 但縮放不再以滑鼠位置為中心
- 視覺上比較像「整張畫布直接向中心放大或縮小」
- 游標下方的內容不會被補回來，會更容易感覺到畫面在跳

## 小結

`handleWheel()` 的設計重點不是「滾輪加減 zoom」，而是：

- 用小步進倍率控制縮放速度
- 用 `clamp()` 防止 zoom 失控
- 用滑鼠位置當錨點
- 用 `zoomAroundPoint()` 修正 `pan`
- 把結果交回 `App.vue` 統一管理

所以它是一個完整的視角縮放流程，而不是單一數值計算。
