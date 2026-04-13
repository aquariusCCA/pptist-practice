`event.composedPath()` 是 **Event** 介面的一個方法，用於取得事件的**路徑 (path)**，它會回傳一個陣列，包含所有將會觸發事件監聽器的物件。

這個方法特別在處理 **Shadow DOM (影子 DOM)** 時非常有用。

# 主要用途與特點：

1.  **取得完整的事件傳播路徑：** 它會回傳從事件最初發生的目標 (target) 到 `window` 物件（或更外層）的所有節點 (node) 或物件，這些物件都會參與事件的冒泡 (bubbling) 過程。
2.  **包含 Shadow DOM 內部的節點 (如果 Shadow Root 模式為 'open')：**
      * 如果事件發生在一個 **open** 模式的 Shadow Root 內部，`composedPath()` 會將 Shadow DOM 內部的節點也包含在路徑中。
      * 如果 Shadow Root 是以 **closed** 模式創建的，則 Shadow DOM 內部的節點將不會被包含在回傳的陣列中，事件路徑會從 Shadow Host (託管影子 DOM 的元素) 開始。
3.  **回傳值：** 一個 `EventTarget` 物件的陣列，代表事件將在其上調用監聽器的物件。

# 如何使用：

這個方法通常是在事件監聽器 (event listener) 內部調用，並在事件物件 (`event`) 上執行：

```html
<!DOCTYPE html>
<html lang="zh-Hant">

<head>
    <meta charset="UTF-8">
    <title>composedPath() 簡單測試</title>
    <style>
        #outer {
            padding: 20px;
            background-color: lightblue;
            border: 1px solid blue;
        }

        #inner {
            padding: 20px;
            background-color: lightcoral;
            border: 1px solid red;
            cursor: pointer;
        }
    </style>
</head>

<body>

    <div id="outer">
        Outer Container
        <div id="inner">
            點擊我 (Inner Element)
        </div>
    </div>

    <p>請開啟瀏覽器的 **開發者工具 (Console)** 查看輸出結果。</p>

    <script>
        // JavaScript 代碼將放在這裡
        // 在最外層的 'outer' 元素上附加事件監聽器
        const outerElement = document.getElementById('outer');

        outerElement.addEventListener('click', function (event) {
            console.log("--- 點擊事件發生 ---");

            // 1. 取得完整的事件路徑
            const path = event.composedPath();

            console.log("事件目標 (event.target):", event.target);
            console.log("當前目標 (event.currentTarget):", event.currentTarget);

            console.log("--- event.composedPath() 輸出路徑 ---");

            // 2. 遍歷並印出路徑中的每一個物件
            path.forEach((element, index) => {
                // 嘗試取得元素的 id 或標籤名稱
                let name = element.id || element.tagName || element.constructor.name;

                console.log(`[${index}]: <${name}>`);
            });

            console.log("------------------------");
        });
    </script>
</body>

</html>
```

# 與 `event.target` 和 `event.currentTarget` 的區別：


> **記住這個原則：**
> - target = 誰被打中（事件的真正來源）。
> - currentTarget = 誰在處理（你把監聽器放在誰身上，事件傳播到誰那裡）。

> **總結：** 當你需要知道一個事件從發生點到最外層，**所有**經歷過的節點（特別是需要穿透 **open** 模式的 Shadow DOM 時），就應該使用 `event.composedPath()`。