# `canvas-system-demo` 的 `zoomAroundPoint()`：縮放時如何把滑鼠指到的點釘住

這份筆記只回答一件事：

> 當你在某個點上縮放畫布時，為什麼要同時調整 `pan`，以及 `pan` 到底怎麼算？

如果你覺得公式很抽象，先記住一句話：

> `zoom` 會把內容放大或縮小，`pan` 的工作是把縮放後「跑掉的那個點」補回來。

相關程式碼：

- [`WorkspaceStage.vue`](../src/components/WorkspaceStage.vue)
- [`workspaceMath.ts`](../src/utils/workspaceMath.ts)
- [`CanvasBoard.vue`](../src/components/CanvasBoard.vue)

## 先看整體結構

這個 demo 可以先拆成三個東西：

1. `stage`
   - 外層舞台
   - 滑鼠事件和座標計算都以它為參考

2. `board`
   - 真正被縮放、平移的內容層
   - `pan` 和 `zoom` 都作用在它身上

3. `logical point`
   - 內容本身的座標
   - 例如 `(150, 0)` 這種點，代表內容裡的一個固定位置

`CanvasBoard.vue` 的 transform 長這樣：

```ts
transform: `translate3d(calc(-50% + ${props.panX}px), calc(-50% + ${props.panY}px), 0) scale(${props.zoom})`
```

你可以先把它想成：

```txt
先把 board 放到 stage 中心
再用 pan 微調位置
最後用 zoom 做縮放
```

## 先用圖理解

下面先只看 X 軸，Y 軸完全同理。

假設 stage 寬度是 `1000px`，中心點是 `500`。

### 1. 滑鼠指在中心右邊 `150px`

```txt
0                         500                         1000
|-------------------------|---------------------------|
                          center
                                                     anchor
                                                     650
```

所以：

```txt
stageCenter = 500
anchor = 650
anchorOffset = anchor - stageCenter = 150
```

這代表滑鼠點在「中心右邊 150px」。

### 2. zoom = 1 時，點在原位

如果目前：

```txt
currentPan = 0
currentZoom = 1
anchorOffset = 150
```

那麼這個點的螢幕位置可以寫成：

```txt
screen = stageCenter + pan + logical * zoom
       = 500 + 0 + 150 * 1
       = 650
```

圖像是這樣：

```txt
0                         500                         650
|-------------------------|---------------------------|
                          center                      point
```

### 3. zoom = 2 但 pan 不變時，點會跑掉

如果只把 zoom 改成 `2`，但 `pan` 不改：

```txt
screen = 500 + 0 + 150 * 2
       = 800
```

圖像變成：

```txt
0                         500                         650                         800
|-------------------------|---------------------------|---------------------------|
                          center                      原本的點                    放大後跑掉的位置
```

這就是縮放時最直觀的問題：

> 點被放大了，所以它的位置不再停在原本滑鼠指到的地方。

## 為什麼要改 pan

我們希望縮放前後，滑鼠指到的那個點都留在同一個螢幕位置。

所以縮放後不能只改 `zoom`，還要順便改 `pan`。

目標是讓這個式子成立：

```txt
原本的位置 = 縮放後的位置
```

也就是：

```txt
stageCenter + currentPan + logical * currentZoom
=
stageCenter + nextPan + logical * nextZoom
```

## 公式怎麼來

這一段慢慢看，不要急著看結論。  
我們的目標很單純：

> 縮放前後，滑鼠指到的那個點要停在同一個位置。

先只看 X 軸，Y 軸完全一樣。

### 1. 先畫出縮放前的狀態

假設：

- `stageCenterX = 500`
- `anchorOffsetX = 150`
- `currentPan.x = 0`
- `currentZoom = 1`

圖可以先想成這樣：

```txt
0                         500                         650
|-------------------------|---------------------------|
                          center                      anchor
```

把這個點寫成公式：

```txt
anchorOffsetX = currentPan.x + logicalX * currentZoom
```

這句話的意思是：

- `currentPan.x` 是整體偏移
- `logicalX * currentZoom` 是內容本身縮放後的位置

### 2. 把 `logicalX` 解出來

從上一式移項：

```txt
logicalX = (anchorOffsetX - currentPan.x) / currentZoom
```

這一步的圖像意思是：

```txt
anchorOffsetX
      |
      |  扣掉 currentPan.x
      v
logicalX * currentZoom
```

### 3. 再畫出縮放後的狀態

縮放後，我們希望同一個點還留在原本的位置，所以仍然要滿足：

```txt
anchorOffsetX = nextPan.x + logicalX * nextZoom
```

圖像可以理解成：

```txt
0                         500                         650
|-------------------------|---------------------------|
                          center                      anchor
                         (要維持不動)
```

### 4. 把 `logicalX` 代回去

把第 2 步的結果代入第 3 步：

```txt
anchorOffsetX = nextPan.x + ((anchorOffsetX - currentPan.x) / currentZoom) * nextZoom
```

這時候你先不要急著整理，先看它的意思：

```txt
縮放後的位置
=
新的 pan
+ 原本內容位置 * 新 zoom
```

### 5. 解出 `nextPan.x`

