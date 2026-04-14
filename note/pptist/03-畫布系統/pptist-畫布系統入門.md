# PPTist 畫布系統入門

所屬章節：[03-畫布系統](./README.md)

## 本節導讀

這篇先不急著看 `PPTist` 源碼，而是先把「畫布系統」本身講清楚。  
重點是看懂三件事：畫布怎麼定義固定尺寸、怎麼把畫布放進實際畫面、以及怎麼把滑鼠操作換回邏輯座標。  
先把這個骨架建立起來，後面再去看拖曳、縮放、旋轉、縮圖，會容易很多。

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

- 畫布系統不是直接拿 DOM 實際尺寸當畫布座標，而是先定義一個固定的邏輯畫布。
- 預設邏輯寬度是 `1000`，高度是 `1000 * 0.5625 = 562.5`。
- 實際畫面只是在外層決定顯示多大，內層內容再用 `scale()` 放大或縮小。
- 滑鼠與拖曳的位移要回到邏輯世界時，核心公式就是：`邏輯位移 = 螢幕位移 / canvasScale`。

## 快速定位

- 想先建立整體模型：看 [先用最簡單的方式理解](#先用最簡單的方式理解)
- 想直接看可執行的最小程式：看 [最小範例程式碼](#最小範例程式碼)
- 想釐清為什麼 `scale()` 之後還需要外層容器：看 [為什麼 Demo 02 要同時設定 `screenFrame` 的寬高，最後再對 `screenViewport` 做 `scale()`](#為什麼-demo-02-要同時設定-screenframe-的寬高最後再對-screenviewport-做-scale)
- 想釐清 `.frame` 為什麼能承接 layout：看 [範例 2：把邏輯畫布縮放後顯示到畫面](#範例-2把邏輯畫布縮放後顯示到畫面)
- 想直接對照 `PPTist` 原始碼：看 [下面才回到 `PPTist`](#下面才回到-pptist)
- 想查為什麼滑鼠座標一直要除以 `canvasScale`：看 [7. 滑鼠操作為什麼一直要除以 `canvasScale`](#7-滑鼠操作為什麼一直要除以-canvasscale)
- 想快速複習定義與規則：看 [速查區](#速查區)

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

- 系統心中永遠有一張固定大小的投影片
- 這張投影片預設是 `1000 x 562.5`
- 元素資料永遠記在這張投影片裡
- 螢幕上看到的大或小，只是這張投影片被整體縮放後的結果

### 例子 1：資料怎麼看

如果有一個文字框資料是：

```ts
{ left: 100, top: 50, width: 200, height: 80 }
```

先不要把它看成「現在螢幕上看到的大小」，
而要把它看成「記在投影片世界裡的位置和尺寸」。

它表示的是：

- 這個文字框左上角在投影片世界的 `(100, 50)`
- 它在投影片世界裡的寬是 `200`
- 它在投影片世界裡的高是 `80`

換句話說，這筆資料描述的是「元素在固定邏輯畫布中的位置與大小」，
不是「當下畫面上實際看起來幾 px」。

所以即使畫面之後被縮小或放大，資料本身還是：

```ts
{ left: 100, top: 50, width: 200, height: 80 }
```

變的是畫面怎麼顯示它，不是資料怎麼存它。

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

#### 為什麼 Demo 02 要同時設定 `screenFrame` 的寬高，最後再對 `screenViewport` 做 `scale()`

Demo 02 裡其實有兩層：

- `screenFrame`：外層容器，代表這張投影片目前在螢幕上實際佔多少空間
- `screenViewport`：內層畫布，代表固定邏輯尺寸的投影片本體

其中 `screenViewport` 固定維持邏輯尺寸：

```ts
width = 1000
height = 562.5
```

然後再用：

```ts
screenViewport.style.transform = `scale(${scale})`
```

把整張邏輯投影片縮小或放大。

這裡最容易混淆的地方是：`transform: scale()` 會改變元素「看起來的大小」，但不會改變它在 CSS layout 裡原本的尺寸語意。

也就是說，當 `scale = 0.5` 時：

- 視覺上它會看起來像 `500 x 281.25`
- 但在版面結構上，這個 viewport 仍然是那張邏輯上的 `1000 x 562.5` 投影片

所以外層還要額外設定：

```ts
screenFrame.style.width = `${1000 * scale}px`
screenFrame.style.height = `${562.5 * scale}px`
```

這樣 `screenFrame` 才會真的變成目前螢幕上可見的大小，也就是：

- `scale = 0.5` 時，外框實際佔 `500 x 281.25`
- `overflow: hidden` 的裁切範圍會正確
- 周圍版面會把它當成縮放後的尺寸，而不是原始的 `1000 x 562.5`

可以把這個分工記成：

- `screenViewport` 負責保留固定邏輯座標系
- `transform: scale()` 負責把整張邏輯投影片縮放到螢幕上
- `screenFrame` 負責承接縮放後真正的顯示尺寸

一句話整理：

```text
scale() 改的是「畫面怎麼看起來」，frame 寬高改的是「這個物件在 layout 裡實際佔多少空間」。
```

這也是 PPTist 真正採用的模式：

- 外層 `viewport-wrapper` 先用 `viewportStyles.width * canvasScale`、`viewportStyles.height * canvasScale` 決定實際顯示區大小
- 內層 `viewport` 再用 `transform: scale(canvasScale)` 去縮放那張固定大小的邏輯投影片

所以不是重複縮放，而是把「邏輯畫布」和「實際顯示空間」拆成兩層處理。

下面的 [範例 2：把邏輯畫布縮放後顯示到畫面](#範例-2把邏輯畫布縮放後顯示到畫面)，會把這個概念換成最小 HTML / CSS 版本重做一次；主線完全一樣，只是從 demo 觀察，改成直接看程式結構。

### 例子 3：滑鼠為什麼要除以 `canvasScale`

如果現在 `canvasScale = 0.5`，表示整張投影片在畫面上被縮成一半。

這時候你在螢幕上看到的距離，其實都是「縮小後的距離」。

假設你用滑鼠點到一個位置，量到它距離左上角是 `50px`：

- 這個 `50` 是螢幕上的距離
- 但資料要寫回的是投影片世界裡的距離

因為畫面已經縮成一半，所以投影片世界裡對應的位置其實是：

```ts
投影片世界的位置 = 50 / 0.5 = 100
```

也就是說：

- 螢幕上看到的是 `50`
- 投影片世界裡對應的是 `100`

所以滑鼠事件拿到的是「畫面座標」，
但元素資料需要的是「邏輯座標」。

中間就一定要做這個換算：

```ts
邏輯座標 = 螢幕座標 / canvasScale
```

這樣存回去的資料，才會和前面元素的 `left / top / width / height` 使用同一套座標系。

這就是很多畫布實作裡會大量出現 `/ canvasScale` 的原因。

對照 demo：

- [Demo 03：滑鼠為什麼要除以 canvasScale](./demos/03-mouse-scale.html)

## 你現在只要先記住這一句

先用固定座標描述投影片，再把整張投影片縮放到畫面上；所有滑鼠操作最後都要換算回那個固定座標系。

## 最小範例程式碼

下面這組範例不綁任何特定專案，只是把畫布系統縮成最小可理解版本。

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

這一段其實就是前面「例子 2：畫面怎麼看」的 HTML / CSS 版：

- 外層容器負責承接實際顯示尺寸
- 內層 viewport 保留固定邏輯尺寸
- `transform: scale(...)` 只負責把邏輯畫布縮放到畫面上

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

這裡最重要的是，分工和前面的「例子 2」完全一致：

- `.frame` 是螢幕上的實際顯示大小
- `.viewport` 是固定的邏輯畫布
- 真正縮放的是 `.viewport`
- 元素仍然寫自己的邏輯座標，不用改成 `60px`、`30px`

這裡也要特別分清楚一件事：

`transform: scale(0.6)` 會讓 `.viewport` 視覺上看起來像是從 `1000 x 562.5` 縮成 `600 x 337.5`，但它不會把 `.viewport` 在 layout 裡的尺寸直接改寫成 `600 x 337.5`。在版面結構上，這個 `.viewport` 仍然會被當成 `1000 x 562.5` 的投影片。

所以這個範例才會同時需要兩層，這和前面 Demo 02 的 `screenFrame` / `screenViewport` 是同一個分工：

- `.viewport` 保留固定邏輯尺寸 `1000 x 562.5`
- `.frame` 負責承接縮放後真正顯示在畫面上的大小 `600 x 337.5`

也可以反過來理解：

- `.viewport` 回答的是「投影片在系統裡有多大」
- `.frame` 回答的是「投影片現在在螢幕上佔多大」

如果只保留 `.viewport` 然後直接 `scale(0.6)`，你雖然會看到內容縮小，但外層版面不一定會自然變成你要的 `600 x 337.5` 顯示區。這也是為什麼真實專案裡，通常都會把「邏輯畫布」和「顯示容器」拆成兩層。

再更精確一點說，`.frame` 能解決問題，不是因為它把 `.viewport` 的 layout 尺寸改掉了，而是因為它接手了「參與版面配置的外層盒子」這個角色。

可以用流程理解：

1. layout 階段先看 `.frame`，所以外界會先把這塊區域當成 `600 x 337.5`
2. `.viewport` 在 `.frame` 裡仍然保有自己的邏輯尺寸 `1000 x 562.5`
3. 到繪製階段時，`.viewport` 才透過 `transform: scale(0.6)` 被畫成 `600 x 337.5`
4. 因為 `.frame` 本身就是 `600 x 337.5`，所以縮小後的 viewport 剛好落在這個顯示容器裡

這裡提到的 `layout 階段` 和 `繪製階段`，可以先用最直覺的方式理解：

- `layout 階段`：瀏覽器先決定元素在版面裡有多大、放在哪裡、會佔多少排版空間
- `繪製階段`：版面位置決定後，再把元素真正畫到畫面上

套回這個範例：

- 在 `layout 階段`，`.frame` 會被當成 `600 x 337.5`，`.viewport` 會被當成 `1000 x 562.5`
- 到 `繪製階段`，`.viewport` 才因為 `transform: scale(0.6)`，視覺上看起來像 `600 x 337.5`

所以 `transform` 比較像是在說「最後畫出來長什麼樣」，而不是在說「前面排版時計算的盒子尺寸要直接改成多少」。

所以真正的分工不是：

- `.frame` 去修改 `.viewport` 的邏輯尺寸

而是：

- `.frame` 決定這個物件在畫面排版中實際佔多少空間
- `.viewport` 保留邏輯畫布尺寸，讓元素繼續用固定座標系運作

一句話說，就是 `.frame` 沒有改寫 `.viewport`，而是把 layout 的責任接走，讓 `.viewport` 專心負責畫布內容與縮放顯示。

### 為什麼不直接把 `.viewport` 改成 `600 x 337.5`

如果只看畫面結果，很容易問：既然最後就是要顯示成 `600 x 337.5`，那為什麼不一開始就把 `.viewport` 直接設成 `600 x 337.5`？

核心原因是，這個設計其實想同時滿足兩個目標，而這兩個目標本來就互相拉扯：

1. 元素資料想永遠用同一套固定座標系
2. 畫面又必須能隨容器大小縮放顯示

這也是為什麼這裡要拆成兩個世界：

- `.viewport = 1000 x 562.5`：資料世界
- `.frame = 600 x 337.5`：顯示世界

一句話說，就是：

```text
用固定尺寸的內部世界寫資料，用可變尺寸的外部盒子負責顯示。
```

如果不這樣拆，通常只會落到下面兩種替代做法。

#### 做法 A：直接把 `.viewport` 本身改成 `600 x 337.5`

這樣 technically 可以，但元素資料就得跟著當前顯示尺寸一起改。

原本在邏輯世界裡：

```ts
left: 100
top: 50
width: 200
height: 80
```

如果畫面改成 `600 x 337.5`，同一個元素就要跟著變成：

```ts
left: 60
top: 30
width: 120
height: 48
```

這樣的問題是：

- 每次縮放都要重算所有元素
- 滑鼠拖曳、框選、旋轉都要一直在不同尺寸間換算
- 縮圖、主畫布、播放頁很難共用同一份資料

#### 做法 B：只對 `.viewport` 做 `transform: scale(0.6)`，但沒有 `.frame`

這樣畫面看起來會縮小，但外部排版仍然容易把它當成原本那張 `1000 x 562.5` 的大投影片。

這樣的問題是：

- 外界不知道它其實只想顯示成 `600 x 337.5`
- 容器佔位、裁切、置中、對齊會變得不直觀
- 你會一直遇到「看起來是小的，為什麼排版上還像大的」這種混亂

所以 `.frame + .viewport` 的設計，本質上是在拆責任：

- `.viewport` 負責資料與座標系穩定
- `.frame` 負責畫面上實際佔多大

你也可以把它想成：

- `.viewport` 像原稿，永遠是 `1000 x 562.5`
- `.frame` 像展示框，今天可以是 `600 x 337.5`，明天也可以是 `800 x 450`
- `transform: scale(...)` 只是把原稿縮放到展示框裡

所以這樣設計不是為了配合瀏覽器流程本身，而是為了工程上的穩定性：

- 資料模型固定
- 元素不用各自處理縮放
- 互動座標換算有一致規則
- 縮圖、主畫布、播放頁可以共用同一套邏輯

#### 三種做法比較

| 做法 | `.viewport` 尺寸 | `transform: scale()` | 元素資料座標 | 優點 | 缺點 | 適合情境 |
|---|---|---:|---|---|---|---|
| 固定邏輯畫布 + 外層承接顯示尺寸 | 固定 `1000 x 562.5` | 有，例如 `scale(0.6)` | 固定邏輯座標，例如 `left: 100` | 資料模型穩定；元素不用各自縮放；滑鼠換算規則一致；縮圖、主畫布、播放頁可共用同一套資料 | 需要理解 `.frame / .viewport` 兩層分工 | 畫布編輯器、投影片系統、白板、縮圖與主畫布共用資料 |
| 直接把 `.viewport` 改成顯示尺寸，不用 `scale()` | 直接是 `600 x 337.5` | 無 | 也要跟著變成顯示尺寸座標，例如 `left: 60` | 結構直觀；不用理解 transform 對 layout 的影響 | 每次縮放都要重算元素；互動換算容易亂；不同畫面尺寸難共用資料 | 很簡單、固定尺寸的小型展示頁 |
| 直接把 `.viewport` 改成顯示尺寸，同時又 `scale(0.6)` | `600 x 337.5` | 有，例如 `scale(0.6)` | 不一致，容易混亂 | 幾乎沒有實際好處 | 會 double scale；最後變成 `360 x 202.5`；邏輯與顯示都混在一起 | 不建議 |

一句話判斷：

- 做投影片編輯器這類系統，通常應選第一種
- 只做單純固定版面展示，第二種有時可以接受
- 第三種基本上是錯的

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

如果你先把這組範例看懂，後面再回頭對照實際專案，會比較容易知道它是在把這件事做大、做完整，而不是在做另一套不同邏輯。

## 一張圖先看懂

```text
資料層
  ├─ viewportSize = 1000
  ├─ viewportRatio = 0.5625
  └─ elements: left / top / width / height ...

畫面層
  ├─ frame / wrapper   決定「實際顯示多大、放在哪」
  └─ viewport          保持「邏輯尺寸 1000 x 562.5」，再做 scale(canvasScale)
       └─ elements     一律用邏輯座標渲染
```

## 名詞對照

- 最小範例裡的 `.frame`，對應 `PPTist` 的 `viewport-wrapper`
- 最小範例裡的 `.viewport`，對應 `PPTist` 的 `viewport`
- `viewportSize` 與 `viewportRatio`，一起決定邏輯畫布大小
- `canvasScale`，決定邏輯畫布最後映射到畫面時的縮放倍率
- 「邏輯畫布大小」回答的是資料世界有多大；「實際顯示大小」回答的是畫面上現在佔多大

## 下面才回到 `PPTist`

上面是在先建立畫布系統的共通模型。  
如果這一層你已經看懂，下面再回來對照 `PPTist`，就會比較清楚它只是把同一套邏輯拆進 store、hooks 和元件，而不是憑空多出一套新規則。

## 1. 畫布系統真正要解的問題

如果直接把元素位置綁死在真實 DOM 像素上，畫布一縮放，很多事情都會開始變麻煩：

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

這裡其實可以整理成一組固定換算公式：

```ts
width = viewportSize
height = viewportSize * viewportRatio

viewportRatio = height / width
height = width * viewportRatio
width = height / viewportRatio
```

也就是說：

- 已知寬度與高寬比，可以推出高度
- 已知高度與高寬比，可以反推出寬度
- 已知寬與高，也可以反推出高寬比

這代表一個元素只要寫：

```ts
{ left: 100, top: 50, width: 200, height: 80 }
```

它永遠是在 `1000 x 562.5` 這個世界裡成立，不會因為畫面目前顯示成 800px 寬或 1400px 寬就改變定義。


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

`viewportStyles.width` 本身還是邏輯寬度 `1000`，真正變成螢幕尺寸的是乘上 `canvasScale` 之後。

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

換句話說：

- `viewportSize` 決定邏輯寬度
- `viewportSize * viewportRatio` 決定邏輯高度
- `canvasScale` 只是把這組邏輯尺寸映射到目前容器大小的倍率

這就是為什麼 `PPTist` 可以在不同大小的編輯區內，仍然維持同一張投影片比例。

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

### 常用公式

```ts
width = viewportSize
height = viewportSize * viewportRatio
viewportRatio = height / width

screenWidth = width * canvasScale
screenHeight = height * canvasScale

logicalX = screenX / canvasScale
logicalY = screenY / canvasScale
```

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
