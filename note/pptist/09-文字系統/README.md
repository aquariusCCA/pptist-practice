# 09-文字系統

本章主要整理 `PPTist` 的文字與富文字編輯能力。文字系統不是單純 `<textarea>`，而是牽涉 text element 資料格式、ProseMirror 編輯器、文字樣式、選區、貼上、格式刷與歷史快照。

## 本章在學什麼

- text element 如何保存文字內容與樣式
- 普通文字輸入與富文字編輯的差異
- ProseMirror 在 PPTist 中扮演什麼角色
- 文字工具列如何改變 marks、colors、font、paragraph style
- 文字編輯期間如何處理選區、focus、blur 與同步更新
- 文字修改何時進入 history snapshot

## 建議閱讀順序

1. [PPTist 文字系統入門](./0.%20PPTist%20%E6%96%87%E5%AD%97%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
2. [文字元素資料模型篇（text element 欄位與 rich text content）](./1.%20%E6%96%87%E5%AD%97%E5%85%83%E7%B4%A0%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B%E7%AF%87%EF%BC%88text%20element%20%E6%AC%84%E4%BD%8D%E8%88%87%20rich%20text%20content%EF%BC%89.md)
3. [ProseMirror 接入篇（editor state、schema、view、commands）](./2.%20ProseMirror%20%E6%8E%A5%E5%85%A5%E7%AF%87%EF%BC%88editor%20state%E3%80%81schema%E3%80%81view%E3%80%81commands%EF%BC%89.md)
4. [文字樣式篇（字型、字級、顏色、粗斜底線、段落樣式）](./3.%20%E6%96%87%E5%AD%97%E6%A8%A3%E5%BC%8F%E7%AF%87%EF%BC%88%E5%AD%97%E5%9E%8B%E3%80%81%E5%AD%97%E7%B4%9A%E3%80%81%E9%A1%8F%E8%89%B2%E3%80%81%E7%B2%97%E6%96%9C%E5%BA%95%E7%B7%9A%E3%80%81%E6%AE%B5%E8%90%BD%E6%A8%A3%E5%BC%8F%EF%BC%89.md)
5. [文字編輯狀態篇（focus、selection、editing mode、同步 store）](./4.%20%E6%96%87%E5%AD%97%E7%B7%A8%E8%BC%AF%E7%8B%80%E6%85%8B%E7%AF%87%EF%BC%88focus%E3%80%81selection%E3%80%81editing%20mode%E3%80%81%E5%90%8C%E6%AD%A5%20store%EF%BC%89.md)
6. [OutlineEditor 與 TextArea 篇（大綱文字與簡易文字輸入）](./5.%20OutlineEditor%20%E8%88%87%20TextArea%20%E7%AF%87%EF%BC%88%E5%A4%A7%E7%B6%B1%E6%96%87%E5%AD%97%E8%88%87%E7%B0%A1%E6%98%93%E6%96%87%E5%AD%97%E8%BC%B8%E5%85%A5%EF%BC%89.md)
7. [文字貼上與格式處理篇（純文字、富文字、clipboard data）](./6.%20%E6%96%87%E5%AD%97%E8%B2%BC%E4%B8%8A%E8%88%87%E6%A0%BC%E5%BC%8F%E8%99%95%E7%90%86%E7%AF%87%EF%BC%88%E7%B4%94%E6%96%87%E5%AD%97%E3%80%81%E5%AF%8C%E6%96%87%E5%AD%97%E3%80%81clipboard%20data%EF%BC%89.md)
8. [文字格式刷與樣式複用篇](./7.%20%E6%96%87%E5%AD%97%E6%A0%BC%E5%BC%8F%E5%88%B7%E8%88%87%E6%A8%A3%E5%BC%8F%E8%A4%87%E7%94%A8%E7%AF%87.md)
9. [文字編輯與 history snapshot 篇](./8.%20%E6%96%87%E5%AD%97%E7%B7%A8%E8%BC%AF%E8%88%87%20history%20snapshot%20%E7%AF%87.md)

## 原始碼對照入口

- `src/utils/prosemirror/*`
- `src/views/components/element/ProsemirrorEditor.vue`
- `src/components/OutlineEditor.vue`
- `src/components/TextArea.vue`
- `src/components/TextColorButton.vue`
- `src/hooks/usePasteTextClipboardData.ts`
- `src/hooks/useTextFormatPainter.ts`

## 高頻回查入口

- 想先知道 PPTist 的文字為什麼不只是 textarea，看：[PPTist 文字系統入門](./0.%20PPTist%20%E6%96%87%E5%AD%97%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
- 想確認文字內容實際存在 element 的哪些欄位，看：[文字元素資料模型篇（text element 欄位與 rich text content）](./1.%20%E6%96%87%E5%AD%97%E5%85%83%E7%B4%A0%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B%E7%AF%87%EF%BC%88text%20element%20%E6%AC%84%E4%BD%8D%E8%88%87%20rich%20text%20content%EF%BC%89.md)
- 想理解 ProseMirror 如何接進 Vue 元件，看：[ProseMirror 接入篇（editor state、schema、view、commands）](./2.%20ProseMirror%20%E6%8E%A5%E5%85%A5%E7%AF%87%EF%BC%88editor%20state%E3%80%81schema%E3%80%81view%E3%80%81commands%EF%BC%89.md)
- 想確認工具列按鈕如何改變文字樣式，看：[文字樣式篇（字型、字級、顏色、粗斜底線、段落樣式）](./3.%20%E6%96%87%E5%AD%97%E6%A8%A3%E5%BC%8F%E7%AF%87%EF%BC%88%E5%AD%97%E5%9E%8B%E3%80%81%E5%AD%97%E7%B4%9A%E3%80%81%E9%A1%8F%E8%89%B2%E3%80%81%E7%B2%97%E6%96%9C%E5%BA%95%E7%B7%9A%E3%80%81%E6%AE%B5%E8%90%BD%E6%A8%A3%E5%BC%8F%EF%BC%89.md)
- 想確認使用者正在編輯文字時，store 是否即時同步，看：[文字編輯狀態篇（focus、selection、editing mode、同步 store）](./4.%20%E6%96%87%E5%AD%97%E7%B7%A8%E8%BC%AF%E7%8B%80%E6%85%8B%E7%AF%87%EF%BC%88focus%E3%80%81selection%E3%80%81editing%20mode%E3%80%81%E5%90%8C%E6%AD%A5%20store%EF%BC%89.md)
- 想確認大綱文字和畫布文字的關係，看：[OutlineEditor 與 TextArea 篇（大綱文字與簡易文字輸入）](./5.%20OutlineEditor%20%E8%88%87%20TextArea%20%E7%AF%87%EF%BC%88%E5%A4%A7%E7%B6%B1%E6%96%87%E5%AD%97%E8%88%87%E7%B0%A1%E6%98%93%E6%96%87%E5%AD%97%E8%BC%B8%E5%85%A5%EF%BC%89.md)
- 想確認貼上文字時如何處理格式，看：[文字貼上與格式處理篇（純文字、富文字、clipboard data）](./6.%20%E6%96%87%E5%AD%97%E8%B2%BC%E4%B8%8A%E8%88%87%E6%A0%BC%E5%BC%8F%E8%99%95%E7%90%86%E7%AF%87%EF%BC%88%E7%B4%94%E6%96%87%E5%AD%97%E3%80%81%E5%AF%8C%E6%96%87%E5%AD%97%E3%80%81clipboard%20data%EF%BC%89.md)
- 想確認文字修改何時可以 undo，看：[文字編輯與 history snapshot 篇](./8.%20%E6%96%87%E5%AD%97%E7%B7%A8%E8%BC%AF%E8%88%87%20history%20snapshot%20%E7%AF%87.md)

## 補充工作區

- 想用簡化版 ProseMirror / rich text demo 驗證文字資料同步時，看：[text-system-demo](./text-system-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 文字內容與文字樣式如何保存？
- ProseMirror 和 Vue 元件如何協作？
- 文字編輯如何與 store / snapshot 同步？

## 返回上層

- [回到 PPTist 導航](../README.md)
