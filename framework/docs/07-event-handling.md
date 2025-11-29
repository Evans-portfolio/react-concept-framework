# Event Handling

Learn how to handle user interactions and custom events.

## DOM Events

### Basic Event Handlers

Attach event handlers using `on{event}` props:

```javascript
import { h } from './framework/src/dom/index.js';

// Click event
h('button', {
  onclick: () => console.log('Clicked!')
}, 'Click me');

// Input event
h('input', {
  oninput: (e) => console.log('Value:', e.target.value)
});

// Submit event
h('form', {
  onsubmit: (e) => {
    e.preventDefault();
    console.log('Form submitted');
  }
}, [...]);
```

### Supported Events

#### Mouse Events

```javascript
class MouseDemo extends Component {
  render() {
    return h('div', {}, [
      h('button', { 
        onclick: (e) => console.log('Click', e) 
      }, 'Click'),
      
      h('button', { 
        ondblclick: (e) => console.log('Double click') 
      }, 'Double Click'),
      
      h('div', {
        onmouseenter: () => console.log('Mouse entered'),
        onmouseleave: () => console.log('Mouse left'),
        onmousemove: (e) => console.log('Mouse at', e.clientX, e.clientY)
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
class FormDemo extends Component {
  render() {
    return h('form', {
      onsubmit: (e) => this.handleSubmit(e)
    }, [
      h('input', {
        oninput: (e) => this.handleInput(e),
        onchange: (e) => console.log('Changed:', e.target.value),
        onfocus: () => console.log('Focused'),
        onblur: () => console.log('Blurred')
      }),
      h('button', { type: 'submit' }, 'Submit')
    ]);
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');
  }

  handleInput(e) {
    this.setState({ value: e.target.value });
  }
}
```

## Event Object

### Accessing Event Properties

```javascript
class EventDemo extends Component {
  handleClick(e) {
    console.log('Event type:', e.type);              // 'click'
    console.log('Target element:', e.target);        // <button>
    console.log('Current target:', e.currentTarget); // <button>
    console.log('Mouse X:', e.clientX);              // 150
    console.log('Mouse Y:', e.clientY);              // 200
  }

  render() {
    return h('button', {
      onclick: (e) => this.handleClick(e)
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
import { Component } from './framework/src/core/index.js';

class Button extends Component {
  handleClick() {
    // Emit custom event
    this.emit('custom-click', {
      timestamp: Date.now(),
      message: 'Button was clicked'
    });
  }

  render() {
    return h('button', {
      onclick: () => this.handleClick()
    }, this.props.children);
  }
}
```

### Listening to Custom Events

```javascript
class Parent extends Component {
  mounted() {
    // Listen to custom event
    this.on('custom-click', (data) => {
      console.log('Received:', data);
    });
  }

  render() {
    return h('div', {}, [
      h(Button, {}, 'Click me')
    ]);
  }
}
```

### Global Custom Events

```javascript
// EventBus.js
import { EventEmitter } from './framework/src/events/index.js';
export const eventBus = new EventEmitter();

// Component A - Emit event
import { eventBus } from './EventBus.js';

class ComponentA extends Component {
  notify() {
    eventBus.emit('notification', {
      type: 'success',
      message: 'Operation completed'
    });
  }

  render() {
    return h('button', {
      onclick: () => this.notify()
    }, 'Notify');
  }
}

// Component B - Listen to event
class ComponentB extends Component {
  mounted() {
    this.unsubscribe = eventBus.on('notification', (data) => {
      this.setState({ notification: data });
    });
  }

  beforeUnmount() {
    this.unsubscribe(); // Cleanup
  }

  render() {
    const { notification } = this.state;
    return h('div', {}, notification ? notification.message : 'No notifications');
  }
}
```

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
class Toast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: []
    };
  }

  mounted() {
    // Listen for notification events
    this.on('notification', (event) => {
      this.addNotification(event.detail);
    });
  }

  addNotification(notification) {
    const id = Date.now();
    const item = { id, ...notification };
    
    this.setState({
      notifications: [...this.state.notifications, item]
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.removeNotification(id);
    }, 3000);
  }

  removeNotification(id) {
    this.setState({
      notifications: this.state.notifications.filter(n => n.id !== id)
    });
  }

  render() {
    return h('div', { class: 'toast-container' },
      this.state.notifications.map(notif =>
        h('div', {
          key: notif.id,
          class: `toast toast-${notif.type}`
        }, [
          h('span', {}, notif.message),
          h('button', {
            onclick: () => this.removeNotification(notif.id)
          }, '×')
        ])
      )
    );
  }
}

// Usage in another component
class MyComponent extends Component {
  showNotification() {
    this.emit('notification', {
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
