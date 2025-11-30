# State Management

State management allows you to share data across components and persist application state.

---

**📚 Navigation:** [← Prev: Components](./04-components.md) | [Next: Routing →](./06-routing.md)

---

## 📖 Table of Contents

- [Local State (Component State)](#local-state-component-state)
- [Global State (Store)](#global-state-store)
- [Using Store in Components](#using-store-in-components)
- [Real-World Examples](#real-world-examples)
- [Advanced Patterns](#advanced-patterns)
- [Performance Tips](#performance-tips)

---

## Local State (Component State)

Each component has its own local state managed with `setState`:

```javascript
// Example: Counter with local state - data is private to this component
class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 }; // Local state - only this component can access
  }

  increment() {
    this.setState({ count: this.state.count + 1 }); // Update local state
  }

  render() {
    return h('div', {}, [
      h('p', {}, `Count: ${this.state.count}`),
      h('button', { onclick: () => this.increment() }, '+')
    ]);
  }
}
```

## Global State (Store)

For data shared across multiple components, use a global store.

**💡 When to use global state:**

- ✅ User authentication status (needed across many pages)
- ✅ App theme/settings (affects entire UI)
- ✅ Shopping cart data (accessed from multiple components)
- ✅ Notification queue (global toasts)

**❌ Don't use global state for:**
- Form input values (use local component state)
- UI state like modals, dropdowns (keep local)
- Temporary loading states (component-specific)

### Creating a Store

```javascript
// Example: Create global store - shared data accessible from any component
import { createStore, setGlobalStore } from './framework/src/state/index.js';

// Create store with initial state
const store = createStore({
  user: {
    name: '',
    email: '',
    isAuthenticated: false
  },
  theme: 'light',
  notifications: []
});

// Make it globally accessible - components can import this
setGlobalStore(store);
```

### Store API

#### getState()

Get current state snapshot:

```javascript
const currentState = store.getState();
console.log(currentState.user.name);
```

#### setState()

Update state (accepts object or function):

```javascript
// Object update
store.setState({ theme: 'dark' });

// Function update (access previous state)
store.setState(prevState => ({
  notifications: [...prevState.notifications, newNotification]
}));
```

#### subscribe()

Listen to state changes:

```javascript
// Example: Subscribe to store changes - callback runs whenever state updates
const unsubscribe = store.subscribe(() => {
  console.log('State changed:', store.getState()); // Runs on every state update
});

// Later: stop listening (important to prevent memory leaks!)
unsubscribe();
```

## Using Store in Components

### Method 1: Direct Access

```javascript
// Example: Component subscribing to store - demonstrates lifecycle with subscriptions
import { store } from './store.js';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: store.getState().user // Initial state from store
    };
  }

  mounted() {
    // Subscribe to store changes - update component when store updates
    this.unsubscribe = store.subscribe(() => {
      this.setState({ user: store.getState().user }); // Sync with store
    });
  }

  beforeUnmount() {
    // Cleanup subscription - prevents memory leaks!
    this.unsubscribe();
  }

  render() {
    const { user } = this.state;
    return h('div', {}, [
      h('p', {}, `Name: ${user.name}`),
      h('p', {}, `Email: ${user.email}`)
    ]);
  }
}
```

### Method 2: Helper Hook

Create a reusable hook:

```javascript
// useStore.js
export function useStore(component, selector) {
  const updateState = () => {
    const storeState = store.getState();
    const selected = selector ? selector(storeState) : storeState;
    component.setState({ storeData: selected });
  };

  // Initial state
  component.state = component.state || {};
  updateState();

  // Subscribe on mount
  const originalMounted = component.mounted;
  component.mounted = function() {
    this.unsubscribe = store.subscribe(updateState);
    if (originalMounted) originalMounted.call(this);
  };

  // Unsubscribe on unmount
  const originalBeforeUnmount = component.beforeUnmount;
  component.beforeUnmount = function() {
    if (this.unsubscribe) this.unsubscribe();
    if (originalBeforeUnmount) originalBeforeUnmount.call(this);
  };
}

// Usage
class MyComponent extends Component {
  constructor(props) {
    super(props);
    useStore(this, state => state.user); // Select only user
  }

  render() {
    const user = this.state.storeData;
    return h('div', {}, user.name);
  }
}
```

## Real-World Examples

### Authentication State

```javascript
// Example: Authentication store with persistence - demonstrates real-world store usage
// store.js
import { createStore, setGlobalStore } from '../framework/src/state/index.js';

export const store = createStore({
  user: {
    name: '',
    email: '',
    token: '',
    isAuthenticated: false
  }
});

// Load from localStorage - restore session on page reload
const savedUser = localStorage.getItem('user');
if (savedUser) {
  store.setState({ user: JSON.parse(savedUser) }); // Restore user state
}

// Persist to localStorage on changes - auto-save user state
store.subscribe(() => {
  const { user } = store.getState();
  localStorage.setItem('user', JSON.stringify(user)); // Save on every change
});

setGlobalStore(store);

// Helper functions
export function login(email, password) {
  // API call here...
  return fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    store.setState({ // Update global user state on successful login
      user: {
        name: data.name,
        email: data.email,
        token: data.token,
        isAuthenticated: true
      }
    });
  });
}

export function logout() {
  store.setState({ // Clear user state
    user: {
      name: '',
      email: '',
      token: '',
      isAuthenticated: false
    }
  });
  localStorage.removeItem('user'); // Clear persisted data
}
```

### Using Auth State

```javascript
// Example: Login button - demonstrates conditional rendering based on auth state
import { store, login, logout } from './store.js';

class LoginButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: store.getState().user // Get current auth state
    };
  }

  mounted() {
    this.unsubscribe = store.subscribe(() => {
      this.setState({ user: store.getState().user }); // Re-render on auth changes
    });
  }

  beforeUnmount() {
    this.unsubscribe(); // Cleanup
  }

  handleLogout() {
    logout(); // Calls store action
  }

  render() {
    const { user } = this.state;

    if (user.isAuthenticated) { // Show logout button if logged in
      return h('div', {}, [
        h('span', {}, `Welcome, ${user.name}`),
        h('button', { onclick: () => this.handleLogout() }, 'Logout')
      ]);
    }

    return h('a', { href: '#/login' }, 'Login'); // Show login link otherwise
  }
}
```

### Shopping Cart Example

```javascript
// Example: Shopping cart store - demonstrates complex state updates with functions
// cartStore.js
import { createStore } from '../framework/src/state/index.js';

export const cartStore = createStore({
  items: [],
  total: 0
});

export function addToCart(product) {
  cartStore.setState(state => { // Function form - access previous state
    const existingItem = state.items.find(item => item.id === product.id);
    
    if (existingItem) { // Product already in cart - increment quantity
      return {
        items: state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        total: state.total + product.price // Add price to total
      };
    }
    
    // New product - add to cart with quantity 1
    return {
      items: [...state.items, { ...product, quantity: 1 }],
      total: state.total + product.price
    };
  });
}

export function removeFromCart(productId) {
  cartStore.setState(state => {
    const item = state.items.find(i => i.id === productId);
    return {
      items: state.items.filter(i => i.id !== productId), // Remove item
      total: state.total - (item.price * item.quantity) // Subtract from total
    };
  });
}

export function clearCart() {
  cartStore.setState({ items: [], total: 0 }); // Reset cart
}
```

### Cart Component

```javascript
// Example: Shopping cart component - displays cart items and handles updates
class ShoppingCart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cart: cartStore.getState() // Get initial cart state
    };
  }

  mounted() {
    this.unsubscribe = cartStore.subscribe(() => {
      this.setState({ cart: cartStore.getState() }); // Update when cart changes
    });
  }

  beforeUnmount() {
    this.unsubscribe(); // Cleanup subscription
  }

  render() {
    const { items, total } = this.state.cart;

    return h('div', { class: 'cart' }, [
      h('h2', {}, 'Shopping Cart'),
      items.length === 0
        ? h('p', {}, 'Cart is empty') // Empty state
        : h('ul', {},
            items.map(item =>
              h('li', { key: item.id }, [ // Use key for list items
                h('span', {}, `${item.name} x${item.quantity}`),
                h('span', {}, `$${item.price * item.quantity}`),
                h('button', {
                  onclick: () => removeFromCart(item.id) // Remove item action
                }, 'Remove')
              ])
            )
          ),
      h('div', { class: 'total' }, [
        h('strong', {}, `Total: $${total.toFixed(2)}`)
      ])
    ]);
  }
}
```

## Advanced Patterns

### Computed Values

```javascript
const store = createStore({
  todos: [],
  filter: 'all' // 'all' | 'active' | 'completed'
});

// Computed getter
export function getFilteredTodos() {
  const { todos, filter } = store.getState();
  
  if (filter === 'active') {
    return todos.filter(t => !t.completed);
  }
  if (filter === 'completed') {
    return todos.filter(t => t.completed);
  }
  return todos;
}

export function getActiveCount() {
  return store.getState().todos.filter(t => !t.completed).length;
}
```

### Actions Pattern

Encapsulate state updates:

```javascript
// actions.js
import { store } from './store.js';

export const actions = {
  addTodo(text) {
    store.setState(state => ({
      todos: [
        ...state.todos,
        { id: Date.now(), text, completed: false }
      ]
    }));
  },

  toggleTodo(id) {
    store.setState(state => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  },

  deleteTodo(id) {
    store.setState(state => ({
      todos: state.todos.filter(t => t.id !== id)
    }));
  },

  setFilter(filter) {
    store.setState({ filter });
  }
};

// Usage in component
import { actions } from './actions.js';

class TodoApp extends Component {
  addTodo() {
    actions.addTodo(this.state.newTodoText);
    this.setState({ newTodoText: '' });
  }
}
```

### Multiple Stores

You can create multiple stores for different domains:

```javascript
// userStore.js
export const userStore = createStore({
  currentUser: null,
  isAuthenticated: false
});

// productStore.js
export const productStore = createStore({
  items: [],
  categories: [],
  loading: false
});

// cartStore.js
export const cartStore = createStore({
  items: [],
  total: 0
});

// Component subscribing to multiple stores
class Dashboard extends Component {
  mounted() {
    this.unsubs = [
      userStore.subscribe(() => this.updateUserData()),
      productStore.subscribe(() => this.updateProducts()),
      cartStore.subscribe(() => this.updateCart())
    ];
  }

  beforeUnmount() {
    this.unsubs.forEach(unsub => unsub());
  }
}
```

## Best Practices

### 1. Normalize State Shape

```javascript
// ❌ Nested and duplicated data
const store = createStore({
  posts: [
    { id: 1, author: { id: 10, name: 'Alice' }, comments: [...] }
  ]
});

// ✅ Normalized
const store = createStore({
  posts: {
    byId: { 1: { id: 1, authorId: 10, commentIds: [1, 2] } },
    allIds: [1]
  },
  authors: {
    byId: { 10: { id: 10, name: 'Alice' } },
    allIds: [10]
  },
  comments: {
    byId: { 1: {...}, 2: {...} },
    allIds: [1, 2]
  }
});
```

### 2. Keep State Minimal

```javascript
// ❌ Derived data in state
const store = createStore({
  todos: [...],
  completedTodos: [...], // Duplicate!
  activeCount: 5 // Can be calculated!
});

// ✅ Store only source data
const store = createStore({
  todos: [...]
});

// Calculate derived data
function getCompletedTodos() {
  return store.getState().todos.filter(t => t.completed);
}
```

### 3. Use Immutable Updates

```javascript
// ❌ Mutating state
const state = store.getState();
state.todos.push(newTodo); // Don't mutate!
store.setState(state);

// ✅ Immutable update
store.setState(state => ({
  todos: [...state.todos, newTodo]
}));
```

## Next Steps

- **[Components](./04-components.md)** - Learn component-local state
- **[Routing](./06-routing.md)** - Navigate between pages
- **[Best Practices](./10-best-practices.md)** - State management patterns

---

**📚 Navigation:** [← Prev: Components](./04-components.md) | [Next: Routing →](./06-routing.md)

---

### 4. Unsubscribe on Unmount

```javascript
class MyComponent extends Component {
  mounted() {
    // Always save unsubscribe function
    this.unsubscribe = store.subscribe(() => {
      this.updateFromStore();
    });
  }

  beforeUnmount() {
    // Always cleanup
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
```

## Next Steps

- [Routing](./06-routing.md) - Integrate routing with state
- [HTTP Client](./09-http-client.md) - Fetch data into store
- [Best Practices](./10-best-practices.md) - State management patterns

---

**📚 Navigation:** [← Prev: Components](./04-components.md) | [Next: Routing →](./06-routing.md)

---
