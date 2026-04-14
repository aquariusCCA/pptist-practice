# PPTist 畫布系統實作對照篇（viewport-wrapper、viewport、canvasScale）

所屬章節：[03-畫布系統](./README.md)

## 這篇在做什麼

這篇不再重講整套概念，而是把前一篇的模型，直接對照到 `PPTist` 的實作位置。

如果你還沒熟悉以下三件事，建議先回去看概念篇：

- 固定邏輯畫布
- `wrapper + viewport` 兩層分工
- 滑鼠座標要換回邏輯座標

先備閱讀：

- [畫布系統概念篇（固定座標、縮放與滑鼠換算）](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)

## 快速定位

- 想看邏輯畫布從哪裡定義：看 [2. 邏輯畫布的來源：`viewportSize` 與 `viewportRatio`](#2-邏輯畫布的來源viewportsize-與-viewportratio)
- 想看外層顯示區怎麼決定大小：看 [3. 實際畫面怎麼決定大小：`viewport-wrapper`](#3-實際畫面怎麼決定大小viewport-wrapper)
- 想看內層畫布怎麼縮放：看 [4. 內容怎麼被放大或縮小：`viewport`](#4-內容怎麼被放大或縮小viewport)
- 想看 `canvasScale` 怎麼算：看 [5. `canvasScale` 怎麼算出來](#5-canvasscale-怎麼算出來)
- 想看滑鼠為什麼一直除以 `canvasScale`：看 [7. 滑鼠操作為什麼一直要除以 `canvasScale`](#7-滑鼠操作為什麼一直要除以-canvasscale)

## 1. 畫布系統真正要解的問題

如果直接把元素位置綁死在真實 DOM 像素上，畫布一縮放，很多事情都會變麻煩：

- 不同螢幕尺寸下的版面不一致
- 滑鼠拖曳位移要重算
- 縮圖、主畫布、播放頁各自要維護不同座標
- 匯出時很難保證構圖一致

`PPTist` 的做法是先建立一個固定的「邏輯世界」，然後讓真實畫面只是那個世界的投影。

對應程式位置：

- [slides.ts](../../../PPTist-SourceCode/src/store/slides.ts)
- [Canvas.md](../../../PPTist-SourceCode/doc/Canvas.md)

## 2. 邏輯畫布的來源：`viewportSize` 與 `viewportRatio`

在 [slides.ts](../../../PPTist-SourceCode/src/store/slides.ts) 第 54 行附近，預設值是：

```ts
viewportSize: 1000
viewportRatio: 0.5625
```

它們的意思不是「目前 DOM 的寬高」，而是：

- `viewportSize`：邏輯畫布寬度基準
- `viewportRatio`：邏輯畫布的高寬比

所以預設邏輯畫布大小是：

```ts
width = 1000
height = 1000 * 0.5625 = 562.5
```

固定換算公式可以整理成：

```ts
width = viewportSize
height = viewportSize * viewportRatio

viewportRatio = height / width
height = width * viewportRatio
width = height / viewportRatio
```

這代表元素資料永遠活在 `1000 x 562.5` 這個邏輯世界裡，不會因為畫面顯示尺寸改變就改掉定義。

## 3. 實際畫面怎麼決定大小：`viewport-wrapper`

真正顯示在畫面上的尺寸，不是直接改 `viewportSize`，而是由 `Canvas` 外層決定。

在 [Canvas/index.vue](../../../PPTist-SourceCode/src/views/Editor/Canvas/index.vue) 第 18 行附近：

```vue
<div
  class="viewport-wrapper"
  :style="{
    width: viewportStyles.width * canvasScale + 'px',
    height: viewportStyles.height * canvasScale + 'px',
    left: viewportStyles.left + 'px',
    top: viewportStyles.top + 'px',
  }"
>
```

這一層做兩件事：

- 決定可視區域實際顯示多大
- 決定可視區域在編輯器中央放在哪裡

所以：

- `viewportStyles.width` 本身仍然是邏輯寬度 `1000`
- 乘上 `canvasScale` 之後，才變成實際顯示寬度

## 4. 內容怎麼被放大或縮小：`viewport`

同一個檔案裡，真正裝元素的內層是 [viewport](../../../PPTist-SourceCode/src/views/Editor/Canvas/index.vue) 第 62 行附近：

```vue
<div
  class="viewport"
  ref="viewportRef"
  :style="{ transform: `scale(${canvasScale})` }"
>
```

這就是整個畫布系統最重要的設計：

- 內層仍然活在固定的邏輯尺寸中
- 真實縮放交給 `transform: scale(...)`

也就是說，元素自己不用知道現在畫面是放大還縮小，它只要照邏輯座標渲染就好。

## 5. `canvasScale` 怎麼算出來

`canvasScale` 存在 [main.ts](../../../PPTist-SourceCode/src/store/main.ts) 第 53 行附近的全域 store 裡，它不是固定值，而是由 [useViewportSize.ts](../../../PPTist-SourceCode/src/views/Editor/Canvas/hooks/useViewportSize.ts) 根據容器大小即時計算。

它的核心邏輯是：

1. 先看外層 `canvas` 容器目前有多大
2. 再看這次應該以寬度為基準，還是以高度為基準來算縮放
3. 用 `canvasPercentage` 決定這張投影片要占容器的幾成
4. 最後算出 `canvasScale`

這裡不要把 `viewportSize = 1000` 理解成顯示上限。  
`1000` 只是邏輯畫布的基準寬度，真正要判斷的是：

- 如果先用容器寬度來算，投影片高度仍然放得進容器，就以寬度為基準計算
- 如果先用容器寬度來算，投影片高度放不進容器，就改以高度為基準計算

以寬度為基準時計算：

```ts
canvasScale = viewportActualWidth / viewportSize
```

以高度為基準時計算：

```ts
canvasScale = viewportActualHeight / (viewportSize * viewportRatio)
```

對照 [useViewportSize.ts](../../../PPTist-SourceCode/src/views/Editor/Canvas/hooks/useViewportSize.ts)：

```ts
if (canvasHeight / canvasWidth > viewportRatio.value) {
  const viewportActualWidth = canvasWidth * (canvasPercentage.value / 100)
  mainStore.setCanvasScale(viewportActualWidth / viewportSize.value)
}
else {
  const viewportActualHeight = canvasHeight * (canvasPercentage.value / 100)
  mainStore.setCanvasScale(viewportActualHeight / (viewportSize.value * viewportRatio.value))
}
```

## 6. 元素怎麼渲染：全部都站在邏輯世界裡

元素元件本身幾乎都直接用資料上的 `left/top/width/height`。

例如文字元素 [TextElement/index.vue](../../../PPTist-SourceCode/src/views/components/element/TextElement/index.vue) 第 4 行附近：

```vue
:style="{
  top: elementInfo.top + 'px',
  left: elementInfo.left + 'px',
  width: elementInfo.width + 'px',
  height: elementInfo.height + 'px',
}"
```

注意這裡沒有自己乘 `canvasScale`。  
原因不是它忘了乘，而是外層 `viewport` 已經整體縮放了。

這種設計的好處是：

- 元素元件簡單
- 資料模型穩定
- 縮圖、主畫布、播放頁可以共用同一份元素資料

## 7. 滑鼠操作為什麼一直要除以 `canvasScale`

畫面上的滑鼠事件是「螢幕座標」，但元素資料要寫回「邏輯座標」，所以中間一定要做轉換。

在 [Canvas/index.vue](../../../PPTist-SourceCode/src/views/Editor/Canvas/index.vue) 第 221 行附近，雙擊空白新增文字：

```ts
const left = (e.pageX - viewportRect.x) / canvasScale.value
const top = (e.pageY - viewportRect.y) / canvasScale.value
```

在 [useMouseSelection.ts](../../../PPTist-SourceCode/src/views/Editor/Canvas/hooks/useMouseSelection.ts) 第 24 行附近，滑鼠框選也一樣：

```ts
const left = (startPageX - viewportRect.x) / canvasScale.value
const top = (startPageY - viewportRect.y) / canvasScale.value
const offsetWidth = (currentPageX - startPageX) / canvasScale.value
const offsetHeight = (currentPageY - startPageY) / canvasScale.value
```

在 [useRotateElement.ts](../../../PPTist-SourceCode/src/views/Editor/Canvas/hooks/useRotateElement.ts) 第 54 行附近，旋轉也先把滑鼠點換回邏輯座標：

```ts
const mouseX = (currentPageX - viewportRect.left) / canvasScale.value
const mouseY = (currentPageY - viewportRect.top) / canvasScale.value
```

核心公式其實只有一句：

```ts
邏輯座標 = 螢幕座標差值 / canvasScale
```

## 8. 為什麼縮圖可以沿用同一套模型

縮圖元件 [ThumbnailSlide/index.vue](../../../PPTist-SourceCode/src/views/components/ThumbnailSlide/index.vue) 跟主畫布是同一個想法：

- 外層 `.thumbnail-slide` 決定縮圖實際大小
- 內層 `.elements` 維持 `viewportSize x viewportSize * viewportRatio`
- 再用 `transform: scale(scale)` 縮小

所以縮圖不是另一套資料結構，只是另一個顯示比例。

## 9. 你現在應該怎麼理解 `PPTist` 畫布

先把它想成兩層：

### 外層：顯示層

- 可視區域有多大
- 投影片在容器中放哪裡
- 目前縮放倍率是多少

### 內層：邏輯層

- 元素資料的真正座標
- 元素之間的對齊、框選、旋轉、縮放計算
- 匯出、縮圖、播放頁可共用的幾何基礎

只要你把這兩層分開，後面讀 `PPTist` 的拖曳、縮放、縮圖、播放，就不會混在一起。

## 常見回查問題

- `viewportSize` 在哪裡定義：看 [slides.ts](../../../PPTist-SourceCode/src/store/slides.ts)
- `canvasScale` 在哪裡計算：看 [useViewportSize.ts](../../../PPTist-SourceCode/src/views/Editor/Canvas/hooks/useViewportSize.ts)
- 內層畫布在哪裡做 `scale()`：看 [Canvas/index.vue](../../../PPTist-SourceCode/src/views/Editor/Canvas/index.vue)
- 哪些互動會一直除以 `canvasScale`：看 [Canvas/index.vue](../../../PPTist-SourceCode/src/views/Editor/Canvas/index.vue)、[useMouseSelection.ts](../../../PPTist-SourceCode/src/views/Editor/Canvas/hooks/useMouseSelection.ts)、[useRotateElement.ts](../../../PPTist-SourceCode/src/views/Editor/Canvas/hooks/useRotateElement.ts)

## 一句話抓核心

`PPTist` 的畫布系統不是把元素直接綁在螢幕像素上，而是先維持固定邏輯畫布，再把它映射到目前容器中。

## 下一步建議

1. 如果概念還不穩，回去看 [畫布系統概念篇（固定座標、縮放與滑鼠換算）](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)
2. 接著看 [縮圖元件設計筆記](../04-縮圖系統/縮圖元件設計筆記.md)
