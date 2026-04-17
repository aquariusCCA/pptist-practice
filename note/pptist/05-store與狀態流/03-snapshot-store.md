# snapshot store

`snapshot store` 負責 undo / redo 的資料保存與回復流程。

這一篇重點是歷史管理，不再重複 `snapshotCursor`、`snapshotLength` 以外的資料模型內容。

## state

- `snapshotCursor`
- `snapshotLength`

## getters

- `canUndo`
- `canRedo`

## actions

- `setSnapshotCursor`
- `setSnapshotLength`
- `initSnapshotDatabase`
- `addSnapshot`
- `unDo`
- `reDo`

## 你要懂的事

- 快照內容主要是 `slides` 與 `slideIndex`
- 快照存在 IndexedDB
- undo / redo 不是回復單一元素，而是回復一整個版本
- `snapshotCursor` 與 `snapshotLength` 只負責定位歷史版本，不代表內容本身

## 對照

- [`src/store/snapshot.ts`](../../../PPTist-SourceCode/src/store/snapshot.ts)
- [`src/utils/database.ts`](../../../PPTist-SourceCode/src/utils/database.ts)
