# Component API Reference

Complete reference for the Component class and lifecycle system.

---

**📚 Navigation:** [← Back to Docs](../README.md)

---

## Table of Contents

- [Component Class](#component-class)
  - [Constructor](#constructor)
  - [Properties](#properties)
  - [Methods](#methods)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Helper Functions](#helper-functions)
- [Examples](#examples)

---

## Component Class

### Constructor

```javascript
constructor(props = {})
```

Creates a new component instance.

**Parameters:**
- `props` (Object) - Component properties passed from parent

**Example:**
```javascript
class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: props.initialCount || 0
    };
  }
}

const component = new MyComponent({ initialCount: 5 });
```

---

### Properties

#### `this.props`

**Type:** `Object`

Read-only properties passed from parent component.

```javascript
class Greeting extends Component {
  render() {
    return h('h1', {}, `Hello, ${this.props.name}!`);
  }
}

// Usage:
const greeting = new Greeting({ name: 'Alice' });
```

#### `this.state`

**Type:** `Object`

Component's internal state. **Never modify directly** - always use `setState()`.

```javascript
class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  // ✅ Correct
  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  // ❌ Wrong - never do this!
  wrongIncrement() {
    this.state.count++; // Won't trigger re-render!
  }
}
```

#### `this._isMounted`

**Type:** `Boolean`

Indicates whether component is currently mounted to the DOM.

```javascript
class MyComponent extends Component {
  mounted() {
    console.log('Is mounted?', this._isMounted); // true
  }

  beforeDestroy() {
    console.log('Still mounted?', this._isMounted); // true
  }

  destroyed() {
    console.log('Still mounted?', this._isMounted); // false
  }
}
```

---

### Methods

#### `setState(update, callback)`

Updates component state and triggers re-render.

**Parameters:**
- `update` (Object | Function) - New state values or updater function
- `callback` (Function, optional) - Called after state update completes

**Returns:** `void`

**Examples:**

```javascript
// Object update
this.setState({ count: 5 });

// Function update - access to current state
this.setState((state, props) => ({
  count: state.count + props.increment
}));

// With callback
this.setState({ loading: false }, () => {
  console.log('State updated!');
});

// Merge behavior - only updates specified keys
this.state = { count: 0, name: 'Alice' };
this.setState({ count: 1 });
// Result: { count: 1, name: 'Alice' }
```

**⚠️ Important Notes:**
- State updates are merged, not replaced
- Re-render only happens if component is mounted
- Multiple `setState` calls are batched in the same update cycle
- Use function form when new state depends on old state

---

#### `forceUpdate()`

Forces component to re-render immediately.

**Parameters:** None

**Returns:** `void`

**Example:**
```javascript
class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = { time: new Date() };
  }

  mounted() {
    // Update every second
    this.timer = setInterval(() => {
      this.state.time = new Date(); // Direct mutation
      this.forceUpdate(); // Force re-render
    }, 1000);
  }

  beforeDestroy() {
    clearInterval(this.timer);
  }

  render() {
    return h('div', {}, this.state.time.toLocaleTimeString());
  }
}
```

**⚠️ Warning:** Rarely needed. Prefer `setState()` for normal state updates.

---

#### `mount(container)`

Mounts the component to a DOM element.

**Parameters:**
- `container` (HTMLElement) - DOM element to mount into

**Returns:** `void`

**Example:**
```javascript
const app = new MyComponent({ title: 'Hello' });
const container = document.getElementById('app');
app.mount(container);
```

**Lifecycle flow:**
1. Calls `beforeMount()` hook
2. Calls `render()` to generate virtual DOM
3. Creates real DOM elements
4. Appends to container
5. Sets `_isMounted = true`
6. Calls `mounted()` hook

---

#### `unmount()`

Unmounts the component from the DOM.

**Parameters:** None

**Returns:** `void`

**Example:**
```javascript
const component = new MyComponent();
component.mount(document.body);

// Later...
component.unmount(); // Removes from DOM and cleans up
```

**Lifecycle flow:**
1. Calls `beforeDestroy()` hook
2. Removes from DOM
3. Clears event handlers
4. Sets `_isMounted = false`
5. Calls `destroyed()` hook

---

#### `render()`

**Abstract method** - must be implemented by subclasses.

**Parameters:** None

**Returns:** `VNode` - Virtual DOM node

**Example:**
```javascript
class MyComponent extends Component {
  render() {
    return h('div', { className: 'container' },
      h('h1', {}, 'Hello World'),
      h('p', {}, `Count: ${this.state.count}`)
    );
  }
}
```

**⚠️ Important:**
- Called on every state update
- Must return a valid virtual DOM node
- Should be a pure function (same state = same output)
- Don't call `setState()` inside `render()`!

---

## Lifecycle Hooks

All lifecycle hooks are **optional** - only implement what you need.

### `beforeCreate()`

Called before component initialization.

**When:** Before `state` and `props` are set up

**Use for:** Early setup that doesn't need state/props

```javascript
class MyComponent extends Component {
  beforeCreate() {
    console.log('Component is being created...');
    // this.state is not available yet
  }
}
```

---

### `created()`

Called after component initialization.

**When:** After `state` and `props` are set up, before mounting

**Use for:**
- Initialize data
- Setup subscriptions
- Start async operations

```javascript
class UserProfile extends Component {
  created() {
    // Access state and props
    console.log('Initial state:', this.state);
    console.log('Props:', this.props);

    // Setup data
    this.observers = [];
  }
}
```

---

### `beforeMount()`

Called before component is mounted to DOM.

**When:** After `render()` called, before DOM insertion

**Use for:**
- Last-minute setup before DOM access
- Prepare data for rendering

```javascript
class Chart extends Component {
  beforeMount() {
    console.log('About to mount chart');
    this.prepareChartData();
  }
}
```

---

### `mounted()`

Called after component is mounted to DOM.

**When:** After DOM insertion complete

**Use for:**
- DOM manipulation
- API calls
- Start timers/intervals
- Initialize third-party libraries

```javascript
class TodoList extends Component {
  async mounted() {
    // DOM is ready
    this.input = this._element.querySelector('input');
    this.input.focus();

    // Make API calls
    const todos = await http.get('/api/todos');
    this.setState({ todos });

    // Start interval
    this.autoSaveTimer = setInterval(() => {
      this.saveToLocalStorage();
    }, 5000);
  }

  beforeDestroy() {
    clearInterval(this.autoSaveTimer);
  }
}
```

---

### `beforeUpdate(oldProps, newProps)`

Called before component re-renders.

**When:** Before `render()` called during update

**Parameters:**
- `oldProps` (Object) - Previous props
- `newProps` (Object) - New props

**Use for:**
- Save DOM state (scroll position, focus)
- Compare old vs new props

```javascript
class ScrollableList extends Component {
  beforeUpdate(oldProps, newProps) {
    // Save scroll position
    this.scrollTop = this._element.scrollTop;

    // Check if data changed
    if (oldProps.items !== newProps.items) {
      console.log('Items changed!');
    }
  }

  updated() {
    // Restore scroll position
    this._element.scrollTop = this.scrollTop;
  }
}
```

---

### `updated(oldProps, newProps)`

Called after component re-renders.

**When:** After DOM update complete

**Parameters:**
- `oldProps` (Object) - Previous props
- `newProps` (Object) - New props

**Use for:**
- React to DOM changes
- Update third-party libraries
- Trigger animations

```javascript
class AnimatedComponent extends Component {
  updated(oldProps, newProps) {
    // Animate on state change
    if (this.state.count !== this.prevCount) {
      this.animateCounter();
    }
    this.prevCount = this.state.count;

    // Update external library
    if (this.chart) {
      this.chart.update(this.state.data);
    }
  }
}
```

---

### `beforeDestroy()`

Called before component is unmounted.

**When:** Before removal from DOM

**Use for:**
- Remove event listeners
- Cancel pending requests
- Clear timers/intervals
- Cleanup subscriptions

```javascript
class RealTimeData extends Component {
  mounted() {
    // Setup
    this.ws = new WebSocket('ws://api.example.com');
    this.handler = (data) => this.setState({ data });
    on('data-update', this.handler);
  }

  beforeDestroy() {
    // Cleanup - CRITICAL!
    if (this.ws) {
      this.ws.close();
    }
    off('data-update', this.handler);
    clearInterval(this.pollTimer);
  }
}
```

**⚠️ Critical:** Always cleanup in `beforeDestroy()` to prevent memory leaks!

---

### `destroyed()`

Called after component is unmounted.

**When:** After removal from DOM

**Use for:**
- Final cleanup
- Log analytics

```javascript
class MyComponent extends Component {
  destroyed() {
    console.log('Component destroyed');
    // Component is no longer in DOM
    // this._isMounted === false
  }
}
```

---

## Helper Functions

### `createComponent(renderFn)`

Creates a functional component from a render function.

**Parameters:**
- `renderFn` (Function) - Render function `(props, state) => VNode`

**Returns:** `Component` class

**Example:**
```javascript
import { createComponent, h } from './framework/src/core/index.js';

const Greeting = createComponent((props, state) => {
  return h('h1', {}, `Hello, ${props.name}!`);
});

const greeting = new Greeting({ name: 'Alice' });
greeting.mount(document.body);
```

---

### `isComponent(obj)`

Checks if an object is a component instance or class.

**Parameters:**
- `obj` (any) - Object to check

**Returns:** `Boolean`

**Example:**
```javascript
import { Component, isComponent } from './framework/src/core/index.js';

class MyComponent extends Component {
  render() { return h('div', {}, 'Hello'); }
}

console.log(isComponent(MyComponent)); // true
console.log(isComponent(new MyComponent())); // true
console.log(isComponent('string')); // false
console.log(isComponent({})); // false
```

---

## Examples

### Basic Counter

```javascript
import { Component, h } from './framework/src/core/index.js';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: props.initialCount || 0
    };
  }

  increment = () => {
    this.setState(state => ({
      count: state.count + 1
    }));
  }

  decrement = () => {
    this.setState(state => ({
      count: state.count - 1
    }));
  }

  render() {
    return h('div', { className: 'counter' }, [
      h('h2', {}, `Count: ${this.state.count}`),
      h('button', { onclick: this.increment }, '+'),
      h('button', { onclick: this.decrement }, '-')
    ]);
  }
}

// Usage
const counter = new Counter({ initialCount: 10 });
counter.mount(document.getElementById('app'));
```

### Form with Lifecycle

```javascript
class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loading: false
    };
  }

  mounted() {
    // Focus on first input
    const input = this._element.querySelector('input');
    if (input) input.focus();
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true });

    try {
      await http.post('/api/login', {
        username: this.state.username,
        password: this.state.password
      });
      emit('notification', { type: 'success', message: 'Logged in!' });
    } catch (error) {
      emit('notification', { type: 'error', message: 'Login failed' });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { username, password, loading } = this.state;

    return h('form', { onsubmit: this.handleSubmit }, [
      h('input', {
        type: 'text',
        value: username,
        oninput: (e) => this.setState({ username: e.target.value }),
        placeholder: 'Username',
        disabled: loading
      }),
      h('input', {
        type: 'password',
        value: password,
        oninput: (e) => this.setState({ password: e.target.value }),
        placeholder: 'Password',
        disabled: loading
      }),
      h('button', { type: 'submit', disabled: loading },
        loading ? 'Logging in...' : 'Login'
      )
    ]);
  }
}
```

### Component with Cleanup

```javascript
class LiveClock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: new Date()
    };
  }

  mounted() {
    // Start timer when mounted
    this.timer = setInterval(() => {
      this.setState({ time: new Date() });
    }, 1000);
  }

  beforeDestroy() {
    // CRITICAL: Clear timer to prevent memory leak
    clearInterval(this.timer);
  }

  render() {
    return h('div', { className: 'clock' },
      h('h1', {}, this.state.time.toLocaleTimeString())
    );
  }
}
```

---

## Best Practices

### 1. Always Cleanup

```javascript
class MyComponent extends Component {
  mounted() {
    this.subscription = store.subscribe(() => {
      this.setState({ data: store.getState() });
    });
  }

  beforeDestroy() {
    // ✅ Always cleanup!
    this.subscription.unsubscribe();
  }
}
```

### 2. Use Function Form for State Updates

```javascript
// ❌ Bad - race condition
this.setState({ count: this.state.count + 1 });
this.setState({ count: this.state.count + 1 }); // May not work!

// ✅ Good - always uses latest state
this.setState(state => ({ count: state.count + 1 }));
this.setState(state => ({ count: state.count + 1 }));
```

### 3. Don't Mutate State Directly

```javascript
// ❌ Bad
this.state.items.push(newItem);
this.forceUpdate();

// ✅ Good
this.setState({
  items: [...this.state.items, newItem]
});
```

### 4. Keep render() Pure

```javascript
// ❌ Bad - side effects in render
render() {
  this.setState({ count: 5 }); // Infinite loop!
  fetch('/api/data'); // Called on every update!
  return h('div', {}, 'Hello');
}

// ✅ Good - pure render
render() {
  return h('div', {}, `Count: ${this.state.count}`);
}

// Side effects go in lifecycle hooks
mounted() {
  fetch('/api/data');
}
```

---

**📚 Navigation:** [← Back to Docs](../README.md)
