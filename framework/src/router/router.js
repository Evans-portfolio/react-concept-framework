// Router implementation
// framework/src/router/router.js
import { Route } from './route.js';
import { createApp } from '../core/index.js';

export class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.rootElement = null;
  }

  on(path, component, props = {}) {
    this.routes.push(new Route(path, component, props));
    return this;
  }

  start(rootSelector = '#app') {
    this.rootElement = document.querySelector(rootSelector);
    if (!this.rootElement) throw new Error('Router root element not found');

    // Use hash-based routing for better compatibility with static servers
    const navigate = () => {
      const hash = location.hash.slice(1) || '/'; // Remove # and default to /
      this.resolve(hash);
    };
    
    window.addEventListener('hashchange', navigate);
    window.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        const to = e.target.getAttribute('href');
        this.navigate(to);
      }
    });

    navigate(); // initial render
  }

  navigate(path) {
    location.hash = path;
    // resolve will be called by hashchange event
  }

  resolve(pathname) {
    const cleanPath = pathname.split('?')[0];
    for (const route of this.routes) {
      const match = route.match(cleanPath);
      if (match) {
        const { component: Component, props } = route;
        const allProps = { ...props, params: match.params, query: match.query };
        this.rootElement.innerHTML = '';
        createApp(Component, this.rootElement, allProps);
        this.currentRoute = route;
        return;
      }
    }

    // 404 fallback
    const notFound = this.routes.find(r => r.path === '*');
    if (notFound) {
      createApp(notFound.component, this.rootElement);
    }
  }
}

// Singleton instance
export const router = new Router();