# Frontend Framework

A lightweight, React-like JavaScript framework built from scratch with Virtual DOM, component system, routing, and state management.

## 🏗️ How It Works - Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                            USER                                  │
│                    (Clicks, types text)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    1. EVENT HANDLING                             │
│   onClick/onInput → EventDispatcher → Component handler          │
│                                                                   │
│   Example: <button onclick={() => this.increment()}>             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. STATE UPDATE                               │
│              this.setState({ count: count + 1 })                 │
│                                                                   │
│   • Updates this.state (immutably)                               │
│   • If global state exists → store.setState()                    │
│   • Triggers re-render                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. LIFECYCLE HOOKS                            │
│                                                                   │
│   beforeUpdate(oldProps, newProps) ← called before render        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. RENDER                                     │
│              const newVNode = this.render()                      │
│                                                                   │
│   render() {                                                     │
│     return h('div', {}, [                                        │
│       h('h1', {}, `Count: ${this.state.count}`),                 │
│       h('button', { onclick: ... }, '+')                         │
│     ])                                                           │
│   }                                                              │
│                                                                   │
│   ✅ Creates new Virtual DOM (JavaScript object)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    5. VIRTUAL DOM DIFF                           │
│              patch(parent, oldVNode, newVNode)                   │
│                                                                   │
│   Compares old and new Virtual DOM:                              │
│   • What changed?                                                │
│   • What was added?                                              │
│   • What was removed?                                            │
│                                                                   │
│   oldVNode: { tag: 'h1', children: ['Count: 5'] }               │
│   newVNode: { tag: 'h1', children: ['Count: 6'] }               │
│   diff: text changed from '5' to '6'                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6. PATCH REAL DOM                             │
│            Apply minimal changes                                 │
│                                                                   │
│   ❌ DON'T recreate entire element                               │
│   ✅ Only update text: textContent = 'Count: 6'                  │
│                                                                   │
│   Result: browser does minimal work (fast!)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    7. LIFECYCLE HOOKS                            │
│                                                                   │
│   updated(oldProps, newProps) ← called after DOM update          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                   (Shows updated UI)                             │
└─────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                    ADDITIONAL SYSTEMS
═══════════════════════════════════════════════════════════════════

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   ROUTER        │     │  HTTP CLIENT    │     │  STORE (State)  │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ URL changed?    │     │ await http.get()│     │ Global state    │
│   ↓             │     │       ↓         │     │                 │
│ Find route      │     │ fetch(url)      │     │ store.setState()│
│   ↓             │     │       ↓         │     │       ↓         │
│ Load Page       │     │ response.json() │     │ Notify all      │
│   ↓             │     │       ↓         │     │ subscribers     │
│ Render          │     │ setState(data)  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  EVENT SYSTEM   │     │   VALIDATORS    │
├─────────────────┤     ├─────────────────┤
│ emit('notify')  │     │ validateEmail() │
│       ↓         │     │       ↓         │
│ All listeners   │     │ regex.test()    │
│ receive event   │     │       ↓         │
│       ↓         │     │ true/false      │
│ Toast shown     │     │                 │
└─────────────────┘     └─────────────────┘
```

## 📋 Complete Cycle Example (Todo App)

```
1. User clicks "Add Todo"
   ↓
2. onClick calls addTodo()
   ↓
3. addTodo() does:
   const newTodo = { id: uid(), text: input, completed: false }
   this.setState({ todos: [...this.state.todos, newTodo] })
   ↓
4. setState() triggers render()
   ↓
5. render() creates new Virtual DOM:
   h('ul', {},
     todos.map(todo => h('li', { key: todo.id }, todo.text))
   )
   ↓
6. patch() compares old/new Virtual DOM
   • Old: 5 <li> elements
   • New: 6 <li> elements
   • Diff: 1 element added
   ↓
7. DOM operation:
   ul.appendChild(new li)  ← Only 1 operation!
   ↓
8. Browser shows new Todo in list
   ↓
9. localStorage.setItem('todos', JSON.stringify(todos))  ← Persist
```

## 🎯 Simplified Flow

```
              ┌──────────────────────────┐
              │     User clicks          │
              └───────────┬──────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │  onClick handler         │
              │  this.setState(new data) │
              └───────────┬──────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │  render()                │
              │  creates Virtual DOM     │
              └───────────┬──────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │  patch()                 │
              │  compares old/new        │
              └───────────┬──────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │  Update Real DOM         │
              │  (minimal changes)       │
              └───────────┬──────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │   Browser displays       │
              │   updated UI             │
              └──────────────────────────┘
```

**Key Idea:**
- **Without Virtual DOM**: every change → full page re-render (slow 🐌)
- **With Virtual DOM**: changes → comparison → only necessary updates (fast ⚡)

## ✨ Features

- 🎯 **Component-Based Architecture** - Build reusable UI components with lifecycle hooks
- ⚡ **Virtual DOM** - Efficient rendering with key-based reconciliation (~10x faster)
- 🔄 **State Management** - Built-in reactive global and local state
- 🧭 **Client-Side Routing** - Hash-based SPA routing with dynamic routes
- 🌐 **HTTP Client** - Promise-based fetch wrapper for API calls
- 📡 **Event System** - DOM events + custom event emitter
- ✅ **Form Validation** - Built-in validators (email, required, minLength)
- 📦 **Small Bundle** - Only ~15KB gzipped
- 🚀 **No Dependencies** - Pure ES6+ JavaScript

## 🚀 Quick Start

```javascript
import { Component, h } from './framework/src/core/index.js';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return h('div', {}, [
      h('h1', {}, `Count: ${this.state.count}`),
      h('button', { 
        onclick: () => this.setState({ count: this.state.count + 1 }) 
      }, '+')
    ]);
  }
}

