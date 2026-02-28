/**
 * Event delegation and handling system
 * Efficient event handling using event delegation
 */

/**
 * Event dispatcher for managing events with delegation
 */
export class EventDispatcher {
  constructor(root = document) {
    this.root = root;
    this.listeners = new Map();
    this.delegatedEvents = new Set();
  }

  /**
   * Registers an event listener with delegation
   * @param {string} eventType - Event type (e.g., 'click', 'input')
   * @param {string|Function} selector - CSS selector or handler function
   * @param {Function} handler - Event handler (if selector provided)
   * @param {Object} options - Event options
   */
  on(eventType, selector, handler, options = {}) {
    // Handle direct binding (no selector)
    if (typeof selector === 'function') {
      handler = selector;
      selector = null;
    }

    // Set up delegation for this event type if not already done
    if (!this.delegatedEvents.has(eventType)) {
      this.setupDelegation(eventType);
    }

    // Store listener
    const key = this.getListenerKey(eventType, selector);
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    this.listeners.get(key).push({
      handler,
      options,
      selector
    });
  }

  /**
   * Removes an event listener
   * @param {string} eventType - Event type
   * @param {string|Function} selector - CSS selector or handler
   * @param {Function} handler - Event handler
   */
  off(eventType, selector, handler) {
    if (typeof selector === 'function') {
      handler = selector;
      selector = null;
    }

    const key = this.getListenerKey(eventType, selector);
    const listeners = this.listeners.get(key);

    if (listeners) {
      const index = listeners.findIndex(l => l.handler === handler);
      if (index !== -1) {
        listeners.splice(index, 1);
      }

      if (listeners.length === 0) {
        this.listeners.delete(key);
      }
    }
  }

  /**
   * Emits a custom event
   * @param {string} eventType - Event type
   * @param {Object} detail - Event detail
   * @param {HTMLElement} target - Target element
   */
  emit(eventType, detail = {}, target = this.root) {
    const event = new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true,
      detail
    });

    target.dispatchEvent(event);
  }

  /**
   * Sets up event delegation for a specific event type
   * @param {string} eventType - Event type
   */
  setupDelegation(eventType) {
    this.delegatedEvents.add(eventType);

    this.root.addEventListener(eventType, (event) => {
      this.handleEvent(event);
    }, true);
  }

  /**
   * Handles delegated events
   * @param {Event} event - DOM event
   */
  handleEvent(event) {
    const eventType = event.type;
    let target = event.target;

    // Check for direct listeners (no selector)
    const directKey = this.getListenerKey(eventType, null);
    const directListeners = this.listeners.get(directKey);

    if (directListeners) {
      directListeners.forEach(({ handler, options }) => {
        this.executeHandler(handler, event, target, options);
      });
    }

    // Walk up the DOM tree for delegated listeners
    while (target && target !== this.root) {
      // Check for delegated listeners (with selectors)
      this.listeners.forEach((listeners, key) => {
        if (key.startsWith(`${eventType}:`)) {
          listeners.forEach(({ handler, selector, options }) => {
            if (selector && this.shouldHandle(target, selector)) {
              this.executeHandler(handler, event, target, options);
            }
          });
        }
      });

      target = target.parentElement;
    }
  }

  /**
   * Checks if a target matches a selector
   * @param {HTMLElement} target - Target element
   * @param {string} selector - CSS selector
   * @returns {boolean} True if target matches selector
   */
  shouldHandle(target, selector) {
    if (!selector) return true;
    return target.matches && target.matches(selector);
  }

  /**
   * Executes an event handler
   * @param {Function} handler - Handler function
   * @param {Event} event - DOM event
   * @param {HTMLElement} target - Target element
   * @param {Object} options - Handler options
   */
  executeHandler(handler, event, target, options) {
    try {
      handler.call(target, event);

      if (options.once) {
        this.off(event.type, target, handler);
      }
    } catch (error) {
      console.error('Error in event handler:', error);
    }
  }

  /**
   * Gets a unique key for a listener
   * @param {string} eventType - Event type
   * @param {string} selector - CSS selector
   * @returns {string} Listener key
   */
  getListenerKey(eventType, selector) {
    return selector ? `${eventType}:${selector}` : eventType;
  }

  /**
   * Removes all listeners
   */
  clear() {
    this.listeners.clear();
    this.delegatedEvents.clear();
  }
}

/**
 * Global event dispatcher instance
 */
export const globalDispatcher = new EventDispatcher();

/**
 * Convenience methods for common operations
 */
export const on = (eventType, selector, handler, options) =>
  globalDispatcher.on(eventType, selector, handler, options);

export const off = (eventType, selector, handler) =>
  globalDispatcher.off(eventType, selector, handler);

export const emit = (eventType, detail, target) =>
  globalDispatcher.emit(eventType, detail, target);

export const once = (eventType, selector, handler) =>
  globalDispatcher.on(eventType, selector, handler, { once: true });
