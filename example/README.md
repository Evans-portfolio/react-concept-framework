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
│   │   ├── TodoItem.js     # Todo with reconciliation
│   │   └── Toast.js        # Notifications (custom events)
│   ├── pages/
│   │   ├── Home.js         # Todo app (local state)
│   │   ├── Login.js        # Auth (HTTP POST, validators)
│   │   ├── Posts.js        # Blog (HTTP CRUD, lifecycle)
│   │   ├── About.js        # Static page
│   │   └── NotFound.js     # 404 handler
│   ├── styles/
│   │   └── main.css        # All styles
│   ├── store.js            # Global state initialization
│   └── index.js            # App entry + routing
└── DEMO.md                 # Detailed documentation
```

## 🚀 Quick Start

### 1. Start Server

```bash
cd public
python3 -m http.server 8000
```

### 2. Open Browser

http://localhost:8000

### 3. Test Features

#### Todo App (Local State + Reconciliation)
1. Add some tasks
2. Toggle completed status
3. Try filters (All/Active/Completed)
4. Refresh → data persists via localStorage

#### Login (HTTP + Validation + Global State)
1. Go to `/login`
2. Use test credentials:
   - Email: `eve.holt@reqres.in`
   - Password: `cityslicka`
3. Watch Toast notifications
4. Successful login → redirects to Posts

#### Posts (HTTP CRUD + Lifecycle)
1. After login, view posts from JSONPlaceholder API
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
const response = await http.post('https://reqres.in/api/login', {
  email,
  password
});

// GET request
const posts = await http.get('https://jsonplaceholder.typicode.com/posts?_limit=10');

// DELETE request
await http.delete(`https://jsonplaceholder.typicode.com/posts/${id}`);
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
componentDidMount() {
  this.on('notification', (event) => {
    this.addNotification(event.detail);
  });
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
componentDidMount() {
  this.loadPosts(); // Fetch data after component renders
}

async loadPosts() {
  this.setState({ loading: true });
  const posts = await http.get('...');
  this.setState({ posts, loading: false });
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

### ReqRes.in (Login)
- **Endpoint:** https://reqres.in/api/login
- **Method:** POST
- **Test Account:** eve.holt@reqres.in / cityslicka
- **Why?** Real authentication without backend

### JSONPlaceholder (Posts)
- **Endpoints:** 
  - GET /posts?_limit=10
  - POST /posts
  - DELETE /posts/:id
- **Why?** Test CRUD operations without backend

## 🐛 Bugs Fixed During Development

### Bug 1: Checkbox Only Worked Once
- **Issue:** Click checkbox → works. Click again → nothing
- **Cause:** Browser cached old component.js without update()
- **Fix:** Implemented key-based reconciliation

### Bug 2: "appendChild on Text Node"
- **Issue:** Crash when reconciling children
- **Cause:** Trying to append child to text node
- **Fix:** Type checking in _reconcileChildren

### Bug 3: UL → DIV Transition Crashed
- **Issue:** Changing element type broke reconciliation
- **Cause:** Incompatible element reuse
- **Fix:** Check `oldChild.type !== newChild.type` → replace

## 📈 Coverage

| Framework Feature | Demonstrated In | Lines of Code |
|-------------------|-----------------|---------------|
| Virtual DOM | All components | ~1500 |
| Components | All pages | ~800 |
| State (local) | Todo, Posts | ~300 |
| State (global) | Login, Posts | ~50 |
| Router | All pages | ~200 |
| HTTP client | Login, Posts | ~100 |
| Events (DOM) | All components | ~200 |
| Events (custom) | Login → Toast | ~80 |
| Validators | Login | ~20 |
| Reconciliation | Todo, Posts | ~150 |

**Total: ~3400 lines of example code**

## 💡 Learning Points

1. **Reconciliation is crucial** for performance with dynamic lists
2. **Global state** should only store shared data (auth, theme)
3. **Custom events** enable loose coupling between components
4. **Lifecycle methods** are perfect for async data loading
5. **Type checking** prevents crashes during reconciliation

## 🔗 Related Files

- [DEMO.md](./DEMO.md) - Detailed demo walkthrough
- [../../framework/README.md](../../framework/README.md) - Framework docs
- [../../framework/docs/](../../framework/docs/) - API reference

## 🎓 Next Steps

- Add more pages to practice routing
- Implement theme switcher (global state)
- Add form validation to Posts
- Write integration tests
- Deploy to GitHub Pages
