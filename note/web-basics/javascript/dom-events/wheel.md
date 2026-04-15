# wheel：滾輪事件

`wheel` 是原生的滾輪事件，屬於 `Wheel Event`，不是 Pointer Events。

## 重點

- 它代表使用者滾動裝置的輸入
- 它常用來做縮放
- 如果要阻止預設捲動，通常要搭配 `preventDefault()`

## 常用欄位

| 欄位 | 說明 | 在畫布互動中的用途 |
| --- | --- | --- |
| `event.deltaY` | 垂直滾動量。往上滾通常是負值，往下滾通常是正值。 | 最常拿來決定要放大還是縮小。 |
| `event.deltaX` | 水平滾動量。 | 在支援橫向滾動或特殊控制時會用到。 |
| `event.deltaMode` | delta 的單位模式。可能是 pixel、line 或 page。 | 需要做跨裝置相容時，用來判斷 delta 的意義。 |
| `event.clientX` / `event.clientY` | 滾輪發生時游標所在的視窗座標。 | 可以拿來做以游標為中心的縮放錨點。 |

### 這些欄位怎麼一起看

最常見的流程是：

1. 先看 `deltaY` 判斷縮放方向
2. 再看 `clientX/clientY` 找縮放錨點
3. 必要時考慮 `deltaMode`

## 範例

對應 demo：

- [wheel.html](./demos/wheel.html)

```ts
stage.addEventListener('wheel', (event) => {
  event.preventDefault()

  const delta = event.deltaY < 0 ? 1.08 : 0.92
  zoom = Math.min(Math.max(zoom * delta, 0.4), 2.4)
}, { passive: false })
```

這種寫法最常見的用途是：

- 攔截預設捲動
- 改成畫布縮放
- 以游標位置為中心做視角控制

## 和 `WorkspaceStage.vue` 的對應

`WorkspaceStage.vue` 用 `@wheel.prevent` 把滑鼠滾輪解讀成畫布縮放輸入，這是畫布、地圖與攝影機視角常見的互動模式。

