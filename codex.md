# 畫布系統概念篇（原理先行的 PPTist Source 導向版）

所屬章節：[03-畫布系統](./README.md)

---

## 這篇要解決什麼

這篇不是用 Demo 講畫布，也不是只把原始碼檔案一個一個列出來。

這篇要做的事是：

1. 先把 **PPTist 畫布系統真正想解決的問題** 講清楚
2. 再把這些原理對回 **PPTist** 的實際原始碼
3. 讓你之後去看 `slides.ts`、`main.ts`、`useViewportSize.ts`、`Canvas/index.vue` 時，不會只看到變數和樣式，而是知道它們各自為什麼存在

這篇會沿著下面這條主線走：

```text
原理
-> 為什麼需要固定邏輯畫布
-> 為什麼需要 wrapper + viewport 兩層
-> 為什麼畫面座標要換回邏輯座標
-> 這些原理在 PPTist 原始碼裡分別落在哪裡
```

---

## 先統一這篇會用到的 4 個名詞

這四個名詞一定要先定清楚，否則後面在讀 `canvasScale`、`viewport-wrapper`、`viewportStyles` 時，很容易混掉。

* **邏輯畫布**：系統內部那張固定尺寸的投影片
* **畫面顯示**：使用者目前在螢幕上看到的結果
* **邏輯座標**：元素資料儲存的位置與尺寸
* **畫面座標**：滑鼠事件、拖曳位移在螢幕上量到的距離

後面請你一直用這套語言去看程式碼，不要在腦中把它們混成同一件事。

---

## 先講結論：畫布系統其實只做 3 件事

PPTist 的畫布系統，本質上只做三件事：

### 1. 先定義一張固定大小的邏輯畫布
這張畫布不是「現在畫面上看起來多大」的那張畫布，而是系統內部用來描述資料的基準平面。

---

### 2. 再把這張邏輯畫布縮放後顯示到畫面上
使用者畫面上看到的大或小，不是資料變了，而是這張邏輯畫布被縮放後的結果。

---

### 3. 最後把畫面座標換回邏輯座標
滑鼠點擊、拖曳、建立元素時，事件先拿到的是畫面座標；
但資料要寫回的，是邏輯座標。

所以中間一定會有一層換算：

```ts
邏輯座標 = 相對於畫布左上角的畫面座標 / canvasScale
```

只要先把這三件事抓住，後面看原始碼才不會散掉。

---

## 先認識這篇會對照的原始碼位置

這篇主要會對照這幾個檔案：

```text
doc/Canvas.md
src/store/slides.ts
src/store/main.ts
src/hooks/useScaleCanvas.ts
src/views/Editor/Canvas/hooks/useViewportSize.ts
src/views/Editor/Canvas/index.vue
```

你可以先把它們理解成下面這種分工：

* `doc/Canvas.md`：作者先講清楚畫布與元素的基本原理
* `slides.ts`：定義邏輯畫布的基準尺寸
* `main.ts`：保存畫布目前的顯示策略與縮放狀態
* `useScaleCanvas.ts`：負責調整縮放相關狀態
* `useViewportSize.ts`：根據容器大小算出實際的縮放倍率與位置
* `Canvas/index.vue`：把整個畫布結構真正渲染出來，並接住滑鼠互動

---

# 一、PPTist 先固定一張「邏輯畫布」

## 1. 先看作者在 `doc/Canvas.md` 怎麼說

作者在 `doc/Canvas.md` 其實已經先把核心原理講出來了：

* 可視區域預設以 **寬 1000**、**高 562.5** 為基準比例
* 無論畫布實際顯示多大，一個 `{ width: 1000, height: 562.5, left: 0, top: 0 }` 的元素，都會剛好鋪滿整個可視區域
* 真正的做法不是改資料，而是根據實際顯示寬度去算縮放比，然後把整個可視區域一起縮放

這段話非常重要，因為它直接告訴你：

> **PPTist 的畫布不是拿 DOM 目前的實際像素尺寸當資料基準，而是先固定一張邏輯畫布，再把它映射到畫面上。**

---

## 2. 這個原理在 `slides.ts` 裡怎麼落地

在 `src/store/slides.ts` 裡，你會看到：

```ts
viewportSize: 1000
viewportRatio: 0.5625
```

這兩個值的意思是：

* `viewportSize`：邏輯畫布的寬度基準
* `viewportRatio`：邏輯畫布的高寬比

