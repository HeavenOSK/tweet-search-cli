#!/usr/bin/env tsx
import { render } from "ink";
import { App } from "./components/App.js";

console.clear();

const app = render(<App />);

await app.waitUntilExit();
process.exit(0);