const counter = new Counter();
document.getElementById('app').appendChild(counter.mount());
```

## 📱 Live Demo

Check out the complete demo application with Todo, Login, and Posts features.

### Run Demo Server

```bash
# Navigate to project directory
cd Gitea/frontend-framework

# Make script executable (first time only)
chmod +x run-demo.sh

# Start the demo server
./run-demo.sh demo
# or simply
./run-demo.sh
```

Then open: http://localhost:8000/example/public/

### Install Dependencies

```bash
# Install all dependencies for framework and example
./run-demo.sh install
```

### Run Tests

```bash
# Run all framework unit tests
./run-demo.sh test
```

**Demo Features:**
- ✅ Todo app with localStorage persistence
- 🔐 Login with DummyJSON API integration
- 📝 Posts CRUD with DummyJSON API
- 🔔 Toast notifications
- 🎨 Modern UI with gradients

## 📚 Documentation

### Getting Started
- [Quick Start Guide](./framework/docs/01-getting-started.md) - Your first app in 5 minutes
- [Installation](./framework/docs/03-installation.md) - Project setup and dev server
- [Architecture Overview](./framework/docs/02-architecture.md) - How it works under the hood

### Core Concepts
- [Components](./framework/docs/04-components.md) - Component class, lifecycle, props & state
- [State Management](./framework/docs/05-state-management.md) - Global store and reactive state
- [Routing](./framework/docs/06-routing.md) - SPA navigation and route guards
- [Event Handling](./framework/docs/07-event-handling.md) - DOM and custom events
- [DOM Manipulation](./framework/docs/08-dom-manipulation.md) - h() function and virtual DOM

### Advanced
- [HTTP Client](./framework/docs/09-http-client.md) - Making API requests
- [Best Practices](./framework/docs/10-best-practices.md) - Code organization and performance

## 📁 Project Structure

```
frontend-framework/
├── framework/              # Core framework source code
│   ├── src/
│   │   ├── core/          # Component system, lifecycle (547 lines)
│   │   ├── dom/           # Virtual DOM, diff, patch
│   │   ├── events/        # Event emitter
│   │   ├── state/         # Store, reactive state (299 lines)
│   │   ├── router/        # Hash-based routing
│   │   ├── http/          # HTTP client
│   │   └── validation/    # Form validators
│   └── docs/              # Comprehensive documentation (5000+ lines)
│
├── example/               # Demo application
│   ├── public/           # Static files, index.html
│   └── src/
│       ├── index.js      # App entry point
│       ├── store.js      # Global state
│       ├── components/   # Reusable components (Header, Toast)
│       ├── pages/        # Page components (Home, Login, Posts, About)
│       └── styles/       # CSS with gradients
│
└── README.md             # This file
```

## 🎓 Key Concepts

### Components

```javascript
class TodoList extends Component {
  constructor(props) {
    super(props);
    this.state = { todos: [] };
  }

  mounted() {
    // Load data after mount
    this.loadTodos();
  }

  render() {
    return h('ul', {},
      this.state.todos.map(todo =>
        h('li', { key: todo.id }, todo.text)
      )
    );
  }
}
```

### Global State

```javascript
import { createStore, setGlobalStore } from './framework/src/state/index.js';

const store = createStore({
  user: { name: '', isAuth: false },
  theme: 'light'
});

setGlobalStore(store);

// Update state
store.setState({ theme: 'dark' });

// Subscribe to changes
store.subscribe(() => {
  console.log('State changed:', store.getState());
});
```

### Routing

```javascript
import { router } from './framework/src/router/index.js';

router.on('/', HomePage);
router.on('/about', AboutPage);
router.on('/users/:id', UserDetailPage);
router.start('#app');

// Navigate programmatically
navigate('/users/123');
```

### HTTP Requests

```javascript
import { http } from './framework/src/http/index.js';

// GET request
const users = await http.get('/api/users');

// POST request
const newUser = await http.post('/api/users', {
  name: 'Alice',
  email: 'alice@example.com'
});
```

## 🛠️ Development

### Run Demo App

```bash
# Start development server
./run-demo.sh

# Or manually:
python3 -m http.server 8000
```

## 📊 Performance

- **Virtual DOM Reconciliation**: ~10x faster than full re-render
  - Key-based: ~5ms for 100 items
  - Without keys: ~50ms for 100 items
- **Bundle Size**: ✅ **11.71KB gzipped** (validated - better than claimed 15KB!)
- **Zero Dependencies**: Pure ES6+ JavaScript

**See [PERFORMANCE.md](PERFORMANCE.md) for validated benchmark results and detailed measurements.**

### Run Performance Benchmarks

```bash
# Bundle size analysis (Node.js)
cd framework
npm run benchmark

# DOM performance benchmarks (Browser)
npm run benchmark:browser
# Open http://localhost:8000/framework/benchmarks/
```

## 🧪 Testing

The framework includes comprehensive integration tests:

```bash
# Run tests (coming soon)
npm test
```

## 🌟 Examples

See the `/example` directory for a complete application demonstrating:
- Component composition
- Global and local state
- Client-side routing
- API integration (DummyJSON)
- Form validation
- Custom events
- LocalStorage persistence

## 📖 Learn More

- Start with [Getting Started Guide](./framework/docs/01-getting-started.md)
- Read about [Architecture](./framework/docs/02-architecture.md) to understand internals
- Check [Best Practices](./framework/docs/10-best-practices.md) for production-ready code

## 🤝 Contributing

This is an educational project built to understand how modern frameworks work internally. @devansvane @elainio0 & @jafa_san

## 📄 License

MIT License - feel free to use for learning purposes!
