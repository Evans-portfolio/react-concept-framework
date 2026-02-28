# Framework Example Application

Comprehensive demo application showcasing **ALL** framework features through real-world examples.

## 🎯 Overview

This example demonstrates the complete framework capabilities:
- ✅ Virtual DOM with key-based reconciliation
- ✅ Component lifecycle (mount, update, unmount)
- ✅ Local & Global state management
- ✅ Hash-based routing
- ✅ HTTP client (fetch wrapper)
- ✅ Custom event system
- ✅ Form validators
- ✅ localStorage persistence

## 📁 Structure

```
example/
├── public/
│   └── index.html          # Entry HTML
├── src/
│   ├── components/
│   │   ├── Header.js       # Navigation with auth status
│   │   ├── Footer.js       # Footer component
│   │   ├── Toast.js        # Notifications (custom events)
│   │   ├── TodoItem.js     # Single todo item with checkbox
│   │   └── TodoList.js     # List of todos with reconciliation
│   ├── pages/
│   │   ├── Home.js         # Todo app (local state + localStorage)
│   │   ├── Login.js        # Auth (HTTP POST, validators)
│   │   ├── Posts.js        # Blog (HTTP CRUD, lifecycle)
│   │   ├── About.js        # Static about page
│   │   └── NotFound.js     # 404 handler
│   ├── styles/
│   │   └── main.css        # All styles
│   ├── store.js            # Global state initialization
│   └── index.js            # App entry + routing
├── README.md               # This file
└── package.json            # Project metadata
```

## 🚀 Quick Start

### Option 1: Using run-demo.sh (Recommended)

```bash
# From project root
./run-demo.sh demo
```

This script automatically:
- Checks dependencies
- Starts Python HTTP server on port 8000
- Opens browser at http://localhost:8000

### Option 2: Manual Start

```bash
# From example/public directory
cd example/public
python3 -m http.server 8000

# Open browser manually
http://localhost:8000
```

### 3. Test Features

#### Todo App (Local State + Reconciliation)
1. Add some tasks
2. Toggle completed status
3. Try filters (All/Active/Completed)
4. Refresh → data persists via localStorage

#### Login (HTTP + Validation + Global State)
1. Go to `/login`
2. Use test credentials:
   - Username: `emilys`
   - Password: `emilyspass`
3. Watch Toast notifications
4. Successful login → redirects to Posts

#### Posts (HTTP CRUD + Lifecycle)
1. After login, view posts from DummyJSON API
2. Create a new post (auth required)
3. Delete posts
4. Logout → can't create posts anymore

## 🏗️ Key Features Demonstrated

### 1. Key-based Reconciliation (Todo)

**Problem:** Full re-render loses DOM state (focus, scroll)  
**Solution:** Use `key` prop to reuse DOM nodes

```javascript
// TodoItem.js
{
  type: 'li',
  props: { 
    key: todo.id,  // Enables reconciliation
    class: 'todo-item'
  }
}
```

**Performance:** ~10x faster updates for lists

### 2. Global State Management (Login, Posts)

```javascript
// store.js
export const store = createStore({
  user: { name: '', email: '', token: '', isAuth: false },
  theme: 'light'
});

// Login.js
store.setState({
  user: { email, name, token, isAuth: true }
});

// Posts.js
const isAuth = store.getState().user.isAuth;
```

### 3. HTTP Client (Login, Posts)

```javascript
// POST request
const response = await http.post('https://dummyjson.com/auth/login', {
  username,
  password
});

// GET request
const response = await http.get('https://dummyjson.com/posts?limit=10');
const posts = response.posts;

// DELETE request
await http.delete(`https://dummyjson.com/posts/${id}`);
```

### 4. Custom Events (Toast notifications)

```javascript
// Login.js - Emit event
import { emit } from '../../../framework/src/events/index.js';

emit('notification', { 
  type: 'success', 
  message: 'Login successful!' 
});

// Toast.js - Listen to event
mounted() {
  this._notificationHandler = (event) => {
    this.addNotification(event.detail);
  };
  on('notification', this._notificationHandler);
}

beforeDestroy() {
  off('notification', this._notificationHandler);
}
```

### 5. Form Validation (Login)

```javascript
import { validateEmail } from '../../../framework/src/utils/validator.js';

if (!validateEmail(email)) {
  this.setState({ error: 'Invalid email format' });
  return;
}
```

### 6. Component Lifecycle (Posts)

```javascript
mounted() {
  this.loadPosts(); // Fetch data after component renders
}

