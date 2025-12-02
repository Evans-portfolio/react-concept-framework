# Router API Reference

Complete reference for the hash-based routing system.

---

**📚 Navigation:** [← Back to Docs](../README.md)

---

## Table of Contents

- [Router Class](#router-class)
- [Router Methods](#router-methods)
  - [on()](#on)
  - [start()](#start)
  - [navigate()](#navigate)
- [Route Matching](#route-matching)
- [Helper Functions](#helper-functions)
  - [Link Component](#link-component)
  - [navigate Function](#navigate-function)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## Router Class

The framework provides a singleton router instance for hash-based client-side routing.

**Import:**
```javascript
import { router } from './framework/src/router/index.js';
```

**Basic Usage:**
```javascript
import { router } from './framework/src/router/index.js';
import HomePage from './pages/Home.js';
import AboutPage from './pages/About.js';

router
  .on('/', HomePage)
  .on('/about', AboutPage)
  .start('#app');
```

---

## Router Methods

### `on()`

Registers a route with a component.

**Signature:**
```javascript
router.on(path, component, props = {})
```

**Parameters:**
- `path` (String) - Route path pattern
- `component` (Component) - Component class to render
- `props` (Object, optional) - Additional props to pass to component

**Returns:** `Router` - Router instance (for chaining)

**Examples:**
```javascript
// Static route
router.on('/', HomePage);

// Dynamic route with parameter
router.on('/users/:id', UserDetailPage);

// Multiple parameters
router.on('/posts/:postId/comments/:commentId', CommentPage);

// With additional props
router.on('/dashboard', DashboardPage, { theme: 'dark' });

// 404 catch-all route
router.on('*', NotFoundPage);

// Method chaining
router
  .on('/', HomePage)
  .on('/about', AboutPage)
  .on('/contact', ContactPage);
```

**Path Patterns:**
- `/home` - Exact match
- `/users/:id` - Matches `/users/123`, params: `{ id: '123' }`
- `/posts/:postId/comments/:commentId` - Multiple params
- `*` - Catch-all for 404 pages

---

### `start()`

Starts the router and begins listening for navigation events.

**Signature:**
```javascript
router.start(rootSelector = '#app')
```

**Parameters:**
- `rootSelector` (String, optional) - CSS selector for mount point. Default: `'#app'`

**Returns:** `void`

**Example:**
```javascript
// Default - mounts to #app
router.start();

// Custom mount point
router.start('#root');

// Throws error if element not found
router.start('#missing'); // Error: Router root element not found
```

**What it does:**
1. Finds the root element
2. Listens to `hashchange` events
3. Handles clicks on `[data-link]` elements
4. Renders initial route

**⚠️ Important:** Must be called after all routes are registered!

---

### `navigate()`

Programmatically navigate to a route.

**Signature:**
```javascript
router.navigate(path)
```

**Parameters:**
- `path` (String) - Target path

**Returns:** `void`

**Example:**
```javascript
// Navigate to home
router.navigate('/');

// Navigate with parameter
router.navigate('/users/123');

// Navigate with query string
router.navigate('/search?q=hello');

// Use in component
class LoginForm extends Component {
  handleSubmit = async (e) => {
    e.preventDefault();
    await http.post('/api/login', this.state);
    router.navigate('/dashboard'); // Redirect after login
  }
}
```

---

## Route Matching

### Parameters

Routes can have dynamic segments prefixed with `:`.

**Pattern:**
```javascript
router.on('/users/:id', UserPage);
router.on('/posts/:postId/comments/:commentId', CommentPage);
```

**Accessing params in component:**
```javascript
class UserPage extends Component {
  mounted() {
    const userId = this.props.params.id;
    console.log('User ID:', userId);
  }

  render() {
    const { id } = this.props.params;
    return h('div', {}, `User ID: ${id}`);
  }
}
```

**Example matches:**
```javascript
// Route: /users/:id
'/users/123' → { id: '123' }
'/users/alice' → { id: 'alice' }

// Route: /posts/:postId/comments/:commentId
'/posts/5/comments/10' → { postId: '5', commentId: '10' }
```

### Query Strings

Access query parameters via `this.props.query`.

**Example:**
```javascript
// URL: #/search?q=hello&page=2

class SearchPage extends Component {
  render() {
    const { q, page } = this.props.query || {};
    return h('div', {}, `Search: ${q}, Page: ${page}`);
  }
}
```

---

## Helper Functions

### Link Component

Create navigation links that work with the router.

**Usage:**
```javascript
import { Link } from './framework/src/router/index.js';

// In component render
render() {
  return h('nav', {}, [
    Link({ to: '/' }, 'Home'),
    Link({ to: '/about' }, 'About'),
    Link({ to: '/contact' }, 'Contact')
  ]);
}
```

**With styling:**
```javascript
Link({
  to: '/dashboard',
  className: 'nav-link',
  style: { color: 'blue' }
}, 'Dashboard')
```

---

### navigate Function

Standalone navigate function (alternative to `router.navigate()`).

**Import:**
```javascript
import { navigate } from './framework/src/router/index.js';
```

**Usage:**
```javascript
// Redirect after action
async function logout() {
  await http.post('/api/logout');
  navigate('/login');
}

// Use in event handlers
h('button', {
  onclick: () => navigate('/dashboard')
}, 'Go to Dashboard')
```

---

## Examples

### Basic Routing

```javascript
import { router } from './framework/src/router/index.js';
import { Component, h } from './framework/src/core/index.js';

// Pages
class HomePage extends Component {
  render() {
    return h('div', {}, [
      h('h1', {}, 'Home Page'),
      h('a', { href: '#/about', 'data-link': true }, 'About')
    ]);
  }
}

class AboutPage extends Component {
  render() {
    return h('div', {}, [
      h('h1', {}, 'About Page'),
      h('a', { href: '#/', 'data-link': true }, 'Home')
    ]);
  }
}

// Setup routes
router
  .on('/', HomePage)
  .on('/about', AboutPage)
  .start('#app');
```

### Dynamic Routes

```javascript
class UserDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true
    };
  }

  async mounted() {
    const userId = this.props.params.id;

    try {
      const user = await http.get(`/api/users/${userId}`);
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ loading: false });
    }
  }

  render() {
    const { user, loading } = this.state;

    if (loading) return h('div', {}, 'Loading...');
    if (!user) return h('div', {}, 'User not found');

    return h('div', {}, [
      h('h1', {}, user.name),
      h('p', {}, `Email: ${user.email}`),
      h('a', { href: '#/users', 'data-link': true }, 'Back to Users')
    ]);
  }
}

// Register route
router.on('/users/:id', UserDetailPage);
```

### Navigation Menu

```javascript
import { Link } from './framework/src/router/index.js';

class Navigation extends Component {
  render() {
    return h('nav', { className: 'navbar' }, [
      h('ul', {}, [
        h('li', {}, Link({ to: '/' }, 'Home')),
        h('li', {}, Link({ to: '/about' }, 'About')),
        h('li', {}, Link({ to: '/users' }, 'Users')),
        h('li', {}, Link({ to: '/contact' }, 'Contact'))
      ])
    ]);
  }
}
```

### Protected Routes

```javascript
import { router, navigate } from './framework/src/router/index.js';
import { store } from './store.js';

class DashboardPage extends Component {
  mounted() {
    // Check authentication
    const { isLoggedIn } = store.getState();

    if (!isLoggedIn) {
      navigate('/login');
    }
  }

  render() {
    return h('div', {}, [
      h('h1', {}, 'Dashboard'),
      h('p', {}, 'Protected content')
    ]);
  }
}

router.on('/dashboard', DashboardPage);
```

### 404 Not Found

```javascript
class NotFoundPage extends Component {
  render() {
    return h('div', { className: 'not-found' }, [
      h('h1', {}, '404 - Page Not Found'),
      h('p', {}, 'The page you are looking for does not exist.'),
      h('a', { href: '#/', 'data-link': true }, 'Go Home')
    ]);
  }
}

// Register as catch-all (must be last!)
router
  .on('/', HomePage)
  .on('/about', AboutPage)
  .on('*', NotFoundPage) // Matches any unmatched route
  .start();
```

### Programmatic Navigation

```javascript
class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: null
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await http.post('/api/login', {
        username: this.state.username,
        password: this.state.password
      });

      // Save token
      localStorage.setItem('token', response.token);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      this.setState({ error: 'Login failed' });
    }
  }

  render() {
    return h('form', { onsubmit: this.handleSubmit }, [
      h('input', {
        type: 'text',
        value: this.state.username,
        oninput: (e) => this.setState({ username: e.target.value })
      }),
      h('input', {
        type: 'password',
        value: this.state.password,
        oninput: (e) => this.setState({ password: e.target.value })
      }),
      h('button', { type: 'submit' }, 'Login'),
      this.state.error && h('p', { className: 'error' }, this.state.error)
    ]);
  }
}
```

---

## Best Practices

### 1. Define Routes Before start()

```javascript
// ✅ Good - all routes defined first
router
  .on('/', HomePage)
  .on('/about', AboutPage)
  .start();

// ❌ Bad - adding routes after start
router.start();
router.on('/', HomePage); // Won't work properly
```

### 2. Use data-link for Internal Links

```javascript
// ✅ Good - uses router
h('a', { href: '#/about', 'data-link': true }, 'About')

// ❌ Bad - full page reload
h('a', { href: '/about' }, 'About')
```

### 3. Always Handle 404

```javascript
// ✅ Good - has 404 handler
router
  .on('/', HomePage)
  .on('*', NotFoundPage)
  .start();
```

### 4. Use navigate() for Redirects

```javascript
// ✅ Good - programmatic navigation
navigate('/dashboard');

// ❌ Bad - direct manipulation
window.location.hash = '/dashboard';
```

### 5. Cleanup in beforeDestroy

```javascript
class MyPage extends Component {
  mounted() {
    this.interval = setInterval(() => {
      // Poll API
    }, 5000);
  }

  beforeDestroy() {
    // ✅ Always cleanup
    clearInterval(this.interval);
  }
}
```

---

**📚 Navigation:** [← Back to Docs](../README.md)
