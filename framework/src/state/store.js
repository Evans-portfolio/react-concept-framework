// Global state store
// framework/src/state/store.js
export function createStore(initialState = {}) {
  let state = { ...initialState };
  const listeners = new Set();

  const getState = () => ({ ...state });

  const setState = (updater) => {
    const newState = typeof updater === "function" ? updater(state) : updater;
    state = { ...state, ...newState };
    listeners.forEach(fn => fn());
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}