# State API Reference

Complete reference for state management functions and reactive stores.

---

**📚 Navigation:** [← Back to Docs](../README.md)

---

## Table of Contents

- [createStore()](#createstore)
- [Store Methods](#store-methods)
  - [getState()](#getstate)
  - [setState()](#setstate)
  - [subscribe()](#subscribe)
- [Reactive Functions](#reactive-functions)
  - [setGlobalStore()](#setglobalstore)
  - [useStore()](#usestore)
  - [reactive()](#reactive)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## `createStore()`

Creates a new reactive store for managing global state.

**Signature:**
```javascript
createStore(initialState = {})
```

**Parameters:**
- `initialState` (Object, optional) - Initial state object. Default: `{}`

**Returns:** Store object with methods: `getState`, `setState`, `subscribe`

**Example:**
```javascript
import { createStore } from './framework/src/state/index.js';

const store = createStore({
  count: 0,
  user: null,
  todos: []
});

console.log(store.getState()); // { count: 0, user: null, todos: [] }
```

---

## Store Methods

### `getState()`

Returns a **copy** of the current state.

**Signature:**
```javascript
store.getState()
```

**Parameters:** None

**Returns:** `Object` - Copy of current state

**Example:**
```javascript
const store = createStore({ count: 0 });

const state = store.getState();
console.log(state.count); // 0

// State is a copy - mutations don't affect store
state.count = 10;
console.log(store.getState().count); // Still 0
```

**⚠️ Important:** Returns a **shallow copy**. Nested objects are still referenced.

---

### `setState()`

Updates the store state and notifies all subscribers.

**Signature:**
```javascript
store.setState(updater)
```

**Parameters:**
- `updater` (Object | Function) - New state values or updater function

**Returns:** `void`

**Examples:**

```javascript
const store = createStore({ count: 0, name: 'Alice' });

// Object update - merges with existing state
store.setState({ count: 1 });
console.log(store.getState()); // { count: 1, name: 'Alice' }

// Function update - access to current state
store.setState(state => ({
  count: state.count + 1
}));
console.log(store.getState()); // { count: 2, name: 'Alice' }

// Update multiple fields
store.setState({
  count: 0,
  name: 'Bob'
});
```

**Behavior:**
- **Merges** new state with existing state (like `Object.assign`)
- Triggers **all subscribers** after update
- Use function form when new state depends on current state

---

### `subscribe()`

Registers a listener function to be called when state changes.

**Signature:**
```javascript
store.subscribe(listener)
```

**Parameters:**
- `listener` (Function) - Callback function called on state changes

**Returns:** `Function` - Unsubscribe function

**Example:**
```javascript
const store = createStore({ count: 0 });

// Subscribe to changes
const unsubscribe = store.subscribe(() => {
  console.log('State changed:', store.getState());
});

store.setState({ count: 1 }); // Logs: "State changed: { count: 1 }"
store.setState({ count: 2 }); // Logs: "State changed: { count: 2 }"

// Cleanup - unsubscribe when done
unsubscribe();

store.setState({ count: 3 }); // No log - unsubscribed
```

**Use Cases:**
- Connect components to global state
- Persist state to localStorage
- Sync state with external APIs
- Debug state changes

---

## Reactive Functions

### `setGlobalStore()`

Sets the global store instance for use with `useStore()` and `reactive()`.

**Signature:**
```javascript
setGlobalStore(store)
```

**Parameters:**
- `store` (Store) - Store instance created with `createStore()`

**Returns:** `void`

**Example:**
```javascript
import { createStore, setGlobalStore } from './framework/src/state/index.js';

const store = createStore({ count: 0 });
setGlobalStore(store);

// Now useStore() and reactive() work globally
```

---

### `useStore()`

Returns the global store instance.

**Signature:**
```javascript
useStore()
```

**Parameters:** None

**Returns:** `Store` - Global store instance

**Example:**
```javascript
import { useStore } from './framework/src/state/index.js';

class MyComponent extends Component {
  mounted() {
    const store = useStore();
    console.log(store.getState());
  }
}
```

**⚠️ Note:** Must call `setGlobalStore()` first, or returns `null`.

---

### `reactive()`

Creates a reactive reference to a specific state key.

**Signature:**
```javascript
reactive(key)
```

**Parameters:**
- `key` (String) - State property key

**Returns:** `Object` - Reactive reference with `.value` getter

**Example:**
```javascript
import { createStore, setGlobalStore, reactive } from './framework/src/state/index.js';

const store = createStore({ count: 0 });
setGlobalStore(store);

const count = reactive('count');

console.log(count.value); // 0

store.setState({ count: 5 });
console.log(count.value); // 5
```

**⚠️ Note:** Currently a basic implementation. For arrays, supports iteration.

---

## Examples

### Basic Store Usage

```javascript
import { createStore } from './framework/src/state/index.js';

// Create store
const store = createStore({
  user: null,
  isLoggedIn: false
});

// Subscribe to changes
store.subscribe(() => {
  console.log('State updated:', store.getState());
});

// Update state
store.setState({
  user: { name: 'Alice', id: 1 },
  isLoggedIn: true
});
// Logs: "State updated: { user: {...}, isLoggedIn: true }"
```

### Component Integration

```javascript
import { Component, h } from './framework/src/core/index.js';
import { createStore } from './framework/src/state/index.js';

// Create global store
const store = createStore({
  count: 0
});

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: store.getState().count
    };
  }

  mounted() {
    // Subscribe to store changes
    this.unsubscribe = store.subscribe(() => {
      this.setState({
        count: store.getState().count
      });
    });
  }

  beforeDestroy() {
    // CRITICAL: Unsubscribe to prevent memory leak
    this.unsubscribe();
  }

  increment = () => {
    store.setState(state => ({
      count: state.count + 1
    }));
  }

  render() {
    return h('div', {}, [
      h('h1', {}, `Count: ${this.state.count}`),
      h('button', { onclick: this.increment }, 'Increment')
    ]);
  }
}
```

### Multiple Components Sharing State

```javascript
import { createStore } from './framework/src/state/index.js';

// Create shared store
const userStore = createStore({
  user: null,
  isLoggedIn: false
});

// Header component
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: userStore.getState().user
    };
  }

  mounted() {
    this.unsubscribe = userStore.subscribe(() => {
      this.setState({
        user: userStore.getState().user
      });
    });
  }

  beforeDestroy() {
    this.unsubscribe();
  }

  render() {
    const { user } = this.state;
    return h('header', {}, [
      user
        ? h('span', {}, `Welcome, ${user.name}`)
        : h('span', {}, 'Please log in')
    ]);
  }
}

// Login component
class LoginForm extends Component {
  handleLogin = async (e) => {
    e.preventDefault();

    const user = await http.post('/api/login', {
      username: this.state.username,
      password: this.state.password
    });

    // Update shared store - Header will automatically update!
    userStore.setState({
      user,
      isLoggedIn: true
    });
  }

  render() {
    // ... form rendering
  }
}
```

### localStorage Persistence

```javascript
import { createStore } from './framework/src/state/index.js';

// Load from localStorage
const loadState = () => {
  try {
    const serialized = localStorage.getItem('appState');
    return serialized ? JSON.parse(serialized) : {};
  } catch (err) {
    return {};
  }
};

// Save to localStorage
const saveState = (state) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem('appState', serialized);
  } catch (err) {
    console.error('Failed to save state:', err);
  }
};

// Create store with persisted state
const store = createStore(loadState());

// Auto-save on every change
store.subscribe(() => {
  saveState(store.getState());
});

// Now state persists across page reloads!
```

### Async Actions

```javascript
import { createStore } from './framework/src/state/index.js';

const store = createStore({
  users: [],
  loading: false,
  error: null
});

// Async action
async function fetchUsers() {
  // Set loading state
  store.setState({ loading: true, error: null });

  try {
    const users = await http.get('/api/users');
    store.setState({
      users,
      loading: false
    });
  } catch (error) {
    store.setState({
      error: error.message,
      loading: false
    });
  }
}

// Usage in component
class UserList extends Component {
  mounted() {
    fetchUsers(); // Trigger async action

    this.unsubscribe = store.subscribe(() => {
      this.setState(store.getState());
    });
  }

  beforeDestroy() {
    this.unsubscribe();
  }

  render() {
    const { users, loading, error } = this.state;

    if (loading) return h('div', {}, 'Loading...');
    if (error) return h('div', {}, `Error: ${error}`);

    return h('ul', {},
      users.map(user =>
        h('li', { key: user.id }, user.name)
      )
    );
  }
}
```

### Store with Actions (Redux-like)

```javascript
import { createStore } from './framework/src/state/index.js';

// Create store
const store = createStore({
  count: 0,
  history: []
});

// Define actions
const actions = {
  increment() {
    store.setState(state => ({
      count: state.count + 1,
      history: [...state.history, 'INCREMENT']
    }));
  },

  decrement() {
    store.setState(state => ({
      count: state.count - 1,
      history: [...state.history, 'DECREMENT']
    }));
  },

  reset() {
    store.setState({
      count: 0,
      history: [...store.getState().history, 'RESET']
    });
  }
};

// Usage
actions.increment(); // count = 1
actions.increment(); // count = 2
actions.decrement(); // count = 1
actions.reset();     // count = 0

console.log(store.getState().history);
// ['INCREMENT', 'INCREMENT', 'DECREMENT', 'RESET']
```

---

## Best Practices

### 1. Always Unsubscribe

```javascript
class MyComponent extends Component {
  mounted() {
    // ✅ Save unsubscribe function
    this.unsubscribe = store.subscribe(() => {
      this.setState(store.getState());
    });
  }

  beforeDestroy() {
    // ✅ Always cleanup!
    this.unsubscribe();
  }
}
```

### 2. Use Function Form for Dependent Updates

```javascript
// ❌ Bad - race condition
store.setState({ count: store.getState().count + 1 });
store.setState({ count: store.getState().count + 1 }); // May not work!

// ✅ Good - always uses latest state
store.setState(state => ({ count: state.count + 1 }));
store.setState(state => ({ count: state.count + 1 }));
```

### 3. Don't Mutate State

```javascript
const state = store.getState();

// ❌ Bad - mutates state copy (still problematic for nested objects)
state.todos.push(newTodo);
store.setState({ todos: state.todos });

// ✅ Good - create new array
store.setState(state => ({
  todos: [...state.todos, newTodo]
}));
```

### 4. Keep State Normalized

```javascript
// ❌ Bad - nested, hard to update
{
  users: [
    { id: 1, name: 'Alice', posts: [{ id: 1, title: 'Hello' }] }
  ]
}

// ✅ Good - flat, easy to update
{
  users: { 1: { id: 1, name: 'Alice' } },
  posts: { 1: { id: 1, title: 'Hello', userId: 1 } },
  userPosts: { 1: [1] }
}
```

### 5. Single Source of Truth

```javascript
// ✅ Good - one store
const appStore = createStore({
  user: null,
  todos: [],
  settings: {}
});

// ❌ Avoid - multiple stores for same data
const userStore = createStore({ user: null });
const todosStore = createStore({ todos: [] });
```

### 6. Derive Data, Don't Store It

```javascript
// ❌ Bad - storing derived data
store.setState({
  todos: [...],
  completedCount: todos.filter(t => t.done).length // Will get out of sync!
});

// ✅ Good - calculate in render
render() {
  const todos = store.getState().todos;
  const completedCount = todos.filter(t => t.done).length;
  return h('div', {}, `Completed: ${completedCount}`);
}
```

---

**📚 Navigation:** [← Back to Docs](../README.md)
