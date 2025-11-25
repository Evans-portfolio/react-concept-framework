/**
 * Core framework entry point
 * Exports main framework functionality
 */

export { Component, createComponent, isComponent } from './component.js';
export { LifecycleManager, LifecycleHooks } from './lifecycle.js';
export { h, createElement } from '../dom/element.js';
export { on, off, emit, once } from '../events/index.js';

/**
 * Creates and mounts an application
 * @param {Component} RootComponent - Root component class
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Object} props - Props to pass to root component
 * @returns {Component} Mounted component instance
 */
export function createApp(RootComponent, container, props = {}) {
  // Get container element
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) {
    throw new Error('Container element not found');
  }

  // Create and mount component
  const app = new RootComponent(props);
  app.mount(el);

  return app;
}