所以畫布真正的邏輯尺寸就是：

```ts
width = viewportSize
height = viewportSize * viewportRatio
```

也就是：

```ts
width = 1000
height = 1000 * 0.5625 = 562.5
```

這不是現在畫面上真的有一個固定 `1000 x 562.5` 的 DOM 盒子永遠顯示給你看，
而是：

> **系統內部永遠用這套尺寸當成元素資料的座標基準。**

---

## 3. 為什麼一定要先固定一張邏輯畫布

這是畫布系統最核心的原理之一。

假設元素資料是：

```ts
{ left: 100, top: 50, width: 200, height: 80 }
```

這組數字如果建立在固定邏輯畫布上，它的意思就很穩定：

* 元素左上角在邏輯畫布的 `(100, 50)`
* 寬 `200`
* 高 `80`

不管螢幕現在看起來是大是小，這組資料的意義都不會變。

但如果你不先固定邏輯畫布，而是讓資料直接綁在目前顯示尺寸上，問題就來了：

* 畫面顯示成 600 時，`left: 100` 是什麼意思？
* 畫面顯示成 800 時，這個 `100` 還是不是同一個位置？
* 之後拖曳、縮放、對齊、群組操作時，到底該用哪一套基準？

所以固定邏輯畫布，真正解決的是：

> **把「資料基準」從「當前顯示尺寸」中切出來。**

一句話記住：

> **資料永遠活在固定邏輯畫布裡，畫面只是它的縮放結果。**

---

# 二、畫面上看到的大小，不等於資料真正的大小

## 1. `main.ts` 裡的兩個關鍵值

在 `src/store/main.ts` 裡，畫布相關最重要的兩個值是：

```ts
canvasPercentage: 90
canvasScale: 1
```

這兩個很容易混，但它們不是同一件事。

---

## 2. `canvasPercentage` 是「想顯示多大」

`canvasPercentage` 表示的是：

> **我希望畫布大概占外層容器的幾成。**

例如：

```ts
canvasPercentage = 90
```

它的意思不是：

> 畫布一定縮放成 `0.9` 倍

而是：

> 畫布這次想占容器大約 90% 的可視空間

所以 `canvasPercentage` 是一個**顯示目標**。

---

## 3. `canvasScale` 是「最後真的要縮放幾倍」

`canvasScale` 才是真正拿去做：

```ts
transform: scale(canvasScale)
```

的值。

它回答的是：

> **這張固定邏輯畫布，現在到底要縮放幾倍，才能顯示成目前想要的大小。**

所以：

* `canvasPercentage` 是目標
* `canvasScale` 是結果

---

## 4. 為什麼 PPTist 不直接手動改 `canvasScale`

這點很值得注意，因為它反映了設計思路。

在 `src/hooks/useScaleCanvas.ts` 裡，縮放畫布時，程式不是直接寫死一個新的 `canvasScale`，
而是先改：

```ts
canvasPercentage
```

再由 `useViewportSize.ts` 重新根據容器大小、比例、目前百分比去算出新的 `canvasScale`。

也就是說，PPTist 的思路不是：

> 我要直接把畫布縮成 1.13 倍

而是：

> 我要讓畫布在容器裡顯示得再大一點，接著由系統重新計算真正的縮放倍率

這種設計比較穩，因為：

* 真正的縮放值會依容器大小而變
* 同樣的 `canvasPercentage` 在不同尺寸容器中，算出來的 `canvasScale` 本來就可能不同
* 這樣系統比較能維持一致的視覺策略

---

# 三、為什麼需要 `viewport-wrapper + viewport` 兩層

這一節是整篇最重要的部分之一。

如果沒有先搞懂這個，後面看到 `Canvas/index.vue` 裡兩層結構，很容易以為只是「多包一層」。

但它其實不是裝飾，而是畫布系統成立的關鍵。

直接用一句話先講結論：

> **`viewport-wrapper` 的存在，是為了把「縮放後的投影片」變成一個明確的畫面外框。**
> `viewport` 只負責「內容照固定邏輯尺寸渲染，再做 scale」。

也就是：

* `viewport`：像**原稿**
* `viewport-wrapper`：像**相框**

---

## 1. 先看 `Canvas/index.vue` 的結構

在 `src/views/Editor/Canvas/index.vue` 裡，核心結構可以先壓成這樣看：

