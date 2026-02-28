// Input validation utilities
// framework/src/utils/validator.js
// Simple validation helpers (can be empty or minimal)

export function required(value) {
  return value !== undefined && value !== null && value !== '';
}

export function minLength(value, length) {
  return typeof value === 'string' && value.length >= length;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default { required, minLength, isEmail };