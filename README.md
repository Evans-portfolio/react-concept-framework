# React Concept Framework

A custom JavaScript frontend framework built to explore and demonstrate the core concepts behind React — including Virtual DOM, component lifecycle, state management, routing, and more.

---

## How It Works

The diagram below shows the full rendering pipeline from user interaction to browser update.

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
```

---

## Additional Systems

```
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

---

## Project Structure

```
react-concept-framework/
├── framework/       # Core framework source (Virtual DOM, Component, Store, Router, etc.)
├── example/         # Demo application using the framework
├── index.html       # Entry point
├── package.json     # Workspace config
└── run-demo.sh      # Script to start the demo
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the demo
./run-demo.sh
```

---

## Concepts Demonstrated

| Concept | Description |
|---|---|
| Virtual DOM | Lightweight JS object tree representing the UI |
| Diffing & Patching | Minimal DOM updates by comparing old vs new VNode |
| Component Lifecycle | `beforeUpdate` / `updated` hooks |
| State Management | Local (`this.setState`) and global (`store.setState`) |
| Routing | Client-side URL-based navigation |
| HTTP Client | Wrapper around `fetch` for API calls |
| Event System | Pub/sub event emitter for cross-component communication |
| Validators | Utility functions for input validation |
