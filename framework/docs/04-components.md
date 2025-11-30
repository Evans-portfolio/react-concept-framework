# Components

Components are the building blocks of your application. They encapsulate UI logic, state, and behavior.

---

**📚 Navigation:** [← Prev: Installation](./03-installation.md) | [Next: State Management →](./05-state-management.md)

---

## 📖 Table of Contents

- [Component Class](#component-class)
- [Component Lifecycle](#component-lifecycle)
- [State Management](#state-management)
- [Props](#props)
- [Event Handling](#event-handling)
- [Component Composition](#component-composition)
- [Best Practices](#best-practices)

---

## Component Class

### Basic Component

```javascript
import { Component, h } from '../framework/src/core/index.js';

class MyComponent extends Component {
  render() {
    return h('div', {}, 'Hello from component');
  }
}
```

### Component with Props

Props are passed to components and are immutable:

```javascript
class Greeting extends Component {
  render() {
    return h('h1', {}, `Hello, ${this.props.name}!`);
  }
}

// Usage
const greeting = new Greeting({ name: 'Alice' });
```

**💡 Understanding Props:**

Props (properties) are like function parameters:
1. **Passed from parent** - Parent component controls the values
2. **Read-only** - Cannot be modified inside the component
3. **Can be any type** - strings, numbers, objects, functions, components

**Example with different prop types:**
```javascript
// Example: User card component - demonstrates receiving props from parent
class UserCard extends Component {
  render() {
    const { name, age, onDelete } = this.props; // Destructure props for easy access
    
    return h('div', { class: 'card' }, [
      h('h3', {}, name),           // String prop
      h('p', {}, `Age: ${age}`),   // Number prop
      h('button', {                 // Function prop
        onclick: () => onDelete(this.props.id)
      }, 'Delete')
    ]);
  }
}

// Parent passes props:
const card = new UserCard({
  id: 1,
  name: 'Alice',
  age: 25,
  onDelete: (id) => console.log('Delete user', id) // Parent controls delete logic
});
```

> ⚠️ **Remember:** Never do `this.props.name = 'Bob'` - props are read-only!

### Component with State

State is internal data that can change over time:

```javascript
// Example: Toggle button - demonstrates internal state management
class Toggle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOn: false  // Initial state - switch is OFF
    };
  }

  toggle() {
    this.setState({ isOn: !this.state.isOn }); // Toggle state - triggers re-render
  }

  render() {
    const { isOn } = this.state;
    return h('div', {}, [
      h('p', {}, `The switch is ${isOn ? 'ON' : 'OFF'}`), // Display current state
      h('button', { 
        onclick: () => this.toggle() // Call toggle method on click
      }, 'Toggle')
    ]);
  }
}
```

**💡 State vs Props:**

| Feature | State | Props |
|---------|-------|-------|
| **Mutable** | ✅ Yes (via `setState`) | ❌ No (read-only) |
| **Owned by** | Component itself | Parent component |
| **Changes trigger** | Re-render | Re-render |
| **Use for** | Internal component data | Configuration from parent |

**Example:**
```javascript
// Props come from parent
<UserCard name="Alice" age={25} />

// State is internal
this.state = { expanded: false }
```

> 📝 **Best practice:** Keep state as local as possible. Only lift state up when multiple components need to share it.

## Component Lifecycle

### Lifecycle Hooks

```javascript
// Example: Complete lifecycle demonstration - shows execution order of all hooks
class LifecycleDemo extends Component {
  constructor(props) {
    super(props);
    console.log('1. Constructor called'); // First - basic setup
  }

  created() {
    console.log('2. Component created'); // Second - after construction
    // Initialize data, setup non-reactive properties
  }

  beforeMount() {
    console.log('3. Before mounting to DOM'); // Third - before first render
    // Last chance to modify state before initial render
  }

  mounted() {
    console.log('4. Component mounted to DOM'); // Fourth - DOM is ready
    // Access DOM, fetch data, setup event listeners
    this.loadData(); // Safe to fetch data now
  }

  beforeUpdate(oldState, newState) {
    console.log('5. Before state update'); // Before each re-render
    // React to state changes before re-render
  }

  updated(oldState, newState) {
    console.log('6. After state update'); // After each re-render
    // Perform DOM operations after update
  }

  beforeUnmount() {
    console.log('7. Before unmounting'); // Before component removal
    // Cleanup: remove event listeners, cancel timers
  }

  unmounted() {
    console.log('8. Component unmounted'); // After component removed
    // Final cleanup
  }

  async loadData() {
    // Example: fetch data after mount
    const data = await fetch('/api/data').then(r => r.json());
    this.setState({ data });
  }

  render() {
    return h('div', {}, 'Lifecycle Demo');
  }
}
```

### Common Lifecycle Patterns

**Fetching Data:**

```javascript
class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      error: null
    };
  }

  async mounted() {
    try {
      const user = await fetch(`/api/users/${this.props.userId}`)
        .then(r => r.json());
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  render() {
    const { user, loading, error } = this.state;

    if (loading) return h('div', {}, 'Loading...');
    if (error) return h('div', {}, `Error: ${error}`);
    if (!user) return h('div', {}, 'User not found');

    return h('div', { class: 'profile' }, [
      h('h2', {}, user.name),
      h('p', {}, user.email)
    ]);
  }
}
```

**Cleanup:**

```javascript
// Example: Timer with cleanup - demonstrates beforeUnmount() hook
class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 0 };
    this.intervalId = null; // Store interval ID for cleanup
  }

  mounted() {
    this.intervalId = setInterval(() => {
      this.setState({ seconds: this.state.seconds + 1 }); // Increment every second
    }, 1000);
  }

  beforeUnmount() {
    // Clean up interval - prevents memory leaks!
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  render() {
    return h('div', {}, `Seconds: ${this.state.seconds}`);
  }
}
```

## setState Patterns

### Basic setState

```javascript
this.setState({ count: 5 });
```

### Functional Updates

Use when new state depends on old state:

```javascript
this.setState(prevState => ({
  count: prevState.count + 1
}));
```

### Callback After Update

```javascript
this.setState({ saved: true }, () => {
  console.log('State updated!');
});
```

### Batching Multiple Updates

```javascript
handleClick() {
  // These will be batched into one re-render
  this.setState({ count: this.state.count + 1 });
  this.setState({ name: 'Updated' });
  this.setState({ active: true });
}
```

## Component Composition

### Reusable Button Component

```javascript
// Example: Reusable button - demonstrates component composition and default props
class Button extends Component {
  render() {
    const { variant = 'primary', onClick, children } = this.props; // Default variant
    
    return h('button', {
      class: `btn btn-${variant}`, // Dynamic CSS class based on variant
      onclick: onClick
    }, children); // children = button content
  }
}

// Usage
h(Button, { 
  variant: 'success', 
  onClick: () => console.log('Clicked') 
}, 'Save')
```

### Card Component with Slots

```javascript
// Example: Card with slots - demonstrates children prop pattern
class Card extends Component {
  render() {
    const { title, children } = this.props;
    
    return h('div', { class: 'card' }, [
      title && h('div', { class: 'card-header' }, title), // Optional header
      h('div', { class: 'card-body' }, children) // children = card content
    ]);
  }
}

// Usage
h(Card, { title: 'My Card' }, [
  h('p', {}, 'Card content goes here') // This becomes children prop
])
```

### List Component

```javascript
// Example: Generic list - demonstrates render prop pattern
class List extends Component {
  render() {
    const { items, renderItem } = this.props;
    
    return h('ul', { class: 'list' },
      items.map((item, index) => 
        h('li', { key: item.id || index }, // Always use keys for lists!
          renderItem(item, index) // Parent controls how each item renders
        )
      )
    );
  }
}

// Usage
h(List, {
  items: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
  renderItem: (item) => h('span', {}, item.name)
})
```

## Functional Components

Simpler components without state:

```javascript
function Header({ title, subtitle }) {
  return h('header', { class: 'header' }, [
    h('h1', {}, title),
    subtitle && h('p', {}, subtitle)
  ]);
}

// Usage
Header({ title: 'My App', subtitle: 'Welcome!' })
```

## Best Practices

### 1. Single Responsibility

```javascript
// ❌ Too much responsibility
class UserDashboard extends Component {
  // Handles users, posts, comments, settings...
}

// ✅ Split into smaller components
class UserDashboard extends Component {
  render() {
    return h('div', {}, [
      h(UserProfile, { userId: this.props.userId }),
      h(UserPosts, { userId: this.props.userId }),
      h(UserSettings, { userId: this.props.userId })
    ]);
  }
}
```

### 2. Prop Validation

```javascript
class UserCard extends Component {
  constructor(props) {
    super(props);
    // Validate required props
    if (!props.user) {
      console.warn('UserCard: user prop is required');
    }
  }
}
```

### 3. Avoid Direct DOM Manipulation

```javascript
// ❌ Don't do this
mounted() {
  document.getElementById('my-element').innerHTML = 'Changed';
}

// ✅ Use state instead
handleClick() {
  this.setState({ content: 'Changed' });
}
```

### 4. Use Keys for Lists

```javascript
render() {
  return h('ul', {},
    this.state.items.map(item =>
      h('li', { key: item.id }, item.name) // ✅ Always use key
    )
  );
}
```

## Examples from Demo App

### Todo Component (Real Example)

```javascript
// Example: Full todo app - demonstrates complete component with state, lifecycle, and events
class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      newTodo: ''
    };
  }

  mounted() {
    // Load from localStorage on mount
    const saved = localStorage.getItem('todos');
    if (saved) {
      this.setState({ todos: JSON.parse(saved) }); // Restore saved todos
    }
  }

  addTodo() {
    if (!this.state.newTodo.trim()) return; // Ignore empty todos
    
    const todos = [
      ...this.state.todos,
      { id: Date.now(), text: this.state.newTodo, completed: false } // Create new todo
    ];
    
    this.setState({ todos, newTodo: '' }); // Update state and clear input
    localStorage.setItem('todos', JSON.stringify(todos)); // Persist to storage
  }

  toggleTodo(id) {
    const todos = this.state.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo // Toggle specific todo
    );
    this.setState({ todos });
    localStorage.setItem('todos', JSON.stringify(todos)); // Persist changes
  }

  render() {
    return h('div', { class: 'todo-app' }, [
      h('input', {
        value: this.state.newTodo,
        oninput: (e) => this.setState({ newTodo: e.target.value }), // Update input state
        onkeypress: (e) => e.key === 'Enter' && this.addTodo() // Add on Enter key
      }),
      h('ul', {},
        this.state.todos.map(todo =>
          h('li', { 
            key: todo.id, // Unique key for efficient rendering
            class: todo.completed ? 'completed' : ''
          }, [
            h('input', {
              type: 'checkbox',
              checked: todo.completed,
              onchange: () => this.toggleTodo(todo.id) // Toggle on click
            }),
            h('span', {}, todo.text)
          ])
        )
      )
    ]);
  }
}
```

## Next Steps

- [State Management](./05-state-management.md) - Global state stores
- [Event Handling](./07-event-handling.md) - Working with events
- [Best Practices](./10-best-practices.md) - Component patterns

---

**📚 Navigation:** [← Prev: Installation](./03-installation.md) | [Next: State Management →](./05-state-management.md)

---
