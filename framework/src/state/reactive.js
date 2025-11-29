// Reactivity system
// framework/src/state/reactive.js
import { createStore } from './store.js';

let globalStore = null;
let subscribers = new Set();

export function setGlobalStore(store) {
  globalStore = store;
  subscribers = new Set();
}

export function notify() {
  subscribers.forEach(fn => fn());
}

export function reactive(key) {
  const listener = () => notify();

  // subscribe once
  globalStore.subscribe(listener);

  return {
    get value() {
      return globalStore.getState()[key];
    },
    [Symbol.iterator]: function* () {
      const arr = globalStore.getState()[key];
      if (Array.isArray(arr)) yield* arr;
    },
  };
}

// convenience
export const useStore = () => globalStore;