# PPTist 畫布系統入門

所屬章節：[03-畫布系統](./README.md)

## 本節導讀

這篇不是逐行解釋 `Canvas` 元件，而是先幫你建立一個能讀懂 `PPTist` 的畫布模型。  
重點是看懂三件事：`PPTist` 怎麼定義畫布尺寸、怎麼把畫布放進實際畫面、以及怎麼把滑鼠操作換回邏輯座標。  
先有這個骨架，再去看拖曳、縮放、旋轉、縮圖，會容易很多。

## 關鍵字

- 主題：畫布系統、邏輯座標、可視區域、縮放渲染
- 英文：canvas system, logical coordinate system, viewport, scale
- 常見搜尋：`viewportSize`、`viewportRatio`、`canvasScale`、`useViewportSize`
- 易混淆：邏輯尺寸 vs 實際顯示尺寸、`canvasPercentage` vs `canvasScale`

## 建議回查情境

- 當你想知道為什麼元素資料都用固定 `left/top/width/height` 時
- 當你想知道滑鼠點擊為什麼常常要除以 `canvasScale` 時
- 當你想理解縮圖、播放頁和主畫布為什麼可以共用同一套資料時

## 30 秒複習入口

- `PPTist` 不是直接拿 DOM 實際尺寸當畫布座標，而是先定義一個固定的邏輯畫布。
- 預設邏輯寬度是 `1000`，高度是 `1000 * 0.5625 = 562.5`。
- 實際畫面只是在外層決定顯示多大，內層內容再用 `scale()` 放大或縮小。
- 滑鼠與拖曳的位移要回到邏輯世界時，核心公式就是：`邏輯位移 = 螢幕位移 / canvasScale`。

## 一張圖先看懂

```text
slides store
  ├─ viewportSize = 1000
  ├─ viewportRatio = 0.5625
  └─ elements: left / top / width / height ...

Canvas
  ├─ viewport-wrapper  決定「實際顯示多大、放在哪」
  └─ viewport          保持「邏輯尺寸 1000 x 562.5」，再做 scale(canvasScale)
       └─ elements     一律用邏輯座標渲染
```

## 1. 畫布系統真正要解的問題

如果直接把元素位置綁死在真實 DOM 像素上，畫布一縮放，很多事情都會開始變麻煩：

- 不同螢幕尺寸下的版面不一致
- 滑鼠拖曳位移要重算
- 縮圖、主畫布、播放頁各自要維護不同座標
- 匯出時很難保證構圖一致

`PPTist` 的做法是先建立一個固定的「邏輯世界」，然後讓真實畫面只是那個世界的投影。

對應程式位置：

- [slides.ts](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/store/slides.ts:1)
- [Canvas.md](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/doc/Canvas.md:1)

## 2. 邏輯畫布的來源：`viewportSize` 與 `viewportRatio`

在 [slides.ts](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/store/slides.ts:54) 裡，預設值是：

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

這代表一個元素只要寫：

```ts
{ left: 100, top: 50, width: 200, height: 80 }
```

它永遠是在 `1000 x 562.5` 這個世界裡成立，不會因為畫面目前顯示成 800px 寬或 1400px 寬就改變定義。

延伸閱讀：

- [ppt-畫布的邏輯座標](./ppt-畫布的邏輯座標.md)

## 3. 實際畫面怎麼決定大小：`viewport-wrapper`

真正顯示在畫面上的尺寸，不是直接改 `viewportSize`，而是由 `Canvas` 外層決定。

在 [Canvas/index.vue](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/views/Editor/Canvas/index.vue:18) 裡：

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

`viewportStyles.width` 本身還是邏輯寬度 `1000`，真正變成螢幕尺寸的是乘上 `canvasScale` 之後。

## 4. 內容怎麼被放大或縮小：`viewport`

同一個檔案裡，真正裝元素的內層是 [viewport](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/views/Editor/Canvas/index.vue:62)：

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

