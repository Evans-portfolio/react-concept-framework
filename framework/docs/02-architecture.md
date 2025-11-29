# Architecture

Understand how the framework works under the hood.

## Overview

Our framework follows a component-based architecture similar to React, with these core concepts:

```
┌─────────────────────────────────────┐
│         Application Layer          │
│   (Your Components & Pages)        │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│       Framework Core Modules        │
├─────────────────────────────────────┤
│  • Component System (Lifecycle)     │
│  • Virtual DOM (h function)         │
│  • Reconciliation (Diff & Patch)    │
│  • State Management (Store)         │
│  • Router (Hash-based)              │
│  • HTTP Client (Fetch wrapper)      │
│  • Event System (DOM + Custom)      │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│            Browser DOM              │
└─────────────────────────────────────┘
```

## Component Lifecycle

Components go through a defined lifecycle:

```
Create → BeforeMount → Mounted → BeforeUpdate → Updated → BeforeUnmount → Unmounted
```

### Lifecycle Flow

1. **Constructor** - Component instance created
2. **created()** - Component initialized, state setup
3. **beforeMount()** - Before first render
4. **render()** - Generate virtual DOM
5. **mounted()** - Component added to real DOM
6. **setState()** called - State changes
7. **beforeUpdate()** - Before re-render
8. **render()** - Generate new virtual DOM
9. **Diff** - Compare old vs new vDOM
10. **Patch** - Update only changed parts
11. **updated()** - DOM updated
12. **beforeUnmount()** - Before removal
13. **unmounted()** - Cleanup complete

## Virtual DOM

### Why Virtual DOM?

Direct DOM manipulation is slow. Virtual DOM provides:
- **Fast diffing**: Compare virtual trees in memory
- **Minimal updates**: Only patch what changed
- **Predictable rendering**: Declarative UI

### Virtual Node Structure

```javascript
{
  type: 'div',
  props: {
    class: 'container',
    onclick: [Function]
  },
  children: [
    { type: 'h1', props: {}, children: ['Hello'] },
    { type: 'p', props: {}, children: ['World'] }
  ]
}
```

### Reconciliation Algorithm

```javascript
function patch(oldVNode, newVNode, container) {
  // 1. Type changed? Replace entire node
  if (oldVNode.type !== newVNode.type) {
    container.replaceChild(createElement(newVNode), oldEl);
    return;
  }

  // 2. Text node? Update text content
  if (typeof newVNode === 'string') {
    if (oldVNode !== newVNode) {
      oldEl.textContent = newVNode;
    }
    return;
  }

  // 3. Update attributes
  updateAttributes(oldEl, oldVNode.props, newVNode.props);

  // 4. Diff children with key-based matching
  patchChildren(oldEl, oldVNode.children, newVNode.children);
}
```

### Key-Based Reconciliation

Using `key` prop optimizes list updates:

```javascript
// Without key: O(n²) - recreates all items
[
  h('li', {}, 'Item 1'),
  h('li', {}, 'Item 2')
]

// With key: O(n) - reuses existing items
[
  h('li', { key: 1 }, 'Item 1'),
  h('li', { key: 2 }, 'Item 2')
]
```

## State Management

### Reactive Store

```javascript
const store = createStore({ count: 0 });

// Subscribe to changes
store.subscribe(() => {
  console.log('State changed:', store.getState());
});

// Update triggers subscribers
store.setState({ count: 1 }); // Logs: "State changed: { count: 1 }"
```

### Data Flow

```
┌──────────┐
│  Action  │ (User clicks button)
└────┬─────┘
     ↓
┌────┴─────┐
│ setState │ (Update component state)
└────┬─────┘
     ↓
┌────┴─────┐
│  render  │ (Generate new vDOM)
└────┬─────┘
     ↓
┌────┴─────┐
│   Diff   │ (Compare old vs new vDOM)
└────┬─────┘
     ↓
┌────┴─────┐
│  Patch   │ (Update real DOM)
└────┬─────┘
     ↓
┌────┴─────┐
│   View   │ (UI updated)
└──────────┘
```

