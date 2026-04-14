# `<component :is="...">` 動態組件教學筆記

所屬章節：[Vue](./README.md)

## 本節導讀

這篇要解決的是一個很典型的 Vue 初學卡點：你看到模板裡不是直接寫 `<MyComponent />`，而是寫成：

```vue
<component :is="someComponent" />
```

如果你不熟這個語法，會很難讀懂 `PPTist` 的 `ThumbnailElement`。因為它就是靠這個機制，根據元素型別決定目前應該渲染圖片元件、文字元件、圖表元件，還是其他元件。

這篇會先從「什麼是動態組件」開始，再回到 `PPTist` 的實際案例做拆解。

## 關鍵字

- 主題：Vue 動態組件、特殊元素、元件分派
- 英文：dynamic component, `<component>`, `:is`
- 常見搜尋：`vue component is`、`dynamic component vue`、`<component :is>`、`vue 動態元件`
- 易混淆：HTML 原生 `<component>`、`v-if` 切換元件、字串元件名 vs 元件物件

## 建議回查情境

- 當你看到 `<component :is="...">` 不知道 Vue 最後會渲染什麼時
- 當你想用一組資料，決定目前要顯示哪個元件時
- 當你在看 `PPTist` 的 `ThumbnailElement`，想弄懂它如何依元素型別切換元件時

## 30 秒複習入口

- `<component>` 是 Vue 提供的特殊元素，不是一般 HTML 標籤。
- `:is` 告訴 Vue「這個位置現在應該渲染哪個元件」。
- 你可以傳元件物件、已註冊元件名稱，或某些原生標籤名稱。
- `PPTist` 的 `ThumbnailElement` 用它來做「元素型別 -> 對應元件」的分派。

## 速查區

### 核心定義

- `<component>`：Vue 內建的特殊元素，用來承載動態切換的元件
- `:is`：指定這個位置要渲染哪個元件
- 動態組件：不是把元件名稱寫死，而是讓它由資料決定

### 最小用法

```vue
<component :is="currentComponent" />
```

```ts
import AComp from './AComp.vue'
import BComp from './BComp.vue'

const currentComponent = computed(() => {
  return mode.value === 'a' ? AComp : BComp
})
```

### 最重要的判斷

- 如果 `:is` 指向 `AComp`，Vue 就渲染 `AComp`
- 如果 `:is` 指向 `BComp`，Vue 就渲染 `BComp`
- 如果 `:is` 是 `null`，通常就不會渲染出有效元件

### 一句話理解

`<component :is="x">` 可以理解成「這裡先保留一個坑位，等資料決定要塞哪個元件進來」。

## 1. 為什麼需要動態組件

先看一個沒有動態組件的世界。

如果你只會這樣寫：

```vue
<BaseImageElement v-if="type === 'image'" />
<BaseTextElement v-else-if="type === 'text'" />
<BaseShapeElement v-else-if="type === 'shape'" />
<BaseLineElement v-else-if="type === 'line'" />
```

當元件種類越來越多時，模板會越來越長，而且維護成本很高。

如果今天你有：

- 圖片
- 文字
- 形狀
- 線條
- 圖表
- 表格
- LaTeX
- 影片
- 音訊

那整段 `v-if / v-else-if` 鏈會很快變得難讀。

這時更自然的寫法會是：

1. 先在 JavaScript / TypeScript 裡決定「要用哪個元件」
2. 模板只保留一個統一出口來渲染它

這就是 `<component :is="...">` 最典型的使用場景。

## 2. `<component>` 不是普通 HTML 標籤

在 Vue 裡，`<component>` 是一個特殊元素。  
你不會在瀏覽器原生 HTML API 裡用它來做一般 DOM 結構。

它的用途非常明確：

- 這裡之後會放一個元件
- 但元件是誰，不是現在寫死，而是等 `:is` 來決定

所以這段：

```vue
<component :is="currentComponent" />
```

不要讀成：

