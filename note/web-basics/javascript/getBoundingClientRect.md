# getBoundingClientRect()

`getBoundingClientRect()` 是 DOM 元素最常用的量測方法之一。它會回傳元素在目前視窗中的位置與尺寸，常用來做：

- 判斷元素在畫面上的位置
- 計算滑鼠、手指相對於元素的座標
- 做拖曳、縮放、碰撞、可視區判斷

你前面在 `WorkspaceStage.vue` 裡看到的 `board.getBoundingClientRect()`，就是這個方法的實際應用。

## 先記住一句話

`getBoundingClientRect()` 回傳的是「元素此刻在視窗中的矩形區域」，不是元素在文件中的原始樣式值。

## 回傳內容

它會回傳一個 `DOMRect` 物件，常用欄位包括：

| 欄位 | 說明 | 用途 |
| --- | --- | --- |
| `x` / `left` | 元素左上角相對於視窗左邊的距離 | 算元素在畫面中的水平位置 |
| `y` / `top` | 元素左上角相對於視窗上邊的距離 | 算元素在畫面中的垂直位置 |
| `width` | 元素目前寬度 | 量測寬度、算比例 |
| `height` | 元素目前高度 | 量測高度、算比例 |
| `right` | 元素右邊界位置 | 邊界判斷 |
| `bottom` | 元素下邊界位置 | 邊界判斷 |

其中 `left/top/width/height` 最常用。

## 它的座標是以誰為基準

`getBoundingClientRect()` 回傳的是**視窗座標**，也就是以瀏覽器可視區左上角為基準。

這代表：

- `left = 0` 表示元素剛好貼齊視窗左邊
- `top = 0` 表示元素剛好貼齊視窗上邊
- 如果頁面捲動了，回傳值也會跟著變

這是它和 `offsetLeft`、`offsetTop` 很不一樣的地方。

## 最基本範例

```html
<div id="box" style="width:200px;height:120px;padding:16px;border:4px solid #333;">
  Hello
</div>

<button id="btn">量測</button>
<pre id="out"></pre>

<script>
  const box = document.getElementById('box')
  const btn = document.getElementById('btn')
  const out = document.getElementById('out')

  btn.addEventListener('click', () => {
    const rect = box.getBoundingClientRect()

    out.textContent = [
      `left: ${rect.left}`,
      `top: ${rect.top}`,
      `width: ${rect.width}`,
      `height: ${rect.height}`,
    ].join('\n')
  })
</script>
```

這段程式會把 box 目前在視窗中的位置與大小列出來。

## 跟 `clientX` / `clientY` 怎麼搭配

這是最常見的實戰用途。

當你知道：

- 滑鼠點擊位置是 `event.clientX` / `event.clientY`
- 元素位置是 `rect.left` / `rect.top`

就可以算出「游標在元素內的相對位置」。

```js
const rect = element.getBoundingClientRect()

const localX = event.clientX - rect.left
const localY = event.clientY - rect.top
```

這個公式在畫布、拖曳、座標轉換裡非常常見。

## 實務範例：算出游標在元素內的位置

```html
<div id="stage" style="width:300px;height:160px;border:2px solid #2563eb;"></div>
<pre id="log"></pre>

<script>
  const stage = document.getElementById('stage')
  const log = document.getElementById('log')

  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const localY = event.clientY - rect.top

    log.textContent = `localX: ${Math.round(localX)}\nlocalY: ${Math.round(localY)}`
  })
</script>
```

這就是把視窗座標轉成元素內座標。

## 在畫布系統裡的用途

畫布系統常常有一個「外框舞台」和一個「內部內容」。

這時候你會先用 `getBoundingClientRect()` 找到舞台的實際位置，再把游標位置轉成相對座標，接著才能進一步換算成：

- 畫布座標
- 拖曳位移
- 縮放錨點
- 命中測試

`WorkspaceStage.vue` 裡的這段就是這個思路：

```ts
const stageRect = stage.getBoundingClientRect()
const anchor = {
  x: event.clientX - stageRect.left,
  y: event.clientY - stageRect.top,
}
```

這裡的 `anchor` 是游標在舞台內的相對位置。

## 常見誤解

### 1. 它不是樣式值

你不能把它當成 CSS 的 `width`、`height` 或 `left`。

它回傳的是「實際渲染後」的幾何資訊，可能會受到：

- padding
- border
- transform
- 捲動位置
- 瀏覽器縮放

影響。

### 2. 它不是文件座標

它是相對於視窗的，不是相對於整個文件。

如果頁面捲動了，數值就會跟著變。

### 3. 它不是靜態資料

它反映的是「你呼叫當下」的畫面狀態。

如果元素尺寸或位置改變了，你需要重新呼叫一次。

## 什麼時候應該重新量測

你通常會在這些情況重新呼叫：

- 元素內容改變後
- 視窗 resize 後
- 版面重新排版後
- 區塊展開或收合後
- 動畫或 transform 改變後

如果畫面會變，量測值就不能一直沿用舊的。

## 和這些方法的差別

| 方法 | 基準 | 適合用途 |
| --- | --- | --- |
| `getBoundingClientRect()` | 視窗座標 | 畫面上實際位置、滑鼠座標轉換 |
| `offsetLeft` / `offsetTop` | 定位父層 | 取得排版上的相對位置 |
| `clientWidth` / `clientHeight` | 元素內容區域 | 量測元素大小，不含邊框 |
| `scrollWidth` / `scrollHeight` | 內容總尺寸 | 看內容是否超出容器 |

如果你要做互動座標計算，通常優先考慮 `getBoundingClientRect()`。

## 最常見的使用模式

1. 先抓元素矩形
2. 再抓滑鼠或手指位置
3. 做座標減法
4. 得到元素內的相對座標

```js
const rect = target.getBoundingClientRect()
const x = event.clientX - rect.left
const y = event.clientY - rect.top
```

這一招非常通用。

## 小結

`getBoundingClientRect()` 是前端互動程式裡的基礎量測工具。

如果你要做的是：

- 點哪裡
- 拖到哪裡
- 放大縮小後座標怎麼算
- 元素在畫面上的實際位置在哪

那你幾乎一定會用到它。

