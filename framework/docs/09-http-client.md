# HTTP Client

Make API requests with the built-in HTTP client.

## Basic Usage

```javascript
import { http } from './framework/src/http/index.js';

// GET request
const data = await http.get('/api/users');

// POST request
const result = await http.post('/api/users', {
  name: 'Alice',
  email: 'alice@example.com'
});

// PUT request
const updated = await http.put('/api/users/1', {
  name: 'Alice Updated'
});

// DELETE request
await http.delete('/api/users/1');
```

## GET Requests

### Simple GET

```javascript
class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: false
    };
  }

  async mounted() {
    this.setState({ loading: true });
    
    try {
      const users = await http.get('/api/users');
      this.setState({ users, loading: false });
    } catch (error) {
      console.error('Failed to load users:', error);
      this.setState({ loading: false });
    }
  }

  render() {
    const { users, loading } = this.state;

    if (loading) return h('div', {}, 'Loading...');

    return h('ul', {},
      users.map(user =>
        h('li', { key: user.id }, user.name)
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
class CreateUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      submitting: false
    };
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({ submitting: true });

    try {
      const user = await http.post('/api/users', {
        name: this.state.name,
        email: this.state.email
      });

      console.log('Created user:', user);
      
      // Reset form
      this.setState({
        name: '',
        email: '',
        submitting: false
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      this.setState({ submitting: false });
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
        oninput: (e) => this.setState({ name: e.target.value }),
        placeholder: 'Name'
      }),
      h('input', {
        type: 'email',
        value: email,
        oninput: (e) => this.setState({ email: e.target.value }),
        placeholder: 'Email'
      }),
      h('button', {
        type: 'submit',
        disabled: submitting
      }, submitting ? 'Saving...' : 'Create User')
    ]);
  }
}
```

### Login Example

```javascript
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
    this.setState({ loading: true, error: null });

    try {
      const response = await http.post('https://reqres.in/api/login', {
        email: this.state.email,
        password: this.state.password
      });

      // Save to store
      store.setState({
        user: {
          email: this.state.email,
          token: response.token,
          isAuthenticated: true
        }
      });

      // Redirect
      navigate('/dashboard');
    } catch (error) {
      this.setState({
        error: 'Login failed. Check your credentials.',
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

### Adding Headers

The HTTP client automatically adds the API key for ReqRes.in requests:

```javascript
// Framework handles this internally
if (url.includes('reqres.in')) {
  headers['x-api-key'] = 'reqres-free-v1';
}
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
      const posts = await http.get(
        'https://jsonplaceholder.typicode.com/posts?_limit=10'
      );
      this.setState({ posts, loading: false });
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
        'https://jsonplaceholder.typicode.com/posts',
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
        `https://jsonplaceholder.typicode.com/posts/${id}`
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
