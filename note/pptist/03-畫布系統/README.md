# 03-畫布系統

本章主要整理 `PPTist` 畫布的固定座標系、縮放與渲染思路。這是後續讀縮圖、播放頁與元素互動前的前置章節。

## 本章在學什麼

- 為什麼畫布要用固定邏輯寬度
- `viewportSize` 與 `viewportRatio` 的角色
- `scale` 如何解耦邏輯尺寸與實際容器尺寸
- `canvasScale`、`store`、多場景顯示之間怎麼串成同一條鏈路

## 建議閱讀順序

1. [PPTist 畫布系統入門](./0.%20pptist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
2. [畫布系統概念篇（固定座標、縮放與滑鼠換算）](./1.%20%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87.md)
3. [PPTist 畫布系統實作對照篇（viewport-wrapper、viewport、canvasScale）](./2.%20PPTist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%AF%A6%E4%BD%9C%E5%B0%8D%E7%85%A7%E7%AF%87%EF%BC%88viewport-wrapper%E3%80%81viewport%E3%80%81canvasScale%EF%BC%89.md)
4. [PPTist 畫布定位篇（viewportStyles、置中公式、可視區定位）](./3.%20PPTist%20%E7%95%AB%E5%B8%83%E5%AE%9A%E4%BD%8D%E7%AF%87%EF%BC%88viewportStyles%E3%80%81%E7%BD%AE%E4%B8%AD%E5%85%AC%E5%BC%8F%E3%80%81%E5%8F%AF%E8%A6%96%E5%8D%80%E5%AE%9A%E4%BD%8D%EF%BC%89.md)
5. [PPTist 畫布縮放鏈路篇（canvasScale 的計算、重算與更新流）](./4.%20PPTist%20%E7%95%AB%E5%B8%83%E7%B8%AE%E6%94%BE%E9%8F%88%E8%B7%AF%E7%AF%87%EF%BC%88canvasScale%20%E7%9A%84%E8%A8%88%E7%AE%97%E3%80%81%E9%87%8D%E7%AE%97%E8%88%87%E6%9B%B4%E6%96%B0%E6%B5%81%EF%BC%89.md)
6. [PPTist store 與資料流篇（誰負責什麼、資料怎麼流、誰才是 source of truth）](./7.%20PPTist%20store%20%E8%88%87%E8%B3%87%E6%96%99%E6%B5%81%E7%AF%87.md)
7. [PPTist 多場景共用篇（主畫布、縮圖、播放頁如何共用同一套邏輯模型）](./8.%20PPTist%20%E5%A4%9A%E5%A0%B4%E6%99%AF%E5%85%B1%E7%94%A8%E7%AF%87.md)

## 高頻回查入口

- 想先建立整體概念時，看：[畫布系統概念篇（固定座標、縮放與滑鼠換算）](./1.%20%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87.md)
- 想確認 16:9 在這套系統裡怎麼計算時，看：[畫布系統概念篇（固定座標、縮放與滑鼠換算）](./1.%20%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87.md)
- 想確認點擊座標如何還原回世界座標時，看：[畫布系統概念篇（固定座標、縮放與滑鼠換算）](./1.%20%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87.md)
- 想對照 `viewport-wrapper`、`viewport`、`canvasScale` 在原始碼裡的角色時，看：[PPTist 畫布系統實作對照篇（viewport-wrapper、viewport、canvasScale）](./2.%20PPTist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%AF%A6%E4%BD%9C%E5%B0%8D%E7%85%A7%E7%AF%87%EF%BC%88viewport-wrapper%E3%80%81viewport%E3%80%81canvasScale%EF%BC%89.md)
- 想確認 `viewportStyles`、置中公式和外層定位怎麼分工時，看：[PPTist 畫布定位篇（viewportStyles、置中公式、可視區定位）](./3.%20PPTist%20%E7%95%AB%E5%B8%83%E5%AE%9A%E4%BD%8D%E7%AF%87%EF%BC%88viewportStyles%E3%80%81%E7%BD%AE%E4%B8%AD%E5%85%AC%E5%BC%8F%E3%80%81%E5%8F%AF%E8%A6%96%E5%8D%80%E5%AE%9A%E4%BD%8D%EF%BC%89.md)
- 想確認 `canvasScale` 是怎麼被算出、重算並傳到畫面上的，看：[PPTist 畫布縮放鏈路篇（canvasScale 的計算、重算與更新流）](./4.%20PPTist%20%E7%95%AB%E5%B8%83%E7%B8%AE%E6%94%BE%E9%8F%88%E8%B7%AF%E7%AF%87%EF%BC%88canvasScale%20%E7%9A%84%E8%A8%88%E7%AE%97%E3%80%81%E9%87%8D%E7%AE%97%E8%88%87%E6%9B%B4%E6%96%B0%E6%B5%81%EF%BC%89.md)
- 想確認誰在管邏輯畫布、誰在管顯示倍率、誰只是互動消費端時，看：[PPTist store 與資料流篇（誰負責什麼、資料怎麼流、誰才是 source of truth）](./7.%20PPTist%20store%20%E8%88%87%E8%B3%87%E6%96%99%E6%B5%81%E7%AF%87.md)
- 想確認主畫布、縮圖、播放頁為什麼能共用同一套資料模型時，看：[PPTist 多場景共用篇（主畫布、縮圖、播放頁如何共用同一套邏輯模型）](./8.%20PPTist%20%E5%A4%9A%E5%A0%B4%E6%99%AF%E5%85%B1%E7%94%A8%E7%AF%87.md)

## 補充工作區

- 想用可互動 demo 驗證 `zoom / pan / fit / pointer` 時，看：[canvas-system-demo](./canvas-system-demo/README.md)

## 返回上層

- [回到 PPTist 導航](../README.md)
