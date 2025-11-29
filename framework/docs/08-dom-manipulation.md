# DOM Manipulation

Learn how to create and manipulate DOM elements with the h() function.

## h() Function

The `h()` function creates virtual DOM nodes:

```javascript
import { h } from './framework/src/dom/index.js';

const vnode = h(type, props, children);
```

**Parameters:**
- `type` (string): HTML tag name
- `props` (object): Attributes and event handlers
- `children` (array|string): Child elements or text

## Basic Elements

### Simple Elements

```javascript
// Text only
h('p', {}, 'Hello World')
// <p>Hello World</p>

// With attributes
h('div', { class: 'container', id: 'main' }, 'Content')
// <div class="container" id="main">Content</div>

// Self-closing
h('img', { src: 'image.jpg', alt: 'Description' })
// <img src="image.jpg" alt="Description" />

// Input
h('input', { type: 'text', placeholder: 'Enter text' })
// <input type="text" placeholder="Enter text" />
```

### Nested Elements

```javascript
h('div', { class: 'card' }, [
  h('h2', {}, 'Title'),
  h('p', {}, 'Description'),
  h('button', {}, 'Click')
])

// Renders:
// <div class="card">
//   <h2>Title</h2>
//   <p>Description</p>
//   <button>Click</button>
// </div>
```

## Attributes

### Common Attributes

```javascript
// Class
h('div', { class: 'container' })

// ID
h('div', { id: 'main' })

// Data attributes
h('div', { 'data-id': '123', 'data-name': 'test' })

// Style (string)
h('div', { style: 'color: red; font-size: 16px;' })

// ARIA attributes
h('button', { 'aria-label': 'Close', 'aria-hidden': 'false' })

// Boolean attributes
h('input', { disabled: true, checked: true, readonly: true })
```

### Dynamic Attributes

```javascript
class MyComponent extends Component {
  render() {
    const isActive = this.state.active;
    const userId = this.props.userId;

    return h('div', {
      class: isActive ? 'box active' : 'box',
      'data-user-id': userId,
      style: `background: ${this.state.color};`
    }, 'Content');
  }
}
```

### Conditional Classes

```javascript
function getClasses(isActive, isDisabled) {
  const classes = ['btn'];
  
  if (isActive) classes.push('active');
  if (isDisabled) classes.push('disabled');
  
  return classes.join(' ');
}

h('button', { 
  class: getClasses(true, false) 
}, 'Button');
// <button class="btn active">Button</button>
```

## Inline Styles

### String Styles

```javascript
h('div', {
  style: 'color: blue; background: #f0f0f0; padding: 10px;'
}, 'Styled div')
```

### Dynamic Styles

```javascript
class ColorBox extends Component {
  render() {
    const { color, width, height } = this.state;
    
    return h('div', {
      style: `
        background-color: ${color};
        width: ${width}px;
        height: ${height}px;
        border-radius: 8px;
      `
    });
  }
}
```

## Lists

### Mapping Arrays

```javascript
class UserList extends Component {
  render() {
    const users = ['Alice', 'Bob', 'Charlie'];

    return h('ul', {},
      users.map((user, index) =>
        h('li', { key: index }, user)
      )
    );
  }
}
```

### Using Keys

Always use `key` prop for list items:

```javascript
class TodoList extends Component {
  render() {
    const todos = this.state.todos;

    return h('ul', {},
      todos.map(todo =>
        h('li', { 
          key: todo.id // ✅ Use unique ID
        }, [
          h('span', {}, todo.text),
          h('button', {
            onclick: () => this.deleteTodo(todo.id)
          }, 'Delete')
        ])
      )
    );
  }
}

// ❌ Bad: using index as key
todos.map((todo, index) =>
  h('li', { key: index }, todo.text)
);
```

## Conditional Rendering

### If-Else

```javascript
render() {
  const isLoggedIn = this.state.isLoggedIn;

  return h('div', {}, [
    isLoggedIn
      ? h('p', {}, 'Welcome back!')
      : h('p', {}, 'Please log in')
  ]);
}
```

### Showing/Hiding Elements

```javascript
render() {
  const showDetails = this.state.showDetails;

  return h('div', {}, [
    h('button', {
      onclick: () => this.toggleDetails()
    }, 'Toggle Details'),
    
    // Only render if true
    showDetails && h('div', { class: 'details' }, [
      h('p', {}, 'Detail 1'),
      h('p', {}, 'Detail 2')
    ])
  ]);
}
```

### Switch Cases

```javascript
function renderByStatus(status) {
  switch (status) {
    case 'loading':
      return h('div', {}, 'Loading...');
    case 'success':
      return h('div', {}, 'Success!');
    case 'error':
      return h('div', {}, 'Error occurred');
    default:
      return h('div', {}, 'Unknown status');
  }
}

render() {
  return renderByStatus(this.state.status);
}
```

## Fragments

Return multiple elements without wrapper:

```javascript
// Using array
render() {
  return [
    h('h1', { key: 'title' }, 'Title'),
    h('p', { key: 'desc' }, 'Description')
  ];
}

// Or wrap in div
render() {
  return h('div', {}, [
    h('h1', {}, 'Title'),
    h('p', {}, 'Description')
  ]);
}
```

## Special Attributes

### innerHTML

