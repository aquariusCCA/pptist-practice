# main store

`main store` 是編輯器當下互動狀態的中心。

這一篇只看互動狀態如何被操作，不再重複 `MainState` 的完整欄位語義。

## state

主要欄位：

- `activeElementIdList`
- `handleElementId`
- `activeGroupElementId`
- `hiddenElementIdList`
- `canvasPercentage`
- `canvasScale`
- `canvasDragged`
- `thumbnailsFocus`
- `editorAreaFocus`
- `disableHotkeys`
- `gridLineSize`
- `showRuler`
- `creatingElement`
- `creatingCustomShape`
- `toolbarState`
- `clipingImageElementId`
- `isScaling`
- `richTextAttrs`
- `selectedTableCells`
- `selectedSlidesIndex`
- `dialogForExport`
- `databaseId`
- `textFormatPainter`
- `shapeFormatPainter`
- `showSelectPanel`
- `showSearchPanel`
- `showNotesPanel`
- `showSymbolPanel`
- `showMarkupPanel`
- `showAIPPTDialog`

## getters

- `activeElementList`
- `handleElement`

## actions

- 選取相關
- 畫布相關
- 工具相關
- 面板相關
- 快捷鍵相關

## 你要懂的事

- 這裡存的是互動狀態，不是簡報內容
- 選取、拖曳、縮放、面板開關都在這裡
- `main store` 常常會和 `slides store` 一起運作，但責任不同
- `activeElementList`、`handleElement` 是根據 `slides store` 的目前頁面衍生出來的結果

## 對照

- [`src/store/main.ts`](../../../PPTist-SourceCode/src/store/main.ts)
- [`src/hooks/useSelectElement.ts`](../../../PPTist-SourceCode/src/hooks/useSelectElement.ts)
- [`src/hooks/useMoveElement.ts`](../../../PPTist-SourceCode/src/hooks/useMoveElement.ts)
