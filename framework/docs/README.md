# Framework Documentation

Welcome to the complete documentation for our JavaScript frontend framework!

## Getting Started

New to the framework? Start here:

1. [Getting Started](./01-getting-started.md) - Build your first app in 5 minutes
2. [Installation](./03-installation.md) - Setup and configuration
3. [Architecture](./02-architecture.md) - Understand how it works

## Core Concepts

Learn the fundamental building blocks:

- **[Components](./04-components.md)** - Building blocks of your UI
  - Class components and functional components
  - Props and state
  - Lifecycle hooks
  - Component composition

- **[State Management](./05-state-management.md)** - Managing application state
  - Component state with `setState()`
  - Global state with stores
  - Reactive updates
  - State persistence

- **[Routing](./06-routing.md)** - Client-side navigation
  - Hash-based routing
  - Dynamic routes and parameters
  - Navigation and links
  - Route guards

## Advanced Topics

- **[Event Handling](./07-event-handling.md)** - User interactions
  - DOM events
  - Custom events
  - Event delegation
  - Event handlers

- **[DOM Manipulation](./08-dom-manipulation.md)** - Working with the DOM
  - Virtual DOM
  - The `h()` function
  - Reconciliation and diffing
  - Direct DOM access

- **[HTTP Client](./09-http-client.md)** - API communication
  - Making requests
  - Error handling
  - Interceptors
  - Best practices

- **[Best Practices](./10-best-practices.md)** - Write better code
  - Performance optimization
  - Code organization
  - Testing strategies
  - Common patterns

## API Reference

Detailed API documentation:

- [Component API](./api/component-api.md) - Complete Component class reference
- [State API](./api/state-api.md) - State management functions
- [Router API](./api/router-api.md) - Routing system API
- [DOM API](./api/dom-api.md) - Virtual DOM functions

## Quick Reference

### Creating a Component

```javascript
import { Component, h } from '../framework/src/core/index.js';

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return h('div', {},
      h('h1', {}, `Count: ${this.state.count}`),
      h('button', {
        onClick: () => this.setState({ count: this.state.count + 1 })
      }, 'Increment')
    );
  }
}
```

### Using the Router

```javascript
import { router } from '../framework/src/router/index.js';
import HomePage from './pages/Home.js';
import AboutPage from './pages/About.js';

router
  .on('/', HomePage)
  .on('/about', AboutPage)
  .on('/users/:id', UserPage)
  .start('#app');
```

### Making HTTP Requests

```javascript
import { http } from '../framework/src/http/index.js';

const users = await http.get('https://api.example.com/users');
const newUser = await http.post('https://api.example.com/users', {
  name: 'John',
  email: 'john@example.com'
});
```

## Examples

Check out the `/example` directory for a complete working application that demonstrates:
- Todo list with local storage
- User authentication flow
- API integration
- Routing between pages
- Global state management
- Custom components

## Need Help?

- Check the [Best Practices](./10-best-practices.md) guide
- Review examples in `/example` directory
- Read the source code - it's well-commented!

## Contributing

Found an error in the docs? Please submit a pull request!
