可以，這一節真正要補強的，不只是把「操作路徑」列出來，而是要先講清楚：

> **為什麼 `PPTist` 不讓使用者操作直接去改 DOM 樣式或直接硬改 `canvasScale`，而是先改上游狀態，再交給畫布系統接手。** ([GitHub][1])

下面這版會更清楚，也更貼近目前原始碼。

---

# 七、使用者操作是怎麼把這條鏈路帶起來的

## 先講原理

如果只記：

> `watcher` 會觸發

其實還是不夠。

因為那樣只看到了**下游反應**，卻還沒看到**上游是誰先動**。
更完整的理解應該是：

> **真正把這條鏈路帶起來的，通常不是某個神秘的自動事件，**
> **而是使用者操作先改了「上游狀態」或「外部條件」，**
> **接著 `useViewportSize.ts` 再依這些變化去重算或更新畫布。** ([GitHub][1])

換句話說，`PPTist` 的思路不是：

```text
使用者操作
-> 直接改 DOM 寬高 / transform / left / top
```

而是：

```text
使用者操作
-> 先改上游狀態或外部條件
-> useViewportSize.ts 接手
-> 重算 / 更新 canvasScale 與 viewport 位置
-> Canvas/index.vue 依最新狀態顯示
```

這樣設計的好處是，所有不同操作入口最後都能收斂到同一套畫布幾何邏輯。
不管你是滑鼠縮放、按鈕縮放、手動輸入比例，還是容器尺寸變了，最後都不需要各自重寫一套「畫布應該怎麼擺」的程式，而是交給 `useViewportSize.ts` 統一處理。這也是它把 `canvasPercentage`、`canvasScale`、`canvasDragged` 放在 store，再由 hook 消費的真正價值。 ([GitHub][1])

所以這一節最重要的，不是背幾條 watcher，
而是先抓住下面這句話：

> **使用者操作通常不直接命令畫布「請變成某個樣子」，**
> **而是先改變意圖、狀態，或環境條件；**
> **真正把這些條件翻譯成 `canvasScale`、`left`、`top` 的，是畫布 hook。** ([GitHub][1])

---

## 再對回 Source

更貼近目前 `PPTist` source 的說法，可以把常見入口拆成三類：

1. **改顯示意圖**：例如放大 / 縮小
2. **要求回到預設狀態**：例如重置畫布
3. **改變外部顯示環境**：例如容器尺寸變動

這三類入口雖然表面上不一樣，但最後都會把變化送進 `useViewportSize.ts`，只是走的入口不同：前兩類多半先改 store，第三類則是透過 `ResizeObserver` 這種環境事件進來。 ([GitHub][1])

---

### 1. 放大 / 縮小畫布：先改「顯示意圖」，再讓系統換算結果

這一類操作最能看出 `PPTist` 的設計思路。

在 `Canvas/index.vue` 裡，畫布容器綁了 `wheel` 事件；當 `ctrlKeyState` 成立時，`handleMousewheelCanvas()` 不會直接去改 `canvasScale`，而是呼叫 `throttleScaleCanvas('+')` 或 `throttleScaleCanvas('-')`。而 `throttleScaleCanvas` 本質上包的就是 `useScaleCanvas()` 裡的 `scaleCanvas()`。 ([GitHub][2])

更關鍵的是，`scaleCanvas()` 做的事不是 `setCanvasScale(...)`，而是 `setCanvasPercentage(...)`。也就是說，使用者的放大 / 縮小操作，先改掉的是：

> **我希望畫布在容器裡看起來更大或更小**

而不是：

> **我要直接把倍率改成某個值**。 ([GitHub][1])

所以這條鏈路更精準地應該寫成：

```text
Ctrl + 滾輪
-> scaleCanvas('+/-')
-> setCanvasPercentage(...)
-> watch(canvasPercentage, setViewportPosition)
-> 重新換算 canvasScale
-> 同步修正 viewportLeft / viewportTop
-> Canvas/index.vue 依新狀態更新畫面
```

這裡最值得強調的設計點是：

> **放大 / 縮小不是直接命令畫布去改樣式，**
> **而是先改「顯示目標」，再讓畫布系統自己把這個意圖翻譯成真正的倍率與位置。** ([GitHub][1])

