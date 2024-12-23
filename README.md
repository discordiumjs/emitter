# @discordiumjs/emitter

A powerful EventEmitter written in Typescript for discordium.js

### features

- Optimized
- Type-Safe
- Lightweight

To install dependencies:

```bash
bun install @discordiumjs/emitter
```

# Usage

```js
const { default: Emitter } = require("@discordiumjs/emitter");


const emitter = new Emitter({
    limitWarn: true
}, {
    foo: 5//for limit
});


emitter.on("foo", (food) => {
    console.log(food)
    return "doner"
})
emitter.on("foo", (food) => {
    console.log(food)
    return "kebab"
})

emitter.emit("foo", "pide")//["doner", "kebab"]
```
### Typing
```ts
interface Events{
    foo(food:string):string
    bar(drink:string):number
}
const emitter = new Emitter<Events>({
    limitWarn: true
}, {
    foo: 5,
    bar: 3
})

emitter.on("foo", (food) => {
    console.log(food)
    return "doner"
})
emitter.on("foo", (food) => {
    console.log(food)
    return "kebab"
})

emitter.emit("foo", "pide")//["doner", "kebab"]
```