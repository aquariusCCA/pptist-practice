# `<component :is="...">` 動態組件教學筆記（精修版）

所屬章節：[Vue](./README.md)

## 本節導讀

在 Vue 裡，你有時不會直接看到這種寫法：

```vue
<MyComponent />
```

而是看到這種：

```vue
<component :is="someComponent" />
```

這時很多人會卡住：

* `<component>` 是什麼？
* `:is` 到底在做什麼？
* Vue 最後到底會渲染哪個元件？
* 為什麼後面還能繼續寫 `props`？

如果你正在讀 `PPTist` 的原始碼，這個語法尤其重要。
因為像 `ThumbnailElement` 這類元件，就是靠它根據不同元素型別，動態切換對應的渲染元件。

這篇會先講清楚：

1. `<component :is="...">` 是什麼
2. 它和 `v-if / v-else-if` 的差別
3. 它在 `PPTist` 裡是怎麼運作的

---

## 關鍵字

* 主題：Vue 動態組件、特殊元素、元件分派
* 英文：dynamic component, `<component>`, `:is`
* 常見搜尋：`vue component is`、`dynamic component vue`、`<component :is>`
* 易混淆：HTML 原生標籤、`v-if` 切換元件、字串元件名 vs 元件物件

---

## 建議回查情境

你可以在這些情況回來看這篇：

* 看到 `<component :is="...">`，但不知道最後會渲染什麼
* 想知道 Vue 怎麼根據資料動態決定元件
* 正在讀 `PPTist` 的 `ThumbnailElement`，想弄懂它如何依元素型別切換元件

---

## 30 秒複習入口

* `<component>` 是 Vue 提供的**特殊元素**，不是一般 HTML 標籤。
* `:is` 用來告訴 Vue：**這個位置現在要渲染哪個元件**。
* `:is` 最常放的是：**元件物件**、**已註冊元件名稱字串**、或**原生標籤名**。
* `PPTist` 用它實作「**元素型別 -> 對應元件**」的分派機制。

---

## 一句話先講懂

`<component :is="x">` 可以直接理解成：

> 這裡先留一個渲染位置，等 `x` 決定現在要放哪個元件進來。

---

# 1. 為什麼需要動態組件

假設你有很多種元素型別：

* 圖片
* 文字
* 形狀
* 線條
* 圖表
* 表格
* 影片
* 音訊

如果全部都用 `v-if / v-else-if` 來寫，可能會變成這樣：

```vue
<BaseImageElement v-if="type === 'image'" />
<BaseTextElement v-else-if="type === 'text'" />
<BaseShapeElement v-else-if="type === 'shape'" />
<BaseLineElement v-else-if="type === 'line'" />
```

當型別越來越多，這樣的模板會出現幾個問題：

* 模板越來越長
* 共通 props 一直重複
* 「型別對應哪個元件」的邏輯散落在模板裡
* 維護成本越來越高

更自然的做法是：

1. 先在 script 區決定「現在該用哪個元件」
2. 模板只保留一個統一出口負責渲染

這就是動態組件的用途。

---

# 2. `<component>` 是什麼

`<component>` 不是普通 HTML 標籤，
它是 **Vue 內建的特殊元素**，專門拿來渲染「動態決定」的元件。

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

---

# 3. `:is` 可以放什麼

## 3.1 放元件物件

這是最常見、也最穩定的寫法。

```ts
import BaseImageElement from './BaseImageElement.vue'

const currentComponent = BaseImageElement
```

```vue
<component :is="currentComponent" />
```

這表示：
現在這個位置要渲染 `BaseImageElement`。

---

## 3.2 放已註冊的元件名稱字串

```vue
<component :is="'MyCard'" />
```

前提是 `MyCard` 必須已經在目前上下文中可用。
例如它是全域註冊元件，或可被目前元件解析到的名稱。

不過在實務上，**直接傳元件物件通常更明確、更穩定**。

---

## 3.3 放原生標籤名稱

```vue
<component :is="'div'">Hello</component>
```

這時 Vue 會渲染成普通的 `<div>`。

---

