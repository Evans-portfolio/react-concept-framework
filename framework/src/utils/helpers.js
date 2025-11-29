// General helper functions
// framework/src/utils/helpers.js

/**
 * Deep clone an object (handles plain objects and arrays)
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Simple unique ID generator
 */
let idCounter = 0;
export function uid(prefix = 'id') {
  return `${prefix}-${++idCounter}-${Date.now().toString(36)}`;
}

/**
 * Check if value is a plain object
 */
export function isObject(val) {
  return val !== null && typeof val === 'object' && val.constructor === Object;
}