async loadPosts() {
  this.setState({ loading: true });
  try {
    const response = await http.get('https://dummyjson.com/posts?limit=10');
    this.setState({ posts: response.posts, loading: false });
  } catch (error) {
    this.setState({ error: 'Failed to load posts', loading: false });
  }
}

beforeDestroy() {
  // Cleanup subscriptions, timers, etc.
}
```

## 🧪 Testing Scenarios

### Scenario 1: Reconciliation Performance
1. Add 50+ todos quickly
2. Toggle completed status on several
3. Switch filters → instant updates (no lag)
4. **Why?** Key-based reconciliation reuses DOM nodes

### Scenario 2: State Persistence
1. Login with test credentials
2. Create some posts
3. Refresh the page
4. Still logged in → localStorage persisted user state

### Scenario 3: Error Handling
1. Try login with wrong password
2. Toast shows error message
3. Auto-dismisses after 3 seconds
4. Try again with correct credentials → success

## 📊 Public APIs Used

### DummyJSON (Authentication & Posts)
- **Auth Endpoint:** https://dummyjson.com/auth/login
- **Posts Endpoints:** 
  - GET /posts?limit=10
  - POST /posts/add
  - DELETE /posts/:id
- **Test Account:** emilys / emilyspass
- **Docs:** https://dummyjson.com/docs
- **Why?** Free unified API for both authentication and CRUD operations, no rate limits

## 🐛 Bugs Fixed During Development

### Bug 1: Toast Notifications Not Showing
- **Issue:** emit('notification') fired but Toast didn't show
- **Cause:** EventDispatcher.handleEvent() checked `shouldHandle()` for direct listeners
- **Fix:** Removed conditional check - direct listeners always execute
- **File:** framework/src/events/dispatcher.js

### Bug 2: React-style Syntax in Toast.js
- **Issue:** className, onClick didn't work
- **Cause:** Used React conventions instead of framework syntax
- **Fix:** Changed to `class`, `onclick`, wrapped children in array
- **File:** example/src/components/Toast.js

### Bug 3: Server Path Issues
- **Issue:** run-demo.sh checked example/node_modules but npm workspaces use root
- **Cause:** Script ran from wrong directory
- **Fix:** Changed to run from project root, check root node_modules
- **File:** run-demo.sh

## 📈 Coverage

| Framework Feature | Demonstrated In | File |
|-------------------|-----------------|------|
| Virtual DOM (h, createElement) | All components | All .js files |
| Component class | All pages | pages/*.js |
| Lifecycle (mounted, beforeDestroy) | Posts, Toast | Posts.js, Toast.js |
| Local State (setState) | Home (Todo), Posts | Home.js, Posts.js |
| Global State (Store) | Login, Posts | store.js, Login.js |
| Router (hash-based) | All pages | index.js |
| HTTP Client (GET/POST/DELETE) | Login, Posts | Login.js, Posts.js |
| Custom Events (on/off/emit) | Login → Toast | Toast.js |
| Event Delegation | Posts list | Posts.js |
| Form Validators | Login | Login.js |
| Key-based Reconciliation | Todo list, Posts | Home.js, Posts.js |
| localStorage | Todo persistence | Home.js |

## 💡 Learning Points

1. **Virtual DOM is powerful** - minimizes real DOM operations (10x faster)
2. **Key-based reconciliation** prevents full re-renders of lists
3. **Global state** should only store shared data (user auth, preferences)
4. **Custom events** enable loose coupling (Toast doesn't know about Login)
5. **Lifecycle hooks** are perfect for async data loading (mounted) and cleanup (beforeDestroy)
6. **Event delegation** saves memory (1 listener vs 1000 for large lists)
7. **Immutability** matters - always create new objects/arrays in setState
8. **Debounce** prevents API spam (search input example)

## 🎯 Best Practices Demonstrated

- ✅ **Cleanup in beforeDestroy**: Always off() event listeners
- ✅ **Keys for lists**: Use unique IDs (uid() or server IDs)
- ✅ **Optimistic UI**: Update state first, rollback on error
- ✅ **Loading states**: Show spinners during async operations
- ✅ **Error handling**: Try/catch for all HTTP requests
- ✅ **Type checking**: Validate props before rendering
- ✅ **Pure functions**: Don't mutate state directly

## 🔗 Related Files

- [../framework/README.md](../framework/README.md) - Framework API documentation
- [../framework/docs/](../framework/docs/) - Additional API reference
- [../run-demo.sh](../run-demo.sh) - Demo launcher script
