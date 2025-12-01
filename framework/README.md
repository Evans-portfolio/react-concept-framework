# Framework Core

A lightweight, modern JavaScript frontend framework with a React-like API, built from scratch.

## Features

- **Component-Based**: Build UIs with reusable components using familiar patterns
- **Virtual DOM**: Efficient rendering with smart reconciliation
- **Lifecycle Hooks**: 8 lifecycle methods for complete control
- **State Management**: Built-in reactive state with global store
- **Routing**: Hash-based router with dynamic parameters
- **Event System**: Efficient event delegation
- **HTTP Client**: Promise-based API client
- **Lightweight**: No dependencies, ~10KB minified

## Quick Start

```javascript
import { Component, h, createApp } from './framework/src/core/index.js';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState(state => ({ count: state.count + 1 }));
  }

  render() {
    return h('div', {},
      h('h1', {}, `Count: ${this.state.count}`),
      h('button', { onClick: this.increment }, 'Increment')
    );
  }
}

createApp(Counter, '#app');
```

## Structure

- `src/` - Framework source code
  - `core/` - Component system and lifecycle
  - `dom/` - Virtual DOM and rendering
  - `events/` - Event delegation system
  - `router/` - Client-side routing
  - `state/` - State management
  - `http/` - HTTP client
  - `utils/` - Utility functions
- `dist/` - Built/bundled files
- `docs/` - Comprehensive documentation
- `tests/` - Unit and integration tests
- `examples/` - Code examples

## Documentation

- [Getting Started](docs/01-getting-started.md)
- [Architecture](docs/02-architecture.md)
- [Installation](docs/03-installation.md)
- [Components](docs/04-components.md)
- [State Management](docs/05-state-management.md)
- [Routing](docs/06-routing.md)
- [Event Handling](docs/07-event-handling.md)
- [DOM Manipulation](docs/08-dom-manipulation.md)
- [HTTP Client](docs/09-http-client.md)
- [Best Practices](docs/10-best-practices.md)

## API Reference

- [Component API](docs/api/component-api.md)
- [State API](docs/api/state-api.md)
- [Router API](docs/api/router-api.md)
- [DOM API](docs/api/dom-api.md)

## Development

```bash
# Run tests
npm test

# Build framework
npm run build

# Run example app
cd ../example && npm run dev
```

## License

ISC
