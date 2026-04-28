# 12-匯入匯出與資料持久化

本章主要整理 PPTist 的資料如何進來、如何出去、如何保存。這章不是只看匯出按鈕，而是把 import、export、print、storage、database、services、檔案資源與格式損失一起看。

## 本章在學什麼

- PPTist 啟動時資料來源可能來自哪裡
- 匯入檔案如何轉成內部 slides 資料模型
- 匯出時內部資料如何轉成圖片、PDF、PPTX 或其他格式
- 列印和匯出 PDF 的流程差異
- IndexedDB、localStorage、mock data、services 的責任差異
- 格式轉換為什麼很難做到完全無損

## 建議閱讀順序

1. [PPTist 匯入匯出與資料持久化入門](./0.%20PPTist%20%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA%E8%88%87%E8%B3%87%E6%96%99%E6%8C%81%E4%B9%85%E5%8C%96%E5%85%A5%E9%96%80.md)
2. [資料來源篇（mock、local storage、IndexedDB、services）](./1.%20%E8%B3%87%E6%96%99%E4%BE%86%E6%BA%90%E7%AF%87%EF%BC%88mock%E3%80%81local%20storage%E3%80%81IndexedDB%E3%80%81services%EF%BC%89.md)
3. [匯入流程篇（file input → parser/service → slides data）](./2.%20%E5%8C%AF%E5%85%A5%E6%B5%81%E7%A8%8B%E7%AF%87%EF%BC%88file%20input%20%E2%86%92%20parser/service%20%E2%86%92%20slides%20data%EF%BC%89.md)
4. [匯出流程篇（slides data → canvas/html/image/pdf/pptx）](./3.%20%E5%8C%AF%E5%87%BA%E6%B5%81%E7%A8%8B%E7%AF%87%EF%BC%88slides%20data%20%E2%86%92%20canvas/html/image/pdf/pptx%EF%BC%89.md)
5. [列印流程篇（print utils、頁面渲染、輸出限制）](./4.%20%E5%88%97%E5%8D%B0%E6%B5%81%E7%A8%8B%E7%AF%87%EF%BC%88print%20utils%E3%80%81%E9%A0%81%E9%9D%A2%E6%B8%B2%E6%9F%93%E3%80%81%E8%BC%B8%E5%87%BA%E9%99%90%E5%88%B6%EF%BC%89.md)
6. [資料持久化篇（database、storage key、save / load）](./5.%20%E8%B3%87%E6%96%99%E6%8C%81%E4%B9%85%E5%8C%96%E7%AF%87%EF%BC%88database%E3%80%81storage%20key%E3%80%81save%20/%20load%EF%BC%89.md)
7. [圖片與檔案資源處理篇（base64、blob、url、跨來源限制）](./6.%20%E5%9C%96%E7%89%87%E8%88%87%E6%AA%94%E6%A1%88%E8%B3%87%E6%BA%90%E8%99%95%E7%90%86%E7%AF%87%EF%BC%88base64%E3%80%81blob%E3%80%81url%E3%80%81%E8%B7%A8%E4%BE%86%E6%BA%90%E9%99%90%E5%88%B6%EF%BC%89.md)
8. [格式損失與兼容性篇（哪些能力無法完全還原）](./7.%20%E6%A0%BC%E5%BC%8F%E6%90%8D%E5%A4%B1%E8%88%87%E5%85%BC%E5%AE%B9%E6%80%A7%E7%AF%87%EF%BC%88%E5%93%AA%E4%BA%9B%E8%83%BD%E5%8A%9B%E7%84%A1%E6%B3%95%E5%AE%8C%E5%85%A8%E9%82%84%E5%8E%9F%EF%BC%89.md)
9. [從保存到重新載入的完整鏈路篇](./8.%20%E5%BE%9E%E4%BF%9D%E5%AD%98%E5%88%B0%E9%87%8D%E6%96%B0%E8%BC%89%E5%85%A5%E7%9A%84%E5%AE%8C%E6%95%B4%E9%8F%88%E8%B7%AF%E7%AF%87.md)
10. [匯入匯出二次開發檢查表篇](./9.%20%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA%E4%BA%8C%E6%AC%A1%E9%96%8B%E7%99%BC%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87.md)