這樣做的好處是，縮放入口可以很多，但幾何邏輯只有一套。
所以不只是 `Ctrl + 滾輪`，連工具列放大 / 縮小、手動輸入比例，本質上也都應該被理解成「先改顯示意圖，再交給 `useViewportSize.ts`」。這正是 `setCanvasScalePercentage()` 也要先回推 `canvasPercentage` 的原因。 ([GitHub][1])

---

### 2. 重置畫布：不是直接重設樣式，而是改狀態讓既有鏈路接手

`resetCanvas()` 是另一個很值得單獨講的例子。

在 `useScaleCanvas.ts` 裡，`resetCanvas()` 不是直接去改 `viewportLeft`、`viewportTop`、`transform`，而是做兩件事：

* 把 `canvasPercentage` 設回 `90`
* 視情況把 `canvasDragged` 設回 `false` ([GitHub][1])

這個設計很重要，因為它代表：

> **重置畫布不是一個「單點命令，直接把所有樣式改完」的流程；**
> **它其實是在修改 store 狀態，然後把後續的倍率與位置處理交回 `useViewportSize.ts`。** ([GitHub][1])

也就是說，`resetCanvas()` 自己不是畫布幾何的終點，
它比較像是發出兩個上游訊號：

1. 顯示目標回到預設值
2. 拖曳狀態回到未拖曳狀態

接著 `useViewportSize.ts` 再透過：

* `watch(canvasPercentage, setViewportPosition)`
* `watch(canvasDragged, () => { if (!canvasDragged.value) initViewportPosition() })`

把畫布拉回合理的倍率與位置。 ([GitHub][1])

所以更貼近 source 的講法應該是：

```text
resetCanvas()
-> setCanvasPercentage(90)
-> setCanvasDragged(false)
-> useViewportSize.ts 的 watcher 接手
-> 視情況走更新型路徑或重置型路徑
-> 畫面回到預設縮放與位置
```

這樣寫，才真的把「重置」的設計說清楚。 ([GitHub][1])

---

### 3. 容器尺寸改變：不是改 store，而是改變「外部條件」

前兩類入口都是先改 store 狀態。
但容器尺寸改變不一樣，它不是某個 `setXXX()` 先動，而是外部顯示環境變了。

在 `useViewportSize.ts` 裡，這條線是透過 `ResizeObserver(initViewportPosition)` 建起來的；`onMounted()` 時開始觀察 `canvasRef.value`，只要 canvas 容器尺寸變動，就會呼叫 `initViewportPosition()`。 ([GitHub][3])

所以這條鏈路更精準地寫是：

```text
canvasRef 尺寸變動
-> ResizeObserver(initViewportPosition)
-> 重新判斷寬度 / 高度基準
-> 重算 canvasScale
-> 重算 viewportLeft / viewportTop
-> Canvas/index.vue 依新狀態更新畫面
```

這一類情況最值得講清楚的設計點是：

> **不是所有鏈路都一定由 store mutation 開始；**
> **有些鏈路的起點其實是「外部條件變了」，**
> **而 `useViewportSize.ts` 正是負責把這些外部條件重新翻譯成畫布幾何結果的地方。** ([GitHub][3])

所以像視窗大小改變、編輯區寬度變動、側邊欄展開收合導致 canvas 可用空間變化，從畫布系統角度看，本質上都屬於同一類：

> **外部環境變動 → 觸發重置型重算。** ([GitHub][3])

---

## 這一節最值得記住的一句話

你可以直接把這段記成：

> **使用者操作通常不直接改畫布最終樣式；**
> **它們先改的是「顯示意圖」、「重置狀態」或「外部條件」，**
> **再由 `useViewportSize.ts` 把這些上游變化翻譯成真正的 `canvasScale`、`viewportLeft`、`viewportTop`。** ([GitHub][1])

---

如果你願意，我可以把 **第七章到第八章** 一起順一遍，讓整篇的節奏更一致。

[1]: https://raw.githubusercontent.com/pipipi-pikachu/PPTist/master/src/hooks/useScaleCanvas.ts "raw.githubusercontent.com"
[2]: https://github.com/pipipi-pikachu/PPTist/blob/master/src/views/Editor/Canvas/index.vue "PPTist/src/views/Editor/Canvas/index.vue at master · pipipi-pikachu/PPTist · GitHub"
[3]: https://raw.githubusercontent.com/pipipi-pikachu/PPTist/master/src/views/Editor/Canvas/hooks/useViewportSize.ts "raw.githubusercontent.com"
