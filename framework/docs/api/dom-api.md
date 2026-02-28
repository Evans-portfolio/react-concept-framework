# DOM API Reference

Complete reference for Virtual DOM functions and element creation.

---

**📚 Navigation:** [← Back to Docs](../README.md)

---

## Table of Contents

- [h() Function](#h-function)
- [createElement()](#createelement)
- [setProps()](#setprops)
- [patch()](#patch)
- [Virtual Node Structure](#virtual-node-structure)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## `h()` Function

Creates a virtual DOM element (similar to `React.createElement` or JSX's `h`).

**Signature:**
```javascript
h(type, props, ...children)
```

**Parameters:**
- `type` (String) - HTML tag name ('div', 'button', 'input', etc.)
- `props` (Object) - Element properties and attributes
- `children` (VNode | String | Number | Array) - Child elements or text

**Returns:** `VNode` - Virtual DOM node object

**Examples:**

```javascript
import { h } from './framework/src/dom/index.js';

// Simple element with text
h('div', {}, 'Hello World')

// Element with attributes
h('input', {
  type: 'text',
  placeholder: 'Enter name',
  value: 'Alice'
})

// Element with event handler
h('button', {
  onclick: () => console.log('Clicked!')
}, 'Click Me')

// Nested elements
h('div', { className: 'container' }, [
  h('h1', {}, 'Title'),
  h('p', {}, 'Paragraph'),
  h('button', { onclick: handleClick }, 'Submit')
])

// Mixed content
h('div', {}, [
  'Text before ',
  h('strong', {}, 'bold text'),
  ' and text after'
])

// Conditional rendering
h('div', {}, [
  isLoggedIn && h('button', {}, 'Logout'),
  !isLoggedIn && h('button', {}, 'Login')
])

// Lists with keys
h('ul', {},
  items.map(item =>
    h('li', { key: item.id }, item.text)
  )
)
```

**Supported Props:**

```javascript
// HTML attributes
h('input', {
  type: 'text',
  placeholder: 'Name',
  value: 'Alice',
  disabled: false,
  required: true,
  className: 'input-field', // or 'class'
  id: 'username'
})

// Event handlers (lowercase)
h('button', {
  onclick: handleClick,
  onmouseenter: handleHover,
  onsubmit: handleSubmit,
  oninput: handleInput
})

// Styles
h('div', {
  style: {
    color: 'blue',
    fontSize: '16px',
    backgroundColor: '#f0f0f0'
  }
})

// Data attributes
h('div', {
  'data-id': '123',
  'data-name': 'Alice'
})

// Boolean attributes
h('input', {
  checked: true,    // Checkbox/radio
  selected: true,   // Option
  disabled: false
})

// Key for list reconciliation
h('li', { key: item.id }, item.text)
```

---

## `createElement()`

Converts a virtual DOM node into a real DOM element.

**Signature:**
```javascript
createElement(vnode)
```

**Parameters:**
- `vnode` (VNode) - Virtual DOM node

**Returns:** `HTMLElement | Text` - Real DOM element

**Example:**
```javascript
import { h, createElement } from './framework/src/dom/index.js';

// Create virtual node
const vnode = h('div', { className: 'box' }, [
  h('h1', {}, 'Hello'),
  h('p', {}, 'World')
]);

// Convert to real DOM
const element = createElement(vnode);

// Mount to page
document.body.appendChild(element);
```

**What it does:**
1. Creates DOM element with `document.createElement()`
2. Sets all properties and attributes
3. Attaches event listeners
4. Recursively creates child elements
5. Returns the complete DOM tree

**⚠️ Note:** Usually handled automatically by Component class. Rarely called directly.

---

## `setProps()`

Sets properties and attributes on a DOM element.

**Signature:**
```javascript
setProps(element, props)
```

**Parameters:**
- `element` (HTMLElement) - DOM element
- `props` (Object) - Properties to set

**Returns:** `void`

**Example:**
```javascript
import { setProps } from './framework/src/dom/index.js';

const button = document.createElement('button');

setProps(button, {
  className: 'btn btn-primary',
  disabled: false,
  onclick: () => console.log('Clicked!'),
  style: { backgroundColor: 'blue' }
});
```

**Handles:**
- HTML attributes (`id`, `type`, `placeholder`, etc.)
- Class names (`className` or `class`)
- Event listeners (`onclick`, `oninput`, etc.)
- Boolean properties (`checked`, `disabled`, `selected`)
- Style objects
- Data attributes

---

## `patch()`

Updates an existing DOM element by comparing old and new virtual nodes.

**Signature:**
```javascript
patch(oldVNode, newVNode, container)
```

**Parameters:**
- `oldVNode` (VNode) - Previous virtual node
- `newVNode` (VNode) - New virtual node
- `container` (HTMLElement) - Parent container

**Returns:** `void`

**Example:**
```javascript
import { h, patch } from './framework/src/dom/index.js';

const oldVNode = h('div', {}, 'Hello');
const newVNode = h('div', {}, 'Hello World');

patch(oldVNode, newVNode, container);
// Updates DOM efficiently - only changes text content
```

**Algorithm:**
1. **Type changed?** → Replace entire element
2. **Text node?** → Update text content if different
3. **Same type?** →
   - Update attributes
   - Diff children recursively
   - Reuse existing DOM nodes where possible

**⚠️ Note:** Handled automatically by Component class during `setState()`.

---

## Virtual Node Structure

Virtual nodes are plain JavaScript objects describing DOM structure.

**Structure:**
```javascript
{
  type: 'div',              // HTML tag name or 'TEXT_ELEMENT'
  props: {                  // Attributes and event handlers
    className: 'container',
    onclick: Function
  },
  children: [               // Array of child VNodes
    { type: 'h1', ... },
    { type: 'p', ... }
  ],
  text: undefined           // Only for TEXT_ELEMENT nodes
}
```

**Examples:**

```javascript
// Element node
{
  type: 'button',
  props: {
    className: 'btn',
    onclick: handleClick
  },
  children: [
    { type: 'TEXT_ELEMENT', text: 'Click me', props: {}, children: [] }
  ]
}

// Text node
{
  type: 'TEXT_ELEMENT',
  props: {},
  children: [],
  text: 'Hello World'
}

// Element with children
{
  type: 'div',
  props: { className: 'container' },
  children: [
    {
      type: 'h1',
      props: {},
      children: [
        { type: 'TEXT_ELEMENT', text: 'Title', props: {}, children: [] }
      ]
    },
    {
      type: 'p',
      props: {},
      children: [
        { type: 'TEXT_ELEMENT', text: 'Paragraph', props: {}, children: [] }
      ]
    }
  ]
}
```

---

## Examples

### Basic Element Creation

```javascript
import { h } from './framework/src/dom/index.js';

// Simple div
const div = h('div', {}, 'Hello');

// Button with handler
const button = h('button', {
  onclick: () => alert('Clicked!')
}, 'Click Me');

// Form input
const input = h('input', {
  type: 'email',
  placeholder: 'Enter email',
  value: email,
  oninput: (e) => setEmail(e.target.value)
});
```

### Nested Structure

```javascript
const card = h('div', { className: 'card' }, [
  h('div', { className: 'card-header' }, [
    h('h2', {}, 'Card Title')
  ]),
  h('div', { className: 'card-body' }, [
    h('p', {}, 'Card content goes here'),
    h('button', { onclick: handleClick }, 'Action')
  ]),
  h('div', { className: 'card-footer' }, [
    h('small', {}, 'Last updated: today')
  ])
]);
```

### Dynamic Lists

```javascript
const todos = [
  { id: 1, text: 'Learn framework', done: false },
  { id: 2, text: 'Build app', done: false },
  { id: 3, text: 'Deploy', done: true }
];

const todoList = h('ul', { className: 'todos' },
  todos.map(todo =>
    h('li', {
      key: todo.id,
      className: todo.done ? 'done' : ''
    }, [
      h('input', {
        type: 'checkbox',
        checked: todo.done,
        onchange: () => toggleTodo(todo.id)
      }),
      h('span', {}, todo.text),
      h('button', {
        onclick: () => deleteTodo(todo.id)
      }, '×')
    ])
  )
);
```

### Conditional Rendering

```javascript
// Ternary operator
const greeting = h('div', {}, [
  isLoggedIn
    ? h('p', {}, `Welcome, ${user.name}`)
    : h('p', {}, 'Please log in')
]);

// Logical AND
const notification = h('div', {}, [
  hasError && h('div', { className: 'error' }, errorMessage)
]);

// Multiple conditions
const statusMessage = h('div', {}, [
  loading && h('div', {}, 'Loading...'),
  error && h('div', { className: 'error' }, error),
  !loading && !error && h('div', {}, data)
]);
```

### Forms

```javascript
const loginForm = h('form', {
  onsubmit: (e) => {
    e.preventDefault();
    handleLogin();
  }
}, [
  h('div', { className: 'form-group' }, [
    h('label', { for: 'username' }, 'Username'),
    h('input', {
      id: 'username',
      type: 'text',
      value: username,
      oninput: (e) => setUsername(e.target.value),
      required: true
    })
  ]),
  h('div', { className: 'form-group' }, [
    h('label', { for: 'password' }, 'Password'),
    h('input', {
      id: 'password',
      type: 'password',
      value: password,
      oninput: (e) => setPassword(e.target.value),
      required: true
    })
  ]),
  h('button', {
    type: 'submit',
    disabled: loading
  }, loading ? 'Logging in...' : 'Login')
]);
```

### Styled Components

```javascript
const styledButton = h('button', {
  className: 'btn btn-primary',
  style: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  onclick: handleClick
}, 'Styled Button');
```

---

## Best Practices

### 1. Always Use Keys for Lists

```javascript
// ✅ Good - with keys
todos.map(todo =>
  h('li', { key: todo.id }, todo.text)
)

// ❌ Bad - without keys (slow diffing)
todos.map(todo =>
  h('li', {}, todo.text)
)

// ❌ Bad - using index as key (breaks on reorder)
todos.map((todo, index) =>
  h('li', { key: index }, todo.text)
)
```

### 2. Use className, Not class

```javascript
// ✅ Good
h('div', { className: 'container' })

// ⚠️ Works but prefer className
h('div', { class: 'container' })
```

### 3. Event Handlers in Lowercase

```javascript
// ✅ Good - lowercase
h('button', { onclick: handler })

// ❌ Bad - camelCase (won't work)
h('button', { onClick: handler })
```

### 4. Filter Falsy Children

```javascript
// ✅ Good - conditions return false, filtered automatically
h('div', {}, [
  condition && h('p', {}, 'Conditional'),
  items.map(item => h('li', { key: item.id }, item.text))
])

// ❌ Bad - including null/undefined
h('div', {}, [
  condition ? h('p', {}, 'Yes') : null  // Works but unnecessary
])
```

### 5. Flatten Arrays

```javascript
// ✅ Good - h() flattens automatically
h('ul', {},
  todos.map(todo =>
    h('li', { key: todo.id }, todo.text)
  )
)

// Also works - explicit array
h('ul', {}, [
  h('li', {}, 'Item 1'),
  h('li', {}, 'Item 2')
])
```

### 6. Use Spread for Dynamic Props

```javascript
const commonProps = {
  className: 'input',
  required: true
};

h('input', {
  ...commonProps,
  type: 'text',
  placeholder: 'Name'
})

h('input', {
  ...commonProps,
  type: 'email',
  placeholder: 'Email'
})
```

### 7. Extract Complex Elements

```javascript
// ✅ Good - readable
function renderTodoItem(todo) {
  return h('li', { key: todo.id, className: todo.done ? 'done' : '' }, [
    h('input', {
      type: 'checkbox',
      checked: todo.done,
      onchange: () => toggleTodo(todo.id)
    }),
    h('span', {}, todo.text),
    h('button', { onclick: () => deleteTodo(todo.id) }, '×')
  ]);
}

render() {
  return h('ul', {}, this.state.todos.map(renderTodoItem));
}

// ❌ Bad - nested and hard to read
render() {
  return h('ul', {}, this.state.todos.map(todo =>
    h('li', { key: todo.id }, [
      h('input', { type: 'checkbox', checked: todo.done, onchange: () => this.toggleTodo(todo.id) }),
      h('span', {}, todo.text),
      h('button', { onclick: () => this.deleteTodo(todo.id) }, '×')
    ])
  ));
}
```

---

**📚 Navigation:** [← Back to Docs](../README.md)
