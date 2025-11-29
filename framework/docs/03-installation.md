# Installation

Get started with the framework in your project.

## Quick Start

No npm package needed - import directly from ES modules:

```javascript
import { Component, h } from './framework/src/core/index.js';
import { router } from './framework/src/router/index.js';
import { createStore } from './framework/src/state/index.js';
```

## Project Structure

### Recommended Layout

```
my-app/
├── framework/           # Framework source
│   └── src/
│       ├── core/
│       ├── dom/
│       ├── events/
│       ├── state/
│       ├── router/
│       └── http/
├── public/              # Static files
│   ├── index.html
│   └── styles.css
└── src/                 # Your app code
    ├── index.js        # Entry point
    ├── store.js        # Global state
    ├── components/     # Reusable components
    │   ├── Header.js
    │   └── Footer.js
    └── pages/          # Page components
        ├── Home.js
        ├── About.js
        └── NotFound.js
```

## HTML Setup

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div id="app"></div>
  
  <!-- Import as ES module -->
  <script type="module" src="../src/index.js"></script>
</body>
</html>
```

## Entry Point

### src/index.js

```javascript
import { router } from '../framework/src/router/index.js';
import { createStore, setGlobalStore } from '../framework/src/state/index.js';
import HomePage from './pages/Home.js';
import AboutPage from './pages/About.js';

// Initialize global store
const store = createStore({
  user: null,
  theme: 'light'
});
setGlobalStore(store);

// Configure routes
router.on('/', HomePage);
router.on('/about', AboutPage);

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  router.start('#app');
});
```

## Development Server

### Option 1: Python HTTP Server

```bash
python3 -m http.server 8000
```

Then open: http://localhost:8000/public/

### Option 2: Node.js http-server

```bash
npx http-server -p 8000
```

### Option 3: VS Code Live Server

Install "Live Server" extension and right-click `index.html` → "Open with Live Server"

## Module Imports

### Core Modules

```javascript
// Component system
import { Component, h, createApp } from './framework/src/core/index.js';

// State management
import { createStore, setGlobalStore } from './framework/src/state/index.js';

// Routing
import { router, Link, navigate } from './framework/src/router/index.js';

// HTTP client
import { http } from './framework/src/http/index.js';

// Events
import { EventEmitter } from './framework/src/events/index.js';

// Validation
import { isEmail, required, minLength } from './framework/src/validation/index.js';
```

## Build Setup (Optional)

### With Rollup

**Install dependencies:**

```bash
npm install --save-dev rollup @rollup/plugin-node-resolve
```

**rollup.config.js:**

```javascript
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [resolve()]
};
```

**Build:**

```bash
npx rollup -c
```

### With Webpack

**Install dependencies:**

```bash
npm install --save-dev webpack webpack-cli webpack-dev-server
```

**webpack.config.js:**

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    static: './public',
    port: 8000
  },
  mode: 'development'
};
```

**Run dev server:**

```bash
npx webpack serve
```

## TypeScript Support (Optional)

### Install TypeScript

```bash
npm install --save-dev typescript
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Type Definitions

```typescript
// types.d.ts
declare module './framework/src/core/index.js' {
  export class Component {
    props: any;
    state: any;
    constructor(props?: any):
    setState(update: any, callback?: () => void): void;
    render(): VNode;
    mounted?(): void;
    beforeUnmount?(): void;
  }
  
  export function h(
    type: string,
    props: Record<string, any>,
    children?: any
  ): VNode;
  
  interface VNode {
    type: string;
    props: Record<string, any>;
    children: any[];
  }
}
```

## Environment Variables

### .env File

```env
API_URL=https://api.example.com
API_KEY=your-api-key
```

### Usage

```javascript
const API_URL = import.meta.env.API_URL || 'http://localhost:3000';
```

## Production Build

### Minification

Use Terser for minification:

```bash
npm install --save-dev terser
npx terser dist/bundle.js -o dist/bundle.min.js -c -m
```

### Bundle Size

Framework size (gzipped):
- Core + DOM: ~8KB
- + State: +2KB
- + Router: +2KB
- + HTTP: +1KB
- **Total**: ~13KB

## Browser Support

### Requirements

- ES6 Modules
- ES6 Classes
- Fetch API
- Proxy (for reactive state)

### Supported Browsers

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

### Polyfills (if needed)

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=fetch,Promise"></script>
```

## Troubleshooting

### CORS Errors with Modules

**Problem**: Cannot load ES modules over `file://` protocol

**Solution**: Use a local server (see Development Server above)

### Module Not Found

**Problem**: `Failed to resolve module specifier`

**Solution**: Use relative paths:
```javascript
// ❌ Won't work
import { Component } from 'framework';

// ✅ Works
import { Component } from './framework/src/core/index.js';
```

### Hash Routing Not Working

**Problem**: Routes don't work without `#`

**Solution**: Framework uses hash-based routing. Always include `#` in URLs:
```
http://localhost:8000/#/
http://localhost:8000/#/about
```

## Next Steps

- [Getting Started](./01-getting-started.md) - Build your first app
- [Architecture](./02-architecture.md) - Understand the framework
- [Components](./04-components.md) - Create components