# 4. 最小可理解範例

先假設你有兩個元件：

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

父元件：

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

* `type.value === 'image'` -> 渲染 `ImageCard`
* `type.value === 'text'` -> 渲染 `TextCard`

核心概念只有一句：

> `:is` 指向誰，Vue 就在這個位置渲染誰。

---

# 5. 回到 `PPTist`：`ThumbnailElement` 在做什麼

先看核心模板：

```vue
<component
  :is="currentElementComponent"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

這段其實可以拆成三步。

---

## 5.1 先建立「元素型別 -> 元件」的對照表

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

意思很簡單：

* 圖片 -> `BaseImageElement`
* 文字 -> `BaseTextElement`
* 圖表 -> `BaseChartElement`

也就是先把資料型別映射成真正的元件。

---

## 5.2 再用 `computed` 算出目前要用哪個元件

```ts
const currentElementComponent = computed(() => {
  return elementTypeMap[props.elementInfo.type] || null
})
```

這段的意思是：

1. 先看 `props.elementInfo.type`
2. 去 `elementTypeMap` 裡找對應元件
3. 找得到就回傳該元件
4. 找不到就回傳 `null`

所以 `currentElementComponent` 的值不是固定的，
而是會跟著不同元素資料改變。

---

## 5.3 最後交給 `<component :is>` 實際渲染

```vue
<component
  :is="currentElementComponent"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

這段可以直接翻成白話：

> 請 Vue 在這個位置渲染 `currentElementComponent` 指向的那個元件，
> 並把 `elementInfo` 和 `target="thumbnail"` 一起傳給它。

例如：

如果 `currentElementComponent` 是 `BaseTextElement`，那它大致等價於：

```vue
<BaseTextElement
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

如果 `currentElementComponent` 是 `BaseImageElement`，那它大致等價於：

```vue
<BaseImageElement
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

---

# 6. 為什麼這裡不用一大串 `v-if`

因為這個場景很典型地適合動態組件。

如果改寫成 `v-if / v-else-if`，會變成：

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

這種寫法的問題是：

* 模板太長
* 共通 props 重複很多次
* 每新增一種型別就要改模板
* 型別分派邏輯不集中

而 `PPTist` 現在這種寫法的優點是：

* 模板只有一個統一出口
* 分派邏輯集中在 `elementTypeMap`
* 共通 props 只寫一次
* script 區負責「選誰」，template 區負責「渲染誰」

這就是它比較乾淨的原因。

---

# 7. 為什麼除了 `is`，還能再寫其他屬性

很多人第一次看到這段時會疑惑：

```vue
<component
  :is="currentElementComponent"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

問題通常是：

> 現在不是還沒決定到底是哪個元件嗎？
> 為什麼 `elementInfo` 和 `target` 已經可以先寫上去？

答案要分成兩層看。

---

## 7.1 `is` 的角色：決定誰上場

`is` 是特殊欄位，它不是一般 props。
它的用途只有一個：

> 告訴 Vue：這個位置最後要渲染哪個元件。

所以 `is` 負責的是「選元件」。

---

## 7.2 其他屬性的角色：傳資料給被選中的元件

像這些：

```vue
:elementInfo="elementInfo"
target="thumbnail"
```

不是用來決定渲染誰，
而是等 Vue 根據 `is` 找到真正的元件之後，再把這些資料轉交給那個元件。

所以這段：

```vue
<component
  :is="BaseTextElement"
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

可以近似理解成：

```vue
<BaseTextElement
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

所以一句話抓核心就是：

> `is` 負責選誰上場，其他屬性負責把資料帶給上場的人。

---

## 7.3 傳下去之後，會變成 `props` 還是 `attrs`

這還要再分一層。

假設最後實際渲染的是：

```vue
<BaseTextElement
  :elementInfo="elementInfo"
  target="thumbnail"
