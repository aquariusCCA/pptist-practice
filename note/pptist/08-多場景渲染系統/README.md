# 08-多場景渲染系統

本章主要整理同一份 slide / element 資料如何在不同場景中被渲染。PPTist 的元素不是只出現在主畫布，也會出現在縮圖、播放頁、手機端，因此要把「資料共用」和「渲染場景差異」分開理解。

## 本章在學什麼

- 為什麼同一份簡報資料可以被多個場景消費
- 編輯器畫布為什麼需要可選取、可拖曳、可編輯
- 縮圖為什麼多半只需要靜態預覽與比例縮放
- 放映模式為什麼要關心動畫、轉場、全螢幕與播放控制
- 手機端如何取捨桌面端能力，保留核心編輯或預覽能力
- 新增一種元素時，要補哪些場景的 renderer

## 建議閱讀順序

1. [PPTist 多場景渲染系統入門](./0.%20PPTist%20%E5%A4%9A%E5%A0%B4%E6%99%AF%E6%B8%B2%E6%9F%93%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
2. [資料共用篇（slide / element 作為唯一邏輯模型）](./1.%20%E8%B3%87%E6%96%99%E5%85%B1%E7%94%A8%E7%AF%87%EF%BC%88slide%20/%20element%20%E4%BD%9C%E7%82%BA%E5%94%AF%E4%B8%80%E9%82%8F%E8%BC%AF%E6%A8%A1%E5%9E%8B%EF%BC%89.md)
3. [編輯器渲染篇（可互動元素、控制框、hover、active 狀態）](./2.%20%E7%B7%A8%E8%BC%AF%E5%99%A8%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E5%8F%AF%E4%BA%92%E5%8B%95%E5%85%83%E7%B4%A0%E3%80%81%E6%8E%A7%E5%88%B6%E6%A1%86%E3%80%81hover%E3%80%81active%20%E7%8B%80%E6%85%8B%EF%BC%89.md)
4. [縮圖渲染篇（靜態預覽、尺寸縮放、同步更新）](./3.%20%E7%B8%AE%E5%9C%96%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E9%9D%9C%E6%85%8B%E9%A0%90%E8%A6%BD%E3%80%81%E5%B0%BA%E5%AF%B8%E7%B8%AE%E6%94%BE%E3%80%81%E5%90%8C%E6%AD%A5%E6%9B%B4%E6%96%B0%EF%BC%89.md)
5. [放映渲染篇（播放頁、動畫、轉場、全螢幕）](./4.%20%E6%94%BE%E6%98%A0%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E6%92%AD%E6%94%BE%E9%A0%81%E3%80%81%E5%8B%95%E7%95%AB%E3%80%81%E8%BD%89%E5%A0%B4%E3%80%81%E5%85%A8%E8%9E%A2%E5%B9%95%EF%BC%89.md)
6. [手機端渲染篇（簡化互動、觸控操作、響應式限制）](./5.%20%E6%89%8B%E6%A9%9F%E7%AB%AF%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E7%B0%A1%E5%8C%96%E4%BA%92%E5%8B%95%E3%80%81%E8%A7%B8%E6%8E%A7%E6%93%8D%E4%BD%9C%E3%80%81%E9%9F%BF%E6%87%89%E5%BC%8F%E9%99%90%E5%88%B6%EF%BC%89.md)
7. [元素 renderer 共用與差異篇](./6.%20%E5%85%83%E7%B4%A0%20renderer%20%E5%85%B1%E7%94%A8%E8%88%87%E5%B7%AE%E7%95%B0%E7%AF%87.md)
8. [新增元素的多場景檢查表篇（editable / thumbnail / screen / mobile）](./7.%20%E6%96%B0%E5%A2%9E%E5%85%83%E7%B4%A0%E7%9A%84%E5%A4%9A%E5%A0%B4%E6%99%AF%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87%EF%BC%88editable%20/%20thumbnail%20/%20screen%20/%20mobile%EF%BC%89.md)
9. [資料共用與 UI 行為分離篇](./8.%20%E8%B3%87%E6%96%99%E5%85%B1%E7%94%A8%E8%88%87%20UI%20%E8%A1%8C%E7%82%BA%E5%88%86%E9%9B%A2%E7%AF%87.md)

## 原始碼對照入口

- `src/views/components/element/*`
- `src/views/components/ThumbnailSlide/*`
- `src/views/Editor/Canvas/*`
- `src/views/Screen/*`
- `src/views/Mobile/*`
- `src/types/slides.ts`
- `src/configs/element.ts`

## 高頻回查入口

- 想先知道為什麼同一份資料可以顯示在很多地方，看：[資料共用篇（slide / element 作為唯一邏輯模型）](./1.%20%E8%B3%87%E6%96%99%E5%85%B1%E7%94%A8%E7%AF%87%EF%BC%88slide%20/%20element%20%E4%BD%9C%E7%82%BA%E5%94%AF%E4%B8%80%E9%82%8F%E8%BC%AF%E6%A8%A1%E5%9E%8B%EF%BC%89.md)
- 想確認主畫布中的 element 為什麼比縮圖複雜，看：[編輯器渲染篇（可互動元素、控制框、hover、active 狀態）](./2.%20%E7%B7%A8%E8%BC%AF%E5%99%A8%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E5%8F%AF%E4%BA%92%E5%8B%95%E5%85%83%E7%B4%A0%E3%80%81%E6%8E%A7%E5%88%B6%E6%A1%86%E3%80%81hover%E3%80%81active%20%E7%8B%80%E6%85%8B%EF%BC%89.md)
- 想確認縮圖只是縮小版畫布還是另一套渲染，看：[縮圖渲染篇（靜態預覽、尺寸縮放、同步更新）](./3.%20%E7%B8%AE%E5%9C%96%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E9%9D%9C%E6%85%8B%E9%A0%90%E8%A6%BD%E3%80%81%E5%B0%BA%E5%AF%B8%E7%B8%AE%E6%94%BE%E3%80%81%E5%90%8C%E6%AD%A5%E6%9B%B4%E6%96%B0%EF%BC%89.md)
- 想確認放映頁和編輯頁的差異，看：[放映渲染篇（播放頁、動畫、轉場、全螢幕）](./4.%20%E6%94%BE%E6%98%A0%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E6%92%AD%E6%94%BE%E9%A0%81%E3%80%81%E5%8B%95%E7%95%AB%E3%80%81%E8%BD%89%E5%A0%B4%E3%80%81%E5%85%A8%E8%9E%A2%E5%B9%95%EF%BC%89.md)
- 想確認手機端是否共用桌面端 renderer，看：[手機端渲染篇（簡化互動、觸控操作、響應式限制）](./5.%20%E6%89%8B%E6%A9%9F%E7%AB%AF%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E7%B0%A1%E5%8C%96%E4%BA%92%E5%8B%95%E3%80%81%E8%A7%B8%E6%8E%A7%E6%93%8D%E4%BD%9C%E3%80%81%E9%9F%BF%E6%87%89%E5%BC%8F%E9%99%90%E5%88%B6%EF%BC%89.md)
- 想新增 chart / latex / table 等元素時，看要補哪些場景，看：[新增元素的多場景檢查表篇（editable / thumbnail / screen / mobile）](./7.%20%E6%96%B0%E5%A2%9E%E5%85%83%E7%B4%A0%E7%9A%84%E5%A4%9A%E5%A0%B4%E6%99%AF%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87%EF%BC%88editable%20/%20thumbnail%20/%20screen%20/%20mobile%EF%BC%89.md)
- 想避免把資料邏輯寫死在某個 UI 場景裡，看：[資料共用與 UI 行為分離篇](./8.%20%E8%B3%87%E6%96%99%E5%85%B1%E7%94%A8%E8%88%87%20UI%20%E8%A1%8C%E7%82%BA%E5%88%86%E9%9B%A2%E7%AF%87.md)

## 補充工作區

- 想用同一份 element 資料渲染出 editable / thumbnail / screen 三種版本時，看：[multi-scene-render-demo](./multi-scene-render-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 同一份 element 資料在編輯器、縮圖、放映、手機端有何差異？
- 新增元素時要補哪些 renderer？
- 哪些邏輯應該共用，哪些行為應該分場景處理？

## 返回上層

- [回到 PPTist 導航](../README.md)
