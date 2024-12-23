# @discordiumjs/emitter

✨ A modern, powerful, and lightweight EventEmitter designed for seamless integration with TypeScript projects, built to complement **discordium.js**.

## Features

- 🚀 **Optimized**: High performance for handling events efficiently.
- 🔒 **Type-Safe**: Leverages TypeScript to ensure robust and predictable event handling.
- ⚡ **Lightweight**: Minimal footprint, designed to be fast and easy to use.

---

## Installation

Install the package using your favorite package manager:

```bash
# npm
npm install @discordiumjs/emitter

# yarn
yarn add @discordiumjs/emitter

# pnpm
pnpm add @discordiumjs/emitter
```

---

## Usage

### Basic Example

Here’s a quick example to get you started:

```ts
import { EventEmitter } from "@discordiumjs/emitter";

const emitter = new EventEmitter<{
  message: (content: string) => void;
  error: (error: Error) => void;
}>();

// Listen for events
emitter.on("message", (content) => {
  console.log("Received message:", content);
});

emitter.on("error", (error) => {
  console.error("An error occurred:", error);
});

// Emit events
emitter.emit("message", "Hello, world!");
emitter.emit("error", new Error("Something went wrong"));
```

### Typed Events

The `EventEmitter` ensures type safety, preventing incorrect event names or parameters:

```ts
// TypeScript will throw an error for these:
emitter.emit("unknownEvent", 123); // Error: "unknownEvent" is not defined in the event map.
emitter.on("message", (count: number) => {}); // Error: Parameter type mismatch.
```

---

## Acknowledgments

- 💖 Special thanks to all contributors who make this project possible.

---

## Contributing

- Contributions are welcome! If you have ideas or improvements, feel free to open an issue or submit a pull request on [GitHub](https://github.com/discordiumjs/emitter).

---

## License

This project is licensed under the [GNU GPL 3.0 License](LICENSE).

---

### ✨ Made with ❤️ by the discordium.js Team
