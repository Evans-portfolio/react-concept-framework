# Best Practices

Write clean, maintainable, and performant code.

## Project Structure

### Recommended Layout

```
my-app/
├── framework/          # Framework source
├── public/             # Static files
│   ├── index.html
│   └── assets/
└── src/
    ├── index.js       # Entry point
    ├── store.js       # Global state
    ├── components/    # Reusable components
    │   ├── Header.js
    │   ├── Footer.js
    │   └── Button.js
    ├── pages/         # Page components
    │   ├── Home.js
    │   ├── About.js
    │   └── NotFound.js
    ├── utils/         # Helper functions
    │   ├── validation.js
    │   └── formatters.js
    └── styles/        # CSS files
        └── main.css
```

## Component Design

### 1. Single Responsibility Principle

Each component should do one thing well:

```javascript
// ❌ Bad - too many responsibilities
class UserDashboard extends Component {
  // Handles user profile, posts, comments, settings, notifications...
}

// ✅ Good - split into focused components
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

### 2. Component vs Function

```javascript
// Use functional components for simple, stateless UI
function Button({ variant = 'primary', onClick, children }) {
  return h('button', {
    class: `btn btn-${variant}`,
    onclick: onClick
  }, children);
}

// Use class components when you need state or lifecycle
class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }

  async mounted() {
    const user = await http.get(`/api/users/${this.props.userId}`);
    this.setState({ user });
  }
}
```

### 3. Props Validation

```javascript
class UserCard extends Component {
  constructor(props) {
    super(props);
    
    // Validate required props
    if (!props.user) {
      console.warn('UserCard: user prop is required');
    }
    if (typeof props.user !== 'object') {
      console.error('UserCard: user must be an object');
    }
  }
}
```

### 4. Default Props

```javascript
function Avatar({ user, size = 'medium', showName = true }) {
  const sizeMap = { small: 32, medium: 48, large: 64 };
  const imgSize = sizeMap[size];

  return h('div', { class: 'avatar' }, [
    h('img', {
      src: user.avatar,
      width: imgSize,
      height: imgSize
    }),
    showName && h('span', {}, user.name)
  ]);
}
```

## State Management

### 1. Keep State Minimal

```javascript
// ❌ Bad - redundant derived data
class TodoList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      completedTodos: [],  // Derived!
      activeTodos: [],     // Derived!
      totalCount: 0        // Derived!
    };
  }
}

// ✅ Good - only source data
class TodoList extends Component {
  constructor(props) {
    super(props);
    this.state = { todos: [] };
  }

  get completedTodos() {
    return this.state.todos.filter(t => t.completed);
  }

  get activeTodos() {
    return this.state.todos.filter(t => !t.completed);
  }
}
```

### 2. Immutable Updates

```javascript
// ❌ Bad - mutating state
handleAddTodo(text) {
  this.state.todos.push({ id: Date.now(), text });
  this.setState(this.state);
}

// ✅ Good - immutable update
handleAddTodo(text) {
  this.setState({
    todos: [...this.state.todos, { id: Date.now(), text }]
  });
}

// ✅ Good - update nested object
handleUpdateUser(updates) {
  this.setState({
    user: {
      ...this.state.user,
      ...updates
    }
  });
}
```

### 3. State Initialization

```javascript
class DataLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: false,
      error: null
    };
  }

  // Load from localStorage on mount
  mounted() {
    const cached = localStorage.getItem('data');
    if (cached) {
      this.setState({ data: JSON.parse(cached) });
    } else {
      this.loadData();
    }
  }
}
```

### 4. Store Organization

```javascript
// store.js
import { createStore, setGlobalStore } from './framework/src/state/index.js';

// Organize by domain
export const store = createStore({
  // Auth
  user: {
    id: null,
    name: '',
    email: '',
    isAuthenticated: false
  },
  
  // UI state
  ui: {
    theme: 'light',
    sidebarOpen: true,
    notifications: []
  },
  
  // Data
  todos: [],
  posts: []
});

