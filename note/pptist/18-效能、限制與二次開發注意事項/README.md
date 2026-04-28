# 18-效能、限制與二次開發注意事項

本章主要整理 PPTist 在大型簡報、圖片資源、縮圖渲染、富文字、歷史快照、匯入匯出與二次開發上的成本與限制。這章適合在看完整體架構後回來讀，用來判斷哪些地方不能亂改。

## 本章在學什麼

- 大型簡報資料量增加時，store、render、snapshot 會遇到什麼問題
- history snapshot 為什麼可能造成記憶體壓力
- 縮圖大量渲染為什麼需要節流、快取或延遲策略
- 圖片、字型、圖表、公式、富文字在匯出時有哪些成本
- 匯入匯出和格式轉換的本質限制
- 二次開發時哪些改法最容易造成資料不一致或效能退化

## 建議閱讀順序

1. [PPTist 效能、限制與二次開發注意事項入門](./0.%20PPTist%20%E6%95%88%E8%83%BD%E3%80%81%E9%99%90%E5%88%B6%E8%88%87%E4%BA%8C%E6%AC%A1%E9%96%8B%E7%99%BC%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A0%85%E5%85%A5%E9%96%80.md)
2. [大型簡報資料量篇（slides、elements、assets、render cost）](./1.%20%E5%A4%A7%E5%9E%8B%E7%B0%A1%E5%A0%B1%E8%B3%87%E6%96%99%E9%87%8F%E7%AF%87%EF%BC%88slides%E3%80%81elements%E3%80%81assets%E3%80%81render%20cost%EF%BC%89.md)
3. [history snapshot 記憶體成本篇](./2.%20history%20snapshot%20%E8%A8%98%E6%86%B6%E9%AB%94%E6%88%90%E6%9C%AC%E7%AF%87.md)
4. [縮圖渲染效能篇（大量頁面、重繪、快取、延遲）](./3.%20%E7%B8%AE%E5%9C%96%E6%B8%B2%E6%9F%93%E6%95%88%E8%83%BD%E7%AF%87%EF%BC%88%E5%A4%A7%E9%87%8F%E9%A0%81%E9%9D%A2%E3%80%81%E9%87%8D%E7%B9%AA%E3%80%81%E5%BF%AB%E5%8F%96%E3%80%81%E5%BB%B6%E9%81%B2%EF%BC%89.md)
5. [圖片與資源成本篇（base64、blob、壓縮、跨來源）](./4.%20%E5%9C%96%E7%89%87%E8%88%87%E8%B3%87%E6%BA%90%E6%88%90%E6%9C%AC%E7%AF%87%EF%BC%88base64%E3%80%81blob%E3%80%81%E5%A3%93%E7%B8%AE%E3%80%81%E8%B7%A8%E4%BE%86%E6%BA%90%EF%BC%89.md)
6. [富文字與 ProseMirror 成本篇](./5.%20%E5%AF%8C%E6%96%87%E5%AD%97%E8%88%87%20ProseMirror%20%E6%88%90%E6%9C%AC%E7%AF%87.md)
7. [圖表、公式與特殊元素渲染成本篇](./6.%20%E5%9C%96%E8%A1%A8%E3%80%81%E5%85%AC%E5%BC%8F%E8%88%87%E7%89%B9%E6%AE%8A%E5%85%83%E7%B4%A0%E6%B8%B2%E6%9F%93%E6%88%90%E6%9C%AC%E7%AF%87.md)
8. [匯入匯出瓶頸篇](./7.%20%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA%E7%93%B6%E9%A0%B8%E7%AF%87.md)
9. [store 更新粒度與重渲染篇](./8.%20store%20%E6%9B%B4%E6%96%B0%E7%B2%92%E5%BA%A6%E8%88%87%E9%87%8D%E6%B8%B2%E6%9F%93%E7%AF%87.md)
10. [事件監聽與資源釋放篇](./9.%20%E4%BA%8B%E4%BB%B6%E7%9B%A3%E8%81%BD%E8%88%87%E8%B3%87%E6%BA%90%E9%87%8B%E6%94%BE%E7%AF%87.md)
11. [二次開發風險清單篇](./10.%20%E4%BA%8C%E6%AC%A1%E9%96%8B%E7%99%BC%E9%A2%A8%E9%9A%AA%E6%B8%85%E5%96%AE%E7%AF%87.md)

