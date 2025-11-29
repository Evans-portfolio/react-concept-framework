// Router entry point
// framework/src/router/index.js
export { router } from './router.js';
export { Route } from './route.js';

// Helper component
export function Link({ to, children, ...props }) {
  return {
    type: 'a',
    props: {
      href: to,
      'data-link': true,
      ...props
    },
    children: Array.isArray(children) ? children : [children]
  };
}

// Global navigate helper
export function navigate(to) {
  router.navigate(to);
}