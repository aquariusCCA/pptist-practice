# 10-元素類型與樣式面板

本章主要整理 PPTist 中各種元素類型的資料格式、渲染方式與右側樣式面板。這章的核心不是「有哪些元素」，而是理解不同元素如何共用通用欄位，又如何擁有自己的專屬設定。

## 本章在學什麼

- element 的通用欄位與類型專屬欄位如何分工
- 文字、圖片、形狀、線條、表格、圖表、公式等元素的差異
- 右側樣式面板如何根據 active element type 切換
- 面板修改樣式時如何更新 element 資料
- 圖表與公式這類複合元素如何建立與渲染
- 新增自訂元素時需要補哪些 config、renderer、panel 與 export 邏輯

## 建議閱讀順序

1. [PPTist 元素類型與樣式面板入門](./0.%20PPTist%20%E5%85%83%E7%B4%A0%E9%A1%9E%E5%9E%8B%E8%88%87%E6%A8%A3%E5%BC%8F%E9%9D%A2%E6%9D%BF%E5%85%A5%E9%96%80.md)
2. [通用 element 欄位篇（id、type、left、top、width、height、rotate、style）](./1.%20%E9%80%9A%E7%94%A8%20element%20%E6%AC%84%E4%BD%8D%E7%AF%87%EF%BC%88id%E3%80%81type%E3%80%81left%E3%80%81top%E3%80%81width%E3%80%81height%E3%80%81rotate%E3%80%81style%EF%BC%89.md)
3. [元素 configs 篇（element、shapes、lines、chart、latex、imageClip）](./2.%20%E5%85%83%E7%B4%A0%20configs%20%E7%AF%87%EF%BC%88element%E3%80%81shapes%E3%80%81lines%E3%80%81chart%E3%80%81latex%E3%80%81imageClip%EF%BC%89.md)
4. [右側樣式面板切換篇（active element type → panel component）](./3.%20%E5%8F%B3%E5%81%B4%E6%A8%A3%E5%BC%8F%E9%9D%A2%E6%9D%BF%E5%88%87%E6%8F%9B%E7%AF%87%EF%BC%88active%20element%20type%20%E2%86%92%20panel%20component%EF%BC%89.md)
5. [文字、圖片、形狀、線條元素篇](./4.%20%E6%96%87%E5%AD%97%E3%80%81%E5%9C%96%E7%89%87%E3%80%81%E5%BD%A2%E7%8B%80%E3%80%81%E7%B7%9A%E6%A2%9D%E5%85%83%E7%B4%A0%E7%AF%87.md)
6. [表格元素篇（資料結構、渲染與樣式設定）](./5.%20%E8%A1%A8%E6%A0%BC%E5%85%83%E7%B4%A0%E7%AF%87%EF%BC%88%E8%B3%87%E6%96%99%E7%B5%90%E6%A7%8B%E3%80%81%E6%B8%B2%E6%9F%93%E8%88%87%E6%A8%A3%E5%BC%8F%E8%A8%AD%E5%AE%9A%EF%BC%89.md)
7. [圖表元素篇（chart data、chart config、樣式面板、重新渲染）](./6.%20%E5%9C%96%E8%A1%A8%E5%85%83%E7%B4%A0%E7%AF%87%EF%BC%88chart%20data%E3%80%81chart%20config%E3%80%81%E6%A8%A3%E5%BC%8F%E9%9D%A2%E6%9D%BF%E3%80%81%E9%87%8D%E6%96%B0%E6%B8%B2%E6%9F%93%EF%BC%89.md)
8. [公式元素篇（latex config、公式資料、渲染差異）](./7.%20%E5%85%AC%E5%BC%8F%E5%85%83%E7%B4%A0%E7%AF%87%EF%BC%88latex%20config%E3%80%81%E5%85%AC%E5%BC%8F%E8%B3%87%E6%96%99%E3%80%81%E6%B8%B2%E6%9F%93%E5%B7%AE%E7%95%B0%EF%BC%89.md)
9. [圖片裁切與特殊樣式篇（image clip、mask、filter、border）](./8.%20%E5%9C%96%E7%89%87%E8%A3%81%E5%88%87%E8%88%87%E7%89%B9%E6%AE%8A%E6%A8%A3%E5%BC%8F%E7%AF%87%EF%BC%88image%20clip%E3%80%81mask%E3%80%81filter%E3%80%81border%EF%BC%89.md)
10. [樣式更新資料流篇（panel input → store update → canvas render → snapshot）](./9.%20%E6%A8%A3%E5%BC%8F%E6%9B%B4%E6%96%B0%E8%B3%87%E6%96%99%E6%B5%81%E7%AF%87%EF%BC%88panel%20input%20%E2%86%92%20store%20update%20%E2%86%92%20canvas%20render%20%E2%86%92%20snapshot%EF%BC%89.md)
11. [新增元素類型檢查表篇](./10.%20%E6%96%B0%E5%A2%9E%E5%85%83%E7%B4%A0%E9%A1%9E%E5%9E%8B%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87.md)

