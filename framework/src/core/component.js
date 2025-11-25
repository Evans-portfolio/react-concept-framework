/**
 * Component base class/factory
 * Like React components - provides state, props, and lifecycle
 */

import { LifecycleManager } from './lifecycle.js';
import { createElement } from '../dom/element.js';
import { patch } from '../dom/diff.js';

/**
 * Base Component class
 */
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this._vnode = null;
    this._element = null;
    this._isMounted = false;
    this._lifecycle = new LifecycleManager(this);
    this._eventHandlers = new Map();

    // Initialize component
    this._lifecycle.create();
  }

  /**
   * Sets component state and triggers re-render
   * @param {Object|Function} update - New state or updater function
   * @param {Function} callback - Optional callback after state update
   */
  setState(update, callback) {
    const oldState = { ...this.state };

    // Handle function or object updates
    const newState = typeof update === 'function'
      ? update(oldState, this.props)
      : update;

    // Merge new state
    this.state = { ...this.state, ...newState };

    // Re-render if mounted
    if (this._isMounted) {
      this.update();
    }

    // Call callback if provided
    if (callback && typeof callback === 'function') {
      callback();
    }
  }

  /**
   * Forces component to re-render
   */
  forceUpdate() {
    if (this._isMounted) {
      this.update();
    }
  }

  /**
   * Updates the component
   */
  update() {
    const oldProps = { ...this.props };
    const oldVNode = this._vnode;

    // Call beforeUpdate hook
    this._lifecycle.callHook('beforeUpdate', oldProps, this.props);

    // Generate new virtual DOM
    const newVNode = this.render();

    // Patch the DOM
    if (this._element && this._element.parentNode) {
      patch(this._element.parentNode, oldVNode, newVNode,
        Array.from(this._element.parentNode.childNodes).indexOf(this._element));
    }

    this._vnode = newVNode;

    // Call updated hook
    this._lifecycle.callHook('updated', oldProps, this.props);
  }

  /**
   * Mounts the component to a DOM element
   * @param {HTMLElement} container - Container element
   */
  mount(container) {
    if (this._isMounted) {
      console.warn('Component is already mounted');
      return;
    }

    // Call beforeMount hook
    this._lifecycle.callHook('beforeMount');

    // Render component
    this._vnode = this.render();
    this._element = createElement(this._vnode);

    // Mount to DOM
    if (container) {
      container.appendChild(this._element);
    }

    this._isMounted = true;

    // Call mounted hook
    this._lifecycle.callHook('mounted');
  }

  /**
   * Unmounts the component
   */
  unmount() {
    if (!this._isMounted) {
      return;
    }

    // Call beforeDestroy hook
    this._lifecycle.callHook('beforeDestroy');

    // Remove from DOM
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }

    // Clean up event handlers
    this._eventHandlers.clear();

    this._isMounted = false;
    this._vnode = null;
    this._element = null;

    // Call destroyed hook
    this._lifecycle.callHook('destroyed');
  }

  /**
   * Render method - must be overridden by subclasses
   * @returns {VNode} Virtual DOM node
   */
  render() {
    throw new Error('Component must implement render() method');
  }

  // Lifecycle hooks - can be overridden by subclasses
  beforeCreate() {}
  created() {}
  beforeMount() {}
  mounted() {}
  beforeUpdate(oldProps, newProps) {}
  updated(oldProps, newProps) {}
  beforeDestroy() {}
  destroyed() {}
}

/**
 * Creates a functional component
 * @param {Function} renderFn - Render function
 * @returns {Component} Component instance
 */
export function createComponent(renderFn) {
  return class extends Component {
    render() {
      return renderFn(this.props, this.state);
    }
  };
}

/**
 * Helper to check if something is a component
 * @param {*} obj - Object to check
 * @returns {boolean} True if obj is a component
 */
export function isComponent(obj) {
  return obj && (obj instanceof Component || obj.prototype instanceof Component);
}
