# 14-手機端

本章主要整理 PPTist 手機端如何承接簡報資料、如何簡化桌面端能力、如何處理觸控互動與小螢幕限制。手機端不是完整複製桌面編輯器，而是針對使用場景做取捨。

## 本章在學什麼

- 手機端入口與桌面端入口如何區分
- Mobile view 和 MobileEditor 的頁面結構
- 手機端保留哪些簡報瀏覽或編輯能力
- 哪些桌面端功能在手機端被省略或簡化
- 觸控事件如何取代滑鼠事件
- 手機端是否共用 slide / element 資料與 renderer

## 建議閱讀順序

1. [PPTist 手機端入門](./0.%20PPTist%20%E6%89%8B%E6%A9%9F%E7%AB%AF%E5%85%A5%E9%96%80.md)
2. [Mobile 入口與路由篇](./1.%20Mobile%20%E5%85%A5%E5%8F%A3%E8%88%87%E8%B7%AF%E7%94%B1%E7%AF%87.md)
3. [Mobile View 結構篇（頁面、工具列、內容區）](./2.%20Mobile%20View%20%E7%B5%90%E6%A7%8B%E7%AF%87%EF%BC%88%E9%A0%81%E9%9D%A2%E3%80%81%E5%B7%A5%E5%85%B7%E5%88%97%E3%80%81%E5%85%A7%E5%AE%B9%E5%8D%80%EF%BC%89.md)
4. [MobileEditor 篇（手機端編輯器的保留與取捨）](./3.%20MobileEditor%20%E7%AF%87%EF%BC%88%E6%89%8B%E6%A9%9F%E7%AB%AF%E7%B7%A8%E8%BC%AF%E5%99%A8%E7%9A%84%E4%BF%9D%E7%95%99%E8%88%87%E5%8F%96%E6%8D%A8%EF%BC%89.md)
5. [手機端資料共用篇（slide / element / store）](./4.%20%E6%89%8B%E6%A9%9F%E7%AB%AF%E8%B3%87%E6%96%99%E5%85%B1%E7%94%A8%E7%AF%87%EF%BC%88slide%20/%20element%20/%20store%EF%BC%89.md)
6. [手機端渲染篇（與桌面端 renderer 的共用與差異）](./5.%20%E6%89%8B%E6%A9%9F%E7%AB%AF%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E8%88%87%E6%A1%8C%E9%9D%A2%E7%AB%AF%20renderer%20%E7%9A%84%E5%85%B1%E7%94%A8%E8%88%87%E5%B7%AE%E7%95%B0%EF%BC%89.md)
7. [觸控互動篇（tap、drag、gesture、selection）](./6.%20%E8%A7%B8%E6%8E%A7%E4%BA%92%E5%8B%95%E7%AF%87%EF%BC%88tap%E3%80%81drag%E3%80%81gesture%E3%80%81selection%EF%BC%89.md)
8. [響應式與 viewport 限制篇](./7.%20%E9%9F%BF%E6%87%89%E5%BC%8F%E8%88%87%20viewport%20%E9%99%90%E5%88%B6%E7%AF%87.md)
9. [桌面端與手機端功能差異檢查表篇](./8.%20%E6%A1%8C%E9%9D%A2%E7%AB%AF%E8%88%87%E6%89%8B%E6%A9%9F%E7%AB%AF%E5%8A%9F%E8%83%BD%E5%B7%AE%E7%95%B0%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87.md)

## 原始碼對照入口

- `src/views/Mobile/*`
- `src/views/Mobile/MobileEditor/*`
- `src/views/components/element/*`
- `src/store/slides.ts`
- `src/store/main.ts`

## 高頻回查入口

- 想先知道手機端是另一個 App 還是同一個 App 的不同路由，看：[Mobile 入口與路由篇](./1.%20Mobile%20%E5%85%A5%E5%8F%A3%E8%88%87%E8%B7%AF%E7%94%B1%E7%AF%87.md)
- 想確認 Mobile 頁面結構如何組成，看：[Mobile View 結構篇（頁面、工具列、內容區）](./2.%20Mobile%20View%20%E7%B5%90%E6%A7%8B%E7%AF%87%EF%BC%88%E9%A0%81%E9%9D%A2%E3%80%81%E5%B7%A5%E5%85%B7%E5%88%97%E3%80%81%E5%85%A7%E5%AE%B9%E5%8D%80%EF%BC%89.md)
- 想確認手機端編輯器保留哪些能力，看：[MobileEditor 篇（手機端編輯器的保留與取捨）](./3.%20MobileEditor%20%E7%AF%87%EF%BC%88%E6%89%8B%E6%A9%9F%E7%AB%AF%E7%B7%A8%E8%BC%AF%E5%99%A8%E7%9A%84%E4%BF%9D%E7%95%99%E8%88%87%E5%8F%96%E6%8D%A8%EF%BC%89.md)
- 想確認手機端是否共用桌面端資料模型，看：[手機端資料共用篇（slide / element / store）](./4.%20%E6%89%8B%E6%A9%9F%E7%AB%AF%E8%B3%87%E6%96%99%E5%85%B1%E7%94%A8%E7%AF%87%EF%BC%88slide%20/%20element%20/%20store%EF%BC%89.md)
- 想確認手機端 renderer 是否和桌面端一致，看：[手機端渲染篇（與桌面端 renderer 的共用與差異）](./5.%20%E6%89%8B%E6%A9%9F%E7%AB%AF%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88%E8%88%87%E6%A1%8C%E9%9D%A2%E7%AB%AF%20renderer%20%E7%9A%84%E5%85%B1%E7%94%A8%E8%88%87%E5%B7%AE%E7%95%B0%EF%BC%89.md)
- 想確認觸控互動如何替代滑鼠互動，看：[觸控互動篇（tap、drag、gesture、selection）](./6.%20%E8%A7%B8%E6%8E%A7%E4%BA%92%E5%8B%95%E7%AF%87%EF%BC%88tap%E3%80%81drag%E3%80%81gesture%E3%80%81selection%EF%BC%89.md)
- 想評估某個桌面功能要不要搬到手機端，看：[桌面端與手機端功能差異檢查表篇](./8.%20%E6%A1%8C%E9%9D%A2%E7%AB%AF%E8%88%87%E6%89%8B%E6%A9%9F%E7%AB%AF%E5%8A%9F%E8%83%BD%E5%B7%AE%E7%95%B0%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87.md)

## 補充工作區

- 想用小 demo 驗證手機端 viewport / touch / element render 時，看：[mobile-editor-demo](./mobile-editor-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 手機端入口與桌面端入口如何區分？
- 手機端保留與省略哪些能力？
- 觸控與小螢幕如何影響元素操作與渲染？

## 返回上層

- [回到 PPTist 導航](../README.md)
