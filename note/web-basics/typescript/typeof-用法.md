> 在 TypeScript 中，typeof 是一种类型操作符，用于在类型上下文中获取变量或属性的类型。它常用于从已有的变量或对象中推断出新的类型定义，也可以配合其他工具来获取函数返回值类型等。 

# 基本用法

在类型定义中，可以使用 typeof 结合一个已存在的变量来定义新的类型。

```typescript
// 假设我们有一个对象
const myObject = {
  name: "Alice",
  age: 30,
};

// 使用 typeof 从 myObject 推断出类型
type MyObjectType = typeof myObject;
// type MyObjectType = {
//   name: string;
//   age: number;
// }
```

# 结合泛型使用

typeof 也可以用于获取特定元素的类型。

```typescript
const data = ['hello', 'world'] as const;
// type Greeting = "hello" | "world";
type Greeting = typeof data[number];
```

- typeof data 得到 readonly ["hello", "world"] 的类型。

- typeof data[number] 通过索引 number 来获取数组中所有元素组成的联合类型。

# 结合 ReturnType 使用

typeof 可以用来获取函数的返回值类型，通常与 ReturnType 工具类型结合使用。 

```typescript
function greet() {
  return "Hello, world!";
}

// type ReturnType = string
type ReturnType = ReturnType<typeof greet>;
```

# 总结

- 获取现有类型：当存在一个已有的变量或对象时，使用 typeof 可以直接获取其类型。

- 类型推断：在需要根据现有值来定义类型时，typeof 提供了便利的类型推断能力。

- 配合泛型：常用于从数组或元组中提取元素类型。 