**結論先行**
`transform: scale(0.12)` 只會「把整棵子樹在繪製階段縮小到 12 %」，**不會改動任何元素的 CSS 寬、高、top、left 的計算值**。也就是說：

| 試圖取得的屬性                      | 你會拿到的數字                              | 為什麼                                                                          |
| ---------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| `offsetWidth / offsetHeight` | 1000 × 562.5（或 585 × 56）             | 取自 **佈局層**（layout）；縮放前的盒模型尺寸。([Stack Overflow][1])                           |
| `getBoundingClientRect()`    | 1000×0.12 = 120<br>562.5×0.12 = 67.5 | 取自 **視覺層**（visual）；包含 transform 後的實際像素框。([JustMarkup][2], [MDN Web Docs][3]) |

---

## 用實際數字拆給你看

```html
<div class="elements"
     style="width:1000px;height:562.5px;transform:scale(0.12)">
  <div class="base-element-text"
       style="top:253.25px;left:355px;width:585px;height:56px;"></div>
</div>
```

| 階段                        | 父層 `.elements`                                         | 子層 `.base-element-text`                                                                                                          |
| ------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Layout (排版完成後)**        | 1000 × 562.5                                           | (top = 253.25, left = 355)<br>585 × 56                                                                                           |
| **Visual (加上 transform)** | 1000 × 0.12 = **120 px**<br>562.5 × 0.12 = **67.5 px** | top: 253.25 × 0.12 ≈ **30.39 px**<br>left: 355 × 0.12 ≈ **42.6 px**<br>寬: 585 × 0.12 ≈ **70.2 px**<br>高: 56 × 0.12 ≈ **6.72 px** |

> **重點**：CSS 仍把它們當成 1000×562.5、585×56 來參與排版；只有渲染管線最後一步把整個像素圖層乘以 0.12。

---

## 可能踩到的三個坑

1. **兄弟元素的碰撞**
   因為盒模型尺寸沒變，小尺寸縮圖旁邊如果還有兄弟元素，實際上會被 1000×562.5 的「隱形大盒子」擋住。

2. **事件座標與命中測試**

   * 滑鼠點擊、觸控命中範圍按 **視覺尺寸** 判斷。
   * 但用程式讀 `offsetX / offsetY` 取到的仍是未縮放座標，容易搞混。

3. **想拿縮放後尺寸來排版**
   若需要依據 *縮放後* 大小再排其他東西，必須用 `getBoundingClientRect()` 或 `ResizeObserver` 抓視覺尺寸，而不是 `offsetWidth`。

---

## 小建議

| 問題           | 建議做法                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| 縮圖佔位過大       | 把 `.thumbnail-slide`（外層容器）寬高設成目標尺寸，並讓 `.elements` 以 `position:absolute` 疊在裡面。這樣不會撐大父層排版。 |
| 需同時考慮 Retina | 以 `scale()` 控制版面，而用 `width/height`（或 `image-set()`）提供高解析度素材，避免縮過頭變霧。                     |
| 需動態讀尺寸       | 使用 `element.getBoundingClientRect()` 或 `ResizeObserver` 監聽，取得真實視覺框再行計算。                  |

---

### 一句話總結

`transform: scale(0.12)` **視覺縮小、排版不變**。內部元素的「CSS 寬高」依舊是原值，只是最後在顯示器上以 12 % 的比例繪出。

[1]: https://stackoverflow.com/questions/32835144/css-transform-scale-does-not-change-dom-size/32835258?utm_source=chatgpt.com "CSS transform: scale does not change DOM size?"
[2]: https://justmarkup.com/articles/2015-11-27-scale-an-element-without-changing-the-size-of-its-child-elements/?utm_source=chatgpt.com "Scale an element without changing the size of its child elements"
[3]: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale?utm_source=chatgpt.com "scale() - CSS - MDN Web Docs - Mozilla"