```html
<div class="canvas">
  <div class="viewport-wrapper" :style="{ width, height, left, top }">
    <div class="operates"> ... </div>

    <div
      class="viewport"
      :style="{ transform: `scale(${canvasScale})` }"
    >
      ...
    </div>
  </div>
</div>
```

這裡最重要的，不是 class 名字，而是這兩層分別在解決不同問題。

---

## 2. `viewport` 在解什麼問題

`viewport` 這一層真正的任務是：

* 保留固定的邏輯尺寸
* 讓元素持續用同一套邏輯座標系渲染
* 再透過 `transform: scale(canvasScale)` 把整張畫布放大或縮小

你可以把它想成：

> **資料世界的基準平面**

也就是說，元素的 `left / top / width / height` 是寫在這張邏輯畫布上的，不是直接寫在目前螢幕看起來的大小上。

---

## 4. `viewport-wrapper` 真正解決的是什麼

`viewport-wrapper` 的任務不是單純再包一層，而是承接下面這些事情：

* 縮放後的實際顯示寬高
* 這張畫布在整個編輯區中的 `left / top`
* 顯示外框、陰影、背景、操作層的定位基準
* 讓可視區域在拖曳、置中、縮放後仍然有一個明確的外框

也就是說，它本質上是：

> **畫面世界裡，這張投影片真正的顯示外框。**

---

## 5. 為什麼這兩件事不能塞在同一層

因為它們本來就不是同一種責任。

### `viewport` 負責：
* 穩定的邏輯座標系
* 固定的資料基準
* 視覺縮放本身

### `viewport-wrapper` 負責：
* 縮放後真正顯示成多大
* 這個顯示框放在哪裡
* 其他圖層與操作元件要對齊哪裡

如果把這兩種責任混在一起，你會立刻開始分不清楚：

* 現在的 `width / height` 是在說邏輯尺寸，還是顯示尺寸？
* `left / top` 是在說資料世界的位置，還是畫面上的位置？
* 選取框、操作點、背景層，到底該貼哪一個框？

所以這兩層不是為了 DOM 結構好看，而是為了把：

> **邏輯世界** 和 **顯示世界**

硬切開來。

---

## 6. 用一句話記住兩層分工

你可以直接記成：

> **`viewport` 讓資料座標穩定，`viewport-wrapper` 讓顯示外框與定位穩定。**

---

## 7. 最簡單版本

假設投影片的邏輯尺寸固定是：

* 寬 `1000`
* 高 `562.5`

這正是 PPTist 預設存在 `slides` store 裡的基準尺寸。

現在縮放比是：

* `canvasScale = 0.5`

這個值在 `main` store 裡維護，`useViewportSize.ts` 會依容器大小與 `canvasPercentage` 去更新它。

那畫面上看起來就會變成：

* 寬 `500`
* 高 `281.25`

---

## 8. 關鍵來了：誰負責這個 `500 x 281.25`？

在 PPTist 裡：

* `viewport-wrapper` 直接被設成
  `width = viewportStyles.width * canvasScale`
  `height = viewportStyles.height * canvasScale`
* `viewport` 自己則只做
  `transform: scale(canvasScale)`。

所以：

* `viewport` 在邏輯上仍然是 `1000 x 562.5`
* `viewport-wrapper` 才是畫面上那個真正的 `500 x 281.25`

**這就是 wrapper 的用途。**

---

## 9. 為什麼不能只有 `viewport`？

因為如果只有這樣：

```html
<div class="viewport" style="transform: scale(0.5)"></div>
```

你得到的只是：

> **內容看起來縮小了**

但你還沒有得到這三件事：

1. **一個明確的外框**
2. **這張畫布的外框應該放在哪裡**
3. **其他操作層要對齊哪個實體框**

而 PPTist 其實很需要這三件事。
因為它不是只有畫內容，還要畫：

* 對齊線 `AlignmentLine`
* 操作框 `Operate`
* 多選操作框 `MultiSelectOperate`
* 背景層 `ViewportBackground`

這些元件在目前的 `Canvas/index.vue` 裡，確實和內容層一起被放在 `viewport-wrapper` 裡。

---

###  「這張畫布的外框應該放在哪裡」是什麼意思？

就是：

> **這個 `500 x 281.25` 的矩形，左上角到底落在畫面的哪裡？**

