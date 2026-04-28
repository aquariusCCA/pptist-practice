# 11-頁面、主題、模板與動畫

本章主要整理從單一元素提升到整份簡報層級的能力，包括頁面新增、刪除、複製、排序、分組、主題、背景、模板、頁面轉場、元素動畫、備註與批註。

## 本章在學什麼

- slide 層級資料和 element 層級資料如何分工
- 頁面新增、刪除、複製、排序如何影響 slidesStore
- section / 分組如何協助管理大量頁面
- theme、background、template 如何作用到 slide
- 頁面轉場與元素動畫的資料應該放在哪裡
- 備註、批註、選擇面板等演示輔助資訊如何和頁面綁定

## 建議閱讀順序

1. [PPTist 頁面、主題、模板與動畫入門](./0.%20PPTist%20%E9%A0%81%E9%9D%A2%E3%80%81%E4%B8%BB%E9%A1%8C%E3%80%81%E6%A8%A1%E6%9D%BF%E8%88%87%E5%8B%95%E7%95%AB%E5%85%A5%E9%96%80.md)
2. [頁面資料模型篇（slide fields、elements、background、notes）](./1.%20%E9%A0%81%E9%9D%A2%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B%E7%AF%87%EF%BC%88slide%20fields%E3%80%81elements%E3%80%81background%E3%80%81notes%EF%BC%89.md)
3. [頁面新增、刪除、複製與排序篇](./2.%20%E9%A0%81%E9%9D%A2%E6%96%B0%E5%A2%9E%E3%80%81%E5%88%AA%E9%99%A4%E3%80%81%E8%A4%87%E8%A3%BD%E8%88%87%E6%8E%92%E5%BA%8F%E7%AF%87.md)
4. [Section 分組管理篇](./3.%20Section%20%E5%88%86%E7%B5%84%E7%AE%A1%E7%90%86%E7%AF%87.md)
5. [主題與背景篇（theme、background style、全域樣式）](./4.%20%E4%B8%BB%E9%A1%8C%E8%88%87%E8%83%8C%E6%99%AF%E7%AF%87%EF%BC%88theme%E3%80%81background%20style%E3%80%81%E5%85%A8%E5%9F%9F%E6%A8%A3%E5%BC%8F%EF%BC%89.md)
6. [模板載入與套用篇（template → slides / elements）](./5.%20%E6%A8%A1%E6%9D%BF%E8%BC%89%E5%85%A5%E8%88%87%E5%A5%97%E7%94%A8%E7%AF%87%EF%BC%88template%20%E2%86%92%20slides%20/%20elements%EF%BC%89.md)
7. [頁面轉場動畫篇](./6.%20%E9%A0%81%E9%9D%A2%E8%BD%89%E5%A0%B4%E5%8B%95%E7%95%AB%E7%AF%87.md)
8. [元素動畫篇（animation data、播放順序、觸發時機）](./7.%20%E5%85%83%E7%B4%A0%E5%8B%95%E7%95%AB%E7%AF%87%EF%BC%88animation%20data%E3%80%81%E6%92%AD%E6%94%BE%E9%A0%86%E5%BA%8F%E3%80%81%E8%A7%B8%E7%99%BC%E6%99%82%E6%A9%9F%EF%BC%89.md)
9. [備註、批註與選擇面板篇](./8.%20%E5%82%99%E8%A8%BB%E3%80%81%E6%89%B9%E8%A8%BB%E8%88%87%E9%81%B8%E6%93%87%E9%9D%A2%E6%9D%BF%E7%AF%87.md)
10. [頁面操作與 history snapshot 篇](./9.%20%E9%A0%81%E9%9D%A2%E6%93%8D%E4%BD%9C%E8%88%87%20history%20snapshot%20%E7%AF%87.md)

## 原始碼對照入口

- `src/hooks/useSlideTheme.ts`
- `src/hooks/useSlideBackgroundStyle.ts`
- `src/hooks/useSectionHandler.ts`
- `src/hooks/useAddSlidesOrElements.ts`
- `src/hooks/useLoadSlides.ts`
- `src/configs/theme.ts`
- `src/configs/storage.ts`
- `src/store/slides.ts`

## 高頻回查入口

- 想先分清楚 slide 層級和 element 層級，看：[頁面資料模型篇（slide fields、elements、background、notes）](./1.%20%E9%A0%81%E9%9D%A2%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B%E7%AF%87%EF%BC%88slide%20fields%E3%80%81elements%E3%80%81background%E3%80%81notes%EF%BC%89.md)
- 想確認新增、刪除、複製頁面如何更新 store，看：[頁面新增、刪除、複製與排序篇](./2.%20%E9%A0%81%E9%9D%A2%E6%96%B0%E5%A2%9E%E3%80%81%E5%88%AA%E9%99%A4%E3%80%81%E8%A4%87%E8%A3%BD%E8%88%87%E6%8E%92%E5%BA%8F%E7%AF%87.md)
- 想確認大量頁面如何用 section 管理，看：[Section 分組管理篇](./3.%20Section%20%E5%88%86%E7%B5%84%E7%AE%A1%E7%90%86%E7%AF%87.md)
- 想確認主題和背景的責任差異，看：[主題與背景篇（theme、background style、全域樣式）](./4.%20%E4%B8%BB%E9%A1%8C%E8%88%87%E8%83%8C%E6%99%AF%E7%AF%87%EF%BC%88theme%E3%80%81background%20style%E3%80%81%E5%85%A8%E5%9F%9F%E6%A8%A3%E5%BC%8F%EF%BC%89.md)
- 想確認模板如何轉成實際 slides / elements，看：[模板載入與套用篇（template → slides / elements）](./5.%20%E6%A8%A1%E6%9D%BF%E8%BC%89%E5%85%A5%E8%88%87%E5%A5%97%E7%94%A8%E7%AF%87%EF%BC%88template%20%E2%86%92%20slides%20/%20elements%EF%BC%89.md)
- 想確認頁面轉場和元素動畫資料放在哪裡，看：[頁面轉場動畫篇](./6.%20%E9%A0%81%E9%9D%A2%E8%BD%89%E5%A0%B4%E5%8B%95%E7%95%AB%E7%AF%87.md)
- 想確認備註、批註、選擇面板屬於哪一層功能，看：[備註、批註與選擇面板篇](./8.%20%E5%82%99%E8%A8%BB%E3%80%81%E6%89%B9%E8%A8%BB%E8%88%87%E9%81%B8%E6%93%87%E9%9D%A2%E6%9D%BF%E7%AF%87.md)
- 想確認頁面操作何時能 undo / redo，看：[頁面操作與 history snapshot 篇](./9.%20%E9%A0%81%E9%9D%A2%E6%93%8D%E4%BD%9C%E8%88%87%20history%20snapshot%20%E7%AF%87.md)

## 補充工作區

- 想做一個簡化版 slide manager / theme / template demo 時，看：[slide-theme-template-demo](./slide-theme-template-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- slide 層級資料如何管理？
- theme / background / template 如何影響頁面？
- 動畫、轉場、備註、批註和頁面資料如何關聯？

## 返回上層

- [回到 PPTist 導航](../README.md)
