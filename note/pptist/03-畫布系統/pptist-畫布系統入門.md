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

## 先用最簡單的方式理解

先不要想元件、hooks 或 store，先只看這條流程：

```text
元素資料
  -> 放進固定大小的虛擬投影片
  -> 再把整張投影片縮放到螢幕上
  -> 使用者點擊螢幕
  -> 程式把點擊位置換回虛擬投影片座標
```

你可以把它想成下面這個模型：

- `PPTist` 心中永遠有一張固定大小的投影片
- 這張投影片預設是 `1000 x 562.5`
- 元素資料永遠記在這張投影片裡
- 螢幕上看到的大或小，只是這張投影片被整體縮放後的結果

### 例子 1：資料怎麼看

如果有一個文字框資料是：

```ts
{ left: 100, top: 50, width: 200, height: 80 }
```

它的意思是：

- 這個文字框在投影片世界裡，距離左上角 `100`
- 距離上方 `50`
- 寬 `200`
- 高 `80`

它不是在說「目前螢幕上剛好就是 200px 寬」。

對照 demo：

- [Demo 01：資料怎麼看](./demos/01-data-view.html)

### 例子 2：畫面怎麼看

如果現在 `canvasScale = 0.5`，那這張投影片會整體縮成一半。

所以你看到的會變成：

- 左邊距離看起來像 `50px`
- 上邊距離看起來像 `25px`
- 寬看起來像 `100px`
- 高看起來像 `40px`

但資料本身完全沒變，還是：

```ts
{ left: 100, top: 50, width: 200, height: 80 }
```

對照 demo：

- [Demo 02：畫面怎麼看](./demos/02-screen-view.html)

### 例子 3：滑鼠為什麼要除以 `canvasScale`

如果你在螢幕上點到距離左上角 `50px` 的地方，而現在 `canvasScale = 0.5`：

```ts
投影片世界的位置 = 50 / 0.5 = 100
```

也就是說：

- 螢幕上看到的 `50`
- 實際對應投影片世界裡的 `100`

這就是 `PPTist` 裡大量出現 `/ canvasScale` 的原因。

對照 demo：

- [Demo 03：滑鼠為什麼要除以 canvasScale](./demos/03-mouse-scale.html)

## 你現在只要先記住這一句

`PPTist` 先用固定座標描述投影片，再把整張投影片縮放到畫面上；所有滑鼠操作最後都要換算回那個固定座標系。

## 最小範例程式碼

下面這組範例不是 `PPTist` 原始碼，只是把畫布系統縮成最小可理解版本。

如果你想先直接操作，再回來看下面的程式碼，可以先打開：

- [Demo 01：資料怎麼看](./demos/01-data-view.html)
- [Demo 02：畫面怎麼看](./demos/02-screen-view.html)
- [Demo 03：滑鼠為什麼要除以 canvasScale](./demos/03-mouse-scale.html)

## 範例 1：先定義固定的邏輯畫布與元素資料

先不要碰 DOM，先只看資料長什麼樣：

```ts
type ElementBox = {
  left: number
  top: number
  width: number
  height: number
  text: string
}

const viewportSize = 1000
const viewportRatio = 9 / 16

const slide = {
  width: viewportSize,
  height: viewportSize * viewportRatio,
  elements: [
    { left: 100, top: 50, width: 220, height: 80, text: '標題' },
    { left: 360, top: 180, width: 260, height: 120, text: '內容區塊' },
  ] satisfies ElementBox[],
}
```

這段資料的重點是：

- 投影片世界固定是 `1000 x 562.5`
- 元素永遠記在這個世界裡
- 不管畫面實際顯示多大，資料都不變

## 範例 2：把邏輯畫布縮放後顯示到畫面

假設你想把邏輯寬度 `1000` 的投影片，顯示成畫面上的 `600px` 寬：

```ts
const logicalWidth = 1000
const actualWidth = 600
const scale = actualWidth / logicalWidth // 0.6
```

對應的最小 HTML：

```html
<div class="frame">
  <div class="viewport" id="viewport">
    <div class="box title">標題</div>
    <div class="box content">內容區塊</div>
  </div>
</div>
```

對應的最小 CSS：

```css
.frame {
  width: 600px;
  height: 337.5px; /* 600 * 9 / 16 */
  position: relative;
  overflow: hidden;
  border: 1px solid #999;
}

.viewport {
  width: 1000px;
  height: 562.5px;
  position: relative;
  transform: scale(0.6);
  transform-origin: 0 0;
}

.box {
  position: absolute;
  border: 1px solid #333;
  background: #f5f5f5;
}

.title {
  left: 100px;
  top: 50px;
  width: 220px;
  height: 80px;
}

.content {
  left: 360px;
  top: 180px;
  width: 260px;
  height: 120px;
}
```

這裡最重要的是：

- `.frame` 是螢幕上的實際顯示大小
- `.viewport` 是固定的邏輯畫布
- 真正縮放的是 `.viewport`
- 元素仍然寫自己的邏輯座標，不用改成 `60px`、`30px`

## 範例 3：用程式產生元素，而不是手寫 CSS

上面的元素位置如果改成根據資料渲染，會更接近真實專案思路：

```ts
const viewport = document.querySelector('#viewport') as HTMLDivElement

slide.elements.forEach(element => {
  const node = document.createElement('div')
  node.className = 'box'
  node.textContent = element.text

  node.style.left = `${element.left}px`
  node.style.top = `${element.top}px`
  node.style.width = `${element.width}px`
  node.style.height = `${element.height}px`

  viewport.appendChild(node)
})
```

這段最重要的觀察是：

- 你直接渲染的是邏輯座標
- 元素自己完全不知道現在畫面是不是縮成 `0.6`
- 變小這件事是外層 `viewport` 幫它做的

## 範例 4：把滑鼠點擊位置換回邏輯座標

現在假設畫面上這張投影片縮成 `0.6` 倍。  
你在螢幕上點到距離左邊 `60px`、距離上方 `30px` 的位置。

要把這個位置換回投影片世界，就要除以縮放比：

```ts
const scale = 0.6

const screenX = 60
const screenY = 30

const worldX = screenX / scale // 100
const worldY = screenY / scale // 50
```

如果要接到 DOM 事件，大致會寫成：

```ts
const frame = document.querySelector('.frame') as HTMLDivElement

frame.addEventListener('click', (event) => {
  const rect = frame.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top

  const worldX = screenX / scale
  const worldY = screenY / scale

  console.log({ worldX, worldY })
})
```

這就是為什麼畫布系統裡一直會出現：

```ts
world = screen / scale
```

## 範例 5：新增元素時，資料應該記哪個座標

假設你點擊畫面上的 `(240, 120)`，而現在縮放比是 `0.6`：

```ts
const scale = 0.6

const newElement = {
  left: 240 / scale,   // 400
  top: 120 / scale,    // 200
  width: 200,
  height: 60,
  text: '新文字框',
}
```

注意新增進資料時，應該存：

```ts
left: 400
top: 200
```

而不是存目前螢幕上的 `240`、`120`。  
因為資料要對應的是投影片世界，不是當下這個縮放過的畫面。

## 一句話總結這組範例

- 資料：永遠使用固定邏輯座標
- 顯示：整張投影片一起縮放
- 互動：先拿到螢幕座標，再換回邏輯座標

如果你先把這組範例看懂，再回頭讀 `PPTist`，會比較容易知道它是在把這件事做大、做完整，而不是在做另一套不同邏輯。

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

1. [縮圖元件設計筆記](../04-縮圖系統/縮圖元件設計筆記.md)