PPTist 在 `useViewportSize.ts` 裡算出 `viewportLeft`、`viewportTop`，再組成 `viewportStyles.left / top`；`Canvas/index.vue` 再把它們綁到 `viewport-wrapper`。([GitHub][4])

也就是說：

* `scale()` 只回答：**縮成幾倍**
* `wrapper.left / top` 才回答：**放在哪裡**

---

### 「其他操作層要對齊哪個實體框」是什麼意思？

就是：

> **操作框、對齊線、背景層，不可能只知道「內容被 scale 了」就夠了；它們還需要知道「整張投影片的畫面外框」到底在哪。**

而這個共同外框，就是 `viewport-wrapper`。

目前在 `Canvas/index.vue` 裡：

* `operates` 層在 wrapper 裡
* `viewport` 內容層也在 wrapper 裡
* `ViewportBackground`、`AlignmentLine`、`Operate`、`MultiSelectOperate` 都在 `operates` 區塊內或同層運作。

所以它們其實都在共享同一個「畫面外框基準」。

---

## 10. 我用一個具體例子講

假設現在：

* 邏輯畫布：`1000 x 562.5`
* `canvasScale = 0.5`
* `wrapper.left = 200`
* `wrapper.top = 100`

這時候畫面上的結果應該是：

* 這張投影片在螢幕上實際顯示成 `500 x 281.25`
* 它的左上角在 `(200, 100)`

那麼：

### `viewport` 做什麼？

它只是在內部把內容照 `1000 x 562.5` 那套邏輯座標畫出來，然後整張套上 `scale(0.5)`。

### `viewport-wrapper` 做什麼？

它告訴整個系統：

> 「現在投影片在畫面上，就是一個從 `(200,100)` 開始、大小是 `500 x 281.25` 的矩形。」

而這個 `(width, height, left, top)`，在 PPTist 裡就是直接綁在 `viewport-wrapper` 上。

---

## 11. 你可以把它想成這樣

### 沒有 wrapper 時

你只有一張被縮小的圖。

系統知道：

* 東西看起來變小了

但系統不夠清楚：

* 這張圖現在畫面外框多大？
* 左上角在哪？
* 操作框要貼哪裡？
* 背景層要鋪到哪裡？

---

### 有 wrapper 時

你不只是有一張被縮小的圖，還多了一個「外框盒子」。

系統現在很清楚：

* 這張投影片畫面上就是 `500 x 281.25`
* 左上角就在 `(200, 100)`
* 操作層、背景層、內容層都拿這個盒子當共同基準

---

## 12. 為什麼 `operates` 也在 wrapper 裡

這也是 `Canvas/index.vue` 很值得注意的一點。

`operates` 這層不在 `viewport` 裡，而是和 `viewport` 一起放在 `viewport-wrapper` 裡。

這代表：

* 操作框、對齊線、背景層等，不是單純跟著元素 DOM 一起縮放就好
* 它們需要以「目前畫面上這張投影片的實際顯示外框」作為共同基準

換句話說：

> **wrapper 不只是包住 viewport，它還把所有和「畫面上這張投影片」有關的圖層，放進同一個顯示外框裡。**

這正是 wrapper 存在的必要性。

---

## 13. 最後壓成一句話

> **`viewport` 是邏輯畫布；`viewport-wrapper` 是畫面外框。**
> `scale()` 只會改變內容的視覺大小，
> `wrapper` 才會把縮放後的結果，變成一個真正可定位、可對齊、可承接操作層的矩形。

---

# 四、`useViewportSize.ts` 在解什麼問題

如果說 `slides.ts` 定義的是邏輯畫布的基準，
那 `useViewportSize.ts` 解決的就是：

> **這張固定邏輯畫布，現在在這個容器裡應該顯示成多大、放在哪裡。**

---

## 1. 這個 hook 管的不是元素資料，而是「整張畫布的位置與大小」

在 `src/views/Editor/Canvas/hooks/useViewportSize.ts` 裡，你會看到幾個關鍵值：

* `viewportLeft`
* `viewportTop`
* `viewportStyles`

其中 `viewportStyles` 會整理出：

```ts
{
  width: viewportSize,
  height: viewportSize * viewportRatio,
  left: viewportLeft,
  top: viewportTop,
}
```

注意這裡很關鍵：

* `width` / `height` 仍然是邏輯尺寸
* `left` / `top` 是這張畫布在畫面上的顯示位置

也就是說，它同時把：

