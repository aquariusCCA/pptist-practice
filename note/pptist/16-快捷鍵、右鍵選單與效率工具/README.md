# 16-快捷鍵、右鍵選單與效率工具

本章主要整理 PPTist 的高頻操作入口，包括快捷鍵、右鍵選單、貼上、搜尋、超連結、格式刷與一致化顯示工具。這些功能常常不是單一元件完成，而是由事件監聽、hooks、store 更新與 snapshot 串起來。

## 本章在學什麼

- 快捷鍵如何被註冊、監聽與分派到具體操作
- keyboardStore 保存哪些鍵盤狀態
- 右鍵選單如何根據目前選取狀態提供不同操作
- 貼上事件如何區分文字、圖片、元素與外部資料
- 搜尋、超連結、格式刷等效率工具如何修改資料
- 效率工具如何避免破壞元素資料與歷史快照一致性

## 建議閱讀順序

1. [PPTist 快捷鍵、右鍵選單與效率工具入門](./0.%20PPTist%20%E5%BF%AB%E6%8D%B7%E9%8D%B5%E3%80%81%E5%8F%B3%E9%8D%B5%E9%81%B8%E5%96%AE%E8%88%87%E6%95%88%E7%8E%87%E5%B7%A5%E5%85%B7%E5%85%A5%E9%96%80.md)
2. [全域快捷鍵篇（useGlobalHotkey、keydown、command dispatch）](./1.%20%E5%85%A8%E5%9F%9F%E5%BF%AB%E6%8D%B7%E9%8D%B5%E7%AF%87%EF%BC%88useGlobalHotkey%E3%80%81keydown%E3%80%81command%20dispatch%EF%BC%89.md)
3. [keyboardStore 篇（按鍵狀態、組合鍵、模式判斷）](./2.%20keyboardStore%20%E7%AF%87%EF%BC%88%E6%8C%89%E9%8D%B5%E7%8B%80%E6%85%8B%E3%80%81%E7%B5%84%E5%90%88%E9%8D%B5%E3%80%81%E6%A8%A1%E5%BC%8F%E5%88%A4%E6%96%B7%EF%BC%89.md)
4. [右鍵選單篇（選取狀態、menu items、操作分派）](./3.%20%E5%8F%B3%E9%8D%B5%E9%81%B8%E5%96%AE%E7%AF%87%EF%BC%88%E9%81%B8%E5%8F%96%E7%8B%80%E6%85%8B%E3%80%81menu%20items%E3%80%81%E6%93%8D%E4%BD%9C%E5%88%86%E6%B4%BE%EF%BC%89.md)
5. [貼上事件篇（文字、圖片、HTML、element clipboard）](./4.%20%E8%B2%BC%E4%B8%8A%E4%BA%8B%E4%BB%B6%E7%AF%87%EF%BC%88%E6%96%87%E5%AD%97%E3%80%81%E5%9C%96%E7%89%87%E3%80%81HTML%E3%80%81element%20clipboard%EF%BC%89.md)
6. [搜尋功能篇（useSearch、定位、選取、跳轉）](./5.%20%E6%90%9C%E5%B0%8B%E5%8A%9F%E8%83%BD%E7%AF%87%EF%BC%88useSearch%E3%80%81%E5%AE%9A%E4%BD%8D%E3%80%81%E9%81%B8%E5%8F%96%E3%80%81%E8%B7%B3%E8%BD%89%EF%BC%89.md)
7. [超連結功能篇（useLink、element link、跳轉行為）](./6.%20%E8%B6%85%E9%80%A3%E7%B5%90%E5%8A%9F%E8%83%BD%E7%AF%87%EF%BC%88useLink%E3%80%81element%20link%E3%80%81%E8%B7%B3%E8%BD%89%E8%A1%8C%E7%82%BA%EF%BC%89.md)
8. [文字格式刷篇](./7.%20%E6%96%87%E5%AD%97%E6%A0%BC%E5%BC%8F%E5%88%B7%E7%AF%87.md)
9. [形狀格式刷與統一顯示篇](./8.%20%E5%BD%A2%E7%8B%80%E6%A0%BC%E5%BC%8F%E5%88%B7%E8%88%87%E7%B5%B1%E4%B8%80%E9%A1%AF%E7%A4%BA%E7%AF%87.md)
10. [從操作入口到 store / snapshot 的完整鏈路篇](./9.%20%E5%BE%9E%E6%93%8D%E4%BD%9C%E5%85%A5%E5%8F%A3%E5%88%B0%20store%20/%20snapshot%20%E7%9A%84%E5%AE%8C%E6%95%B4%E9%8F%88%E8%B7%AF%E7%AF%87.md)

