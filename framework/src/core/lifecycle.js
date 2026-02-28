/**
 * Component lifecycle management
 * Defines lifecycle hooks and their execution order
 */

/**
 * Lifecycle hooks available to components
 */
export const LifecycleHooks = {
  BEFORE_CREATE: 'beforeCreate',
  CREATED: 'created',
  BEFORE_MOUNT: 'beforeMount',
  MOUNTED: 'mounted',
  BEFORE_UPDATE: 'beforeUpdate',
  UPDATED: 'updated',
  BEFORE_DESTROY: 'beforeDestroy',
  DESTROYED: 'destroyed'
};

/**
 * Manages component lifecycle
 */
export class LifecycleManager {
  constructor(component) {
    this.component = component;
    this.currentPhase = null;
  }

  /**
   * Calls a lifecycle hook if it exists
   * @param {string} hook - Hook name
   * @param {...any} args - Arguments to pass to the hook
   */
  callHook(hook, ...args) {
    this.currentPhase = hook;

    if (this.component[hook] && typeof this.component[hook] === 'function') {
      try {
        return this.component[hook](...args);
      } catch (error) {
        console.error(`Error in ${hook} hook:`, error);
        throw error;
      }
    }
  }

  /**
   * Executes the creation lifecycle
   */
  create() {
    this.callHook(LifecycleHooks.BEFORE_CREATE);
    this.callHook(LifecycleHooks.CREATED);
  }

  /**
   * Executes the mounting lifecycle
   */
  mount() {
    this.callHook(LifecycleHooks.BEFORE_MOUNT);
    this.callHook(LifecycleHooks.MOUNTED);
  }

  /**
   * Executes the update lifecycle
   */
  update(oldProps, newProps) {
    this.callHook(LifecycleHooks.BEFORE_UPDATE, oldProps, newProps);
    this.callHook(LifecycleHooks.UPDATED, oldProps, newProps);
  }

  /**
   * Executes the destruction lifecycle
   */
  destroy() {
    this.callHook(LifecycleHooks.BEFORE_DESTROY);
    this.callHook(LifecycleHooks.DESTROYED);
  }

  /**
   * Gets the current lifecycle phase
   */
  getCurrentPhase() {
    return this.currentPhase;
  }
}