```text
渲染一個叫 component 的標籤
```

而要讀成：

```text
在這個位置，渲染 currentComponent 指向的那個元件
```

## 3. `:is` 到底可以放什麼

最常見的有三種：

### 3.1 放元件物件

這是 `PPTist` 目前最常用、也最穩定的寫法。

```ts
import BaseImageElement from './BaseImageElement.vue'

const currentComponent = BaseImageElement
```

```vue
<component :is="currentComponent" />
```

這時 `currentComponent` 就是你 `import` 進來的元件物件。

### 3.2 放已註冊的元件名稱字串

```vue
<component :is="'MyCard'" />
```

前提是 `MyCard` 必須已經是目前上下文可用的元件名稱。

### 3.3 放原生標籤名稱

```vue
<component :is="'div'">Hello</component>
```

這時 Vue 會渲染成普通的 `<div>`。

不過在你現在讀 `PPTist` 的情境裡，最重要的是第一種：  
`PPTist` 主要是把 `:is` 綁到「元件物件」。

## 4. 一個最小可理解範例

假設你有兩種卡片：

- 圖片卡
- 文字卡

先建立兩個元件：

```vue
<!-- ImageCard.vue -->
<template>
  <div>我是圖片卡</div>
</template>
```

```vue
<!-- TextCard.vue -->
<template>
  <div>我是文字卡</div>
</template>
```

父元件這樣寫：

```vue
<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ImageCard from './ImageCard.vue'
import TextCard from './TextCard.vue'

const type = ref<'image' | 'text'>('image')

const currentComponent = computed(() => {
  return type.value === 'image' ? ImageCard : TextCard
})
</script>
```

執行時：

- `type = 'image'` -> 顯示 `ImageCard`
- `type = 'text'` -> 顯示 `TextCard`

這就是動態組件最核心的行為。

## 5. 回到 `PPTist`：`ThumbnailElement` 怎麼用它

先看 `PPTist` 原始碼：[ThumbnailElement.vue](../../../PPTist-SourceCode/src/views/components/ThumbnailSlide/ThumbnailElement.vue)

```vue
<component
  :is="currentElementComponent"
  :elementInfo="elementInfo"
  target="thumbnail"
></component>
```

這段可以拆成三步理解。

### 5.1 第一步：先根據元素型別決定要用哪個元件

`ThumbnailElement` 裡有一個對照表：

```ts
const elementTypeMap = {
  [ElementTypes.IMAGE]: BaseImageElement,
  [ElementTypes.TEXT]: BaseTextElement,
  [ElementTypes.SHAPE]: BaseShapeElement,
  [ElementTypes.LINE]: BaseLineElement,
  [ElementTypes.CHART]: BaseChartElement,
  [ElementTypes.TABLE]: BaseTableElement,
  [ElementTypes.LATEX]: BaseLatexElement,
  [ElementTypes.VIDEO]: BaseVideoElement,
  [ElementTypes.AUDIO]: BaseAudioElement,
}
```

這表示：

- 如果型別是圖片，就用 `BaseImageElement`
- 如果型別是文字，就用 `BaseTextElement`
- 如果型別是圖表，就用 `BaseChartElement`

也就是說，它先把「資料型別」映射成「元件」。

### 5.2 第二步：用 `computed` 算出目前元件

```ts
const currentElementComponent = computed(() => {
  return elementTypeMap[props.elementInfo.type] || null
})
```

這段的意思是：

- 看 `props.elementInfo.type`
- 去對照表裡找對應元件
- 找不到就回傳 `null`

所以 `currentElementComponent` 不是固定值，而是會跟著不同 element 資料改變。

### 5.3 第三步：交給 `<component :is>` 實際渲染

```vue
<component
  :is="currentElementComponent"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

你可以把它翻成白話：

```text
請 Vue 在這裡渲染 currentElementComponent 指向的那個元件，
並把 elementInfo 與 target="thumbnail" 傳給它。
```

如果 `currentElementComponent` 現在是 `BaseTextElement`，這段就等價於：

```vue
<BaseTextElement
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

