// Application entry point
import { router } from '../../framework/src/router/index.js';
import HomePage from './pages/Home.js';
import AboutPage from './pages/About.js';
import NotFoundPage from './pages/NotFound.js';
import LoginPage from './pages/Login.js';
import PostsPage from './pages/Posts.js';
import { Toast } from './components/Toast.js';
import './store.js'; // Initialize global store

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Toast component for notifications
  const toast = new Toast();
  const toastContainer = document.querySelector('#toast-root');
  if (toastContainer) {
    toast.mount(toastContainer);
  }

  // Настроить маршруты
  router.on('/', HomePage);
  router.on('/about', AboutPage);
  router.on('/login', LoginPage);
  router.on('/posts', PostsPage);
  router.on('*', NotFoundPage); // Fallback для 404

  // Запустить роутер
  router.start('#app');
});
