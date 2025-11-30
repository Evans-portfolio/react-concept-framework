# Getting Started

Welcome to our lightweight JavaScript framework! This guide will help you build your first application in just a few minutes.

---

**📚 Navigation:** [Next: Architecture →](./02-architecture.md)

---

## 📖 Table of Contents

- [Quick Start](#quick-start)
  - [Your First App](#1-your-first-app)
  - [Understanding h() Function](#2-understanding-h-function)
  - [Adding Interactivity](#3-adding-interactivity)
  - [Working with Forms](#4-working-with-forms)
  - [Conditional Rendering](#5-conditional-rendering)
  - [Lists and Keys](#6-lists-and-keys)
- [Next Steps](#next-steps)
- [Live Example](#live-example)

---

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

**💡 What's happening here:**

1. **Import modules** - We import two main functions:
   - `h()` - creates virtual DOM elements (like `React.createElement`)
   - `Component` - base class for all components

2. **Component class** - `App` extends `Component` and must have a `render()` method:
   - `render()` returns a virtual DOM tree
   - Each time state changes, `render()` is called again

3. **h() function** - creates elements in format `h(tag, props, children)`:
   - First parameter: `'div'` - HTML tag name
   - Second parameter: `{ class: 'app' }` - element attributes
   - Third parameter: array of child elements or a string

4. **Mounting** - `mount()` converts virtual DOM to real DOM:
   - `new App()` creates component instance
   - `.mount()` creates real DOM element
   - `appendChild()` adds it to the page

> ⚠️ **Important:** The `render()` method is required! Without it, the component won't work.

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
// Example 1: Simple element with text - just text inside
h('div', {}, 'Hello')
// Creates: <div>Hello</div>

// Example 2: Element with HTML attributes - add type, placeholder
h('input', { type: 'text', placeholder: 'Enter name' })
// Creates: <input type="text" placeholder="Enter name" />

// Example 3: Element with click handler - responds to user clicks
h('button', { 
  onclick: () => console.log('Clicked!') 
}, 'Click me')
// Creates: <button>Click me</button> that logs when clicked

// Example 4: Nested elements - children passed as array
h('div', { class: 'container' }, [
  h('h1', {}, 'Title'),
  h('p', {}, 'Paragraph')
])
// Creates:
// <div class="container">
//   <h1>Title</h1>
//   <p>Paragraph</p>
// </div>
```

**💡 Tip:** The `h()` function doesn't create real DOM! It creates a JavaScript object that describes the DOM. Real DOM is created only when calling `.mount()`.

> 📝 **Learn more:** See [DOM Manipulation](./08-dom-manipulation.md) for detailed Virtual DOM explanation.

### 3. Adding Interactivity

Create a counter component with state:

```javascript
// Example: Interactive counter - demonstrates state management
import { h } from './framework/src/dom/index.js';
import { Component } from './framework/src/core/index.js';

class Counter extends Component {
  constructor(props) {
    super(props);
    // Initial component state - starting count is 0
    this.state = {
      count: 0
    };
  }

  increment() {
    // Update state - setState() automatically calls render() after update
    this.setState({ count: this.state.count + 1 });
  }

  decrement() {
    // Decrease count - same automatic re-render
    this.setState({ count: this.state.count - 1 });
  }

  render() {
    return h('div', { class: 'counter' }, [
      h('h2', {}, `Count: ${this.state.count}`), // Display current count
      h('button', { 
        onclick: () => this.increment() // Arrow function keeps 'this' context
      }, '+'),
      h('button', { 
        onclick: () => this.decrement() 
      }, '-')
    ]);
  }
}

// Create and mount the counter
const counter = new Counter();
document.getElementById('app').appendChild(counter.mount());
```

**💡 How reactivity works:**

1. **Initial state** - set in `constructor()`:
   ```javascript
   this.state = { count: 0 }
   ```

2. **Update state** - use ONLY `setState()`:
   ```javascript
   // ✅ Correct - triggers re-render
   this.setState({ count: this.state.count + 1 })
   
   // ❌ Wrong - won't trigger re-render!
   this.state.count = this.state.count + 1
   ```

3. **Automatic re-render** - after `setState()` the framework:
   - Updates `this.state` with new data
   - Calls `render()` to create new Virtual DOM
   - Compares with old Virtual DOM (diffing)
   - Updates only changed parts of real DOM

> ⚠️ **Common mistake:** Never mutate `this.state` directly! Always use `this.setState()`.

### 4. Working with Forms

Handle user input:

```javascript
// Example: Form with controlled input - demonstrates form handling
class NameForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',          // Input value stored in state
      submitted: false   // Track if form was submitted
    };
  }

  handleSubmit(e) {
    e.preventDefault(); // Prevent page reload on form submit
    this.setState({ submitted: true });
  }

  render() {
    const { name, submitted } = this.state;

    // Conditional rendering - show different UI based on state
    if (submitted) {
      return h('div', {}, `Hello, ${name}!`);
    }

    return h('form', { onsubmit: (e) => this.handleSubmit(e) }, [
      h('input', {
        type: 'text',
        value: name, // Controlled input - value from state
        oninput: (e) => this.setState({ name: e.target.value }), // Update state on every keystroke
        placeholder: 'Enter your name'
      }),
      h('button', { type: 'submit' }, 'Submit')
    ]);
  }
}
```

**💡 Working with forms:**

1. **Controlled Input** - input value is controlled by state:
   ```javascript
   value: name  // Taken from this.state.name
   ```

2. **Handle input** - update state on every change:
   ```javascript
   oninput: (e) => this.setState({ name: e.target.value })
   ```
   - `e.target` - is the DOM element (input)
   - `e.target.value` - current value in the input field

3. **Handle submit** - don't forget `preventDefault()`:
   ```javascript
   handleSubmit(e) {
     e.preventDefault(); // Without this, page will reload!
     // your logic...
   }
   ```

> 📝 **Form validation:** See [Components](./04-components.md#form-validation) for validation examples.

### 5. Conditional Rendering

Show different UI based on state:

```javascript
// Example: Toggle with conditional rendering - shows/hides content
class LoginStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false  // Track login status
    };
  }

  render() {
    const { isLoggedIn } = this.state;

    return h('div', {}, [
      // Ternary operator - show different message based on state
      isLoggedIn 
        ? h('p', {}, 'Welcome back!')
        : h('p', {}, 'Please log in'),
      h('button', { 
        onclick: () => this.setState({ isLoggedIn: !isLoggedIn }) // Toggle state
      }, isLoggedIn ? 'Logout' : 'Login')
    ]);
  }
}
```

**💡 Ways to do conditional rendering:**

1. **Ternary operator** (shown above):
   ```javascript
   condition ? h('div', {}, 'Yes') : h('div', {}, 'No')
   ```

2. **Logical AND operator** - for single condition:
   ```javascript
   isLoggedIn && h('button', {}, 'Logout')
   // If isLoggedIn = false, nothing renders
   ```

3. **Early return** - for different UI variants:
   ```javascript
   render() {
     if (this.state.loading) {
       return h('div', {}, 'Loading...');
     }
     return h('div', {}, 'Content');
   }
   ```

4. **Variables** - for complex logic:
   ```javascript
   render() {
     let content;
     if (this.state.error) {
       content = h('p', {}, this.state.error);
     } else if (this.state.loading) {
       content = h('p', {}, 'Loading...');
     } else {
       content = h('p', {}, this.state.data);
     }
     return h('div', {}, content);
   }
   ```

> ⚠️ **Note:** You can't use `if/else` directly inside children array! Use ternary operator or create a variable.

### 6. Lists and Keys

Render lists efficiently with keys:

```javascript
// Example: Todo list with keys - demonstrates efficient list rendering
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
      // map() creates list item for each todo
      this.state.todos.map(todo =>
        h('li', { key: todo.id }, todo.text) // key helps framework track items
      )
    );
  }
}
```

**💡 Why keys are important:**

1. **Performance** - keys help framework identify which items changed:
   ```javascript
   // ✅ With key - framework knows item identity
   h('li', { key: todo.id }, todo.text)
   
   // ❌ Without key - slower, may cause bugs
   h('li', {}, todo.text)
   ```

2. **When to use keys:**
   - Always when rendering lists with `.map()`
   - Use stable, unique IDs (not array index!)
   - Database IDs are perfect

3. **Performance comparison:**
   - With keys: ~5ms for 100 items (10x faster!)
   - Without keys: ~50ms for 100 items

**Example with array index (avoid if possible):**
```javascript
// ⚠️ Only use index if items never reorder
this.state.items.map((item, index) =>
  h('li', { key: index }, item)
)
```

> 📝 **Learn more:** See [Architecture](./02-architecture.md#reconciliation) for how key-based diffing works.

## Next Steps

Now that you know the basics, dive deeper into specific topics:

- **[Architecture](./02-architecture.md)** - Understand how Virtual DOM and reconciliation work
- **[Components](./04-components.md)** - Learn about lifecycle hooks, props, and composition
- **[State Management](./05-state-management.md)** - Use global stores for app-wide state
- **[Routing](./06-routing.md)** - Build single-page applications with client-side routing
- **[HTTP Client](./09-http-client.md)** - Make API requests and handle responses

## Live Example

Check out the complete Todo app in `/example` directory to see all features in action!

**What you'll find:**
- ✅ Todo app with localStorage persistence
- 🔐 Login page with API integration
- 📝 Posts CRUD operations
- 🔔 Toast notifications
- 🎨 Modern UI with gradients

Run the demo:
```bash
cd Gitea/frontend-framework
./run-demo.sh
```

Then open: http://localhost:8000/example/public/

---

**📚 Navigation:** [Next: Architecture →](./02-architecture.md)

---