如果它現在是 `BaseImageElement`，就等價於：

```vue
<BaseImageElement
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

所以 `<component>` 沒有做神祕的事，它只是幫你把「哪個元件要出場」這件事延後到執行時再決定。

## 6. 為什麼 `PPTist` 不直接寫一串 `v-if`

可以，但不划算。

如果改寫成 `v-if / v-else-if`，大概會變成這樣：

```vue
<BaseImageElement
  v-if="elementInfo.type === ElementTypes.IMAGE"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
<BaseTextElement
  v-else-if="elementInfo.type === ElementTypes.TEXT"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

缺點很明顯：

- 模板變很長
- 每加一種元素型別都要改模板
- 共同 props 會一直重複
- 「型別 -> 元件」這種映射邏輯反而散落在模板裡

現在 `PPTist` 的寫法比較乾淨：

- 模板只保留一個動態出口
- 對照邏輯集中在 `elementTypeMap`
- 共通 props 只寫一次

這是很標準的「資料分派到元件」寫法。

## 7. 傳 props 給動態組件時要怎麼理解

很多人第一次看到會卡在這裡：

```vue
<component
  :is="currentElementComponent"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

疑問通常是：

```text
可是現在都還不知道是哪個元件，props 怎麼先傳？
```

答案是：

- Vue 會先解析 `:is`
- 確認目前真正要渲染哪個元件
- 再把後面的 attrs / props 傳進去

所以這段不是「先傳給 `<component>`」；  
而是「最後傳給 `:is` 指定的那個真正元件」。

你可以把它理解成：

```text
<component> 只是轉接器，真正收 props 的是最後被選中的元件。
```

## 7.5 為什麼除了 `is`，還可以再寫其他屬性

這正是很多人第一次看到動態組件時最疑惑的地方。

先看這段：

```vue
<component
  :is="currentElementComponent"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

表面上看起來像是：

- `is` 是給 `<component>` 的屬性
- `elementInfo` 也是給 `<component>` 的屬性
- `target` 也是給 `<component>` 的屬性

但實際上不是這樣分工。

### `is` 是特殊控制欄位

`is` 的角色很特別，它不是一般 props。

它的用途是：

```text
告訴 Vue：這個坑位最後要渲染哪個元件
```

所以 `is` 是 Vue 在解析 `<component>` 時就先拿走使用的特殊欄位。

### 其他屬性不負責「選元件」，而是負責「傳資料」

像這些：

```vue
:elementInfo="elementInfo"
target="thumbnail"
```

它們不是用來決定渲染誰，而是等 Vue 根據 `is` 找到真正要渲染的元件後，再轉交給那個元件。

所以這段：

```vue
<component
  :is="BaseTextElement"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

最後可以把它想成近似於：

```vue
<BaseTextElement
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

如果 `:is="BaseImageElement"`，那就近似於：

```vue
<BaseImageElement
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

所以不是 `<component>` 自己能吃下所有自定義屬性，而是：

```text
Vue 先用 is 決定真正元件，再把其餘屬性往下傳。
```

### 傳下去之後，會變成 `props` 還是 `attrs`

這裡還要再分一層。

假設最終渲染的是：

```vue
<BaseTextElement
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

那 Vue 會看 `BaseTextElement` 自己怎麼宣告：

```ts
defineProps<{
  elementInfo: PPTTextElement
  target?: string
}>()
```

如果子元件有宣告這些 props：

- `elementInfo` 會進入子元件的 props
- `target` 也會進入子元件的 props

如果子元件沒有宣告某個欄位，那它通常不會變成 props，而是會落到 `$attrs`。

所以更精確地說：

```text
<component> 上除了 is 以外寫的屬性，
會先被轉交給實際渲染的元件；
至於最後成為 props 還是 attrs，
要看那個子元件有沒有宣告對應的 props。
```

