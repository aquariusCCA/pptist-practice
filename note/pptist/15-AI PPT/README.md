# 15-AI PPT

本章主要整理 PPTist 中 AI PPT 相關流程。這章的重點不是模型本身，而是 AI 產生的大綱、模板、內容與圖片如何被轉成 PPTist 內部可編輯的 slides / elements。

## 本章在學什麼

- AI PPT 的輸入與輸出資料型別
- 大綱如何轉成頁面結構
- 模板如何參與 AI 產生內容
- AI 產生的內容如何映射到 text / image / shape 等 elements
- 圖片替換與素材取得流程
- AI 結果如何驗證、修正並寫入 slidesStore

## 建議閱讀順序

1. [PPTist AI PPT 入門](./0.%20PPTist%20AI%20PPT%20%E5%85%A5%E9%96%80.md)
2. [AI PPT 型別篇（AIPPT types、request、response）](./1.%20AI%20PPT%20%E5%9E%8B%E5%88%A5%E7%AF%87%EF%BC%88AIPPT%20types%E3%80%81request%E3%80%81response%EF%BC%89.md)
3. [大綱生成篇（outline markdown / json → slide structure）](./2.%20%E5%A4%A7%E7%B6%B1%E7%94%9F%E6%88%90%E7%AF%87%EF%BC%88outline%20markdown%20/%20json%20%E2%86%92%20slide%20structure%EF%BC%89.md)
4. [模板選擇與套用篇](./3.%20%E6%A8%A1%E6%9D%BF%E9%81%B8%E6%93%87%E8%88%87%E5%A5%97%E7%94%A8%E7%AF%87.md)
5. [內容填充篇（title、paragraph、list、image placeholder）](./4.%20%E5%85%A7%E5%AE%B9%E5%A1%AB%E5%85%85%E7%AF%87%EF%BC%88title%E3%80%81paragraph%E3%80%81list%E3%80%81image%20placeholder%EF%BC%89.md)
6. [圖片替換與素材處理篇](./5.%20%E5%9C%96%E7%89%87%E6%9B%BF%E6%8F%9B%E8%88%87%E7%B4%A0%E6%9D%90%E8%99%95%E7%90%86%E7%AF%87.md)
7. [Mock data 與本地開發篇](./6.%20Mock%20data%20%E8%88%87%E6%9C%AC%E5%9C%B0%E9%96%8B%E7%99%BC%E7%AF%87.md)
8. [AI 結果驗證與 normalize 篇](./7.%20AI%20%E7%B5%90%E6%9E%9C%E9%A9%97%E8%AD%89%E8%88%87%20normalize%20%E7%AF%87.md)
9. [AI 結果寫入 slidesStore 篇](./8.%20AI%20%E7%B5%90%E6%9E%9C%E5%AF%AB%E5%85%A5%20slidesStore%20%E7%AF%87.md)
10. [AI PPT 二次開發檢查表篇](./9.%20AI%20PPT%20%E4%BA%8C%E6%AC%A1%E9%96%8B%E7%99%BC%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87.md)

## 原始碼對照入口

- `src/hooks/useAIPPT.ts`
- `src/types/AIPPT.ts`
- `public/mocks/AIPPT*.json`
- `public/mocks/AIPPT_Outline.md`
- `doc/AIPPT.md`
- `src/store/slides.ts`

## 高頻回查入口

- 想先知道 AI PPT 在 PPTist 裡解決什麼問題，看：[PPTist AI PPT 入門](./0.%20PPTist%20AI%20PPT%20%E5%85%A5%E9%96%80.md)
- 想確認 AI 相關型別和資料結構，看：[AI PPT 型別篇（AIPPT types、request、response）](./1.%20AI%20PPT%20%E5%9E%8B%E5%88%A5%E7%AF%87%EF%BC%88AIPPT%20types%E3%80%81request%E3%80%81response%EF%BC%89.md)
- 想確認大綱如何變成頁面，看：[大綱生成篇（outline markdown / json → slide structure）](./2.%20%E5%A4%A7%E7%B6%B1%E7%94%9F%E6%88%90%E7%AF%87%EF%BC%88outline%20markdown%20/%20json%20%E2%86%92%20slide%20structure%EF%BC%89.md)
- 想確認模板和 AI 內容如何結合，看：[模板選擇與套用篇](./3.%20%E6%A8%A1%E6%9D%BF%E9%81%B8%E6%93%87%E8%88%87%E5%A5%97%E7%94%A8%E7%AF%87.md)
- 想確認 AI 文字內容如何填入 elements，看：[內容填充篇（title、paragraph、list、image placeholder）](./4.%20%E5%85%A7%E5%AE%B9%E5%A1%AB%E5%85%85%E7%AF%87%EF%BC%88title%E3%80%81paragraph%E3%80%81list%E3%80%81image%20placeholder%EF%BC%89.md)
- 想確認圖片替換如何處理，看：[圖片替換與素材處理篇](./5.%20%E5%9C%96%E7%89%87%E6%9B%BF%E6%8F%9B%E8%88%87%E7%B4%A0%E6%9D%90%E8%99%95%E7%90%86%E7%AF%87.md)
- 想用 mock data 讀懂流程，看：[Mock data 與本地開發篇](./6.%20Mock%20data%20%E8%88%87%E6%9C%AC%E5%9C%B0%E9%96%8B%E7%99%BC%E7%AF%87.md)
- 想確認 AI 產生結果如何寫回正式簡報資料，看：[AI 結果寫入 slidesStore 篇](./8.%20AI%20%E7%B5%90%E6%9E%9C%E5%AF%AB%E5%85%A5%20slidesStore%20%E7%AF%87.md)

## 補充工作區

- 想做一個簡化版「大綱 → slides」產生器時，看：[ai-ppt-flow-demo](./ai-ppt-flow-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- AI 產生的資料如何轉成 PPTist slides？
- 大綱、模板、內容、圖片替換如何分工？
- AI 結果寫回 store 前需要如何驗證？

## 返回上層

- [回到 PPTist 導航](../README.md)