把上式整理成 `nextPan.x`：

```txt
nextPan.x = anchorOffsetX - ((anchorOffsetX - currentPan.x) / currentZoom) * nextZoom
```

再把比例整理成：

```txt
zoomRatio = nextZoom / currentZoom
```

代回去：

```txt
nextPan.x = anchorOffsetX - (anchorOffsetX - currentPan.x) * zoomRatio
```

圖上可以這樣想：

```txt
原本距離中心的偏移量
       |
       |  乘上 zoomRatio
       v
縮放後的新位置
       |
       |  用 pan 補回差值
       v
最後回到 anchorOffsetX
```

### 6. 寫成程式碼

所以 `workspaceMath.ts` 裡的寫法就是：

```ts
const zoomRatio = nextZoom / (currentZoom || 1)

return {
  x: currentPan.x + (anchorOffsetX - currentPan.x) * (1 - zoomRatio),
  y: currentPan.y + (anchorOffsetY - currentPan.y) * (1 - zoomRatio),
}
```

這和上面的式子是同一件事，只是換了一種整理方式：

```txt
nextPan = anchorOffset - (anchorOffset - currentPan) * zoomRatio
```

等價於：

```txt
nextPan = currentPan + (anchorOffset - currentPan) * (1 - zoomRatio)
```

### 7. 最後用一張小圖收尾

```txt
縮放前：

0                         500                         650
|-------------------------|---------------------------|
                          center                      anchor

縮放後如果不補 pan：

0                         500                         650                         800
|-------------------------|---------------------------|---------------------------|
                          center                      原點                        跑掉

縮放後補 pan：

0                         350      500                         650
|-------------------------|--------|---------------------------|
                        board左移  center                      anchor
```

一句話總結：

> 放大後會跑掉多少，就用 `pan` 把它拉回來多少。

## 用圖看 `pan` 的補償

### zoom 放大前

```txt
stage center                    anchorOffset = 150
500                             650
|-------------------------------|
```

### zoom 放大後，如果不補 pan

```txt
stage center                    point 會被放大到更右邊
500                             800
|-------------------------------|
```

### zoom 放大後，補上反方向的 pan

```txt
stage center        board 往左移 150        anchor 還留在原位
500                 350                     650
|-------------------|-----------------------|
```

你可以把它想成：

```txt
放大造成的位移 = 往外擴
pan 的工作 = 往反方向拉回來
```

## 最直覺的數字例子

假設：

```txt
stageSize.width = 1000
stageSize.height = 600
stageCenter = (500, 300)
anchor = (650, 300)
currentPan = (0, 0)
currentZoom = 1
nextZoom = 2
```

先算 `anchorOffset`：

```txt
anchorOffsetX = 650 - 500 = 150
anchorOffsetY = 300 - 300 = 0
```

再算 `zoomRatio`：

```txt
zoomRatio = 2 / 1 = 2
```

代回公式：

```txt
nextPanX = 0 + (150 - 0) * (1 - 2) = -150
nextPanY = 0 + (0 - 0) * (1 - 2) = 0
```

所以結果是：

```txt
nextPan = (-150, 0)
nextZoom = 2
```

這表示：

- 內容放大 2 倍
- 同時往左補 `150px`
- 讓滑鼠指到的點還是留在原位

## 為什麼 `1 - zoomRatio` 會變負數

當你是放大，也就是：

```txt
nextZoom > currentZoom
```

那麼：

```txt
zoomRatio > 1
1 - zoomRatio < 0
```

所以結果會是反方向的位移。

這不是錯誤，而是刻意的補償：

```txt
放大往外跑
pan 往反方向拉回
```

## `stageRef` 的角色

`stageRef` 的用途不是「拿來縮放」，而是拿來算座標。

在 `handleWheel()` 裡，它主要做三件事：

1. 取得 stage 的實際 DOM 位置
2. 把滑鼠的 `clientX / clientY` 轉成 stage 內座標
3. 交給 `zoomAroundPoint()` 算新的 `pan`

你可以把它理解成：

```txt
滑鼠在螢幕上的座標
   -> 轉成 stage 內座標
   -> 再轉成縮放要釘住的 anchor
```

## `handleWheel()` 在做什麼

`WorkspaceStage.vue` 裡的 wheel 流程大概是這樣：

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

你可以把它拆成四步：

```txt
1. 算出 nextZoom
2. 算出滑鼠在 stage 裡的 anchor
3. 用 zoomAroundPoint() 算 nextPan
4. 同時更新 pan 和 zoom
```

## 跟 `zoomBy()` 的差別

`zoomBy()` 只負責改 `zoom`，不負責改 `pan`。

`handleWheel()` 則是：

- 改 `zoom`
- 同時改 `pan`
- 保持滑鼠下的點不動

所以它們不是同一件事。

可以直接記成：

```txt
zoomBy() = 只調倍率
zoomAroundPoint() = 調倍率 + 補償位移
```

## 一句話總結

`zoomAroundPoint()` 不是在算「神秘座標」，它只是把這件事做完：

> 讓縮放後的畫面，仍然把滑鼠指到的那個點固定在原本的位置。