* 邏輯畫布大小
* 顯示外框位置

一起準備給 `Canvas/index.vue` 使用。

---

## 2. 為什麼它要比較容器比例和投影片比例

初始化位置時，程式會先看：

```ts
canvasHeight / canvasWidth > viewportRatio
```

這不是多餘判斷，而是在回答一個問題：

> **這次應該用寬度當基準縮放，還是用高度當基準縮放？**

原因很簡單：

* 有時容器比較高、比較窄
* 有時容器比較矮、比較寬
* 但投影片的比例是固定的

所以系統必須先判斷：

* 這次是寬度先碰到限制
* 還是高度先碰到限制

這其實就是所有「保持固定比例縮放」系統都要做的事。

---

## 3. 用寬度當基準時，它怎麼算

當容器相對較高時，程式會大致走這條路：

```ts
viewportActualWidth = canvasWidth * (canvasPercentage / 100)
canvasScale = viewportActualWidth / viewportSize
```

這表示：

* 我想讓畫布在容器寬度內顯示成某個比例
* 再反推出邏輯畫布這次應該縮放幾倍

---

## 4. 用高度當基準時，它怎麼算

當容器相對較扁時，程式會改用高度去推：

```ts
viewportActualHeight = canvasHeight * (canvasPercentage / 100)
canvasScale = viewportActualHeight / (viewportSize * viewportRatio)
```

這表示：

* 這次真正的限制邊是高度
* 所以要用高度去倒推縮放倍率

---

## 5. 為什麼還要算 `left / top`

因為畫布不只是要縮放，還要被正確地放進編輯區裡。

`useViewportSize.ts` 會把：

* `viewportLeft`
* `viewportTop`

算成置中後的位置，讓畫布在外層容器裡正常居中顯示。

所以這個 hook 不只是「算 scale」而已，它其實在解：

1. 現在應該縮多少
2. 現在應該放哪裡
3. 容器大小改變時，要怎麼重算
4. 畫布被拖曳之後，要怎麼維持狀態

---

## 6. 為什麼畫布拖曳也放在這個 hook

因為拖曳整張畫布，改變的不是元素資料，而是：

* `viewportLeft`
* `viewportTop`

也就是：

> **整張投影片顯示外框在畫面中的位置**

所以它理所當然屬於 `useViewportSize.ts` 的責任範圍。

這也再次證明：

> **畫布拖曳是在移動顯示外框，不是在改元素的邏輯座標。**

---

# 五、為什麼滑鼠事件拿到的不是你要存進資料的座標

這也是畫布系統非常關鍵的一層。

因為使用者在螢幕上點到的位置，是**畫面座標**；
但元素資料要寫回的，是**邏輯座標**。

如果不做換算，資料一定會錯。

---

## 1. `Canvas/index.vue` 裡的雙擊新增文字

在 `handleDblClick` 裡，PPTist 大致做了這幾步：

```ts
const viewportRect = viewportRef.getBoundingClientRect()

const left = (e.pageX - viewportRect.x) / canvasScale
const top = (e.pageY - viewportRect.y) / canvasScale
```

這裡背後的意思是：

### 第一步：先扣掉畫布左上角偏移
不然你拿到的只是整個頁面上的位置，還不是相對於畫布左上角的位置。

### 第二步：再除以 `canvasScale`
因為事件先拿到的是縮放後的畫面距離，
而資料要存的是未縮放前的邏輯距離。

---

## 2. 核心公式其實只有一條

你可以直接記：

```ts
邏輯座標 = 相對於畫布左上角的畫面座標 / canvasScale
```

如果目前畫布縮成 `0.5` 倍：

* 畫面上量到 `50`
* 代表邏輯畫布裡其實是 `100`

因為：

```ts
100 * 0.5 = 50
```

所以回寫時一定要反推回去：

```ts
50 / 0.5 = 100
```

---

## 3. 為什麼建立文字時，寬度也要除以 `canvasScale`

`handleDblClick` 裡還有一個很值得注意的細節：

```ts
width: 200 / canvasScale
```

這代表程式不是想把資料寬度固定寫成 200，
而是想讓它在目前畫面上看起來接近固定的視覺寬度。

也就是說：

* 畫面上想要看起來差不多寬
* 但資料仍然要存成邏輯寬度

所以當前縮放越小，實際存進資料的邏輯寬度就要越大，
這樣縮回畫面後，視覺寬度才會一致。