setGlobalStore(store);

// Helper functions
export function login(user) {
  store.setState({ user: { ...user, isAuthenticated: true } });
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  store.setState({
    user: { id: null, name: '', email: '', isAuthenticated: false }
  });
  localStorage.removeItem('user');
}
```

## Performance

### 1. Use Keys for Lists

```javascript
// ✅ Good - stable unique keys
items.map(item =>
  h('li', { key: item.id }, item.name)
)

// ❌ Bad - index as key
items.map((item, i) =>
  h('li', { key: i }, item.name)
)

// ❌ Bad - no key
items.map(item =>
  h('li', {}, item.name)
)
```

### 2. Avoid Expensive Operations in render()

```javascript
// ❌ Bad - filtering in render
render() {
  const filtered = this.state.items.filter(/* complex logic */);
  return h('ul', {}, filtered.map(...));
}

// ✅ Good - compute once, cache result
get filteredItems() {
  if (!this._cachedFilter || this._cachedItems !== this.state.items) {
    this._cachedFilter = this.state.items.filter(/* logic */);
    this._cachedItems = this.state.items;
  }
  return this._cachedFilter;
}

render() {
  return h('ul', {}, this.filteredItems.map(...));
}
```

### 3. Debounce/Throttle

```javascript
// Debounce search
class SearchBox extends Component {
  handleInput(e) {
    const query = e.target.value;
    this.setState({ query });

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.search(query);
    }, 300);
  }

  beforeUnmount() {
    clearTimeout(this.searchTimeout);
  }
}

// Throttle scroll
class InfiniteScroll extends Component {
  mounted() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }
}
```

### 4. Lazy Loading

```javascript
// Load route components on demand
router.on('/dashboard', async () => {
  const { default: Dashboard } = await import('./pages/Dashboard.js');
  return Dashboard;
});

// Load images lazily
class LazyImage extends Component {
  mounted() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setState({ loaded: true });
          observer.disconnect();
        }
      });
    });

    observer.observe(this._element);
  }

  render() {
    return h('img', {
      src: this.state.loaded ? this.props.src : this.props.placeholder,
      alt: this.props.alt
    });
  }
}
```

## Error Handling

### 1. Error Boundaries

```javascript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return h('div', { class: 'error-boundary' }, [
        h('h2', {}, 'Something went wrong'),
        h('p', {}, this.state.error.message),
        h('button', {
          onclick: () => window.location.reload()
        }, 'Reload Page')
      ]);
    }

    return this.props.children;
  }
}

// Wrap app
render() {
  return h(ErrorBoundary, {}, [
    h(App, {})
  ]);
}
```

### 2. API Error Handling

```javascript
class DataLoader extends Component {
  async loadData() {
    this.setState({ loading: true, error: null });

    try {
      const data = await http.get('/api/data');
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({
        error: this.getErrorMessage(error),
        loading: false
      });
    }
  }

  getErrorMessage(error) {
    if (error.status === 404) return 'Not found';
    if (error.status === 403) return 'Access denied';
    if (error.status >= 500) return 'Server error';
    return 'Something went wrong';
  }
}
```

### 3. User Feedback

```javascript
// Show error messages
render() {
  const { error } = this.state;

  return h('div', {}, [
    error && h('div', { class: 'alert alert-error' }, [
      h('span', {}, error),
      h('button', {
        onclick: () => this.setState({ error: null })
      }, '×')
    ]),
    // ... rest of component
  ]);
}
```

## Code Organization

### 1. Extract Helper Functions

```javascript
// utils/validation.js
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function required(value) {
  return value !== null && value !== undefined && value !== '';
}

export function minLength(min) {
  return (value) => value.length >= min;
}

// Use in components
import { isEmail, required } from './utils/validation.js';

