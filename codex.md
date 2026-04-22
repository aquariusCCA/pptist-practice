# 六、拖曳整張畫布，改的不是元素座標，而是外框位置

這一節要處理的不是「元素怎麼移動」，而是「整個畫布視窗怎麼被平移」。

在 `PPTist` 裡，拖曳整張畫布時改變的不是元素資料本身，而是畫布外框的位置，也就是：

* `viewportLeft`
* `viewportTop`

> 元素的邏輯座標 `left / top` 不會因此改變。

---

## 先講結論

如果你按住 `Space` 再拖曳畫布空白處，系統做的事情其實是：

```text
使用者拖曳畫布
-> 更新 viewportLeft / viewportTop
-> 讓 viewport-wrapper 在螢幕上的位置改變
-> 內層 viewport 的元素內容維持原本邏輯座標
```

所以這裡改的是「看畫布的窗口」的位置，不是畫布內容本身的座標。

---

## 這一層到底是什麼

在 [`PPTist-SourceCode/src/views/Editor/Canvas/index.vue`](./PPTist-SourceCode/src/views/Editor/Canvas/index.vue) 裡，畫布最外層是：

```vue
<div class="canvas" ref="canvasRef">
```

它下面還有兩層：

```vue
<div class="viewport-wrapper" :style="...">
  <div class="viewport" :style="{ transform: `scale(${canvasScale})` }">
    ...
  </div>
</div>
```

這三層要分清楚：

* `canvas`：宿主容器，負責接事件與提供觀察目標
* `viewport-wrapper`：外框位置與實際寬高的承載層
* `viewport`：真正放元素內容、套用 `scale()` 的內容層

所以「拖曳整張畫布」拖的不是 `viewport` 裡的元素，而是 `viewport-wrapper` 在螢幕上的偏移。

---

## 觸發入口在哪裡

入口在 [`PPTist-SourceCode/src/views/Editor/Canvas/index.vue`](./PPTist-SourceCode/src/views/Editor/Canvas/index.vue) 的這段：

```ts
const handleClickBlankArea = (e: MouseEvent) => {
  if (activeElementIdList.value.length) mainStore.setActiveElementIdList([])

  if (!spaceKeyState.value) updateMouseSelection(e)
  else dragViewport(e)
}
```

意思很直接：

* 沒按 `Space`：走框選
* 按了 `Space`：走畫布拖曳

所以這個功能的前置條件不是「拖到元素」，而是「按住 `Space` 後拖曳空白區」。

---

## 真正被改的是什麼

核心在 [`PPTist-SourceCode/src/views/Editor/Canvas/hooks/useViewportSize.ts`](./PPTist-SourceCode/src/views/Editor/Canvas/hooks/useViewportSize.ts) 的 `dragViewport()`：

```ts
const dragViewport = (e: MouseEvent) => {
  let isMouseDown = true

  const startPageX = e.pageX
  const startPageY = e.pageY

  const originLeft = viewportLeft.value
  const originTop = viewportTop.value

  document.onmousemove = e => {
    if (!isMouseDown) return

    const currentPageX = e.pageX
    const currentPageY = e.pageY

    viewportLeft.value = originLeft + (currentPageX - startPageX)
    viewportTop.value = originTop + (currentPageY - startPageY)
  }
}
```

這裡只做兩件事：

* 記住起點座標
* 根據滑鼠移動量更新 `viewportLeft` 和 `viewportTop`

沒有改元素的 `left`、`top`。

---

## 為什麼這樣算是「拖畫布」

因為 `viewportLeft` 和 `viewportTop` 不是元素座標，而是外框座標。

同一個 hook 裡有：

```ts
const viewportStyles = computed(() => ({
  width: viewportSize.value,
  height: viewportSize.value * viewportRatio.value,
  left: viewportLeft.value,
  top: viewportTop.value,
}))
```

這代表：

* `viewportStyles.width / height` 決定畫布視窗大小
* `viewportStyles.left / top` 決定這個視窗在螢幕上的位置

也就是說，拖曳畫布時，改動的是視窗的位置，不是內容資料。

