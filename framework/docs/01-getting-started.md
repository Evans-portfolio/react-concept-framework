# Getting Started

Welcome to our lightweight JavaScript framework! This guide will help you build your first application in just a few minutes.

## Quick Start

### 1. Your First App

Create a simple "Hello World" application:

```javascript
import { h } from './framework/src/dom/index.js';
import { Component } from './framework/src/core/index.js';

class App extends Component {
  render() {
    return h('div', { class: 'app' }, [
      h('h1', {}, 'Hello World!'),
      h('p', {}, 'Welcome to our framework')
    ]);
  }
}

// Mount the app
const app = new App();
document.body.appendChild(app.mount());
```

### 2. Understanding h() Function

The `h()` function creates virtual DOM elements:

```javascript
h(tag, props, children)
```

**Parameters:**
- `tag` (string): HTML tag name ('div', 'button', 'input', etc.)
- `props` (object): Attributes and event handlers
- `children` (array|string): Child elements or text content

**Examples:**

```javascript
// Simple element
h('div', {}, 'Hello')

// With attributes
h('input', { type: 'text', placeholder: 'Enter name' })

// With event handlers
h('button', { 
  onclick: () => console.log('Clicked!') 
}, 'Click me')

// Nested elements
h('div', { class: 'container' }, [
  h('h1', {}, 'Title'),
  h('p', {}, 'Paragraph')
])
```

### 3. Adding Interactivity

Create a counter component with state:

```javascript
import { h } from './framework/src/dom/index.js';
import { Component } from './framework/src/core/index.js';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  decrement() {
    this.setState({ count: this.state.count - 1 });
  }

  render() {
    return h('div', { class: 'counter' }, [
      h('h2', {}, `Count: ${this.state.count}`),
      h('button', { 
        onclick: () => this.increment() 
      }, '+'),
      h('button', { 
        onclick: () => this.decrement() 
      }, '-')
    ]);
  }
}

const counter = new Counter();
document.getElementById('app').appendChild(counter.mount());
```

### 4. Working with Forms

Handle user input:

```javascript
class NameForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      submitted: false
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ submitted: true });
  }

  render() {
    const { name, submitted } = this.state;

    if (submitted) {
      return h('div', {}, `Hello, ${name}!`);
    }

    return h('form', { onsubmit: (e) => this.handleSubmit(e) }, [
      h('input', {
        type: 'text',
        value: name,
        oninput: (e) => this.setState({ name: e.target.value }),
        placeholder: 'Enter your name'
      }),
      h('button', { type: 'submit' }, 'Submit')
    ]);
  }
}
```

### 5. Conditional Rendering

Show different UI based on state:

```javascript
class LoginStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false
    };
  }

  render() {
    const { isLoggedIn } = this.state;

    return h('div', {}, [
      isLoggedIn 
        ? h('p', {}, 'Welcome back!')
        : h('p', {}, 'Please log in'),
      h('button', { 
        onclick: () => this.setState({ isLoggedIn: !isLoggedIn }) 
      }, isLoggedIn ? 'Logout' : 'Login')
    ]);
  }
}
```

### 6. Lists and Keys

Render lists efficiently with keys:

```javascript
class TodoList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [
        { id: 1, text: 'Learn framework' },
        { id: 2, text: 'Build app' },
        { id: 3, text: 'Deploy' }
      ]
    };
  }

  render() {
    return h('ul', {}, 
      this.state.todos.map(todo =>
        h('li', { key: todo.id }, todo.text)
      )
    );
  }
}
```

## Next Steps

- [Components](./04-components.md) - Deep dive into component lifecycle
- [State Management](./05-state-management.md) - Global state with stores
- [Routing](./06-routing.md) - Building single-page applications
- [HTTP Client](./09-http-client.md) - Making API requests

## Live Example

Check out the complete Todo app in `/example` directory to see all features in action!