## 原始碼對照入口

- `src/hooks/useImport.ts`
- `src/hooks/useExport.ts`
- `src/utils/print.ts`
- `src/services/*`
- `src/utils/database.ts`
- `src/configs/storage.ts`
- `src/store/slides.ts`

## 高頻回查入口

- 想先知道 PPTist 的資料可能從哪裡來，看：[資料來源篇（mock、local storage、IndexedDB、services）](./1.%20%E8%B3%87%E6%96%99%E4%BE%86%E6%BA%90%E7%AF%87%EF%BC%88mock%E3%80%81local%20storage%E3%80%81IndexedDB%E3%80%81services%EF%BC%89.md)
- 想確認匯入檔案如何轉成 slides，看：[匯入流程篇（file input → parser/service → slides data）](./2.%20%E5%8C%AF%E5%85%A5%E6%B5%81%E7%A8%8B%E7%AF%87%EF%BC%88file%20input%20%E2%86%92%20parser/service%20%E2%86%92%20slides%20data%EF%BC%89.md)
- 想確認匯出圖片 / PDF / PPTX 大概怎麼分工，看：[匯出流程篇（slides data → canvas/html/image/pdf/pptx）](./3.%20%E5%8C%AF%E5%87%BA%E6%B5%81%E7%A8%8B%E7%AF%87%EF%BC%88slides%20data%20%E2%86%92%20canvas/html/image/pdf/pptx%EF%BC%89.md)
- 想確認列印和匯出 PDF 的差異，看：[列印流程篇（print utils、頁面渲染、輸出限制）](./4.%20%E5%88%97%E5%8D%B0%E6%B5%81%E7%A8%8B%E7%AF%87%EF%BC%88print%20utils%E3%80%81%E9%A0%81%E9%9D%A2%E6%B8%B2%E6%9F%93%E3%80%81%E8%BC%B8%E5%87%BA%E9%99%90%E5%88%B6%EF%BC%89.md)
- 想確認保存與重新載入如何串起來，看：[資料持久化篇（database、storage key、save / load）](./5.%20%E8%B3%87%E6%96%99%E6%8C%81%E4%B9%85%E5%8C%96%E7%AF%87%EF%BC%88database%E3%80%81storage%20key%E3%80%81save%20/%20load%EF%BC%89.md)
- 想確認圖片資源為什麼容易造成匯出問題，看：[圖片與檔案資源處理篇（base64、blob、url、跨來源限制）](./6.%20%E5%9C%96%E7%89%87%E8%88%87%E6%AA%94%E6%A1%88%E8%B3%87%E6%BA%90%E8%99%95%E7%90%86%E7%AF%87%EF%BC%88base64%E3%80%81blob%E3%80%81url%E3%80%81%E8%B7%A8%E4%BE%86%E6%BA%90%E9%99%90%E5%88%B6%EF%BC%89.md)
- 想確認匯入匯出為什麼可能不完全無損，看：[格式損失與兼容性篇（哪些能力無法完全還原）](./7.%20%E6%A0%BC%E5%BC%8F%E6%90%8D%E5%A4%B1%E8%88%87%E5%85%BC%E5%AE%B9%E6%80%A7%E7%AF%87%EF%BC%88%E5%93%AA%E4%BA%9B%E8%83%BD%E5%8A%9B%E7%84%A1%E6%B3%95%E5%AE%8C%E5%85%A8%E9%82%84%E5%8E%9F%EF%BC%89.md)
- 想把一次保存再重新載入流程追完整，看：[從保存到重新載入的完整鏈路篇](./8.%20%E5%BE%9E%E4%BF%9D%E5%AD%98%E5%88%B0%E9%87%8D%E6%96%B0%E8%BC%89%E5%85%A5%E7%9A%84%E5%AE%8C%E6%95%B4%E9%8F%88%E8%B7%AF%E7%AF%87.md)

## 補充工作區

- 想用簡化版 import / export / save / load demo 驗證資料進出時，看：[import-export-persistence-demo](./import-export-persistence-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 資料如何從外部檔案轉成 slides？
- slides 如何輸出成不同格式？
- 保存、載入、匯出時哪些資訊可能失真？

## 返回上層

- [回到 PPTist 導航](../README.md)