### 套回 `ThumbnailElement`

在 `PPTist` 這個例子裡：

```vue
<component
  :is="currentElementComponent"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

因為很多基底元素元件本來就有宣告像這樣的 props：

```ts
defineProps<{
  elementInfo: ...
  target?: string
}>()
```

所以：

- `is` 負責決定目前要渲染哪個基底元素元件
- `elementInfo` 與 `target` 則被當成資料傳給那個元件

### 一句話抓核心

`is` 是「選誰上場」，其他屬性是「上場後帶哪些資料」。

## 8. 如果 `:is` 是 `null` 會怎樣

在 `ThumbnailElement` 裡：

```ts
return elementTypeMap[props.elementInfo.type] || null
```

這代表如果型別沒有對上任何已知元件，`currentElementComponent` 會是 `null`。

這種寫法通常表示：

- 不認得的型別就不要渲染
- 至少不要直接讓程式崩掉

你可以把它理解成一種保守 fallback。

不過實務上如果真的常常落到 `null`，通常代表：

- 型別表沒補齊
- 資料裡有新型別，但渲染層還沒接上

## 9. `<component :is>` 和 `v-if` 到底怎麼選

這兩者都能做到「切換不同元件」，但用途有差別。

### 比較適合用 `v-if / v-else-if` 的情況

- 分支很少，只有兩三種
- 每個分支的模板差很多
- 每個分支的 props 差很多

### 比較適合用 `<component :is>` 的情況

- 分支很多
- 這些分支本質上是「同一個坑位，不同元件輪流上場」
- 共同 props 很多
- 你想把「選哪個元件」的邏輯收斂到 script 區

`ThumbnailElement` 就非常符合第二種。

## 10. 讀 `PPTist` 時，怎麼快速看懂這類動態組件

看到 `<component :is="xxx">` 時，建議你固定做這三步：

1. 先找 `xxx` 是在哪裡定義的
2. 再看它最後回傳的是字串、元件物件，還是 `null`
3. 最後看這個動態元件共通傳了哪些 props

套回 `ThumbnailElement`：

1. `xxx = currentElementComponent`
2. 它來自 `elementTypeMap[props.elementInfo.type]`
3. 共通傳入 `elementInfo` 和 `target="thumbnail"`

這樣整段就很快能看懂。

## 11. 一段完整白話翻譯

把 `ThumbnailElement` 最核心的程式翻成白話，其實就是：

```text
我現在手上有一個 elementInfo。
先看它的 type 是什麼。
如果是圖片，就選 BaseImageElement。
如果是文字，就選 BaseTextElement。
如果是圖表，就選 BaseChartElement。
選好之後，在模板這個位置把那個元件渲染出來，
並且把同一份 elementInfo 與 target="thumbnail" 傳給它。
```

你只要能把這段話講順，基本上就已經真的看懂 `<component :is>` 在這個場景的用途了。

## 自測問題

1. `<component>` 在 Vue 裡是普通 HTML 標籤，還是特殊元素？
2. `:is` 最常見可以放哪幾種值？
3. 為什麼 `ThumbnailElement` 適合用 `<component :is>`，而不是一大串 `v-if`？
4. 在 `ThumbnailElement` 裡，哪一段邏輯負責把元素型別對應到具體元件？
5. 如果 `currentElementComponent` 是 `BaseTextElement`，模板最後等價於哪段一般元件寫法？

## 延伸閱讀

- `PPTist` 實例：[ThumbnailElement.vue](../../../PPTist-SourceCode/src/views/components/ThumbnailSlide/ThumbnailElement.vue)
- 相關主題：[縮圖元件設計筆記](../../pptist/04-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/%E7%B8%AE%E5%9C%96%E5%85%83%E4%BB%B6%E8%A8%AD%E8%A8%88%E7%AD%86%E8%A8%98.md)
- 返回章節：[Vue](./README.md)
