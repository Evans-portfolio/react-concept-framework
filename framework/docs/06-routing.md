# Routing

Build single-page applications (SPAs) with client-side routing.

## Basic Setup

### 1. Create Router Instance

```javascript
import { router } from './framework/src/router/index.js';

// Define routes
router.on('/', HomePage);
router.on('/about', AboutPage);
router.on('/users/:id', UserDetailPage);
router.on('*', NotFoundPage); // 404 fallback

// Start router
router.start('#app');
```

### 2. Hash-Based Routing

The framework uses hash-based routing (`#/path`) which works without server configuration:

```
http://localhost:8000/example/public/#/
http://localhost:8000/example/public/#/about
http://localhost:8000/example/public/#/users/123
```

## Defining Routes

### Static Routes

```javascript
router.on('/', HomePage);
router.on('/about', AboutPage);
router.on('/contact', ContactPage);
```

### Dynamic Routes

Capture URL parameters:

```javascript
// Route with parameter
router.on('/users/:id', UserDetailPage);
router.on('/posts/:postId/comments/:commentId', CommentDetailPage);

// Access params in component
class UserDetailPage extends Component {
  mounted() {
    const userId = this.props.params.id;
    console.log('User ID:', userId);
    this.loadUser(userId);
  }

  async loadUser(id) {
    const user = await fetch(`/api/users/${id}`).then(r => r.json());
    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    if (!user) return h('div', {}, 'Loading...');
    
    return h('div', {}, [
      h('h1', {}, user.name),
      h('p', {}, user.email)
    ]);
  }
}
```

### Wildcard Route (404)

```javascript
router.on('*', NotFoundPage);

class NotFoundPage extends Component {
  render() {
    return h('div', { class: 'not-found' }, [
      h('h1', {}, '404 - Page Not Found'),
      h('p', {}, 'The page you are looking for does not exist.'),
      Link({ to: '/', children: 'Go to Home' })
    ]);
  }
}
```

## Navigation

### Using Link Component

```javascript
import { Link } from './framework/src/router/index.js';

class Navigation extends Component {
  render() {
    return h('nav', {}, [
      Link({ to: '/', children: 'Home' }),
      Link({ to: '/about', children: 'About' }),
      Link({ to: '/contact', children: 'Contact' })
    ]);
  }
}
```

### Programmatic Navigation

```javascript
import { navigate } from './framework/src/router/index.js';

class LoginForm extends Component {
  async handleSubmit(e) {
    e.preventDefault();
    
    const success = await this.login();
    
    if (success) {
      // Redirect after successful login
      navigate('/dashboard');
    }
  }

  render() {
    return h('form', { onsubmit: (e) => this.handleSubmit(e) }, [
      // ... form fields
      h('button', { type: 'submit' }, 'Login')
    ]);
  }
}
```

### Navigation with State

Pass data when navigating:

```javascript
// Navigate with query params
navigate('/search?q=javascript&page=1');

// Access in component
class SearchPage extends Component {
  mounted() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const query = params.get('q');
    const page = params.get('page');
    
    this.setState({ query, page });
    this.search(query, page);
  }
}
```

## Complete Example

### Multi-Page App

```javascript
// index.js
import { router } from './framework/src/router/index.js';
import { store } from './store.js';
import HomePage from './pages/Home.js';
import AboutPage from './pages/About.js';
import LoginPage from './pages/Login.js';
import PostsPage from './pages/Posts.js';
import PostDetailPage from './pages/PostDetail.js';
import NotFoundPage from './pages/NotFound.js';

// Register routes
router.on('/', HomePage);
router.on('/about', AboutPage);
router.on('/login', LoginPage);
router.on('/posts', PostsPage);
router.on('/posts/:id', PostDetailPage);
router.on('*', NotFoundPage);

// Start router
document.addEventListener('DOMContentLoaded', () => {
  router.start('#app');
});
```

### Page Components

**Home Page:**

```javascript
import { h, Component } from '../framework/src/core/index.js';
import Header from '../components/Header.js';
import { Link } from '../framework/src/router/index.js';

export default class HomePage extends Component {
  render() {
    return h('div', { class: 'home-page' }, [
      Header(),
      h('div', { class: 'hero' }, [
        h('h1', {}, 'Welcome to Our App'),
        h('p', {}, 'Get started by exploring our features'),
        Link({ 
          to: '/posts', 
          class: 'btn btn-primary',
          children: 'View Posts' 
        })
      ])
    ]);
  }
}
```

**Posts List Page:**

```javascript
export default class PostsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: true
    };
  }

  async mounted() {
    const posts = await fetch('/api/posts').then(r => r.json());
    this.setState({ posts, loading: false });
  }

  render() {
    const { posts, loading } = this.state;

    return h('div', { class: 'posts-page' }, [
      Header(),
      h('h2', {}, 'All Posts'),
      loading 
        ? h('div', {}, 'Loading...')
        : h('div', { class: 'posts-list' },
            posts.map(post =>
              h('div', { key: post.id, class: 'post-card' }, [
                h('h3', {}, post.title),
                h('p', {}, post.excerpt),
                Link({ 
                  to: `/posts/${post.id}`, 
                  children: 'Read More →' 
                })
              ])
            )
          )
    ]);
  }
}
```

**Post Detail Page:**

