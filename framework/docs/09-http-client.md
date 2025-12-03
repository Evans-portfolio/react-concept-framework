# HTTP Client

Make API requests with the built-in HTTP client.

---

**📚 Navigation:** [← Prev: DOM Manipulation](./08-dom-manipulation.md) | [Next: Best Practices →](./10-best-practices.md)

---

## 📖 Table of Contents

- [Basic Usage](#basic-usage)
- [GET Requests](#get-requests)
- [POST Requests](#post-requests)
- [PUT Requests](#put-requests)
- [DELETE Requests](#delete-requests)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Real-World Examples](#real-world-examples)

---

## Basic Usage

```javascript
// Example: HTTP client methods - demonstrates all CRUD operations
import { http } from './framework/src/http/index.js';

// GET request - read data
const data = await http.get('/api/users');

// POST request - create new resource
const result = await http.post('/api/users', {
  name: 'Alice',
  email: 'alice@example.com'
});

// PUT request - update existing resource
const updated = await http.put('/api/users/1', {
  name: 'Alice Updated'
});

// DELETE request - remove resource
await http.delete('/api/users/1');
```

**💡 HTTP Methods explained:**

| Method | Purpose | Has Body | Idempotent |
|--------|---------|----------|------------|
| **GET** | Read data | ❌ No | ✅ Yes |
| **POST** | Create new | ✅ Yes | ❌ No |
| **PUT** | Update (replace) | ✅ Yes | ✅ Yes |
| **PATCH** | Update (partial) | ✅ Yes | ❌ No |
| **DELETE** | Remove | ❌ No | ✅ Yes |

**Idempotent** means calling it multiple times has the same effect as calling once.

**Example:**
```javascript
// GET - idempotent (always returns same user)
await http.get('/api/users/1');

// POST - not idempotent (creates new user each time!)
await http.post('/api/users', { name: 'Alice' });

// PUT - idempotent (sets user to same state each time)
await http.put('/api/users/1', { name: 'Alice' });
```

> ⚠️ **Common mistake:** Using POST when you should use PUT/PATCH for updates!

## GET Requests

### Simple GET

```javascript
// Example: GET with loading state - demonstrates async data fetching
class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: false // Track loading state
    };
  }

  async mounted() {
    this.setState({ loading: true }); // Show loading
    
    try {
      const users = await http.get('/api/users'); // Fetch data
      this.setState({ users, loading: false }); // Update state with data
    } catch (error) {
      console.error('Failed to load users:', error);
      this.setState({ loading: false }); // Hide loading on error
    }
  }

  render() {
    const { users, loading } = this.state;

    if (loading) return h('div', {}, 'Loading...'); // Loading state

    return h('ul', {},
      users.map(user =>
        h('li', { key: user.id }, user.name) // Render users
      )
    );
  }
}
```

### GET with Query Parameters

```javascript
// Option 1: Build URL manually
const users = await http.get('/api/users?page=1&limit=10');

// Option 2: Use URLSearchParams
const params = new URLSearchParams({
  page: '1',
  limit: '10',
  sort: 'name'
});
const users = await http.get(`/api/users?${params}`);
```

**💡 Understanding query parameters:**

Query parameters add filters/options to URLs:
```
https://api.example.com/users?page=2&limit=20&sort=name

?           - Starts query string
page=2      - First parameter
&           - Separates parameters  
limit=20    - Second parameter
&sort=name  - Third parameter
```

**When to use URLSearchParams:**
```javascript
// ❌ Manual - error-prone, hard to read
const url = `/api/search?q=${query}&page=${page}&limit=${limit}`;

// ✅ URLSearchParams - clean, handles encoding
const params = new URLSearchParams({
  q: query,        // Automatically encodes special chars
  page: page,
  limit: limit
});
const url = `/api/search?${params}`;

// Example with special characters:
const params = new URLSearchParams({
  q: 'hello world',  // Becomes: hello%20world
  tag: 'C++'         // Becomes: C%2B%2B
});
// Result: ?q=hello%20world&tag=C%2B%2B
```

**Dynamic parameters:**
```javascript
class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      page: 1,
      limit: 10,
      sortBy: 'name'
    };
  }

  async loadUsers() {
    const { page, limit, sortBy } = this.state;
    
    // Build params from state
    const params = new URLSearchParams({
      page: page.toString(),     // Must be strings!
      limit: limit.toString(),
      sort: sortBy
    });
    
    const users = await http.get(`/api/users?${params}`);
    this.setState({ users });
  }

  nextPage() {
    this.setState({ page: this.state.page + 1 }, () => {
      this.loadUsers(); // Reload with new page
    });
  }

  render() {
    return h('div', {}, [
      h('ul', {}, this.state.users.map(u => h('li', { key: u.id }, u.name))),
      h('button', { onclick: () => this.nextPage() }, 'Next Page')
    ]);
  }
}
```

> 📝 **Tip:** Use URLSearchParams when you have multiple or dynamic query parameters.

### GET Single Resource

```javascript
class UserDetail extends Component {
  async mounted() {
    const userId = this.props.params.id;
    
    try {
      const user = await http.get(`/api/users/${userId}`);
      this.setState({ user });
    } catch (error) {
      if (error.status === 404) {
        this.setState({ error: 'User not found' });
      }
    }
  }

  render() {
    const { user, error } = this.state;

    if (error) return h('div', {}, error);
    if (!user) return h('div', {}, 'Loading...');

    return h('div', {}, [
      h('h1', {}, user.name),
      h('p', {}, user.email)
    ]);
  }
}
```

## POST Requests

### Creating Resources

```javascript
// Example: POST request - demonstrates creating new resource with form
class CreateUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      submitting: false // Track form submission state
    };
  }

  async handleSubmit(e) {
    e.preventDefault(); // Prevent page reload
    this.setState({ submitting: true }); // Disable submit button

    try {
      const user = await http.post('/api/users', { // Send data to API
        name: this.state.name,
        email: this.state.email
      });

      console.log('Created user:', user);
      
      // Reset form after successful creation
      this.setState({
        name: '',
        email: '',
        submitting: false
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      this.setState({ submitting: false }); // Re-enable submit button
    }
  }

  render() {
    const { name, email, submitting } = this.state;

    return h('form', {
      onsubmit: (e) => this.handleSubmit(e)
    }, [
      h('input', {
        type: 'text',
        value: name,
        oninput: (e) => this.setState({ name: e.target.value }), // Update state on input
        placeholder: 'Name'
      }),
      h('input', {
        type: 'email',
        value: email,
        oninput: (e) => this.setState({ email: e.target.value }), // Update state on input
        placeholder: 'Email'
      }),
      h('button', {
        type: 'submit',
        disabled: submitting // Disable while submitting
      }, submitting ? 'Saving...' : 'Create User') // Show feedback
    ]);
  }
}
```

### Login Example

```javascript
// Example: Login with authentication - demonstrates POST with error handling and navigation
import { http } from '../framework/src/http/index.js';
import { store } from './store.js';
import { navigate } from '../framework/src/router/index.js';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loading: false,
      error: null
    };
  }

  async handleLogin(e) {
    e.preventDefault();
    this.setState({ loading: true, error: null }); // Clear previous errors

    try {
      const response = await http.post('https://dummyjson.com/auth/login', {
        username: this.state.username,
        password: this.state.password
      });

      // Save to store - update global auth state
      store.setState({
        user: {
          username: this.state.username,
          token: response.accessToken,
          isAuthenticated: true
        }
      });

      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      this.setState({
        error: 'Login failed. Check your credentials.', // Show error message
        loading: false
      });
    }
  }

  render() {
    const { email, password, loading, error } = this.state;

    return h('form', {
      onsubmit: (e) => this.handleLogin(e)
    }, [
      error && h('div', { class: 'error' }, error),
      
      h('input', {
        type: 'email',
        value: email,
        oninput: (e) => this.setState({ email: e.target.value }),
        placeholder: 'Email'
      }),
      
      h('input', {
        type: 'password',
        value: password,
        oninput: (e) => this.setState({ password: e.target.value }),
        placeholder: 'Password'
      }),
      
      h('button', {
        type: 'submit',
        disabled: loading
      }, loading ? 'Logging in...' : 'Login')
    ]);
  }
}
```

## PUT Requests

### Updating Resources

```javascript
class EditUser extends Component {
  async mounted() {
    // Load user first
    const user = await http.get(`/api/users/${this.props.userId}`);
    this.setState({ name: user.name, email: user.email });
  }

  async handleUpdate(e) {
    e.preventDefault();

    try {
      const updated = await http.put(`/api/users/${this.props.userId}`, {
        name: this.state.name,
        email: this.state.email
      });

      console.log('Updated:', updated);
      navigate('/users');
    } catch (error) {
      console.error('Update failed:', error);
    }
  }

  render() {
    return h('form', {
      onsubmit: (e) => this.handleUpdate(e)
    }, [
      h('input', {
        value: this.state.name,
        oninput: (e) => this.setState({ name: e.target.value })
      }),
      h('button', { type: 'submit' }, 'Update')
    ]);
  }
}
```

## DELETE Requests

### Deleting Resources

```javascript
class DeleteButton extends Component {
  async handleDelete() {
    if (!confirm('Are you sure?')) return;

    try {
      await http.delete(`/api/users/${this.props.userId}`);
      
      // Refresh list or redirect
      this.props.onDeleted();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }

  render() {
    return h('button', {
      onclick: () => this.handleDelete(),
      class: 'btn-danger'
    }, 'Delete');
  }
}
```

## Error Handling

### Try-Catch Pattern

```javascript
class DataLoader extends Component {
  async loadData() {
    this.setState({ loading: true, error: null });

    try {
      const data = await http.get('/api/data');
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({
        error: error.message,
        loading: false
      });
    }
  }

  render() {
    const { data, loading, error } = this.state;

    if (loading) return h('div', {}, 'Loading...');
    if (error) return h('div', { class: 'error' }, `Error: ${error}`);
    if (!data) return h('div', {}, 'No data');

    return h('div', {}, JSON.stringify(data));
  }
}
```

### Status Code Handling

```javascript
async loadUser(id) {
  try {
    const user = await http.get(`/api/users/${id}`);
    this.setState({ user });
  } catch (error) {
    if (error.status === 404) {
      this.setState({ error: 'User not found' });
    } else if (error.status === 403) {
      this.setState({ error: 'Access denied' });
    } else if (error.status >= 500) {
      this.setState({ error: 'Server error. Try again later.' });
    } else {
      this.setState({ error: 'Something went wrong' });
    }
  }
}
```

## Loading States

### Optimistic Loading

```javascript
class PostsList extends Component {
  async mounted() {
    this.loadPosts();
  }

  async loadPosts() {
    this.setState({ loading: true });

    const posts = await http.get('/api/posts');
    
    this.setState({
      posts,
      loading: false
    });
  }

  async createPost(title, body) {
    // Optimistic update
    const tempPost = {
      id: Date.now(),
      title,
      body,
      pending: true
    };

    this.setState({
      posts: [tempPost, ...this.state.posts]
    });

    try {
      const newPost = await http.post('/api/posts', { title, body });
      
      // Replace temp with real post
      this.setState({
        posts: this.state.posts.map(p =>
          p.id === tempPost.id ? newPost : p
        )
      });
    } catch (error) {
      // Remove temp post on error
      this.setState({
        posts: this.state.posts.filter(p => p.id !== tempPost.id)
      });
    }
  }
}
```

## Authentication

### Using DummyJSON

DummyJSON is a free REST API with no authentication required. You can use it directly without API keys:

```javascript
// No API key needed - just use the endpoints directly
const posts = await http.get('https://dummyjson.com/posts');
```

### Custom Headers

For other APIs, you can extend the client:

```javascript
import { HttpClient } from './framework/src/http/client.js';

class AuthenticatedHttpClient extends HttpClient {
  async request(method, url, data = null, options = {}) {
    const token = localStorage.getItem('token');
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    return super.request(method, url, data, options);
  }
}

export const authHttp = new AuthenticatedHttpClient();
```

## Real-World Example

### Posts Page from Demo App

```javascript
import { http } from '../../framework/src/http/index.js';
import { Component, h } from '../../framework/src/core/index.js';

export default class PostsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: true,
      creating: false,
      newPostTitle: '',
      newPostBody: ''
    };
  }

  async mounted() {
    await this.loadPosts();
  }

  async loadPosts() {
    try {
      const response = await http.get(
        'https://dummyjson.com/posts?limit=10'
      );
      this.setState({ posts: response.posts, loading: false });
    } catch (error) {
      console.error('Failed to load posts:', error);
      this.setState({ loading: false });
    }
  }

  async createPost(e) {
    e.preventDefault();
    const { newPostTitle, newPostBody } = this.state;

    if (!newPostTitle || !newPostBody) return;

    this.setState({ creating: true });

    try {
      const newPost = await http.post(
        'https://dummyjson.com/posts/add',
        {
          title: newPostTitle,
          body: newPostBody,
          userId: 1
        }
      );

      this.setState({
        posts: [newPost, ...this.state.posts],
        newPostTitle: '',
        newPostBody: '',
        creating: false
      });
    } catch (error) {
      console.error('Failed to create post:', error);
      this.setState({ creating: false });
    }
  }

  async deletePost(id) {
    try {
      await http.delete(
        `https://dummyjson.com/posts/${id}`
      );

      this.setState({
        posts: this.state.posts.filter(p => p.id !== id)
      });
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  }

  render() {
    const { posts, loading, creating } = this.state;

    if (loading) {
      return h('div', {}, 'Loading posts...');
    }

    return h('div', { class: 'posts-page' }, [
      // Create form
      h('form', { onsubmit: (e) => this.createPost(e) }, [
        h('input', {
          value: this.state.newPostTitle,
          oninput: (e) => this.setState({ newPostTitle: e.target.value }),
          placeholder: 'Post title'
        }),
        h('textarea', {
          value: this.state.newPostBody,
          oninput: (e) => this.setState({ newPostBody: e.target.value }),
          placeholder: 'Post body'
        }),
        h('button', {
          type: 'submit',
          disabled: creating
        }, creating ? 'Creating...' : 'Create Post')
      ]),

      // Posts list
      h('div', { class: 'posts-list' },
        posts.map(post =>
          h('div', { key: post.id, class: 'post-card' }, [
            h('h3', {}, post.title),
            h('p', {}, post.body),
            h('button', {
              onclick: () => this.deletePost(post.id)
            }, 'Delete')
          ])
        )
      )
    ]);
  }
}
```

## Best Practices

### 1. Show Loading States

```javascript
render() {
  if (this.state.loading) {
    return h('div', { class: 'spinner' }, 'Loading...');
  }
  // ... rest of component
}
```

### 2. Handle Errors Gracefully

```javascript
if (this.state.error) {
  return h('div', { class: 'error' }, [
    h('p', {}, this.state.error),
    h('button', {
      onclick: () => this.retry()
    }, 'Retry')
  ]);
}
```

### 3. Cancel Requests on Unmount

```javascript
class DataLoader extends Component {
  mounted() {
    this.abortController = new AbortController();
    this.loadData();
  }

  async loadData() {
    try {
      const data = await fetch('/api/data', {
        signal: this.abortController.signal
      }).then(r => r.json());
      
      this.setState({ data });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  }

  beforeUnmount() {
    this.abortController.abort();
  }
}
```

### 4. Cache Responses

```javascript
const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }

  const data = await http.get(url);
  cache.set(url, data);
  return data;
}
```

## Next Steps

- [State Management](./05-state-management.md) - Store API responses
- [Components](./04-components.md) - Lifecycle for data fetching
- [Best Practices](./10-best-practices.md) - Error handling patterns

---

**📚 Navigation:** [← Prev: DOM Manipulation](./08-dom-manipulation.md) | [Next: Best Practices →](./10-best-practices.md)

---
