# PPTist Practice Notes

這份筆記主要整理 `PPTist` 原始碼閱讀過程中的專案理解，以及為了讀懂它而補的前端基礎與套件筆記。

## 這份筆記怎麼分

- `pptist/`：直接對應 `PPTist` 專案本身的閱讀筆記
- `web-basics/`：閱讀過程中補的 JavaScript、TypeScript、Vite 等基礎筆記
- `libraries/`：第三方套件的速查入口

## 建議閱讀順序

1. 先看 [PPTist 章節導航](./pptist/README.md)
2. 讀到卡住的基礎點，再回查 [Web Basics](./web-basics/README.md)
3. 遇到具體套件時，再查 [Libraries](./libraries/README.md)

## 章節導航

### PPTist

- [查看本章導航](./pptist/README.md)
- [畫布系統](./pptist/03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/README.md)
- [縮圖系統](./pptist/04-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/README.md)

### Web Basics

- [查看本章導航](./web-basics/README.md)
- [JavaScript](./web-basics/javascript/README.md)
- [TypeScript](./web-basics/typescript/README.md)
- [Vite](./web-basics/vite/README.md)

### Libraries

- [查看本章導航](./libraries/README.md)

## 快速回查入口

- 想先建立 `PPTist` 畫布模型的整體概念，看：[PPTist 畫布系統入門](./pptist/03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/pptist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
- 想先理解 `PPTist` 的固定座標系與縮放邏輯，看：[PPTist 畫布系統入門](./pptist/03-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1/pptist-%E7%95%AB%E5%B8%83%E7%B3%BB%E7%B5%B1%E5%85%A5%E9%96%80.md)
- 想理解縮圖元件為什麼要縮內層不縮外層，看：[縮圖元件設計筆記](./pptist/04-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/%E7%B8%AE%E5%9C%96%E5%85%83%E4%BB%B6%E8%A8%AD%E8%A8%88%E7%AD%86%E8%A8%98.md)
- 想補事件路徑概念，看：[composed-path](./web-basics/javascript/composed-path.md)
- 想補 `typeof` 的基本用法，看：[typeof-用法](./web-basics/typescript/typeof-%E7%94%A8%E6%B3%95.md)