```javascript
// Render HTML string (use carefully!)
h('div', {
  innerHTML: '<strong>Bold</strong> text'
})

// Sanitize user content first
import { sanitize } from './utils.js';

h('div', {
  innerHTML: sanitize(userContent)
})
```

### value (for inputs)

```javascript
class Input extends Component {
  render() {
    return h('input', {
      type: 'text',
      value: this.state.text,
      oninput: (e) => this.setState({ text: e.target.value })
    });
  }
}
```

### checked (for checkboxes)

```javascript
class Checkbox extends Component {
  render() {
    return h('input', {
      type: 'checkbox',
      checked: this.state.isChecked,
      onchange: (e) => this.setState({ isChecked: e.target.checked })
    });
  }
}
```

## Component Composition

### Reusable Components

```javascript
// Button component
function Button({ variant = 'primary', onClick, children }) {
  return h('button', {
    class: `btn btn-${variant}`,
    onclick: onClick
  }, children);
}

// Usage
class App extends Component {
  render() {
    return h('div', {}, [
      Button({ 
        variant: 'primary', 
        onClick: () => this.save(), 
        children: 'Save' 
      }),
      Button({ 
        variant: 'danger', 
        onClick: () => this.delete(), 
        children: 'Delete' 
      })
    ]);
  }
}
```

### Slots/Children

```javascript
// Card component with children
function Card({ title, children }) {
  return h('div', { class: 'card' }, [
    h('div', { class: 'card-header' }, title),
    h('div', { class: 'card-body' }, children)
  ]);
}

// Usage
Card({ 
  title: 'My Card',
  children: [
    h('p', {}, 'Content here'),
    h('button', {}, 'Action')
  ]
});
```

## Real-World Examples

### Table

```javascript
class DataTable extends Component {
  render() {
    const users = this.props.users;

    return h('table', { class: 'table' }, [
      h('thead', {}, [
        h('tr', {}, [
          h('th', {}, 'Name'),
          h('th', {}, 'Email'),
          h('th', {}, 'Role')
        ])
      ]),
      h('tbody', {},
        users.map(user =>
          h('tr', { key: user.id }, [
            h('td', {}, user.name),
            h('td', {}, user.email),
            h('td', {}, user.role)
          ])
        )
      )
    ]);
  }
}
```

### Form

```javascript
class ContactForm extends Component {
  render() {
    const { name, email, message } = this.state;

    return h('form', {
      onsubmit: (e) => this.handleSubmit(e)
    }, [
      h('div', { class: 'form-group' }, [
        h('label', {}, 'Name'),
        h('input', {
          type: 'text',
          value: name,
          oninput: (e) => this.setState({ name: e.target.value })
        })
      ]),
      
      h('div', { class: 'form-group' }, [
        h('label', {}, 'Email'),
        h('input', {
          type: 'email',
          value: email,
          oninput: (e) => this.setState({ email: e.target.value })
        })
      ]),
      
      h('div', { class: 'form-group' }, [
        h('label', {}, 'Message'),
        h('textarea', {
          rows: 4,
          value: message,
          oninput: (e) => this.setState({ message: e.target.value })
        })
      ]),
      
      h('button', { type: 'submit' }, 'Send')
    ]);
  }
}
```

### Modal

```javascript
class Modal extends Component {
  render() {
    if (!this.props.isOpen) return null;

    return h('div', { 
      class: 'modal-overlay',
      onclick: () => this.props.onClose()
    }, [
      h('div', {
        class: 'modal-content',
        onclick: (e) => e.stopPropagation() // Don't close on content click
      }, [
        h('div', { class: 'modal-header' }, [
          h('h2', {}, this.props.title),
          h('button', {
            onclick: () => this.props.onClose()
          }, '×')
        ]),
        h('div', { class: 'modal-body' }, this.props.children)
      ])
    ]);
  }
}
```

## Best Practices

### 1. Use Semantic HTML

```javascript
// ✅ Good
h('article', {}, [
  h('header', {}, h('h1', {}, 'Title')),
  h('section', {}, 'Content')
])

// ❌ Avoid
h('div', {}, [
  h('div', {}, h('div', {}, 'Title')),
  h('div', {}, 'Content')
])
```

### 2. Keep Render Functions Pure

```javascript
// ✅ Good - pure function
render() {
  return h('div', {}, this.state.value);
}

// ❌ Avoid - side effects
render() {
  this.setState({ value: Math.random() }); // Side effect!
  return h('div', {}, this.state.value);
}
```

### 3. Extract Complex Logic

```javascript
// ✅ Good
getUserStatus(user) {
  if (user.isActive && user.isPremium) return 'Premium Active';
  if (user.isActive) return 'Active';
  return 'Inactive';
}

render() {
  return h('span', {}, this.getUserStatus(this.props.user));
}
```

### 4. Use Keys for Dynamic Lists

```javascript
// ✅ Good - stable unique key
items.map(item => h('li', { key: item.id }, item.name))

// ❌ Avoid - index as key (unstable)
items.map((item, i) => h('li', { key: i }, item.name))
```

## Next Steps

- [Components](./04-components.md) - Component architecture
- [Event Handling](./07-event-handling.md) - Handle user interactions
- [Best Practices](./10-best-practices.md) - Code quality tips
