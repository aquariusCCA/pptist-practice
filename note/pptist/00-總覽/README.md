# 00-總覽

這一章不是要把 `PPTist` 的所有功能一次講完，而是先建立整體地圖。

如果把 [`note/pptist/README.md`](../README.md) 當成主索引，這一頁就是第一個落點：

1. 先知道 `PPTist` 是什麼
2. 再知道它由哪些大模組組成
3. 最後知道接下來應該怎麼讀

## 這一章要解決什麼

- `PPTist` 的產品定位是什麼
- 它和一般簡報工具、畫布工具、低代碼編輯器有什麼不同
- 它的主要能力範圍有哪些
- 後面各章在整個系統裡各自負責什麼

## 你應該先建立的理解

- `PPTist` 是一個 Web 簡報編輯與播放應用，不只是單純的畫布工具
- 核心不是某一個元件，而是「資料模型 + 編輯器骨架 + 畫布互動 + 元素系統 + 演示輸出」的整體
- 你要學的是一條系統路線，不是孤立地背功能

## 閱讀順序

這一章看完後，請回到主索引按順序往下讀。

1. [PPTist Learning Map](../README.md)
2. [01-資料模型](../01-%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B/README.md)
3. [02-編輯器骨架](../02-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%AA%A8%E6%9E%B6/README.md)
4. [03-畫布系統](../03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/README.md)

## 這一章的重點

### 1. 產品定位
- `PPTist` 不是低代碼平台
- `PPTist` 不是純畫圖工具
- `PPTist` 也不是簡單的簡報預覽器
- 它的定位是 Web-based slideshow application

### 2. 功能版圖
- 桌面端編輯
- 簡報播放與預覽
- 手機端簡化編輯與預覽
- 匯入匯出與列印
- AI PPT
- 自訂元素與擴充

### 3. 模組分層
- 資料層：slides、elements、theme、template、history
- 編輯層：選取、拖曳、縮放、排序、對齊、鎖定、隱藏
- 元素層：文字、圖片、圖形、線條、圖表、表格、影片、音訊、公式
- 演示層：播放、縮圖、批註、全螢幕、計時器、演講者視圖
- 輸出層：匯出 PPTX、JSON、圖片、PDF

## 讀這章時要回答的問題

1. `PPTist` 到底在解決什麼問題
2. 它和一般編輯器最大的差異是什麼
3. 為什麼要先讀資料模型，而不是直接看元件
4. 哪些能力屬於主線，哪些能力屬於延伸功能

## 對照文件

- [`PPTist-SourceCode/README_zh.md`](../../../PPTist-SourceCode/README_zh.md)
- [`PPTist-SourceCode/doc/DirectoryAndData.md`](../../../PPTist-SourceCode/doc/DirectoryAndData.md)
- [`PPTist-SourceCode/doc/Canvas.md`](../../../PPTist-SourceCode/doc/Canvas.md)
- [`PPTist-SourceCode/doc/Q&A.md`](../../../PPTist-SourceCode/doc/Q%26A.md)

## 下一步

讀完這章後，直接進入：

1. [01-資料模型](../01-%E8%B3%87%E6%96%99%E6%A8%A1%E5%9E%8B/README.md)
2. [02-編輯器骨架](../02-%E7%B7%A8%E8%BC%AF%E5%99%A8%E9%AA%A8%E6%9E%B6/README.md)