class LoginForm extends Component {
  validate() {
    const errors = {};
    
    if (!required(this.state.email)) {
      errors.email = 'Email is required';
    } else if (!isEmail(this.state.email)) {
      errors.email = 'Invalid email';
    }
    
    return errors;
  }
}
```

### 2. Constants File

```javascript
// constants.js
export const API_URL = 'https://api.example.com';
export const STORAGE_KEYS = {
  USER: 'user',
  TODOS: 'todos',
  THEME: 'theme'
};
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  LOGIN: '/login',
  DASHBOARD: '/dashboard'
};
```

### 3. Composable Actions

```javascript
// actions/todos.js
import { store } from '../store.js';

export const todoActions = {
  add(text) {
    const todo = {
      id: Date.now(),
      text,
      completed: false
    };
    
    store.setState(state => ({
      todos: [...state.todos, todo]
    }));
  },

  toggle(id) {
    store.setState(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
  },

  delete(id) {
    store.setState(state => ({
      todos: state.todos.filter(t => t.id !== id)
    }));
  }
};
```

## Testing

### 1. Unit Tests

```javascript
// utils/validation.test.js
import { isEmail, required } from './validation.js';

describe('Validation', () => {
  test('isEmail validates correctly', () => {
    expect(isEmail('test@example.com')).toBe(true);
    expect(isEmail('invalid')).toBe(false);
  });

  test('required checks for empty values', () => {
    expect(required('text')).toBe(true);
    expect(required('')).toBe(false);
    expect(required(null)).toBe(false);
  });
});
```

### 2. Component Tests

```javascript
// Button.test.js
import { h } from './framework/src/dom/index.js';
import Button from './components/Button.js';

test('Button renders with text', () => {
  const button = Button({ children: 'Click me' });
  expect(button.children).toContain('Click me');
});

test('Button calls onClick when clicked', () => {
  const onClick = jest.fn();
  const button = Button({ onClick, children: 'Click' });
  
  // Simulate click
  button.props.onclick();
  expect(onClick).toHaveBeenCalled();
});
```

## Security

### 1. Sanitize User Input

```javascript
// ❌ Bad - XSS vulnerability
render() {
  return h('div', {
    innerHTML: this.props.userContent
  });
}

// ✅ Good - sanitize first
import DOMPurify from 'dompurify';

render() {
  const clean = DOMPurify.sanitize(this.props.userContent);
  return h('div', { innerHTML: clean });
}

// ✅ Better - use text content
render() {
  return h('div', {}, this.props.userContent);
}
```

### 2. Validate API Responses

```javascript
async loadUser(id) {
  const data = await http.get(`/api/users/${id}`);
  
  // Validate response structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response');
  }
  
  if (!data.id || !data.name) {
    throw new Error('Missing required fields');
  }
  
  this.setState({ user: data });
}
```

## Documentation

### 1. Component Documentation

```javascript
/**
 * Button component with multiple variants
 * 
 * @param {Object} props
 * @param {string} props.variant - Button style (primary|secondary|danger)
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {*} props.children - Button content
 * 
 * @example
 * Button({ 
 *   variant: 'primary', 
 *   onClick: () => console.log('clicked'),
 *   children: 'Click me' 
 * })
 */
function Button({ variant = 'primary', onClick, disabled = false, children }) {
  return h('button', {
    class: `btn btn-${variant}`,
    onclick: onClick,
    disabled
  }, children);
}
```

### 2. README Files

Create README.md in each major directory:

```markdown
# Components

Reusable UI components.

## Usage

```javascript
import Button from './components/Button.js';

Button({ variant: 'primary', children: 'Click' });
```

## Available Components

- `Button` - Styled button with variants
- `Card` - Container with header and body
- `Modal` - Overlay dialog
```

## Next Steps

- [Getting Started](./01-getting-started.md) - Quick start guide
- [Architecture](./02-architecture.md) - Framework internals
- [Components](./04-components.md) - Component patterns
- [State Management](./05-state-management.md) - Managing state
