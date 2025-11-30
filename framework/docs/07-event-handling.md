# Event Handling

Learn how to handle user interactions and custom events.

---

**📚 Navigation:** [← Prev: Routing](./06-routing.md) | [Next: DOM Manipulation →](./08-dom-manipulation.md)

---

## 📖 Table of Contents

- [DOM Events](#dom-events)
- [Supported Events](#supported-events)
- [Custom Events](#custom-events)
- [Event Patterns](#event-patterns)
- [Best Practices](#best-practices)

---

## DOM Events

### Basic Event Handlers

Attach event handlers using `on{event}` props:

```javascript
// Example: Basic DOM events - demonstrates common event handling patterns
import { h } from './framework/src/dom/index.js';

// Click event
h('button', {
  onclick: () => console.log('Clicked!') // Handler runs when button is clicked
}, 'Click me');

// Input event
h('input', {
  oninput: (e) => console.log('Value:', e.target.value) // Fires on every keystroke
});

// Submit event
h('form', {
  onsubmit: (e) => {
    e.preventDefault(); // Prevent page reload
    console.log('Form submitted');
  }
}, [...]);
```

### Supported Events

#### Mouse Events

```javascript
// Example: Mouse event handlers - demonstrates various mouse interactions
class MouseDemo extends Component {
  render() {
    return h('div', {}, [
      h('button', { 
        onclick: (e) => console.log('Click', e) // Single click
      }, 'Click'),
      
      h('button', { 
        ondblclick: (e) => console.log('Double click') // Double click
      }, 'Double Click'),
      
      h('div', {
        onmouseenter: () => console.log('Mouse entered'), // When mouse enters element
        onmouseleave: () => console.log('Mouse left'),    // When mouse leaves element
        onmousemove: (e) => console.log('Mouse at', e.clientX, e.clientY) // Track mouse position
      }, 'Hover me')
    ]);
  }
}
```

#### Keyboard Events

```javascript
class KeyboardDemo extends Component {
  render() {
    return h('input', {
      onkeydown: (e) => console.log('Key down:', e.key),
      onkeyup: (e) => console.log('Key up:', e.key),
      onkeypress: (e) => {
        if (e.key === 'Enter') {
          console.log('Enter pressed');
        }
      }
    });
  }
}
```

#### Form Events

```javascript
// Example: Form event handlers - demonstrates form interaction events
class FormDemo extends Component {
  render() {
    return h('form', {
      onsubmit: (e) => this.handleSubmit(e) // Form submission
    }, [
      h('input', {
        oninput: (e) => this.handleInput(e),  // Every keystroke
        onchange: (e) => console.log('Changed:', e.target.value), // When input loses focus
        onfocus: () => console.log('Focused'), // When input gets focus
        onblur: () => console.log('Blurred')   // When input loses focus
      }),
      h('button', { type: 'submit' }, 'Submit')
    ]);
  }

  handleSubmit(e) {
    e.preventDefault(); // Prevent page reload
    console.log('Form submitted');
  }

  handleInput(e) {
    this.setState({ value: e.target.value }); // Update state on input
  }
}
```

## Event Object

### Accessing Event Properties

```javascript
// Example: Event object properties - demonstrates accessing event data
class EventDemo extends Component {
  handleClick(e) {
    console.log('Event type:', e.type);              // 'click' - event name
    console.log('Target element:', e.target);        // <button> - element that triggered event
    console.log('Current target:', e.currentTarget); // <button> - element with event listener
    console.log('Mouse X:', e.clientX);              // 150 - mouse position X
    console.log('Mouse Y:', e.clientY);              // 200 - mouse position Y
  }

  render() {
    return h('button', {
      onclick: (e) => this.handleClick(e) // Pass event object to handler
    }, 'Click me');
  }
}
```

### Preventing Default Behavior

```javascript
// Prevent form submission
h('form', {
  onsubmit: (e) => {
    e.preventDefault();
    // Handle form data
  }
}, [...]);

// Prevent link navigation
h('a', {
  href: '#',
  onclick: (e) => {
    e.preventDefault();
    // Custom navigation logic
  }
}, 'Click me');
```

### Stopping Event Propagation

```javascript
class PropagationDemo extends Component {
  render() {
    return h('div', {
      onclick: () => console.log('Div clicked')
    }, [
      h('button', {
        onclick: (e) => {
          e.stopPropagation(); // Won't trigger div click
          console.log('Button clicked');
        }
      }, 'Click me')
    ]);
  }
}
```

## Component Event Handlers

### Binding Context

```javascript
class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    
    // Method 1: Bind in constructor
    this.increment = this.increment.bind(this);
  }

  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  decrement() {
    this.setState({ count: this.state.count - 1 });
  }

  render() {
    return h('div', {}, [
      h('p', {}, `Count: ${this.state.count}`),
      
      // Method 1: Pre-bound
      h('button', { onclick: this.increment }, '+'),
      
      // Method 2: Arrow function
      h('button', { onclick: () => this.decrement() }, '-')
    ]);
  }
}
```

### Passing Arguments

```javascript
class TodoList extends Component {
  deleteTodo(id) {
    console.log('Delete todo:', id);
  }

  render() {
    const todos = this.state.todos;
    
    return h('ul', {},
      todos.map(todo =>
        h('li', { key: todo.id }, [
          h('span', {}, todo.text),
          h('button', {
            onclick: () => this.deleteTodo(todo.id) // Pass id
          }, 'Delete')
        ])
      )
    );
  }
}
```

## Custom Events

### Creating Custom Events

```javascript
// Example: Emit custom event - demonstrates child-to-parent communication
import { Component } from './framework/src/core/index.js';

class Button extends Component {
  handleClick() {
    // Emit custom event with data - parent can listen to this
    this.emit('custom-click', {
      timestamp: Date.now(),
      message: 'Button was clicked'
    });
  }

  render() {
    return h('button', {
      onclick: () => this.handleClick() // Trigger custom event on DOM click
    }, this.props.children);
  }
}
```

### Listening to Custom Events

```javascript
// Example: Listen to custom event - demonstrates parent receiving child events
class Parent extends Component {
  mounted() {
    // Listen to custom event from child component
    this.on('custom-click', (data) => {
      console.log('Received:', data); // Receives { timestamp, message }
    });
  }

  render() {
    return h('div', {}, [
      h(Button, {}, 'Click me') // Button will emit custom-click event
    ]);
  }
}
```

### Global Custom Events

```javascript
// Example: Global event bus - demonstrates cross-component communication
// EventBus.js
import { EventEmitter } from './framework/src/events/index.js';
export const eventBus = new EventEmitter(); // Shared event bus

// Component A - Emit event
import { eventBus } from './EventBus.js';

class ComponentA extends Component {
  notify() {
    eventBus.emit('notification', { // Broadcast to all listeners
      type: 'success',
      message: 'Operation completed'
    });
  }

  render() {
    return h('button', {
      onclick: () => this.notify() // Trigger global event
    }, 'Notify');
  }
}

// Component B - Listen to event
class ComponentB extends Component {
  mounted() {
    this.unsubscribe = eventBus.on('notification', (data) => {
      this.setState({ notification: data }); // Update state when event received
    });
  }

  beforeUnmount() {
    this.unsubscribe(); // Cleanup - prevent memory leaks!
  }

  render() {
    const { notification } = this.state;
    return h('div', {}, notification ? notification.message : 'No notifications');
  }
}
```

**💡 Understanding Custom Events (Pub/Sub pattern):**

**How it works:**
```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Component A    │         │  EventBus    │         │  Component B    │
│  (Publisher)    │────────▶│  (Mediator)  │────────▶│  (Subscriber)   │
└─────────────────┘         └──────────────┘         └─────────────────┘
     emit()                                                on()
```

**Step-by-step:**
```javascript
// Step 1: Component B subscribes ("I want to listen")
eventBus.on('user-login', (userData) => {
  console.log('User logged in:', userData);
});

// Step 2: Component A emits ("Something happened!")
eventBus.emit('user-login', { name: 'Alice', id: 123 });

// Step 3: Component B's callback fires automatically
// Output: "User logged in: { name: 'Alice', id: 123 }"
```

**When to use custom events:**
- ✅ Components that don't have parent-child relationship
- ✅ Global notifications (toasts, alerts)
- ✅ Multiple components need to react to same action
- ✅ Decoupling components (loose coupling)

**When NOT to use:**
- ❌ Parent → Child communication (use props instead)
- ❌ Sharing state (use global store instead)
- ❌ Simple callbacks (use props with functions)

**Real-world example - Shopping Cart:**
```javascript
// ProductCard.js - Adds item to cart
class ProductCard extends Component {
  addToCart() {
    eventBus.emit('cart:add', {
      id: this.props.product.id,
      name: this.props.product.name,
      price: this.props.product.price
    });
  }
  
  render() {
    return h('div', {}, [
      h('h3', {}, this.props.product.name),
      h('button', { onclick: () => this.addToCart() }, 'Add to Cart')
    ]);
  }
}

// CartBadge.js - Shows cart count
class CartBadge extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  mounted() {
    this.unsubscribe = eventBus.on('cart:add', () => {
      this.setState({ count: this.state.count + 1 });
    });
  }
  
  beforeUnmount() {
    this.unsubscribe(); // Always cleanup!
  }
  
  render() {
    return h('span', { class: 'badge' }, this.state.count);
  }
}

// CartSidebar.js - Shows cart items
class CartSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = { items: [] };
  }
  
  mounted() {
    this.unsubscribe = eventBus.on('cart:add', (item) => {
      this.setState({ items: [...this.state.items, item] });
    });
  }
  
  beforeUnmount() {
    this.unsubscribe();
  }
  
  render() {
    return h('div', {}, [
      h('h3', {}, 'Cart'),
      h('ul', {}, this.state.items.map(item =>
        h('li', { key: item.id }, `${item.name} - $${item.price}`)
      ))
    ]);
  }
}
```

> ⚠️ **Critical:** Always unsubscribe in `beforeUnmount()` to prevent memory leaks!

## Real-World Examples

### Form Validation

```javascript
import { isEmail, required } from './framework/src/validation/index.js';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errors: {}
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const errors = {};
    
    if (!required(this.state.email)) {
      errors.email = 'Email is required';
    } else if (!isEmail(this.state.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!required(this.state.password)) {
      errors.password = 'Password is required';
    }
    
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }
    
    // Submit form
    this.login();
  }

  handleChange(field, value) {
    this.setState({
      [field]: value,
      errors: { ...this.state.errors, [field]: null }
    });
  }

  render() {
    const { email, password, errors } = this.state;

    return h('form', {
      onsubmit: (e) => this.handleSubmit(e)
    }, [
      h('input', {
        type: 'email',
        value: email,
        oninput: (e) => this.handleChange('email', e.target.value),
        placeholder: 'Email'
      }),
      errors.email && h('span', { class: 'error' }, errors.email),
      
      h('input', {
        type: 'password',
        value: password,
        oninput: (e) => this.handleChange('password', e.target.value),
        placeholder: 'Password'
      }),
      errors.password && h('span', { class: 'error' }, errors.password),
      
      h('button', { type: 'submit' }, 'Login')
    ]);
  }
}
```

### Debounced Search

```javascript
class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      results: []
    };
    this.searchTimeout = null;
  }

  handleInput(e) {
    const query = e.target.value;
    this.setState({ query });

    // Clear previous timeout
    clearTimeout(this.searchTimeout);

    // Debounce search by 300ms
    this.searchTimeout = setTimeout(() => {
      this.search(query);
    }, 300);
  }

  async search(query) {
    if (!query) {
      this.setState({ results: [] });
      return;
    }

    const results = await fetch(`/api/search?q=${query}`)
      .then(r => r.json());
    
    this.setState({ results });
  }

  beforeUnmount() {
    clearTimeout(this.searchTimeout);
  }

  render() {
    const { query, results } = this.state;

    return h('div', {}, [
      h('input', {
        type: 'text',
        value: query,
        oninput: (e) => this.handleInput(e),
        placeholder: 'Search...'
      }),
      h('ul', {},
        results.map(result =>
          h('li', { key: result.id }, result.title)
        )
      )
    ]);
  }
}
```

### Toast Notifications

```javascript
import { Component, h } from './framework/src/core/index.js';
import { on, off, emit } from './framework/src/events/index.js';

class Toast extends Component {
  constructor() {
    super();
    this.state = {
      notifications: [] // Array of {id, type, message}
    };
    this._notificationHandler = null;
  }

  mounted() {
    // Listen for custom 'notification' events
    this._notificationHandler = (event) => {
      this.addNotification(event.detail);
    };
    on('notification', this._notificationHandler);
  }

  beforeDestroy() {
    // Clean up event listener
    if (this._notificationHandler) {
      off('notification', this._notificationHandler);
    }
  }

  addNotification({ type = 'info', message, duration = 3000 }) {
    const id = Date.now();
    const notification = { id, type, message };
    
    this.setState({
      notifications: [...this.state.notifications, notification]
    });

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(id);
    }, duration);
  }

  removeNotification(id) {
    this.setState({
      notifications: this.state.notifications.filter(n => n.id !== id)
    });
  }

  render() {
    const { notifications } = this.state;

    return h('div', { class: 'toast-container' },
      notifications.map(notif =>
        h('div', {
          key: notif.id,
          class: `toast toast-${notif.type}`,
          onclick: () => this.removeNotification(notif.id)
        }, [
          h('span', { class: 'toast-icon' }, this.getIcon(notif.type)),
          h('span', { class: 'toast-message' }, notif.message),
          h('button', {
            class: 'toast-close',
            onclick: (e) => {
              e.stopPropagation();
              this.removeNotification(notif.id);
            }
          }, '×')
        ])
      )
    );
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }
}

// Usage in another component
class MyComponent extends Component {
  showNotification() {
    // Emit global event
    emit('notification', {
      type: 'success',
      message: 'Operation successful!'
    });
  }
}
```

## Best Practices

### 1. Use Arrow Functions for Component Methods

```javascript
// ✅ Good
h('button', { onclick: () => this.handleClick() }, 'Click')

// ❌ Avoid (loses context)
h('button', { onclick: this.handleClick }, 'Click')
```

### 2. Clean Up Event Listeners

```javascript
class MyComponent extends Component {
  mounted() {
    this.unsubscribe = eventBus.on('event', this.handler);
  }

  beforeUnmount() {
    this.unsubscribe(); // Always cleanup!
  }
}
```

### 3. Debounce Expensive Operations

```javascript
// Debounce search, resize, scroll handlers
handleInput(e) {
  clearTimeout(this.timeout);
  this.timeout = setTimeout(() => {
    this.expensiveOperation(e.target.value);
  }, 300);
}
```

### 4. Prevent Memory Leaks

```javascript
beforeUnmount() {
  // Clear timers
  clearTimeout(this.timeout);
  clearInterval(this.interval);
  
  // Remove event listeners
  window.removeEventListener('resize', this.handleResize);
  
  // Unsubscribe from stores
  this.unsubscribe();
}
```

## Next Steps

- [Components](./04-components.md) - Component lifecycle
- [State Management](./05-state-management.md) - Managing state
- [Best Practices](./10-best-practices.md) - Code quality

---

**📚 Navigation:** [← Prev: Routing](./06-routing.md) | [Next: DOM Manipulation →](./08-dom-manipulation.md)

---
