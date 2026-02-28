// Router entry point
// framework/src/router/index.js
import { router as routerInstance } from './router.js';

export { router } from './router.js';
export { Route } from './route.js';

// Helper component
export function Link({ to, children, ...props }) {
  // Normalize children to array and convert strings to text nodes
  const normalizedChildren = (Array.isArray(children) ? children : [children])
    .map(child => 
      typeof child === 'string' || typeof child === 'number'
        ? { type: 'TEXT_ELEMENT', props: {}, children: [], text: String(child) }
        : child
    );

  return {
    type: 'a',
    props: {
      href: to,
      'data-link': true,
      ...props
    },
    children: normalizedChildren
  };
}

// Global navigate helper
export function navigate(to) {
  routerInstance.navigate(to);
}
