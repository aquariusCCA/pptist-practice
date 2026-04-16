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

- 元素內容改變後# `getBoundingClientRect()` 是什麼？

`getBoundingClientRect()` 是前端互動開發裡非常重要的量測方法。

它的作用很簡單：

> **取得某個元素「此刻在視窗中」的實際位置與大小。**

這個方法特別常用在：

* 計算滑鼠或手指在元素內的相對座標
* 拖曳
* 縮放
* 碰撞判斷
* 可視區判斷
* 畫布座標換算

像你在 `WorkspaceStage.vue` 裡看到的：

```ts
const rect = board.getBoundingClientRect()
```

本質上就是在問：

> **這個 board，現在在畫面上的哪裡？有多大？**

---

# 先記住一句最核心的話

`getBoundingClientRect()` 回傳的不是 CSS 原始設定值，
而是：

> **元素在「目前視窗中」實際渲染後的矩形資訊。**

也就是說，它看的是**現在畫面上真正呈現出來的結果**。

---

# 它會回傳什麼？

它會回傳一個 `DOMRect` 物件，常見欄位有這些：

| 欄位       | 意思            |
| -------- | ------------- |
| `left`   | 元素左邊界到視窗左邊的距離 |
| `top`    | 元素上邊界到視窗上邊的距離 |
| `right`  | 元素右邊界到視窗左邊的距離 |
| `bottom` | 元素下邊界到視窗上邊的距離 |
| `width`  | 元素目前的實際寬度     |
| `height` | 元素目前的實際高度     |
| `x`      | 通常等同於 `left`  |
| `y`      | 通常等同於 `top`   |

最常用的是這四個：

```ts
rect.left
rect.top
rect.width
rect.height
```

---

# 它的座標是以誰為基準？

這是最重要的地方之一。

`getBoundingClientRect()` 使用的是：

> **視窗座標系**
>
> 也就是以「瀏覽器可視區左上角」當作原點 `(0, 0)`

所以：

* `left = 0` 代表元素左邊剛好貼齊視窗左邊
* `top = 0` 代表元素上邊剛好貼齊視窗上邊

請注意：

> 它不是以整份文件的最上方為基準，
> 而是以「目前你看到的視窗」為基準。

---

# 為什麼頁面一捲動，數值會變？

因為它量的是：

> **元素相對於目前視窗的位置**

假設某個元素本來在整份文件的第 `1000px` 高度。

如果你把頁面往下捲了 `300px`，那麼這個元素在視窗中看起來就會往上靠近，因此：

* 原本可能 `rect.top = 1000`
* 捲動後可能變成 `rect.top = 700`

所以你可以把它理解成：

> **文件中的位置不一定變，但元素在視窗中的位置變了。**

這也是為什麼 `getBoundingClientRect()` 的值會隨著捲動改變。

---

# 最基本的例子

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

按下按鈕後，你拿到的不是 `box` 的 CSS 原始設定，
而是它**目前在畫面上的實際矩形資訊**。

---

# 它最常見的用途：把滑鼠座標轉成元素內座標

這是 `getBoundingClientRect()` 最重要的實戰用法。

你會同時拿到兩種資訊：

1. 滑鼠在視窗中的位置

   ```ts
   event.clientX
   event.clientY
   ```

2. 元素在視窗中的位置

   ```ts
   rect.left
   rect.top
   ```

注意，這兩組值都是：

> **相對於視窗左上角的座標**

所以它們可以直接相減：

```ts
const rect = element.getBoundingClientRect()

const localX = event.clientX - rect.left
const localY = event.clientY - rect.top
```

這樣就得到：

> **滑鼠在元素內部的相對座標**

---

# 為什麼這樣減就對了？

因為座標系統一致。

* `event.clientX`：滑鼠相對於視窗左上角的 X
* `rect.left`：元素左邊界相對於視窗左上角的 X

兩者都以視窗為基準，
所以相減之後，剩下的就是：

> **滑鼠相對於元素左上角的距離**

這就是很多互動功能背後最核心的一步。

---

# 實戰範例：取得游標在元素內的位置

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

這段程式做的事其實很單純：

1. 先量出 `stage` 在視窗中的位置
2. 再拿到滑鼠在視窗中的位置
3. 兩者相減
4. 得到滑鼠在 `stage` 內的座標

---

# 在畫布系統裡，它為什麼這麼重要？

因為畫布互動的第一步，通常都不是直接算「畫布座標」，
而是先算：

> **滑鼠在舞台容器內的相對位置**

