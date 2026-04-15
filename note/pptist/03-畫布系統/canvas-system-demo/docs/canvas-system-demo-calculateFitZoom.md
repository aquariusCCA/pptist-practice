# `canvas-system-demo` 的 `calculateFitZoom()` 計算邏輯

這份文件說明 `src/utils/workspaceMath.ts` 裡的 `calculateFitZoom()` 是怎麼算出 `Fit` 按鈕要用的縮放倍率。

對應程式：

- [`src/utils/workspaceMath.ts`](../src/utils/workspaceMath.ts)
- [`src/App.vue`](../src/App.vue)
- [`src/components/WorkspaceStage.vue`](../src/components/WorkspaceStage.vue)

## 它在做什麼

`calculateFitZoom()` 的目標很直接：

- 讓整張 slide 完整顯示在 stage 裡
- 保留四周 padding，不要貼邊
- 回傳一個可直接套用的 zoom 倍率

在 `App.vue` 中，`Fit` 按鈕會觸發 `fitView()`，而 `fitView()` 會把 `zoom` 設成這個計算結果，再把 `pan` 歸零。

## 函式原型

```ts
export function calculateFitZoom(stage: StageSize, slide: Slide, padding = 96) {
  if (stage.width <= 0 || stage.height <= 0) {
    return 1
  }

  const usableWidth = Math.max(stage.width - padding * 2, 320)
  const usableHeight = Math.max(stage.height - padding * 2, 240)

  return Math.min(usableWidth / slide.width, usableHeight / slide.height)
}
```

## 參數意義

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

## 計算流程

### 1. 先確認 stage 是否有效

```ts
if (stage.width <= 0 || stage.height <= 0) {
  return 1
}
```

如果 stage 還沒完成量測，或尺寸是 0，就直接回傳 `1`。

這樣做是為了避免：

- 在 DOM 尚未 ready 時算出錯誤倍率
- 發生除以 0
- 產生無意義的 fit 結果

### 2. 扣掉 padding，得到可用區域

```ts
const usableWidth = Math.max(stage.width - padding * 2, 320)
const usableHeight = Math.max(stage.height - padding * 2, 240)
```

這一步是在算真正可以放 slide 的空間。

因為左右各要留 `padding`，所以寬度要減掉 `padding * 2`。高度同理。

另外還加了最低下限：

- 寬度至少 `320`
- 高度至少 `240`

這是為了避免 stage 太小時，usable area 縮得太離譜。

### 3. 分別算寬向和高向的倍率

```ts
usableWidth / slide.width
usableHeight / slide.height
```

這兩個值各自代表：

- 以寬度為準時，slide 最多能縮放到多少倍才塞得進去
- 以高度為準時，slide 最多能縮放到多少倍才塞得進去

例如：

- `usableWidth / slide.width = 1.2`
- `usableHeight / slide.height = 0.85`

代表：

- 寬度放到 `1.2` 倍剛好
- 但高度最多只能放到 `0.85` 倍

### 4. 取較小值

```ts
return Math.min(usableWidth / slide.width, usableHeight / slide.height)
```

這是 `fit` 的關鍵。

如果要保證 slide 完整顯示，寬和高都不能超出，所以必須採用比較保守的那個倍率，也就是兩者中的較小值。

這樣可以保證：

- slide 不會超出 stage 的寬度
- slide 不會超出 stage 的高度
- 整張 slide 都看得到

## 為什麼是 `min`，不是 `max`

如果取 `max`，就會有一個方向溢出。

假設：

- stage 可用寬：`1360`
- stage 可用高：`660`
- slide 寬：`1000`
- slide 高：`800`

那麼：

- 寬倍率 = `1360 / 1000 = 1.36`
- 高倍率 = `660 / 800 = 0.825`

如果選 `1.36`：

- 寬度剛好
- 高度會變成 `800 * 1.36 = 1088`
- 明顯超出 stage

所以必須選 `0.825` 這種較小的倍率。

## 這個函式本身不做縮放上限限制

`calculateFitZoom()` 只負責算「理論上的 fit 倍率」。

真正的限制是在 `App.vue`：

```ts
const fitZoom = computed(() => {
  return clamp(calculateFitZoom(stageSize, slide.value, 120), MIN_ZOOM, MAX_ZOOM)
})
```

也就是說：

1. 先算出 fit 倍率
2. 再限制在 `0.4 ~ 2.4`

因此最終套用到畫面的值，不一定等於純粹的 fit 結果。

## 實際例子

假設：

- stage = `1600 x 900`
- padding = `120`
- slide = `1000 x 562.5`

先算 usable size：

- `usableWidth = max(1600 - 240, 320) = 1360`
- `usableHeight = max(900 - 240, 240) = 660`

再算倍率：

- 寬倍率 = `1360 / 1000 = 1.36`
- 高倍率 = `660 / 562.5 = 1.1733...`

取較小值後：

- `fitZoom = 1.1733...`

意思是這張 slide 最多放到大約 `117.33%`，才能完整顯示並保留 padding。

## 一句話總結

`calculateFitZoom()` 的本質是：

> 先扣掉 padding 找到可用空間，再分別算寬高倍率，最後取較小值，確保整張 slide 一定放得下。

