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
    if (!this._isMounted || !this._element) return;

    const oldProps = { ...this.props };

    // Call beforeUpdate hook
    this._lifecycle.callHook('beforeUpdate', oldProps, this.props);
    
    // Generate new virtual DOM
    const newVNode = this.render();

    // Smart reconciliation: update existing element instead of full replacement
    if (this._element && this._vnode) {
      this._reconcile(this._element, this._vnode, newVNode);
    } else if (this._element && this._element.parentNode) {
      // Fallback: full replacement if no old vnode
      const parent = this._element.parentNode;
      const newElement = createElement(newVNode);
      parent.replaceChild(newElement, this._element);
      this._element = newElement;
    }

    this._vnode = newVNode;

    // Call updated hook
    this._lifecycle.callHook('updated', oldProps, this.props);
  }

  /**
   * Reconciles (diffs and patches) old and new virtual DOM nodes
   * @param {HTMLElement} domElement - The real DOM element to update
   * @param {VNode} oldVNode - The old virtual node
   * @param {VNode} newVNode - The new virtual node
   */
  _reconcile(domElement, oldVNode, newVNode) {
    // If nodes are completely different types, replace entirely
    if (!oldVNode || !newVNode || oldVNode.type !== newVNode.type) {
      const newElement = createElement(newVNode);
      if (newElement && domElement.parentNode) {
        domElement.parentNode.replaceChild(newElement, domElement);
        if (domElement === this._element) {
          this._element = newElement;
        }
      }
      return;
    }

    // If it's a text node, update text content if changed
    if (oldVNode.type === 'TEXT_ELEMENT') {
      if (oldVNode.text !== newVNode.text) {
        domElement.textContent = newVNode.text;
      }
      return;
    }

    // Update attributes/properties
    this._updateProps(domElement, oldVNode.props || {}, newVNode.props || {});

    // Reconcile children
    this._reconcileChildren(domElement, oldVNode.children || [], newVNode.children || []);
  }

  /**
   * Updates element properties/attributes
   * @param {HTMLElement} element - DOM element to update
   * @param {Object} oldProps - Old properties
   * @param {Object} newProps - New properties
   */
  _updateProps(element, oldProps, newProps) {
    // Remove old props that don't exist in new props
    Object.keys(oldProps).forEach(key => {
      if (key === 'key') return; // Skip key prop
      if (!(key in newProps)) {
        if (key.startsWith('on') && typeof oldProps[key] === 'function') {
          const eventName = key.substring(2).toLowerCase();
          element.removeEventListener(eventName, oldProps[key]);
        } else if (key === 'className' || key === 'class') {
          element.removeAttribute('class');
        } else if (key === 'checked' || key === 'value' || key === 'selected') {
          element[key] = key === 'checked' || key === 'selected' ? false : '';
        } else {
          element.removeAttribute(key);
        }
      }
    });

    // Set new props
    Object.keys(newProps).forEach(key => {
      if (key === 'key') return; // Skip key prop
      if (oldProps[key] !== newProps[key]) {
        if (key.startsWith('on') && typeof newProps[key] === 'function') {
          const eventName = key.substring(2).toLowerCase();
          // Remove old listener if exists
          if (typeof oldProps[key] === 'function') {
            element.removeEventListener(eventName, oldProps[key]);
          }
          element.addEventListener(eventName, newProps[key]);
        } else if (key === 'className' || key === 'class') {
          element.setAttribute('class', newProps[key]);
        } else if (key === 'checked' || key === 'value' || key === 'selected') {
          element[key] = newProps[key];
        } else if (key === 'style' && typeof newProps[key] === 'object') {
          Object.assign(element.style, newProps[key]);
        } else {
          element.setAttribute(key, newProps[key]);
        }
      }
    });
  }

  /**
   * Reconciles children using key-based algorithm
   * @param {HTMLElement} parentElement - Parent DOM element
   * @param {Array} oldChildren - Old virtual children
   * @param {Array} newChildren - New virtual children
   */
  _reconcileChildren(parentElement, oldChildren, newChildren) {
    // Build a map of old children by key
    const oldKeyedMap = new Map();
    const oldChildNodes = Array.from(parentElement.childNodes);
    const processedDomNodes = new Set();
    
    oldChildren.forEach((child, index) => {
      if (child && child.props && child.props.key !== undefined) {
        oldKeyedMap.set(child.props.key, { vnode: child, dom: oldChildNodes[index] });
      }
    });

    let currentDomIndex = 0;

    newChildren.forEach((newChild, newIndex) => {
      if (!newChild) return;

      let oldChild = null;
      let domNode = null;

      // Try to find matching old child by key
      if (newChild.props && newChild.props.key !== undefined) {
        const match = oldKeyedMap.get(newChild.props.key);
        if (match) {
          oldChild = match.vnode;
          domNode = match.dom;
          oldKeyedMap.delete(newChild.props.key); // Mark as used
        }
      } else {
        // For unkeyed children, match by position
        oldChild = oldChildren[newIndex];
        domNode = oldChildNodes[newIndex];
      }

      // Check if types match - if not, need to replace
      if (oldChild && domNode && domNode.nodeType === Node.ELEMENT_NODE) {
        if (oldChild.type !== newChild.type) {
          // Types don't match, replace entirely
          const newElement = createElement(newChild);
          if (newElement) {
            parentElement.replaceChild(newElement, domNode);
            processedDomNodes.add(newElement);
            currentDomIndex++;
          }
        } else {
          // Same type, reconcile existing element
          this._reconcile(domNode, oldChild, newChild);
          
          // Move to correct position if needed
          const targetPosition = parentElement.childNodes[currentDomIndex];
          if (targetPosition !== domNode) {
            parentElement.insertBefore(domNode, targetPosition || null);
          }
          processedDomNodes.add(domNode);
          currentDomIndex++;
        }
      } else {
        // Create new element
        const newElement = createElement(newChild);
        if (newElement) {
          const targetPosition = parentElement.childNodes[currentDomIndex];
          parentElement.insertBefore(newElement, targetPosition || null);
          processedDomNodes.add(newElement);
          currentDomIndex++;
        }
      }
    });

    // Remove all old DOM nodes that weren't processed
    oldChildNodes.forEach(node => {
      if (!processedDomNodes.has(node) && node.parentNode === parentElement) {
        parentElement.removeChild(node);
      }
    });
  }

  /**
   * Update element in place by comparing vnodes
   */
  _updateElement(element, oldVNode, newVNode) {
    // If types are different, replace entirely
    if (oldVNode.type !== newVNode.type) {
      const newElement = createElement(newVNode);
      element.parentNode.replaceChild(newElement, element);
      this._element = newElement;
      return;
    }

    // Update text nodes
    if (newVNode.type === 'TEXT_ELEMENT') {
      if (oldVNode.text !== newVNode.text) {
        element.textContent = newVNode.text;
      }
      return;
    }

    // Update props
    this._updateProps(element, oldVNode.props || {}, newVNode.props || {});

    // Update children
    this._updateChildren(element, oldVNode.children || [], newVNode.children || []);
  }

  /**
   * Update element props
   */
  _updateProps(element, oldProps, newProps) {
    // Track which event listeners to update
    const eventListenersToUpdate = new Set();
    
    // Remove old props
    Object.keys(oldProps).forEach(key => {
      if (!(key in newProps)) {
        if (key.startsWith('on')) {
          eventListenersToUpdate.add(key);
        } else if (key === 'class' || key === 'className') {
          element.className = '';
        } else if (key === 'checked' || key === 'value') {
          element[key] = false;
        } else {
          element.removeAttribute(key);
        }
      }
    });

    // Add/update new props
    Object.keys(newProps).forEach(key => {
      const value = newProps[key];
      const shouldUpdate = oldProps[key] !== newProps[key] || 
                          key === 'checked' || 
                          key === 'value' ||
                          key.startsWith('on');
      
      if (shouldUpdate) {
        if (key === 'class' || key === 'className') {
          element.className = value;
        } else if (key === 'checked') {
          // Force update checked property
          const newChecked = !!value;
          if (element.checked !== newChecked) {
            element.checked = newChecked;
          }
        } else if (key === 'value') {
          element.value = value || '';
        } else if (key === 'selected') {
          element.selected = !!value;
        } else if (key.startsWith('on')) {
          eventListenersToUpdate.add(key);
        } else if (value != null) {
          element.setAttribute(key, value);
        }
      }
    });

    // Update event listeners
    eventListenersToUpdate.forEach(key => {
      const eventType = key.substring(2).toLowerCase();
      
      // Remove old listener if exists
      if (oldProps[key]) {
        element.removeEventListener(eventType, oldProps[key]);
      }
      
      // Add new listener if exists
      if (newProps[key]) {
        element.addEventListener(eventType, newProps[key]);
      }
    });
  }

  /**
   * Update children elements
   */
  _updateChildren(element, oldChildren, newChildren) {
    // Build a map of existing elements by data-id
    const existingElements = new Map();
    Array.from(element.childNodes).forEach((node, index) => {
      if (node.nodeType === 1) { // Element node
        const dataId = node.getAttribute('data-id');
        if (dataId) {
          existingElements.set(dataId, { node, oldChild: oldChildren[index] });
        } else {
          existingElements.set(`__index_${index}`, { node, oldChild: oldChildren[index] });
        }
      } else {
        existingElements.set(`__index_${index}`, { node, oldChild: oldChildren[index] });
      }
    });

    // Process new children
    newChildren.forEach((newChild, index) => {
      const dataId = newChild.props && newChild.props['data-id'];
      const key = dataId || `__index_${index}`;
      const existing = existingElements.get(key);

      if (existing) {
        // Update existing element
        const { node, oldChild } = existing;
        
        // Make sure it's in the right position
        const currentNode = element.childNodes[index];
        if (currentNode !== node) {
          element.insertBefore(node, currentNode);
        }
        
        // Update the element
        if (oldChild) {
          this._updateElement(node, oldChild, newChild);
        }
        
        existingElements.delete(key);
      } else {
        // Create new element
        const newElement = createElement(newChild);
        if (element.childNodes[index]) {
          element.insertBefore(newElement, element.childNodes[index]);
        } else {
          element.appendChild(newElement);
        }
      }
    });

    // Remove unused elements
    existingElements.forEach(({ node }) => {
      if (node.parentNode === element) {
        element.removeChild(node);
      }
    });
  }

  /**
   * Recursively remove event listeners from element tree
   * @param {HTMLElement} element - Element to clean
   */
  _removeEventListeners(element) {
    if (!element) return;
    
    // Clone and replace to remove all event listeners
    const clone = element.cloneNode(false);
    while (element.firstChild) {
      clone.appendChild(element.firstChild);
    }
    
    // Recursively clean children
    Array.from(clone.children).forEach(child => {
      this._removeEventListeners(child);
    });
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