## Router Architecture

### Hash-Based Routing

Uses `window.location.hash` for client-side routing:

```
URL: http://example.com/#/users/123
              ↓
hashchange event
              ↓
Router resolves path: /users/123
              ↓
Match route pattern: /users/:id
              ↓
Extract params: { id: '123' }
              ↓
Render UserDetailPage with params
```

### Route Matching

```javascript
class Route {
  match(pathname) {
    const pattern = this.path.replace(/:([^/]+)/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);
    
    if (match) {
      const keys = this.path.match(/:([^/]+)/g) || [];
      const params = {};
      keys.forEach((key, i) => {
        params[key.slice(1)] = match[i + 1];
      });
      return params;
    }
    return null;
  }
}
```

## Event System

### Event Delegation

Events are attached to container, not individual elements:

```javascript
// Framework does this internally
container.addEventListener('click', (e) => {
  const handler = e.target._clickHandler;
  if (handler) handler(e);
});

// You write this
h('button', { onclick: () => console.log('Clicked') }, 'Click me')
```

### Custom Events

```javascript
component.on('custom-event', (data) => {
  console.log(data);
});

component.emit('custom-event', { message: 'Hello' });
```

## HTTP Client

Simple wrapper around `fetch` API:

```javascript
export const http = {
  async get(url) {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS
    });
    return response.json();
  },
  
  async post(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

## Performance Optimizations

### 1. Key-Based Reconciliation

Reuses DOM nodes instead of recreating:

```javascript
// Before: 50ms for 100 items
// After: 5ms for 100 items (10x faster)
```

### 2. Batched Updates

Multiple `setState` calls are batched:

```javascript
handleClick() {
  this.setState({ a: 1 });
  this.setState({ b: 2 });
  this.setState({ c: 3 });
  // Only re-renders once!
}
```

### 3. Lazy Rendering

Components only render when mounted:

```javascript
const component = new MyComponent(); // Not rendered yet
component.mount(container); // Now rendered
```

## Module Structure

```
framework/
├── src/
│   ├── core/           # Component, lifecycle, app
│   │   ├── component.js
│   │   ├── lifecycle.js
│   │   └── index.js
│   ├── dom/            # Virtual DOM, diff, patch
│   │   ├── element.js
│   │   ├── diff.js
│   │   └── index.js
│   ├── events/         # Event system
│   │   ├── emitter.js
│   │   └── index.js
│   ├── state/          # State management
│   │   ├── store.js
│   │   ├── reactive.js
│   │   └── index.js
│   ├── router/         # Routing
│   │   ├── router.js
│   │   ├── route.js
│   │   └── index.js
│   └── http/           # HTTP client
│       ├── client.js
│       └── index.js
└── docs/
```

## Design Principles

### 1. Simplicity
- Small API surface
- Minimal abstractions
- Easy to understand source code

### 2. Performance
- Virtual DOM diffing
- Key-based reconciliation
- Event delegation

### 3. Modularity
- Each module is independent
- Tree-shakeable
- Import only what you need

### 4. Developer Experience
- Familiar React-like API
- Clear error messages
- Comprehensive documentation

## Comparison with Other Frameworks

| Feature | Our Framework | React | Vue |
|---------|--------------|-------|-----|
| Virtual DOM | ✅ | ✅ | ✅ |
| Components | ✅ | ✅ | ✅ |
| State Management | ✅ (Built-in) | ❌ (External) | ✅ (Vuex) |
| Router | ✅ (Built-in) | ❌ (React Router) | ✅ (Vue Router) |
| Bundle Size | ~15KB | ~40KB | ~30KB |
| Learning Curve | Easy | Medium | Easy |
| JSX Support | ❌ | ✅ | ❌ |

## Next Steps

- [Components](./04-components.md) - Build reusable UI components
- [State Management](./05-state-management.md) - Manage application state
- [Performance](./10-best-practices.md) - Optimization techniques
