# 01-專案入口與模式切換

本章主要整理 `PPTist` 從應用啟動到進入不同使用模式的流程。這是閱讀資料模型、store、編輯器骨架之前的前置章節，用來先搞清楚使用者從哪裡進來、畫面由誰承接、Editor / Screen / Mobile 三種模式如何分工。

## 本章在學什麼

- `main.ts` 如何掛載 Vue App 並註冊全域能力
- `App.vue` 在整個應用中的承接角色
- router 如何決定進入桌面編輯、播放頁或手機端
- Editor / Screen / Mobile 三種模式的責任邊界
- 哪些 store、元件、工具函數會跨模式共用
- 使用者從 URL 進入畫面後，資料與畫面如何初始化

## 建議閱讀順序

1. [PPTist 專案入口與模式切換入門](./0.%20PPTist%20%E5%B0%88%E6%A1%88%E5%85%A5%E5%8F%A3%E8%88%87%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8F%9B%E5%85%A5%E9%96%80.md)
2. [main.ts 與全域初始化篇（createApp、Pinia、router、plugins）](./1.%20main.ts%20%E8%88%87%E5%85%A8%E5%9F%9F%E5%88%9D%E5%A7%8B%E5%8C%96%E7%AF%87%EF%BC%88createApp%E3%80%81Pinia%E3%80%81router%E3%80%81plugins%EF%BC%89.md)
3. [App.vue 承接篇（根元件、路由出口、全域狀態）](./2.%20App.vue%20%E6%89%BF%E6%8E%A5%E7%AF%87%EF%BC%88%E6%A0%B9%E5%85%83%E4%BB%B6%E3%80%81%E8%B7%AF%E7%94%B1%E5%87%BA%E5%8F%A3%E3%80%81%E5%85%A8%E5%9F%9F%E7%8B%80%E6%85%8B%EF%BC%89.md)
4. [router 模式切換篇（Editor、Screen、Mobile 的入口）](./3.%20router%20%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8F%9B%E7%AF%87%EF%BC%88Editor%E3%80%81Screen%E3%80%81Mobile%20%E7%9A%84%E5%85%A5%E5%8F%A3%EF%BC%89.md)
5. [Editor / Screen / Mobile 分工篇（同一份簡報的三種使用情境）](./4.%20Editor%20/%20Screen%20/%20Mobile%20%E5%88%86%E5%B7%A5%E7%AF%87%EF%BC%88%E5%90%8C%E4%B8%80%E4%BB%BD%E7%B0%A1%E5%A0%B1%E7%9A%84%E4%B8%89%E7%A8%AE%E4%BD%BF%E7%94%A8%E6%83%85%E5%A2%83%EF%BC%89.md)
6. [跨模式共用資源篇（store、element renderer、utils、configs）](./5.%20%E8%B7%A8%E6%A8%A1%E5%BC%8F%E5%85%B1%E7%94%A8%E8%B3%87%E6%BA%90%E7%AF%87%EF%BC%88store%E3%80%81element%20renderer%E3%80%81utils%E3%80%81configs%EF%BC%89.md)
7. [從 URL 到畫面載入完整流程篇](./6.%20%E5%BE%9E%20URL%20%E5%88%B0%E7%95%AB%E9%9D%A2%E8%BC%89%E5%85%A5%E5%AE%8C%E6%95%B4%E6%B5%81%E7%A8%8B%E7%AF%87.md)

## 原始碼對照入口

- `src/main.ts`
- `src/App.vue`
- `src/router/*`
- `src/views/Editor/*`
- `src/views/Screen/*`
- `src/views/Mobile/*`
- `src/store/index.ts`

## 高頻回查入口

- 想先知道 PPTist 啟動後第一個進入點在哪裡，看：[PPTist 專案入口與模式切換入門](./0.%20PPTist%20%E5%B0%88%E6%A1%88%E5%85%A5%E5%8F%A3%E8%88%87%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8F%9B%E5%85%A5%E9%96%80.md)
- 想確認 `main.ts` 做了哪些全域註冊，看：[main.ts 與全域初始化篇（createApp、Pinia、router、plugins）](./1.%20main.ts%20%E8%88%87%E5%85%A8%E5%9F%9F%E5%88%9D%E5%A7%8B%E5%8C%96%E7%AF%87%EF%BC%88createApp%E3%80%81Pinia%E3%80%81router%E3%80%81plugins%EF%BC%89.md)
- 想確認 `App.vue` 和 router 的分工，看：[App.vue 承接篇（根元件、路由出口、全域狀態）](./2.%20App.vue%20%E6%89%BF%E6%8E%A5%E7%AF%87%EF%BC%88%E6%A0%B9%E5%85%83%E4%BB%B6%E3%80%81%E8%B7%AF%E7%94%B1%E5%87%BA%E5%8F%A3%E3%80%81%E5%85%A8%E5%9F%9F%E7%8B%80%E6%85%8B%EF%BC%89.md)
- 想確認桌面編輯、播放、手機端如何被路由切開，看：[router 模式切換篇（Editor、Screen、Mobile 的入口）](./3.%20router%20%E6%A8%A1%E5%BC%8F%E5%88%87%E6%8F%9B%E7%AF%87%EF%BC%88Editor%E3%80%81Screen%E3%80%81Mobile%20%E7%9A%84%E5%85%A5%E5%8F%A3%EF%BC%89.md)
- 想確認三種模式共用哪些資料與元件，看：[Editor / Screen / Mobile 分工篇（同一份簡報的三種使用情境）](./4.%20Editor%20/%20Screen%20/%20Mobile%20%E5%88%86%E5%B7%A5%E7%AF%87%EF%BC%88%E5%90%8C%E4%B8%80%E4%BB%BD%E7%B0%A1%E5%A0%B1%E7%9A%84%E4%B8%89%E7%A8%AE%E4%BD%BF%E7%94%A8%E6%83%85%E5%A2%83%EF%BC%89.md)
- 想用一條線串起「網址 → router → view → store → 畫面」，看：[從 URL 到畫面載入完整流程篇](./6.%20%E5%BE%9E%20URL%20%E5%88%B0%E7%95%AB%E9%9D%A2%E8%BC%89%E5%85%A5%E5%AE%8C%E6%95%B4%E6%B5%81%E7%A8%8B%E7%AF%87.md)

## 補充工作區

- 想做一個簡化版三模式切換範例時，看：[entry-mode-switch-demo](./entry-mode-switch-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 使用者從 URL 進入後，會經過哪些入口檔案？
- Editor / Screen / Mobile 三種模式各自負責什麼？
- 哪些資料與元件是跨模式共用？

## 返回上層

- [回到 PPTist 導航](../README.md)