## 原始碼對照入口

- `src/hooks/useHistorySnapshot.ts`
- `src/views/components/ThumbnailSlide/*`
- `src/utils/database.ts`
- `src/hooks/useExport.ts`
- `src/hooks/useImport.ts`
- `src/utils/prosemirror/*`
- `src/views/components/element/*`
- `src/store/slides.ts`

## 高頻回查入口

- 想先知道 PPTist 效能問題通常出在哪裡，看：[PPTist 效能、限制與二次開發注意事項入門](./0.%20PPTist%20%E6%95%88%E8%83%BD%E3%80%81%E9%99%90%E5%88%B6%E8%88%87%E4%BA%8C%E6%AC%A1%E9%96%8B%E7%99%BC%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A0%85%E5%85%A5%E9%96%80.md)
- 想確認大型簡報為什麼會變慢，看：[大型簡報資料量篇（slides、elements、assets、render cost）](./1.%20%E5%A4%A7%E5%9E%8B%E7%B0%A1%E5%A0%B1%E8%B3%87%E6%96%99%E9%87%8F%E7%AF%87%EF%BC%88slides%E3%80%81elements%E3%80%81assets%E3%80%81render%20cost%EF%BC%89.md)
- 想確認 undo / redo 為什麼可能吃記憶體，看：[history snapshot 記憶體成本篇](./2.%20history%20snapshot%20%E8%A8%98%E6%86%B6%E9%AB%94%E6%88%90%E6%9C%AC%E7%AF%87.md)
- 想確認縮圖為什麼是效能熱點，看：[縮圖渲染效能篇（大量頁面、重繪、快取、延遲）](./3.%20%E7%B8%AE%E5%9C%96%E6%B8%B2%E6%9F%93%E6%95%88%E8%83%BD%E7%AF%87%EF%BC%88%E5%A4%A7%E9%87%8F%E9%A0%81%E9%9D%A2%E3%80%81%E9%87%8D%E7%B9%AA%E3%80%81%E5%BF%AB%E5%8F%96%E3%80%81%E5%BB%B6%E9%81%B2%EF%BC%89.md)
- 想確認圖片資源為什麼會影響保存與匯出，看：[圖片與資源成本篇（base64、blob、壓縮、跨來源）](./4.%20%E5%9C%96%E7%89%87%E8%88%87%E8%B3%87%E6%BA%90%E6%88%90%E6%9C%AC%E7%AF%87%EF%BC%88base64%E3%80%81blob%E3%80%81%E5%A3%93%E7%B8%AE%E3%80%81%E8%B7%A8%E4%BE%86%E6%BA%90%EF%BC%89.md)
- 想確認富文字編輯可能造成哪些成本，看：[富文字與 ProseMirror 成本篇](./5.%20%E5%AF%8C%E6%96%87%E5%AD%97%E8%88%87%20ProseMirror%20%E6%88%90%E6%9C%AC%E7%AF%87.md)
- 想確認圖表與公式這類元素的渲染成本，看：[圖表、公式與特殊元素渲染成本篇](./6.%20%E5%9C%96%E8%A1%A8%E3%80%81%E5%85%AC%E5%BC%8F%E8%88%87%E7%89%B9%E6%AE%8A%E5%85%83%E7%B4%A0%E6%B8%B2%E6%9F%93%E6%88%90%E6%9C%AC%E7%AF%87.md)
- 想確認二次開發前應該避免哪些改法，看：[二次開發風險清單篇](./10.%20%E4%BA%8C%E6%AC%A1%E9%96%8B%E7%99%BC%E9%A2%A8%E9%9A%AA%E6%B8%85%E5%96%AE%E7%AF%87.md)

## 補充工作區

- 想用 checklist 檢查一個新增功能是否會拖慢 PPTist 時，看：[performance-risk-checklist-demo](./performance-risk-checklist-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- PPTist 的主要效能熱點在哪裡？
- 大型簡報、縮圖、history、匯出各自有哪些成本？
- 二次開發前應該檢查哪些風險？

## 返回上層

- [回到 PPTist 導航](../README.md)