例如：

```ts
const stageRect = stage.getBoundingClientRect()

const anchor = {
  x: event.clientX - stageRect.left,
  y: event.clientY - stageRect.top,
}
```

這裡的 `anchor` 代表的不是全局座標，
而是：

> **游標在 stage 這個容器內的 local 座標**

接下來你才有辦法繼續做：

* 拖曳位移計算
* 縮放中心點計算
* 畫布座標換算
* 命中測試

所以在畫布系統中，`getBoundingClientRect()` 通常負責的是：

> **把全局視窗座標，轉成容器內部座標**

---

# `width` / `height` 要怎麼理解？

這裡也很容易混淆。

`rect.width` 和 `rect.height` 表示的是：

> **目前這個矩形在畫面上實際佔了多大**

它不是單純照抄你 CSS 裡寫的 `width`、`height`。

它可能會受到這些因素影響：

* `padding`
* `border`
* `transform`
* 頁面縮放
* 實際渲染結果

尤其是 `transform: scale(...)` 很重要。

例如元素原本寬度是 `100px`，
如果你做了：

```css
transform: scale(2);
```

那它畫面上看起來就變成兩倍大，
此時 `getBoundingClientRect().width` 也可能反映這個放大後的結果。

所以你可以這樣記：

> CSS 寫的是「原本怎麼設計」
> `getBoundingClientRect()` 回傳的是「現在畫面上實際看起來怎麼樣」

---

# 常見誤解

## 1. 它不是 CSS 樣式值

它不是在讀：

* `style.left`
* `style.top`
* `style.width`
* `style.height`

它讀的是：

> **瀏覽器實際排版與渲染後的幾何結果**

---

## 2. 它不是文件座標

它不是在告訴你元素離整份文件最上方多遠，
而是在告訴你：

> **元素現在離視窗左上角多遠**

所以只要捲動頁面，數值就可能改變。

---

## 3. 它不是固定不變的資料

它反映的是：

> **你呼叫當下的畫面狀態**

如果元素位置變了、尺寸變了、畫面縮放了、頁面捲動了，
你就要重新呼叫一次。

---

# 什麼時候應該重新量測？

通常遇到以下情況，就不要沿用舊的 `rect`：

* 視窗 resize
* 頁面捲動
* 元素內容改變
* 版面重新排版
* 元素展開 / 收合
* `transform` 改變
* 動畫中位置或大小變化

一句話就是：

> **只要畫面可能變，量測值就可能過期。**

---

# 它和其他幾種屬性差在哪？

這裡最容易搞混，我幫你整理成一句話版。

| 方法                             | 基準            | 重點                   |
| ------------------------------ | ------------- | -------------------- |
| `getBoundingClientRect()`      | 視窗            | 看元素此刻在畫面上的實際位置與大小    |
| `offsetLeft` / `offsetTop`     | offset parent | 看元素相對於定位父層的位置        |
| `clientWidth` / `clientHeight` | 元素內部盒模型       | 看可視內容區大小，通常不含 border |
| `scrollWidth` / `scrollHeight` | 內容總尺寸         | 看內容是否比容器大、是否有溢出      |

如果你的目的是：

* 算滑鼠在元素內的位置
* 做拖曳
* 做縮放
* 做畫布座標轉換

那通常最優先考慮的是：

```ts
getBoundingClientRect()
```

---

# 最常見的使用公式

這幾乎是前端互動開發的基礎公式：

```ts
const rect = target.getBoundingClientRect()
const x = event.clientX - rect.left
const y = event.clientY - rect.top
```

意思就是：

1. 先量元素在視窗中的位置
2. 再取得滑鼠在視窗中的位置
3. 兩者相減
4. 得到元素內部座標

這一招非常通用。

---

# 小結

`getBoundingClientRect()` 可以用一句話總結：

> **它用來取得元素目前在視窗中的實際矩形資訊。**

所以當你要處理這些問題時，幾乎一定會用到它：

* 元素現在在畫面哪裡？
* 滑鼠點在元素的哪個位置？
* 拖曳位移怎麼算？
* 縮放中心點怎麼算？
* 畫布座標怎麼從視窗座標換過來？

在互動式前端、畫布系統、拖曳系統裡，
它是非常基礎、也非常核心的量測工具。

---

如果你要，我也可以下一步幫你把這篇再升級成更像你前面那種 **「PPTist 畫布系統筆記風格」版本**，讓它能直接和 `WorkspaceStage.vue` 的程式碼講解接起來。

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

