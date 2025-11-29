# State Management

State management allows you to share data across components and persist application state.

## Local State (Component State)

Each component has its own local state managed with `setState`:

```javascript
class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 }; // Local state
  }

  increment() {
    this.setState({ count: this.state.count + 1 });
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

### Creating a Store

```javascript
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

// Make it globally accessible
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
const unsubscribe = store.subscribe(() => {
  console.log('State changed:', store.getState());
});

// Later: stop listening
unsubscribe();
```

## Using Store in Components

### Method 1: Direct Access

```javascript
import { store } from './store.js';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: store.getState().user
    };
  }

  mounted() {
    // Subscribe to store changes
    this.unsubscribe = store.subscribe(() => {
      this.setState({ user: store.getState().user });
    });
  }

  beforeUnmount() {
    // Cleanup subscription
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

// Load from localStorage
const savedUser = localStorage.getItem('user');
if (savedUser) {
  store.setState({ user: JSON.parse(savedUser) });
}

// Persist to localStorage on changes
store.subscribe(() => {
  const { user } = store.getState();
  localStorage.setItem('user', JSON.stringify(user));
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
    store.setState({
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
  store.setState({
    user: {
      name: '',
      email: '',
      token: '',
      isAuthenticated: false
    }
  });
  localStorage.removeItem('user');
}
```

### Using Auth State

```javascript
import { store, login, logout } from './store.js';

class LoginButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: store.getState().user
    };
  }

  mounted() {
    this.unsubscribe = store.subscribe(() => {
      this.setState({ user: store.getState().user });
    });
  }

  beforeUnmount() {
    this.unsubscribe();
  }

  handleLogout() {
    logout();
  }

  render() {
    const { user } = this.state;

    if (user.isAuthenticated) {
      return h('div', {}, [
        h('span', {}, `Welcome, ${user.name}`),
        h('button', { onclick: () => this.handleLogout() }, 'Logout')
      ]);
    }

    return h('a', { href: '#/login' }, 'Login');
  }
}
```

### Shopping Cart Example

```javascript
// cartStore.js
import { createStore } from '../framework/src/state/index.js';

export const cartStore = createStore({
  items: [],
  total: 0
});

export function addToCart(product) {
  cartStore.setState(state => {
    const existingItem = state.items.find(item => item.id === product.id);
    
    if (existingItem) {
      return {
        items: state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        total: state.total + product.price
      };
    }
    
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
      items: state.items.filter(i => i.id !== productId),
      total: state.total - (item.price * item.quantity)
    };
  });
}

export function clearCart() {
  cartStore.setState({ items: [], total: 0 });
}
```

### Cart Component

```javascript
class ShoppingCart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cart: cartStore.getState()
    };
  }

  mounted() {
    this.unsubscribe = cartStore.subscribe(() => {
      this.setState({ cart: cartStore.getState() });
    });
  }

  beforeUnmount() {
    this.unsubscribe();
  }

  render() {
    const { items, total } = this.state.cart;

    return h('div', { class: 'cart' }, [
      h('h2', {}, 'Shopping Cart'),
      items.length === 0
        ? h('p', {}, 'Cart is empty')
        : h('ul', {},
            items.map(item =>
              h('li', { key: item.id }, [
                h('span', {}, `${item.name} x${item.quantity}`),
                h('span', {}, `$${item.price * item.quantity}`),
                h('button', {
                  onclick: () => removeFromCart(item.id)
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
