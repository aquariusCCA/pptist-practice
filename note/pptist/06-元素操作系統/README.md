# 06-元素操作系統

本章主要整理 `PPTist` 中元素被建立、選取、拖曳、縮放、旋轉、刪除、複製、對齊、排序、組合、鎖定、隱藏的完整操作鏈路。它是畫布系統之後最重要的互動核心。

## 本章在學什麼

- 元素操作為什麼要建立在固定座標系與 canvasScale 之上
- activeElement、selectedElements、hoverElement 這類狀態的角色
- 點擊選取、框選、多選與取消選取如何更新 store
- 拖曳、縮放、旋轉如何把滑鼠事件轉成 element 欄位變更
- 新增元素、拖曳新增元素與插入圖表 / 公式的流程差異
- 哪些操作需要寫入 history snapshot，哪些只是暫時 UI 狀態

## 建議閱讀順序

1. [PPTist 元素操作系統入門](./0.%20PPTist%20%E5%85%83%E7%B4%A0%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
2. [元素選取篇（activeElement、selectedElements、hover 狀態）](./1.%20%E5%85%83%E7%B4%A0%E9%81%B8%E5%8F%96%E7%AF%87%EF%BC%88activeElement%E3%80%81selectedElements%E3%80%81hover%20%E7%8B%80%E6%85%8B%EF%BC%89.md)
3. [拖曳移動篇（滑鼠座標、canvasScale、element x/y 更新）](./2.%20%E6%8B%96%E6%9B%B3%E7%A7%BB%E5%8B%95%E7%AF%87%EF%BC%88%E6%BB%91%E9%BC%A0%E5%BA%A7%E6%A8%99%E3%80%81canvasScale%E3%80%81element%20x/y%20%E6%9B%B4%E6%96%B0%EF%BC%89.md)
4. [縮放與旋轉篇（控制點、比例、旋轉角度與邊界）](./3.%20%E7%B8%AE%E6%94%BE%E8%88%87%E6%97%8B%E8%BD%89%E7%AF%87%EF%BC%88%E6%8E%A7%E5%88%B6%E9%BB%9E%E3%80%81%E6%AF%94%E4%BE%8B%E3%80%81%E6%97%8B%E8%BD%89%E8%A7%92%E5%BA%A6%E8%88%87%E9%82%8A%E7%95%8C%EF%BC%89.md)
5. [新增元素流程篇（點擊新增、拖曳新增、預設資料、插入位置）](./4.%20%E6%96%B0%E5%A2%9E%E5%85%83%E7%B4%A0%E6%B5%81%E7%A8%8B%E7%AF%87%EF%BC%88%E9%BB%9E%E6%93%8A%E6%96%B0%E5%A2%9E%E3%80%81%E6%8B%96%E6%9B%B3%E6%96%B0%E5%A2%9E%E3%80%81%E9%A0%90%E8%A8%AD%E8%B3%87%E6%96%99%E3%80%81%E6%8F%92%E5%85%A5%E4%BD%8D%E7%BD%AE%EF%BC%89.md)
6. [刪除、複製與貼上篇（clipboard、clone、id、位置偏移）](./5.%20%E5%88%AA%E9%99%A4%E3%80%81%E8%A4%87%E8%A3%BD%E8%88%87%E8%B2%BC%E4%B8%8A%E7%AF%87%EF%BC%88clipboard%E3%80%81clone%E3%80%81id%E3%80%81%E4%BD%8D%E7%BD%AE%E5%81%8F%E7%A7%BB%EF%BC%89.md)
7. [對齊、排序與分布篇（z-index、canvas 對齊、多元素對齊）](./6.%20%E5%B0%8D%E9%BD%8A%E3%80%81%E6%8E%92%E5%BA%8F%E8%88%87%E5%88%86%E5%B8%83%E7%AF%87%EF%BC%88z-index%E3%80%81canvas%20%E5%B0%8D%E9%BD%8A%E3%80%81%E5%A4%9A%E5%85%83%E7%B4%A0%E5%B0%8D%E9%BD%8A%EF%BC%89.md)
8. [組合、取消組合、鎖定與隱藏篇](./7.%20%E7%B5%84%E5%90%88%E3%80%81%E5%8F%96%E6%B6%88%E7%B5%84%E5%90%88%E3%80%81%E9%8E%96%E5%AE%9A%E8%88%87%E9%9A%B1%E8%97%8F%E7%AF%87.md)
9. [元素操作與歷史快照篇（哪些操作要進 undo / redo）](./8.%20%E5%85%83%E7%B4%A0%E6%93%8D%E4%BD%9C%E8%88%87%E6%AD%B7%E5%8F%B2%E5%BF%AB%E7%85%A7%E7%AF%87%EF%BC%88%E5%93%AA%E4%BA%9B%E6%93%8D%E4%BD%9C%E8%A6%81%E9%80%B2%20undo%20/%20redo%EF%BC%89.md)
10. [一次拖曳操作的完整資料流篇（event → hook → store → render）](./9.%20%E4%B8%80%E6%AC%A1%E6%8B%96%E6%9B%B3%E6%93%8D%E4%BD%9C%E7%9A%84%E5%AE%8C%E6%95%B4%E8%B3%87%E6%96%99%E6%B5%81%E7%AF%87%EF%BC%88event%20%E2%86%92%20hook%20%E2%86%92%20store%20%E2%86%92%20render%EF%BC%89.md)

## 原始碼對照入口

- `src/hooks/useSelectElement.ts`
- `src/hooks/useMoveElement.ts`
- `src/hooks/useCreateElement.ts`
- `src/hooks/useDeleteElement.ts`
- `src/hooks/useOrderElement.ts`
- `src/hooks/useAlignElementToCanvas.ts`
- `src/hooks/useAlignActiveElement.ts`
- `src/hooks/useCombineElement.ts`
- `src/hooks/useLockElement.ts`
- `src/hooks/useHideElement.ts`
- `src/hooks/useCopyAndPasteElement.ts`
- `src/hooks/useHistorySnapshot.ts`
- `src/store/slides.ts`

## 高頻回查入口

- 想先知道元素操作大致包含哪些能力，看：[PPTist 元素操作系統入門](./0.%20PPTist%20%E5%85%83%E7%B4%A0%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
- 想確認「點一下元素為什麼會被選中」，看：[元素選取篇（activeElement、selectedElements、hover 狀態）](./1.%20%E5%85%83%E7%B4%A0%E9%81%B8%E5%8F%96%E7%AF%87%EF%BC%88activeElement%E3%80%81selectedElements%E3%80%81hover%20%E7%8B%80%E6%85%8B%EF%BC%89.md)
- 想確認拖曳時滑鼠座標如何轉成 element 座標，看：[拖曳移動篇（滑鼠座標、canvasScale、element x/y 更新）](./2.%20%E6%8B%96%E6%9B%B3%E7%A7%BB%E5%8B%95%E7%AF%87%EF%BC%88%E6%BB%91%E9%BC%A0%E5%BA%A7%E6%A8%99%E3%80%81canvasScale%E3%80%81element%20x/y%20%E6%9B%B4%E6%96%B0%EF%BC%89.md)
- 想確認縮放、旋轉控制點怎麼影響資料，看：[縮放與旋轉篇（控制點、比例、旋轉角度與邊界）](./3.%20%E7%B8%AE%E6%94%BE%E8%88%87%E6%97%8B%E8%BD%89%E7%AF%87%EF%BC%88%E6%8E%A7%E5%88%B6%E9%BB%9E%E3%80%81%E6%AF%94%E4%BE%8B%E3%80%81%E6%97%8B%E8%BD%89%E8%A7%92%E5%BA%A6%E8%88%87%E9%82%8A%E7%95%8C%EF%BC%89.md)
- 想確認插入圖表、插入公式、拖曳新增元素如何放進同一條新增流程，看：[新增元素流程篇（點擊新增、拖曳新增、預設資料、插入位置）](./4.%20%E6%96%B0%E5%A2%9E%E5%85%83%E7%B4%A0%E6%B5%81%E7%A8%8B%E7%AF%87%EF%BC%88%E9%BB%9E%E6%93%8A%E6%96%B0%E5%A2%9E%E3%80%81%E6%8B%96%E6%9B%B3%E6%96%B0%E5%A2%9E%E3%80%81%E9%A0%90%E8%A8%AD%E8%B3%87%E6%96%99%E3%80%81%E6%8F%92%E5%85%A5%E4%BD%8D%E7%BD%AE%EF%BC%89.md)
- 想確認複製貼上為什麼要重建 id 與偏移位置，看：[刪除、複製與貼上篇（clipboard、clone、id、位置偏移）](./5.%20%E5%88%AA%E9%99%A4%E3%80%81%E8%A4%87%E8%A3%BD%E8%88%87%E8%B2%BC%E4%B8%8A%E7%AF%87%EF%BC%88clipboard%E3%80%81clone%E3%80%81id%E3%80%81%E4%BD%8D%E7%BD%AE%E5%81%8F%E7%A7%BB%EF%BC%89.md)
- 想確認操作完後何時產生 snapshot，看：[元素操作與歷史快照篇（哪些操作要進 undo / redo）](./8.%20%E5%85%83%E7%B4%A0%E6%93%8D%E4%BD%9C%E8%88%87%E6%AD%B7%E5%8F%B2%E5%BF%AB%E7%85%A7%E7%AF%87%EF%BC%88%E5%93%AA%E4%BA%9B%E6%93%8D%E4%BD%9C%E8%A6%81%E9%80%B2%20undo%20/%20redo%EF%BC%89.md)
- 想把一次拖曳操作從事件追到畫面更新，看：[一次拖曳操作的完整資料流篇（event → hook → store → render）](./9.%20%E4%B8%80%E6%AC%A1%E6%8B%96%E6%9B%B3%E6%93%8D%E4%BD%9C%E7%9A%84%E5%AE%8C%E6%95%B4%E8%B3%87%E6%96%99%E6%B5%81%E7%AF%87%EF%BC%88event%20%E2%86%92%20hook%20%E2%86%92%20store%20%E2%86%92%20render%EF%BC%89.md)

## 補充工作區

- 想用小 demo 驗證 select / drag / resize / rotate / snapshot 時，看：[element-operation-demo](./element-operation-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 一次元素操作如何從事件進入 hook？
- 操作如何修改 slide / element 資料？
- 哪些操作需要產生 history snapshot？

## 返回上層

- [回到 PPTist 導航](../README.md)
