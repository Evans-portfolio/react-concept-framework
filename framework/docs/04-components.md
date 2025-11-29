# Components

Components are the building blocks of your application. They encapsulate UI logic, state, and behavior.

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

### Component with State

State is internal data that can change over time:

```javascript
class Toggle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOn: false
    };
  }

  toggle() {
    this.setState({ isOn: !this.state.isOn });
  }

  render() {
    const { isOn } = this.state;
    return h('div', {}, [
      h('p', {}, `The switch is ${isOn ? 'ON' : 'OFF'}`),
      h('button', { 
        onclick: () => this.toggle() 
      }, 'Toggle')
    ]);
  }
}
```

## Component Lifecycle

### Lifecycle Hooks

```javascript
class LifecycleDemo extends Component {
  constructor(props) {
    super(props);
    console.log('1. Constructor called');
  }

  created() {
    console.log('2. Component created');
    // Initialize data, setup non-reactive properties
  }

  beforeMount() {
    console.log('3. Before mounting to DOM');
    // Last chance to modify state before initial render
  }

  mounted() {
    console.log('4. Component mounted to DOM');
    // Access DOM, fetch data, setup event listeners
    this.loadData();
  }

  beforeUpdate(oldState, newState) {
    console.log('5. Before state update');
    // React to state changes before re-render
  }

  updated(oldState, newState) {
    console.log('6. After state update');
    // Perform DOM operations after update
  }

  beforeUnmount() {
    console.log('7. Before unmounting');
    // Cleanup: remove event listeners, cancel timers
  }

  unmounted() {
    console.log('8. Component unmounted');
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
class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 0 };
    this.intervalId = null;
  }

  mounted() {
    this.intervalId = setInterval(() => {
      this.setState({ seconds: this.state.seconds + 1 });
    }, 1000);
  }

  beforeUnmount() {
    // Clean up interval
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
class Button extends Component {
  render() {
    const { variant = 'primary', onClick, children } = this.props;
    
    return h('button', {
      class: `btn btn-${variant}`,
      onclick: onClick
    }, children);
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
class Card extends Component {
  render() {
    const { title, children } = this.props;
    
    return h('div', { class: 'card' }, [
      title && h('div', { class: 'card-header' }, title),
      h('div', { class: 'card-body' }, children)
    ]);
  }
}

// Usage
h(Card, { title: 'My Card' }, [
  h('p', {}, 'Card content goes here')
])
```

### List Component

```javascript
class List extends Component {
  render() {
    const { items, renderItem } = this.props;
    
    return h('ul', { class: 'list' },
      items.map((item, index) => 
        h('li', { key: item.id || index }, 
          renderItem(item, index)
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
class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      newTodo: ''
    };
  }

  mounted() {
    // Load from localStorage
    const saved = localStorage.getItem('todos');
    if (saved) {
      this.setState({ todos: JSON.parse(saved) });
    }
  }

  addTodo() {
    if (!this.state.newTodo.trim()) return;
    
    const todos = [
      ...this.state.todos,
      { id: Date.now(), text: this.state.newTodo, completed: false }
    ];
    
    this.setState({ todos, newTodo: '' });
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  toggleTodo(id) {
    const todos = this.state.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.setState({ todos });
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  render() {
    return h('div', { class: 'todo-app' }, [
      h('input', {
        value: this.state.newTodo,
        oninput: (e) => this.setState({ newTodo: e.target.value }),
        onkeypress: (e) => e.key === 'Enter' && this.addTodo()
      }),
      h('ul', {},
        this.state.todos.map(todo =>
          h('li', { 
            key: todo.id,
            class: todo.completed ? 'completed' : ''
          }, [
            h('input', {
              type: 'checkbox',
              checked: todo.completed,
              onchange: () => this.toggleTodo(todo.id)
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