```javascript
export default class PostDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null,
      loading: true
    };
  }

  async mounted() {
    const postId = this.props.params.id;
    const post = await fetch(`/api/posts/${postId}`).then(r => r.json());
    this.setState({ post, loading: false });
  }

  render() {
    const { post, loading } = this.state;

    if (loading) {
      return h('div', {}, 'Loading...');
    }

    return h('div', { class: 'post-detail' }, [
      Header(),
      h('article', {}, [
        h('h1', {}, post.title),
        h('div', { class: 'meta' }, [
          h('span', {}, `By ${post.author}`),
          h('span', {}, new Date(post.date).toLocaleDateString())
        ]),
        h('div', { class: 'content', innerHTML: post.content }),
        Link({ to: '/posts', children: '← Back to Posts' })
      ])
    ]);
  }
}
```

## Route Guards

Protect routes based on authentication:

```javascript
// authGuard.js
import { store } from './store.js';
import { navigate } from './framework/src/router/index.js';

export function requireAuth(Component) {
  return class AuthGuard extends Component {
    mounted() {
      const { user } = store.getState();
      
      if (!user.isAuthenticated) {
        // Redirect to login
        navigate('/login');
        return;
      }

      // Call original mounted if exists
      if (super.mounted) {
        super.mounted();
      }
    }
  };
}

// Usage
router.on('/dashboard', requireAuth(DashboardPage));
router.on('/profile', requireAuth(ProfilePage));
```

## Navigation Guards

Execute code before navigation:

```javascript
class ProtectedPage extends Component {
  beforeMount() {
    // Check permission
    if (!this.hasPermission()) {
      navigate('/unauthorized');
      return false; // Cancel mount
    }
    return true;
  }

  hasPermission() {
    const { user } = store.getState();
    return user.role === 'admin';
  }
}
```

## Active Link Styling

Highlight active navigation:

```javascript
class Navigation extends Component {
  isActive(path) {
    return window.location.hash === `#${path}`;
  }

  render() {
    return h('nav', {}, [
      Link({ 
        to: '/', 
        class: this.isActive('/') ? 'nav-link active' : 'nav-link',
        children: 'Home' 
      }),
      Link({ 
        to: '/about', 
        class: this.isActive('/about') ? 'nav-link active' : 'nav-link',
        children: 'About' 
      })
    ]);
  }

  mounted() {
    // Re-render on route change to update active state
    window.addEventListener('hashchange', () => this.update());
  }
}
```

## Nested Routes

Create layouts with nested content:

```javascript
// Layout component
class DashboardLayout extends Component {
  render() {
    return h('div', { class: 'dashboard-layout' }, [
      h('aside', { class: 'sidebar' }, [
        Link({ to: '/dashboard', children: 'Overview' }),
        Link({ to: '/dashboard/stats', children: 'Statistics' }),
        Link({ to: '/dashboard/settings', children: 'Settings' })
      ]),
      h('main', { class: 'content' }, [
        this.props.children // Nested content here
      ])
    ]);
  }
}

// Register nested routes
router.on('/dashboard', () => 
  h(DashboardLayout, {}, DashboardOverview())
);
router.on('/dashboard/stats', () =>
  h(DashboardLayout, {}, DashboardStats())
);
router.on('/dashboard/settings', () =>
  h(DashboardLayout, {}, DashboardSettings())
);
```

## Scroll Behavior

Scroll to top on navigation:

```javascript
router.on('*', (Component) => {
  // Scroll to top
  window.scrollTo(0, 0);
  
  // Return component
  return Component;
});
```

## Best Practices

### 1. Code Splitting

Lazy load pages:

```javascript
// Instead of importing all at once
router.on('/dashboard', async () => {
  const { default: Dashboard } = await import('./pages/Dashboard.js');
  return Dashboard;
});
```

### 2. Loading States

Show loading indicator during navigation:

```javascript
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  mounted() {
    window.addEventListener('hashchange', () => {
      this.setState({ loading: true });
      
      // Reset after render
      setTimeout(() => this.setState({ loading: false }), 100);
    });
  }

  render() {
    return h('div', {}, [
      this.state.loading && h('div', { class: 'loader' }, 'Loading...'),
      h('div', { id: 'router-outlet' })
    ]);
  }
}
```

### 3. Error Boundaries

Handle routing errors:

```javascript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error) {
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return h('div', { class: 'error' }, [
        h('h1', {}, 'Something went wrong'),
        h('p', {}, this.state.error.message),
        Link({ to: '/', children: 'Go Home' })
      ]);
    }

    return this.props.children;
  }
}
```

### 4. SEO-Friendly Titles

Update page title:

```javascript
class BasePage extends Component {
  setTitle(title) {
    document.title = `${title} | My App`;
  }

  mounted() {
    this.setTitle(this.getTitle());
  }

  getTitle() {
    return 'Page'; // Override in subclasses
  }
}

class AboutPage extends BasePage {
  getTitle() {
    return 'About Us';
  }
}
```

## Demo App Example

From our example app (`/example/src/index.js`):

```javascript
import { router } from '../../framework/src/router/index.js';
import HomePage from './pages/Home.js';
import AboutPage from './pages/About.js';
import LoginPage from './pages/Login.js';
import PostsPage from './pages/Posts.js';
import Toast from './components/Toast.js';

document.addEventListener('DOMContentLoaded', () => {
  // Mount toast notifications
  const toast = new Toast();
  toast.mount(document.querySelector('#toast-root'));

  // Register routes
  router.on('/', HomePage);
  router.on('/about', AboutPage);
  router.on('/login', LoginPage);
  router.on('/posts', PostsPage);
  router.on('*', NotFoundPage);

  // Start router
  router.start('#app');
});
```

## Next Steps

- [State Management](./05-state-management.md) - Combine routing with global state
- [HTTP Client](./09-http-client.md) - Fetch data on route changes
- [Best Practices](./10-best-practices.md) - SPA architecture patterns