`canvasScale` 存在 [main.ts](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/store/main.ts:40) 的全域 store 裡，它不是固定值，而是由 [useViewportSize.ts](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/views/Editor/Canvas/hooks/useViewportSize.ts:1) 根據容器大小即時計算。

它的核心邏輯是：

1. 先看外層 `canvas` 容器目前有多大
2. 再看目前是寬度受限，還是高度受限
3. 用 `canvasPercentage` 決定這張投影片要占容器的幾成
4. 最後算出 `canvasScale`

寬度受限時，核心公式是：

```ts
canvasScale = viewportActualWidth / viewportSize
```

高度受限時，核心公式是：

```ts
canvasScale = viewportActualHeight / (viewportSize * viewportRatio)
```

這就是為什麼 `PPTist` 可以在不同大小的編輯區內，仍然維持同一張投影片比例。

## 6. 元素怎麼渲染：全部都站在邏輯世界裡

元素元件本身幾乎都直接用資料上的 `left/top/width/height`。

例如文字元素 [TextElement/index.vue](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/views/components/element/TextElement/index.vue:4)：

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

在 [Canvas/index.vue](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/views/Editor/Canvas/index.vue:221) 裡，雙擊空白新增文字：

```ts
const left = (e.pageX - viewportRect.x) / canvasScale.value
const top = (e.pageY - viewportRect.y) / canvasScale.value
```

在 [useMouseSelection.ts](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/views/Editor/Canvas/hooks/useMouseSelection.ts:24) 裡，滑鼠框選也一樣：

```ts
const left = (startPageX - viewportRect.x) / canvasScale.value
const top = (startPageY - viewportRect.y) / canvasScale.value
const offsetWidth = (currentPageX - startPageX) / canvasScale.value
const offsetHeight = (currentPageY - startPageY) / canvasScale.value
```

在 [useRotateElement.ts](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/views/Editor/Canvas/hooks/useRotateElement.ts:45) 裡，旋轉也先把滑鼠點換回邏輯座標：

```ts
const mouseX = (currentPageX - viewportRect.left) / canvasScale.value
const mouseY = (currentPageY - viewportRect.top) / canvasScale.value
```

核心公式其實只有一句：

```ts
邏輯座標 = 螢幕座標差值 / canvasScale
```

## 8. 為什麼縮圖可以沿用同一套模型

縮圖元件 [ThumbnailSlide/index.vue](/C:/Users/wtlc/Documents/pptist-practice/PPTist-SourceCode/src/views/components/ThumbnailSlide/index.vue:1) 跟主畫布是同一個想法：

- 外層 `.thumbnail-slide` 決定縮圖實際大小
- 內層 `.elements` 維持 `viewportSize x viewportSize * viewportRatio`
- 再用 `transform: scale(scale)` 縮小

所以縮圖不是另一套資料結構，只是另一個顯示比例。

這一點很重要，因為它證明 `PPTist` 的畫布設計不是只服務主編輯區，而是整個投影片系統的共通基礎。

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

## 速查區

### 核心定義

- `viewportSize`：邏輯畫布寬度
- `viewportRatio`：邏輯畫布高寬比
- `canvasScale`：邏輯畫布映射到實際畫面的縮放倍率
- `canvasPercentage`：可視區域占外層容器的比例

### 關鍵規則

- 元素資料一律使用邏輯座標
- 顯示縮放交給外層 `scale()`
- 事件座標回寫資料前，要先除以 `canvasScale`

### 一句話對比

- `viewportSize` 是畫布「定義多大」
- `canvasScale` 是畫布「現在顯示多大」

## 下一步建議

讀完這篇後，建議接著看：

1. [ppt-畫布的邏輯座標](./ppt-畫布的邏輯座標.md)
2. [縮圖元件設計筆記](../04-縮圖系統/縮圖元件設計筆記.md)