## 原始碼對照入口

- `src/hooks/useGlobalHotkey.ts`
- `src/store/keyboard.ts`
- `src/hooks/usePasteEvent.ts`
- `src/hooks/usePasteTextClipboardData.ts`
- `src/hooks/useSearch.ts`
- `src/hooks/useLink.ts`
- `src/hooks/useTextFormatPainter.ts`
- `src/hooks/useShapeFormatPainter.ts`
- `src/hooks/useUniformDisplayElement.ts`
- `src/hooks/useHistorySnapshot.ts`

## 高頻回查入口

- 想先知道快捷鍵、右鍵、貼上為什麼應該放同一章，看：[PPTist 快捷鍵、右鍵選單與效率工具入門](./0.%20PPTist%20%E5%BF%AB%E6%8D%B7%E9%8D%B5%E3%80%81%E5%8F%B3%E9%8D%B5%E9%81%B8%E5%96%AE%E8%88%87%E6%95%88%E7%8E%87%E5%B7%A5%E5%85%B7%E5%85%A5%E9%96%80.md)
- 想確認快捷鍵在哪裡被註冊，看：[全域快捷鍵篇（useGlobalHotkey、keydown、command dispatch）](./1.%20%E5%85%A8%E5%9F%9F%E5%BF%AB%E6%8D%B7%E9%8D%B5%E7%AF%87%EF%BC%88useGlobalHotkey%E3%80%81keydown%E3%80%81command%20dispatch%EF%BC%89.md)
- 想確認 keyboardStore 保存什麼，看：[keyboardStore 篇（按鍵狀態、組合鍵、模式判斷）](./2.%20keyboardStore%20%E7%AF%87%EF%BC%88%E6%8C%89%E9%8D%B5%E7%8B%80%E6%85%8B%E3%80%81%E7%B5%84%E5%90%88%E9%8D%B5%E3%80%81%E6%A8%A1%E5%BC%8F%E5%88%A4%E6%96%B7%EF%BC%89.md)
- 想確認右鍵選單如何根據選取狀態變化，看：[右鍵選單篇（選取狀態、menu items、操作分派）](./3.%20%E5%8F%B3%E9%8D%B5%E9%81%B8%E5%96%AE%E7%AF%87%EF%BC%88%E9%81%B8%E5%8F%96%E7%8B%80%E6%85%8B%E3%80%81menu%20items%E3%80%81%E6%93%8D%E4%BD%9C%E5%88%86%E6%B4%BE%EF%BC%89.md)
- 想確認貼上圖片、文字、元素時流程差異，看：[貼上事件篇（文字、圖片、HTML、element clipboard）](./4.%20%E8%B2%BC%E4%B8%8A%E4%BA%8B%E4%BB%B6%E7%AF%87%EF%BC%88%E6%96%87%E5%AD%97%E3%80%81%E5%9C%96%E7%89%87%E3%80%81HTML%E3%80%81element%20clipboard%EF%BC%89.md)
- 想確認搜尋如何定位到頁面或元素，看：[搜尋功能篇（useSearch、定位、選取、跳轉）](./5.%20%E6%90%9C%E5%B0%8B%E5%8A%9F%E8%83%BD%E7%AF%87%EF%BC%88useSearch%E3%80%81%E5%AE%9A%E4%BD%8D%E3%80%81%E9%81%B8%E5%8F%96%E3%80%81%E8%B7%B3%E8%BD%89%EF%BC%89.md)
- 想確認格式刷如何複製樣式，看：[文字格式刷篇](./7.%20%E6%96%87%E5%AD%97%E6%A0%BC%E5%BC%8F%E5%88%B7%E7%AF%87.md)
- 想把快捷鍵觸發到資料更新完整追一遍，看：[從操作入口到 store / snapshot 的完整鏈路篇](./9.%20%E5%BE%9E%E6%93%8D%E4%BD%9C%E5%85%A5%E5%8F%A3%E5%88%B0%20store%20/%20snapshot%20%E7%9A%84%E5%AE%8C%E6%95%B4%E9%8F%88%E8%B7%AF%E7%AF%87.md)

## 補充工作區

- 想用 command pattern 模擬快捷鍵 / 右鍵 / 貼上共同入口時，看：[command-entry-demo](./command-entry-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 快捷鍵、右鍵、貼上等操作入口如何分派到 hooks？
- 這些操作如何更新資料並產生 snapshot？
- 如何避免在文字編輯模式誤觸全域快捷鍵？

## 返回上層

- [回到 PPTist 導航](../README.md)
