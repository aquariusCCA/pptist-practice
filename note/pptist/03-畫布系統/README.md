# 03-畫布系統

本章主要整理 `PPTist` 畫布的固定座標系、縮放與渲染思路。這是後續讀縮圖、播放頁與元素互動前的前置章節。

## 本章在學什麼

- 為什麼畫布要用固定邏輯寬度
- `viewportSize` 與 `viewportRatio` 的角色
- `scale` 如何解耦邏輯尺寸與實際容器尺寸

## 建議閱讀順序

1. [PPTist 畫布系統入門](./pptist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
2. [畫布系統概念篇（固定座標、縮放與滑鼠換算）](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)
3. [PPTist 畫布系統實作對照篇（viewport-wrapper、viewport、canvasScale）](./PPTist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%AF%A6%E4%BD%9C%E5%B0%8D%E7%85%A7%E7%AF%87%EF%BC%88viewport-wrapper%E3%80%81viewport%E3%80%81canvasScale%EF%BC%89.md)

## 高頻回查入口

- 想先建立整體概念時，看：[畫布系統概念篇（固定座標、縮放與滑鼠換算）](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)
- 想確認 16:9 在這套系統裡怎麼計算時，看：[畫布系統概念篇（固定座標、縮放與滑鼠換算）](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)
- 想確認點擊座標如何還原回世界座標時，看：[畫布系統概念篇（固定座標、縮放與滑鼠換算）](./%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E6%A6%82%E5%BF%B5%E7%AF%87%EF%BC%88%E5%9B%BA%E5%AE%9A%E5%BA%A7%E6%A8%99%E3%80%81%E7%B8%AE%E6%94%BE%E8%88%87%E6%BB%91%E9%BC%A0%E6%8F%9B%E7%AE%97%EF%BC%89.md)
- 想對照 `viewport-wrapper`、`viewport`、`canvasScale` 在原始碼裡的角色時，看：[PPTist 畫布系統實作對照篇（viewport-wrapper、viewport、canvasScale）](./PPTist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%AF%A6%E4%BD%9C%E5%B0%8D%E7%85%A7%E7%AF%87%EF%BC%88viewport-wrapper%E3%80%81viewport%E3%80%81canvasScale%EF%BC%89.md)

## 返回上層

- [回到 PPTist 導航](../README.md)