---

## 對照 DOM 會更清楚

在 [`Canvas/index.vue`](./PPTist-SourceCode/src/views/Editor/Canvas/index.vue) 裡，`viewport-wrapper` 的 style 是：

```vue
:style="{
  width: viewportStyles.width * canvasScale + 'px',
  height: viewportStyles.height * canvasScale + 'px',
  left: viewportStyles.left + 'px',
  top: viewportStyles.top + 'px',
}"
```

你可以把它理解成：

* `width / height`：這張畫布視窗本身有多大
* `left / top`：這張畫布視窗在外層容器裡放在哪裡

拖曳整張畫布時，就是把這個外框移走，而不是把裡面的元素一個個搬移。

---

## 元素座標為什麼沒變

元素真正的座標是在資料裡，例如：

* `element.left`
* `element.top`
* `element.width`
* `element.height`

拖曳畫布時沒有去改這些值。

所以結果是：

* 畫布的位置變了
* 元素相對於畫布的位置不變
* 只是使用者在螢幕上看到的位置改變了

這也是為什麼你會覺得「整張畫布被拖走了」，但其實資料沒有被重新定位。

---

## 這和拖元素有什麼不同

這裡最容易混淆的是：

* 拖畫布：改外框位置
* 拖元素：改元素座標

兩者不是同一件事。

拖元素時，會看到像這樣的換算：

```ts
moveX = (currentPageX - startPageX) / canvasScale.value
moveY = (currentPageY - startPageY) / canvasScale.value
```

也就是滑鼠移動要除以 `canvasScale`，再去更新元素位置。

但拖畫布時，沒有這一步。
它只是在改 `viewportLeft / viewportTop`，也就是改容器偏移。

---

## 拖完之後為什麼還要記狀態

`dragViewport()` 在滑鼠放開時會做這件事：

```ts
document.onmouseup = () => {
  isMouseDown = false
  document.onmousemove = null
  document.onmouseup = null

  mainStore.setCanvasDragged(true)
}
```

這個 `canvasDragged` 比較像一個「拖曳完成」的旗標。

它的用途是讓系統知道：

* 這次平移結束了
* 接下來可以視情況重新校正位置

在 [`useViewportSize.ts`](./PPTist-SourceCode/src/views/Editor/Canvas/hooks/useViewportSize.ts) 裡還有：

```ts
watch(canvasDragged, () => {
  if (!canvasDragged.value) initViewportPosition()
})
```

而在 [`PPTist-SourceCode/src/hooks/useScaleCanvas.ts`](./PPTist-SourceCode/src/hooks/useScaleCanvas.ts) 裡，重設畫布時也會把它歸回來：

```ts
const resetCanvas = () => {
  mainStore.setCanvasPercentage(90)
  if (canvasDragged) mainStore.setCanvasDragged(false)
}
```

所以 `canvasDragged` 不是內容座標，它比較像一個操作狀態標記。

---

## 三層座標感

你可以把這件事拆成三個層次：

### 1. 元素座標

```text
element.left / element.top
```

這是資料座標，拖畫布時不變。

### 2. 視窗位置

```text
viewportLeft / viewportTop
```

這是畫布外框在螢幕上的位置，拖畫布時改的是這個。

### 3. 視覺顯示

```text
viewport-wrapper + viewport
```

這是最後畫出來的樣子，會跟著外框位置和 `canvasScale` 一起變。

---

## 一個具體例子

假設：

* 畫布現在位於 `left: 200px, top: 120px`
* 你按住 `Space` 往右拖了 `50px`

那麼結果會是：

```text
viewportLeft = 250px
viewportTop = 120px
```

發生改變的是畫布外框位置。

但如果畫布裡某個元素原本是：

```text
element.left = 300
element.top = 160
```

這兩個值不會因為你拖畫布就變成別的數字。

---

## 可以怎麼記

最簡單的記法是：

```text
拖畫布 = 移動 viewport-wrapper
拖元素 = 修改 element 座標
```

這樣就不會把「視窗平移」和「內容平移」混在一起。

---