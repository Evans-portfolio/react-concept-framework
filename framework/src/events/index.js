/**
 * Event system entry point
 * Exports event handling utilities
 */

export {
  EventDispatcher,
  globalDispatcher,
  on,
  off,
  emit,
  once
} from './dispatcher.js';
