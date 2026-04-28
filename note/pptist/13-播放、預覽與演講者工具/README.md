# 13-播放、預覽與演講者工具

本章主要整理 PPTist 從編輯狀態進入播放、預覽、全螢幕、翻頁、動畫播放、批註與演講者工具的流程。它和編輯器畫布不同，重點是展示、控制與演示輔助。

## 本章在學什麼

- 播放頁如何取得目前簡報資料
- Screen view 和 Editor view 的渲染差異
- useScreening 如何處理翻頁、播放狀態與進度
- 全螢幕工具如何與瀏覽器 API 協作
- 動畫、轉場、批註、演講者視圖在播放時如何運作
- 預覽模式和正式放映模式的責任差異

## 建議閱讀順序

1. [PPTist 播放、預覽與演講者工具入門](./0.%20PPTist%20%E6%92%AD%E6%94%BE%E3%80%81%E9%A0%90%E8%A6%BD%E8%88%87%E6%BC%94%E8%AC%9B%E8%80%85%E5%B7%A5%E5%85%B7%E5%85%A5%E9%96%80.md)
2. [Screen 入口與資料取得篇](./1.%20Screen%20%E5%85%A5%E5%8F%A3%E8%88%87%E8%B3%87%E6%96%99%E5%8F%96%E5%BE%97%E7%AF%87.md)
3. [播放頁渲染篇（與編輯器畫布的差異）](./2.%20%E6%92%AD%E6%94%BE%E9%A0%81%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E8%88%87%E7%B7%A8%E8%BC%AF%E5%99%A8%E7%95%AB%E5%B8%83%E7%9A%84%E5%B7%AE%E7%95%B0%EF%BC%89.md)
4. [useScreening 篇（翻頁、當前頁、播放狀態、進度）](./3.%20useScreening%20%E7%AF%87%EF%BC%88%E7%BF%BB%E9%A0%81%E3%80%81%E7%95%B6%E5%89%8D%E9%A0%81%E3%80%81%E6%92%AD%E6%94%BE%E7%8B%80%E6%85%8B%E3%80%81%E9%80%B2%E5%BA%A6%EF%BC%89.md)
5. [全螢幕控制篇（fullscreen utils、瀏覽器限制）](./4.%20%E5%85%A8%E8%9E%A2%E5%B9%95%E6%8E%A7%E5%88%B6%E7%AF%87%EF%BC%88fullscreen%20utils%E3%80%81%E7%80%8F%E8%A6%BD%E5%99%A8%E9%99%90%E5%88%B6%EF%BC%89.md)
6. [鍵盤與滑鼠播放控制篇](./5.%20%E9%8D%B5%E7%9B%A4%E8%88%87%E6%BB%91%E9%BC%A0%E6%92%AD%E6%94%BE%E6%8E%A7%E5%88%B6%E7%AF%87.md)
7. [動畫與轉場播放篇](./6.%20%E5%8B%95%E7%95%AB%E8%88%87%E8%BD%89%E5%A0%B4%E6%92%AD%E6%94%BE%E7%AF%87.md)
8. [WritingBoard 批註工具篇](./7.%20WritingBoard%20%E6%89%B9%E8%A8%BB%E5%B7%A5%E5%85%B7%E7%AF%87.md)
9. [演講者備註與演示輔助篇](./8.%20%E6%BC%94%E8%AC%9B%E8%80%85%E5%82%99%E8%A8%BB%E8%88%87%E6%BC%94%E7%A4%BA%E8%BC%94%E5%8A%A9%E7%AF%87.md)
10. [從編輯器進入播放的一次完整流程篇](./9.%20%E5%BE%9E%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%80%B2%E5%85%A5%E6%92%AD%E6%94%BE%E7%9A%84%E4%B8%80%E6%AC%A1%E5%AE%8C%E6%95%B4%E6%B5%81%E7%A8%8B%E7%AF%87.md)

## 原始碼對照入口

- `src/views/Screen/*`
- `src/hooks/useScreening.ts`
- `src/utils/fullscreen.ts`
- `src/utils/print.ts`
- `src/components/WritingBoard.vue`
- `src/store/screen.ts`
- `src/store/slides.ts`

## 高頻回查入口

- 想先知道播放頁從哪裡拿資料，看：[Screen 入口與資料取得篇](./1.%20Screen%20%E5%85%A5%E5%8F%A3%E8%88%87%E8%B3%87%E6%96%99%E5%8F%96%E5%BE%97%E7%AF%87.md)
- 想確認播放頁和編輯器畫布有什麼不同，看：[播放頁渲染篇（與編輯器畫布的差異）](./2.%20%E6%92%AD%E6%94%BE%E9%A0%81%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E8%88%87%E7%B7%A8%E8%BC%AF%E5%99%A8%E7%95%AB%E5%B8%83%E7%9A%84%E5%B7%AE%E7%95%B0%EF%BC%89.md)
- 想確認翻頁狀態與播放進度如何管理，看：[useScreening 篇（翻頁、當前頁、播放狀態、進度）](./3.%20useScreening%20%E7%AF%87%EF%BC%88%E7%BF%BB%E9%A0%81%E3%80%81%E7%95%B6%E5%89%8D%E9%A0%81%E3%80%81%E6%92%AD%E6%94%BE%E7%8B%80%E6%85%8B%E3%80%81%E9%80%B2%E5%BA%A6%EF%BC%89.md)
- 想確認全螢幕 API 如何封裝，看：[全螢幕控制篇（fullscreen utils、瀏覽器限制）](./4.%20%E5%85%A8%E8%9E%A2%E5%B9%95%E6%8E%A7%E5%88%B6%E7%AF%87%EF%BC%88fullscreen%20utils%E3%80%81%E7%80%8F%E8%A6%BD%E5%99%A8%E9%99%90%E5%88%B6%EF%BC%89.md)
- 想確認播放時按鍵如何控制上一頁下一頁，看：[鍵盤與滑鼠播放控制篇](./5.%20%E9%8D%B5%E7%9B%A4%E8%88%87%E6%BB%91%E9%BC%A0%E6%92%AD%E6%94%BE%E6%8E%A7%E5%88%B6%E7%AF%87.md)
- 想確認動畫與轉場在播放時如何觸發，看：[動畫與轉場播放篇](./6.%20%E5%8B%95%E7%95%AB%E8%88%87%E8%BD%89%E5%A0%B4%E6%92%AD%E6%94%BE%E7%AF%87.md)
- 想確認批註板的角色，看：[WritingBoard 批註工具篇](./7.%20WritingBoard%20%E6%89%B9%E8%A8%BB%E5%B7%A5%E5%85%B7%E7%AF%87.md)
- 想把「點擊播放」到「進入放映」完整追一遍，看：[從編輯器進入播放的一次完整流程篇](./9.%20%E5%BE%9E%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%80%B2%E5%85%A5%E6%92%AD%E6%94%BE%E7%9A%84%E4%B8%80%E6%AC%A1%E5%AE%8C%E6%95%B4%E6%B5%81%E7%A8%8B%E7%AF%87.md)

## 補充工作區

- 想做一個簡化版 slide show / fullscreen / page control demo 時，看：[screening-demo](./screening-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 播放頁如何取得簡報資料？
- 播放模式與編輯模式的渲染差異是什麼？
- 翻頁、全螢幕、批註、演講者工具如何串起來？

## 返回上層

- [回到 PPTist 導航](../README.md)