## 原始碼對照入口

- `src/views/components/element/*`
- `src/views/Editor/Panel/*`
- `src/configs/element.ts`
- `src/configs/shapes.ts`
- `src/configs/lines.ts`
- `src/configs/chart.ts`
- `src/configs/latex.ts`
- `src/configs/imageClip.ts`
- `src/utils/element.ts`
- `src/types/slides.ts`

## 高頻回查入口

- 想先知道所有元素有哪些共通欄位，看：[通用 element 欄位篇（id、type、left、top、width、height、rotate、style）](./1.%20%E9%80%9A%E7%94%A8%20element%20%E6%AC%84%E4%BD%8D%E7%AF%87%EF%BC%88id%E3%80%81type%E3%80%81left%E3%80%81top%E3%80%81width%E3%80%81height%E3%80%81rotate%E3%80%81style%EF%BC%89.md)
- 想確認 shapes、lines、chart、latex 設定放在哪裡，看：[元素 configs 篇（element、shapes、lines、chart、latex、imageClip）](./2.%20%E5%85%83%E7%B4%A0%20configs%20%E7%AF%87%EF%BC%88element%E3%80%81shapes%E3%80%81lines%E3%80%81chart%E3%80%81latex%E3%80%81imageClip%EF%BC%89.md)
- 想確認右側面板為什麼會跟著選中元素改變，看：[右側樣式面板切換篇（active element type → panel component）](./3.%20%E5%8F%B3%E5%81%B4%E6%A8%A3%E5%BC%8F%E9%9D%A2%E6%9D%BF%E5%88%87%E6%8F%9B%E7%AF%87%EF%BC%88active%20element%20type%20%E2%86%92%20panel%20component%EF%BC%89.md)
- 想確認圖片、形狀、線條的資料差異，看：[文字、圖片、形狀、線條元素篇](./4.%20%E6%96%87%E5%AD%97%E3%80%81%E5%9C%96%E7%89%87%E3%80%81%E5%BD%A2%E7%8B%80%E3%80%81%E7%B7%9A%E6%A2%9D%E5%85%83%E7%B4%A0%E7%AF%87.md)
- 想確認插入圖表後資料如何存、如何渲染，看：[圖表元素篇（chart data、chart config、樣式面板、重新渲染）](./6.%20%E5%9C%96%E8%A1%A8%E5%85%83%E7%B4%A0%E7%AF%87%EF%BC%88chart%20data%E3%80%81chart%20config%E3%80%81%E6%A8%A3%E5%BC%8F%E9%9D%A2%E6%9D%BF%E3%80%81%E9%87%8D%E6%96%B0%E6%B8%B2%E6%9F%93%EF%BC%89.md)
- 想確認插入公式後 LaTeX 如何變成畫面元素，看：[公式元素篇（latex config、公式資料、渲染差異）](./7.%20%E5%85%AC%E5%BC%8F%E5%85%83%E7%B4%A0%E7%AF%87%EF%BC%88latex%20config%E3%80%81%E5%85%AC%E5%BC%8F%E8%B3%87%E6%96%99%E3%80%81%E6%B8%B2%E6%9F%93%E5%B7%AE%E7%95%B0%EF%BC%89.md)
- 想確認改樣式時完整資料流怎麼走，看：[樣式更新資料流篇（panel input → store update → canvas render → snapshot）](./9.%20%E6%A8%A3%E5%BC%8F%E6%9B%B4%E6%96%B0%E8%B3%87%E6%96%99%E6%B5%81%E7%AF%87%EF%BC%88panel%20input%20%E2%86%92%20store%20update%20%E2%86%92%20canvas%20render%20%E2%86%92%20snapshot%EF%BC%89.md)
- 想日後新增一個元素類型，看：[新增元素類型檢查表篇](./10.%20%E6%96%B0%E5%A2%9E%E5%85%83%E7%B4%A0%E9%A1%9E%E5%9E%8B%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87.md)

## 補充工作區

- 想用小型樣式面板 demo 驗證「選元素 → 改欄位 → 重渲染」時，看：[element-style-panel-demo](./element-style-panel-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 不同 element type 的共用欄位與專屬欄位是什麼？
- 右側面板如何根據選取元素切換？
- 圖表、公式、表格等特殊元素新增時要補哪些地方？

## 返回上層

- [回到 PPTist 導航](../README.md)