/>
```

如果 `BaseTextElement` 有宣告：

```ts
defineProps<{
  elementInfo: PPTTextElement
  target?: string
}>()
```

那麼：

* `elementInfo` 會成為 props
* `target` 也會成為 props

如果子元件沒有宣告某個欄位，
那它通常不會進 props，而是會落到 `$attrs`。

所以更精確的說法是：

> `<component>` 上除了 `is` 以外的屬性，
> 會先被轉交給真正渲染的元件；
> 至於最後進入 `props` 還是 `$attrs`，要看子元件有沒有宣告對應的 props。

---

# 8. 如果 `:is` 是 `null` 會怎樣

在 `ThumbnailElement` 裡：

```ts
const currentElementComponent = computed(() => {
  return elementTypeMap[props.elementInfo.type] || null
})
```

這代表：

如果 `props.elementInfo.type` 沒有對到任何已知元件，
那 `currentElementComponent` 就會是 `null`。

這通常表示：

* 這個型別目前不支援渲染
* 先不要渲染錯誤內容
* 用保守方式避免程式直接崩掉

你可以把它理解成一種 fallback。

但如果實務上常常落到 `null`，通常代表兩種可能：

* 資料裡出現了新型別
* `elementTypeMap` 還沒有補上對應元件

---

# 9. `<component :is>` 和 `v-if` 怎麼選

兩者都能做到「切換不同元件」，但適用場景不同。

## 比較適合 `v-if / v-else-if` 的情況

* 分支很少
* 每個分支差異很大
* 每個分支的 props 也差很多

## 比較適合 `<component :is>` 的情況

* 分支很多
* 本質上是同一個位置切換不同元件
* 大部分 props 是共通的
* 你想把「選哪個元件」的邏輯集中在 script 區

`ThumbnailElement` 明顯屬於第二種。

---

# 10. 讀原始碼時，怎麼快速看懂這類寫法

之後你看到：

```vue
<component :is="xxx" />
```

建議固定做這三步：

1. 找 `xxx` 是在哪裡定義的
2. 看它最後回傳的是什麼

   * 元件物件
   * 字串
   * `null`
3. 看這個動態組件還傳了哪些共通 props

套回 `ThumbnailElement`：

1. `xxx` 是 `currentElementComponent`
2. 它來自 `elementTypeMap[props.elementInfo.type]`
3. 共通傳了 `elementInfo` 和 `target="thumbnail"`

這樣整段原始碼就會很快看懂。

---

# 11. 最後用一句白話總結 `ThumbnailElement`

把它最核心的邏輯翻成白話，就是：

> 我現在拿到一份 `elementInfo`。
> 先看它的 `type` 是什麼。
> 如果是圖片，就選 `BaseImageElement`；
> 如果是文字，就選 `BaseTextElement`；
> 如果是圖表，就選 `BaseChartElement`。
> 選好之後，在模板這個位置把那個元件渲染出來，
> 並把 `elementInfo` 和 `target="thumbnail"` 傳給它。

只要你能把這段話講順，
就表示你真的看懂這個場景下的 `<component :is>` 了。

---

## 自測問題

1. `<component>` 在 Vue 裡是普通 HTML 標籤，還是特殊元素？
2. `:is` 最常見可以放哪幾種值？
3. `ThumbnailElement` 為什麼適合用 `<component :is>`，而不是一大串 `v-if`？
4. 哪一段邏輯負責把元素型別對應到具體元件？
5. 如果 `currentElementComponent` 是 `BaseTextElement`，模板最後近似等價於哪段一般元件寫法？
6. `<component>` 上除了 `is` 以外的屬性，最後是怎麼傳給真正元件的？
7. 什麼情況下這些屬性會變成 props？什麼情況下會落到 `$attrs`？

---

## 延伸閱讀

* `PPTist` 實例：[ThumbnailElement.vue](../../../PPTist-SourceCode/src/views/components/ThumbnailSlide/ThumbnailElement.vue)
* 相關主題：[縮圖元件設計筆記](../../pptist/04-%E7%B8%AE%E5%9C%96%E7%B3%BB%E7%B5%B1/%E7%B8%AE%E5%9C%96%E5%85%83%E4%BB%B6%E8%A8%AD%E8%A8%88%E7%AD%86%E8%A8%98.md)
* 返回章節：[Vue](./README.md)

---