# PPTist 畫布系統入門

所屬章節：[03-畫布系統](./README.md)

這篇原本同時承擔兩件事：

- 先把畫布系統的概念講懂
- 再把同一套概念對照回 `PPTist` 的實作

篇幅變長之後，第一次閱讀、複習、回查程式位置都擠在同一篇裡，成本會偏高。  
所以現在把它拆成兩篇，分別處理「概念理解」和「原始碼對照」。

## 建議閱讀順序

1. [畫布系統概念篇（固定座標、縮放與滑鼠換算）](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)
2. [PPTist 畫布系統實作對照篇（viewport-wrapper、viewport、canvasScale）](./PPTist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%AF%A6%E4%BD%9C%E5%B0%8D%E7%85%A7%E7%AF%87%EF%BC%88viewport-wrapper%E3%80%81viewport%E3%80%81canvasScale%EF%BC%89.md)

## 兩篇各自處理什麼

### 1. 概念篇

適合處理：

- 為什麼畫布要用固定邏輯座標
- 為什麼顯示縮放和資料座標要拆開
- 為什麼滑鼠座標要除以 `canvasScale`
- `wrapper + viewport` 兩層到底在分工什麼

如果你現在還在建立整體模型，先讀概念篇。

### 2. 實作對照篇

適合處理：

- `viewportSize`、`viewportRatio` 在哪裡來
- `viewport-wrapper`、`viewport` 在實作裡各做什麼
- `canvasScale` 在原始碼裡怎麼算
- 哪些互動邏輯會一直把座標除以 `canvasScale`

如果你已經懂概念，只是想對照 `PPTist` 原始碼，直接讀實作對照篇。

## 高頻回查入口

- 想先建立整體概念：看 [畫布系統概念篇](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)
- 想確認 `canvasScale` 怎麼算：看 [實作對照篇的 `5. canvasScale 怎麼算出來`](./PPTist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%AF%A6%E4%BD%9C%E5%B0%8D%E7%85%A7%E7%AF%87%EF%BC%88viewport-wrapper%E3%80%81viewport%E3%80%81canvasScale%EF%BC%89.md#5-canvasscale-怎麼算出來)
- 想確認滑鼠座標如何換回邏輯座標：看 [概念篇的 `例子 3：滑鼠為什麼要除以 canvasScale`](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md#例子-3滑鼠為什麼要除以-canvasscale)
- 想確認 `viewport-wrapper` 與 `viewport` 的分工：看 [概念篇的 `範例 2：把邏輯畫布縮放後顯示到畫面`](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md#範例-2把邏輯畫布縮放後顯示到畫面)

## 下一步建議

1. 先讀 [畫布系統概念篇（固定座標、縮放與滑鼠換算）](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)
2. 再讀 [PPTist 畫布系統實作對照篇（viewport-wrapper、viewport、canvasScale）](./PPTist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%AF%A6%E4%BD%9C%E5%B0%8D%E7%85%A7%E7%AF%87%EF%BC%88viewport-wrapper%E3%80%81viewport%E3%80%81canvasScale%EF%BC%89.md)
3. 接著看 [縮圖元件設計筆記](../04-縮圖系統/縮圖元件設計筆記.md)
