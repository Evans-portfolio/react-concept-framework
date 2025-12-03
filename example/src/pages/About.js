// About page
import { h } from '../../../framework/src/dom/index.js';
import { Component } from '../../../framework/src/core/index.js';
import Header from '../components/Header.js';

export default class AboutPage extends Component {
  render() {
    return h('div', { class: 'about-page' }, [
      Header(),
      h('div', { class: 'content' }, [
        h('h2', {}, 'About Demo Application'),
        h('p', {}, 'This demo application showcases all capabilities of our custom framework through three different pages.'),
        
        h('h3', {}, '📋 Todo Page'),
        h('p', {}, 'Classic Todo application demonstrates:'),
        h('ul', {}, [
          h('li', {}, '✅ Local component state (Component.state)'),
          h('li', {}, '✅ Key-based reconciliation for optimized rendering'),
          h('li', {}, '✅ localStorage for data persistence'),
          h('li', {}, '✅ Event handling (checkbox, input, delete)'),
          h('li', {}, '✅ Data filtering (All, Active, Completed)')
        ]),

        h('h3', {}, '🔐 Login Page'),
        h('p', {}, 'Authentication page demonstrates:'),
        h('ul', {}, [
          h('li', {}, '✅ HTTP POST requests (http.post)'),
          h('li', {}, '✅ Form validation (validateEmail)'),
          h('li', {}, '✅ Global state (store.setState)'),
          h('li', {}, '✅ Custom events (emit/on for notifications)'),
          h('li', {}, '✅ External API integration (DummyJSON)')
        ]),
        h('p', { class: 'demo-hint' }, [
          h('strong', {}, 'Test credentials: '),
          h('code', {}, 'emilys'),
          h('span', {}, ' / '),
          h('code', {}, 'emilyspass')
        ]),

        h('h3', {}, '📝 Posts Page'),
        h('p', {}, 'Posts page demonstrates:'),
        h('ul', {}, [
          h('li', {}, '✅ HTTP GET/POST/DELETE requests'),
          h('li', {}, '✅ Lifecycle hooks (mounted)'),
          h('li', {}, '✅ Loading and error states'),
          h('li', {}, '✅ Conditional rendering based on auth'),
          h('li', {}, '✅ Optimistic UI updates'),
          h('li', {}, '✅ DummyJSON API integration')
        ]),

        h('h3', {}, '🔔 Toast Notifications'),
        h('p', {}, 'Notification component (appears on actions):'),
        h('ul', {}, [
          h('li', {}, '✅ Custom event system (on/off/emit)'),
          h('li', {}, '✅ Global component'),
          h('li', {}, '✅ Auto-dismiss after 3 seconds'),
          h('li', {}, '✅ CSS animations')
        ]),

        h('h3', {}, '🎯 Framework Coverage'),
        h('p', {}, 'All major features demonstrated:'),
        h('ul', {}, [
          h('li', {}, 'Virtual DOM with reconciliation'),
          h('li', {}, 'Component lifecycle (mounted, updated, beforeDestroy)'),
          h('li', {}, 'State management (local and global)'),
          h('li', {}, 'HTTP client (GET, POST, DELETE)'),
          h('li', {}, 'Hash-based routing'),
          h('li', {}, 'Custom events (pub/sub)'),
          h('li', {}, 'Validators'),
          h('li', {}, 'localStorage persistence')
        ]),

        h('h3', {}, '🚀 Technologies'),
        h('ul', {}, [
          h('li', {}, 'Pure JavaScript ES6+ (modules)'),
          h('li', {}, 'Fetch API for HTTP requests'),
          h('li', {}, 'Web Components pattern'),
          h('li', {}, 'Reactive state management'),
          h('li', {}, 'Virtual DOM for performance')
        ]),

        h('p', { style: 'margin-top: 30px; padding: 15px; background: #f0f8ff; border-radius: 6px;' }, [
          h('strong', {}, '💡 Tip: '),
          h('span', {}, 'Open DevTools → Network to see real HTTP requests to external APIs!')
        ])
      ])
    ]);
  }
}
