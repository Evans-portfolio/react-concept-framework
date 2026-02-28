/**
 * Router unit tests
 */

import { Router } from '../../src/router/router.js';
import { Route } from '../../src/router/route.js';
import { Component } from '../../src/core/component.js';
import { h } from '../../src/dom/element.js';
import { jest } from '@jest/globals';

describe('Router', () => {
  let router;
  let container;

  beforeEach(() => {
    // Setup DOM
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
    
    // Reset location hash
    window.location.hash = '';
    
    router = new Router();
  });

  afterEach(() => {
    document.body.removeChild(container);
    window.location.hash = '';
  });

  test('should create router instance', () => {
    expect(router).toBeInstanceOf(Router);
    expect(router.routes).toEqual([]);
    expect(router.currentRoute).toBeNull();
  });

  test('should register routes', () => {
    class HomePage extends Component {
      render() {
        return h('div', {}, 'Home');
      }
    }

    router.on('/', HomePage);
    
    expect(router.routes).toHaveLength(1);
    expect(router.routes[0]).toBeInstanceOf(Route);
  });

  test('should register multiple routes', () => {
    class HomePage extends Component {
      render() { return h('div', {}, 'Home'); }
    }
    class AboutPage extends Component {
      render() { return h('div', {}, 'About'); }
    }

    router.on('/', HomePage).on('/about', AboutPage);
    
    expect(router.routes).toHaveLength(2);
  });

  test('should navigate to route', (done) => {
    class HomePage extends Component {
      render() {
        return h('div', { class: 'home' }, 'Home Page');
      }
    }

    router.on('/', HomePage);
    router.start('#app');

    // Wait for hashchange event
    setTimeout(() => {
      const homeElement = container.querySelector('.home');
      expect(homeElement).toBeTruthy();
      expect(homeElement.textContent).toBe('Home Page');
      done();
    }, 100);
  });

  test('should handle route navigation', (done) => {
    class HomePage extends Component {
      render() { return h('div', { class: 'home' }, 'Home'); }
    }
    class AboutPage extends Component {
      render() { return h('div', { class: 'about' }, 'About'); }
    }

    router.on('/', HomePage).on('/about', AboutPage);
    router.start('#app');

    setTimeout(() => {
      router.navigate('/about');
      
      setTimeout(() => {
        const aboutElement = container.querySelector('.about');
        expect(aboutElement).toBeTruthy();
        expect(aboutElement.textContent).toBe('About');
        done();
      }, 100);
    }, 100);
  });

  test('should handle 404 fallback', (done) => {
    class HomePage extends Component {
      render() { return h('div', {}, 'Home'); }
    }
    class NotFoundPage extends Component {
      render() { return h('div', { class: 'not-found' }, '404'); }
    }

    router.on('/', HomePage).on('*', NotFoundPage);
    router.start('#app');

    setTimeout(() => {
      router.navigate('/unknown-route');
      
      setTimeout(() => {
        const notFoundElement = container.querySelector('.not-found');
        expect(notFoundElement).toBeTruthy();
        done();
      }, 100);
    }, 100);
  });

  test('should throw error if root element not found', () => {
    expect(() => {
      router.start('#non-existent');
    }).toThrow('Router root element not found');
  });
});

describe('Route', () => {
  test('should match exact path', () => {
    class TestComponent extends Component {
      render() { return h('div', {}, 'Test'); }
    }
    
    const route = new Route('/', TestComponent);
    
    expect(route.match('/')).toBeTruthy();
    expect(route.match('/about')).toBeFalsy();
  });

  test('should match path with params', () => {
    class TestComponent extends Component {
      render() { return h('div', {}, 'Test'); }
    }
    
    const route = new Route('/user/:id', TestComponent);
    const match = route.match('/user/123');
    
    expect(match).toBeTruthy();
    expect(match.params.id).toBe('123');
  });

  test('should match wildcard route', () => {
    class TestComponent extends Component {
      render() { return h('div', {}, 'Test'); }
    }
    
    const route = new Route('*', TestComponent);
    
    expect(route.match('/any/path')).toBeTruthy();
    expect(route.match('/')).toBeTruthy();
  });
});