這是一個很典型的畫布系統思路：

> **你要維持的是畫面操作體驗，但資料仍然必須回到邏輯座標系裡。**

---

# 六、元素為什麼永遠用邏輯座標渲染

在 `Canvas/index.vue` 裡，`EditableElement` 接到的是每個元素的資料。

而這些資料本質上就是：

* `left`
* `top`
* `width`
* `height`
* `rotate`
* 其他樣式與行為設定

也就是說，元素本身拿到的是：

> **邏輯資料**

不是：

> **現在螢幕上看起來幾個像素**

所以你在看元素渲染時，腦中一定要有這個觀念：

* 元素不需要自己知道「畫布現在縮成幾倍」
* 元素只要照邏輯座標畫在 `viewport` 上
* 至於現在實際畫面看起來多大，交給 `viewport` 的縮放與 wrapper 的外框處理

這也是畫布系統分層的關鍵好處：

> **元素只關心資料，畫布層才關心顯示映射。**

---

# 七、把整套流程串成一條完整主線

到這裡，可以把 PPTist 的畫布系統壓成下面這條流程：

```text
slides.ts
  定義邏輯畫布基準（viewportSize / viewportRatio）
    ->
main.ts
  保存畫布顯示策略（canvasPercentage / canvasScale）
    ->
useScaleCanvas.ts
  調整顯示百分比
    ->
useViewportSize.ts
  根據容器大小與比例，計算真正的 canvasScale、left、top
    ->
Canvas/index.vue
  用 viewport-wrapper 承接顯示外框
  用 viewport 保留固定邏輯畫布並做 scale
  用事件把畫面座標換回邏輯座標
```

這條流程如果你能講順，代表你已經不只是「看過 source」，而是真的懂它在幹嘛。

---

# 八、常見混淆點

## 1. `viewportSize` 不是現在畫面上的寬度
它是邏輯畫布的寬度基準。

---

## 2. `canvasPercentage` 不等於 `canvasScale`
前者是顯示目標，後者是實際縮放結果。

---

## 3. `viewport-wrapper` 不是重複包一層
它是縮放後顯示外框與多圖層定位的共同基準。

---

## 4. `transform: scale()` 改的是畫面，不是資料
資料裡的 `left / top / width / height` 不會因為縮放而自動改值。

---

## 5. 滑鼠事件拿到的是畫面座標，不是邏輯座標
要回寫資料前，一定要先做座標換算。

---

## 6. 拖曳整張畫布，不是在改元素位置
它改的是 `viewportLeft / viewportTop`，也就是整張畫布顯示外框的位置。

---

# 九、30 秒速查

如果你之後只想快速複習，可以直接記這幾句：

* PPTist 先用 `viewportSize = 1000`、`viewportRatio = 0.5625` 定義固定邏輯畫布
* 畫面顯示大小不是直接改資料，而是透過 `canvasScale` 把整張畫布縮放後顯示
* `canvasPercentage` 是顯示目標，`canvasScale` 是真正計算出的縮放倍率
* `viewport` 保留固定邏輯尺寸，`viewport-wrapper` 承接縮放後的顯示外框與位置
* 滑鼠事件先拿到畫面座標，回寫資料時必須換回邏輯座標
* 核心公式就是：

```ts
邏輯座標 = 相對於畫布左上角的畫面座標 / canvasScale
```

---

# 十、你之後再讀原始碼，建議怎麼看

建議你照下面順序讀：

1. `doc/Canvas.md`  
   先建立作者原本想表達的畫布模型

2. `src/store/slides.ts`  
   看邏輯畫布基準值從哪裡來

3. `src/store/main.ts`  
   看畫布顯示狀態有哪些

4. `src/hooks/useScaleCanvas.ts`  
   看使用者調整縮放時，系統先改了什麼

5. `src/views/Editor/Canvas/hooks/useViewportSize.ts`  
   看真正的縮放與定位是怎麼算的

6. `src/views/Editor/Canvas/index.vue`  
   最後再回頭看 DOM 結構與事件處理

這樣讀，你比較不會一上來就被 template 和一堆 hook 淹掉。

---

# 一句話總結整套畫布系統

> **PPTist 先用固定尺寸的邏輯畫布保存資料，再把這張畫布縮放到畫面上；所有互動最後都要換回同一套邏輯座標系處理。**

---