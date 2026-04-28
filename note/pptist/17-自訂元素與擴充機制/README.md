# 17-自訂元素與擴充機制

本章主要整理 PPTist 如何進行二次擴充，包括自訂元素、plugins、directives、共用元件、右側面板、渲染場景、匯入匯出與 history snapshot 的接入點。

## 本章在學什麼

- PPTist 哪些地方是可擴充點，哪些地方不適合硬改
- 自訂元素需要定義哪些資料欄位
- 自訂元素如何接入編輯器、縮圖、放映、手機端渲染
- 自訂元素如何接入右側屬性面板與工具列
- plugins / directives / components 的責任差異
- 擴充功能時如何避免破壞匯入匯出與 snapshot

## 建議閱讀順序

1. [PPTist 自訂元素與擴充機制入門](./0.%20PPTist%20%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E8%88%87%E6%93%B4%E5%85%85%E6%A9%9F%E5%88%B6%E5%85%A5%E9%96%80.md)
2. [擴充點總覽篇（plugins、directives、components、configs、hooks）](./1.%20%E6%93%B4%E5%85%85%E9%BB%9E%E7%B8%BD%E8%A6%BD%E7%AF%87%EF%BC%88plugins%E3%80%81directives%E3%80%81components%E3%80%81configs%E3%80%81hooks%EF%BC%89.md)
3. [自訂元素資料模型篇](./2.%20%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B%E7%AF%87.md)
4. [自訂元素渲染篇（editable、thumbnail、screen、mobile）](./3.%20%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88editable%E3%80%81thumbnail%E3%80%81screen%E3%80%81mobile%EF%BC%89.md)
5. [自訂元素屬性面板篇](./4.%20%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E5%B1%AC%E6%80%A7%E9%9D%A2%E6%9D%BF%E7%AF%87.md)
6. [自訂元素操作接入篇（select、move、resize、snapshot）](./5.%20%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E6%93%8D%E4%BD%9C%E6%8E%A5%E5%85%A5%E7%AF%87%EF%BC%88select%E3%80%81move%E3%80%81resize%E3%80%81snapshot%EF%BC%89.md)
7. [plugins 與 directives 篇](./6.%20plugins%20%E8%88%87%20directives%20%E7%AF%87.md)
8. [共用元件擴充篇](./7.%20%E5%85%B1%E7%94%A8%E5%85%83%E4%BB%B6%E6%93%B4%E5%85%85%E7%AF%87.md)
9. [匯入匯出與持久化接入篇](./8.%20%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA%E8%88%87%E6%8C%81%E4%B9%85%E5%8C%96%E6%8E%A5%E5%85%A5%E7%AF%87.md)
10. [完整新增一個自訂元素檢查表篇](./9.%20%E5%AE%8C%E6%95%B4%E6%96%B0%E5%A2%9E%E4%B8%80%E5%80%8B%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87.md)

## 原始碼對照入口

- `src/plugins/*`
- `src/plugins/directive/*`
- `doc/CustomElement.md`
- `src/components/*`
- `src/views/components/element/*`
- `src/views/Editor/Panel/*`
- `src/configs/element.ts`
- `src/types/slides.ts`

## 高頻回查入口

- 想先知道 PPTist 可以從哪些地方擴充，看：[擴充點總覽篇（plugins、directives、components、configs、hooks）](./1.%20%E6%93%B4%E5%85%85%E9%BB%9E%E7%B8%BD%E8%A6%BD%E7%AF%87%EF%BC%88plugins%E3%80%81directives%E3%80%81components%E3%80%81configs%E3%80%81hooks%EF%BC%89.md)
- 想確認自訂元素資料該怎麼設計，看：[自訂元素資料模型篇](./2.%20%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B%E7%AF%87.md)
- 想確認新增元素後要補哪些渲染場景，看：[自訂元素渲染篇（editable、thumbnail、screen、mobile）](./3.%20%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E6%B8%B2%E6%9F%93%E7%AF%87%EF%BC%88editable%E3%80%81thumbnail%E3%80%81screen%E3%80%81mobile%EF%BC%89.md)
- 想確認右側屬性面板如何接入自訂元素，看：[自訂元素屬性面板篇](./4.%20%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E5%B1%AC%E6%80%A7%E9%9D%A2%E6%9D%BF%E7%AF%87.md)
- 想確認自訂元素能否沿用選取、拖曳、縮放，看：[自訂元素操作接入篇（select、move、resize、snapshot）](./5.%20%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E6%93%8D%E4%BD%9C%E6%8E%A5%E5%85%A5%E7%AF%87%EF%BC%88select%E3%80%81move%E3%80%81resize%E3%80%81snapshot%EF%BC%89.md)
- 想確認 plugins 和 directives 的角色，看：[plugins 與 directives 篇](./6.%20plugins%20%E8%88%87%20directives%20%E7%AF%87.md)
- 想確認擴充後匯入匯出是否要改，看：[匯入匯出與持久化接入篇](./8.%20%E5%8C%AF%E5%85%A5%E5%8C%AF%E5%87%BA%E8%88%87%E6%8C%81%E4%B9%85%E5%8C%96%E6%8E%A5%E5%85%A5%E7%AF%87.md)
- 想照清單完整新增一個元素，看：[完整新增一個自訂元素檢查表篇](./9.%20%E5%AE%8C%E6%95%B4%E6%96%B0%E5%A2%9E%E4%B8%80%E5%80%8B%E8%87%AA%E8%A8%82%E5%85%83%E7%B4%A0%E6%AA%A2%E6%9F%A5%E8%A1%A8%E7%AF%87.md)

## 補充工作區

- 想用最小範例新增一個 custom badge / card element 時，看：[custom-element-demo](./custom-element-demo/README.md)

## 本章完成標準


讀完本章後，至少要能回答：

- 新增自訂元素需要補哪些資料、渲染、面板與匯出邏輯？
- plugins、directives、components 的責任差異是什麼？
- 擴充時如何避免破壞既有操作流？

## 返回上層

- [回到 PPTist 導航](../README.md)
