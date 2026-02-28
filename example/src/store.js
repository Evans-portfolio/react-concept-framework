// Global application store
import { createStore, setGlobalStore } from '../../framework/src/state/index.js';

// Initial state
const initialState = {
  user: {
    name: null,
    email: null,
    token: null,
    isAuth: false
  },
  theme: 'light'
};

// Create and initialize global store
const store = createStore(initialState);
setGlobalStore(store);

// Load persisted state from localStorage
const savedUser = localStorage.getItem('user');
if (savedUser) {
  try {
    const user = JSON.parse(savedUser);
    store.setState({ user });
  } catch (e) {
    console.error('Failed to load user from localStorage');
  }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  store.setState({ theme: savedTheme });
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Subscribe to store changes to persist
store.subscribe(() => {
  const state = store.getState();
  
  // Persist user
  localStorage.setItem('user', JSON.stringify(state.user));
  
  // Persist theme
  localStorage.setItem('theme', state.theme);
  document.documentElement.setAttribute('data-theme', state.theme);
});

export { store };
export default store;
