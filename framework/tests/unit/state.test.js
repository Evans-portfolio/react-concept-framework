/**
 * State management unit tests
 */

import { createStore } from '../../src/state/store.js';
import { jest } from '@jest/globals';

describe('State Store', () => {
  let store;

  beforeEach(() => {
    store = createStore({ count: 0, user: null });
  });

  test('should create store with initial state', () => {
    const state = store.getState();
    expect(state).toEqual({ count: 0, user: null });
  });

  test('should return copy of state (immutability)', () => {
    const state1 = store.getState();
    const state2 = store.getState();
    
    expect(state1).toEqual(state2);
    expect(state1).not.toBe(state2); // Different objects
  });

  test('should update state with object', () => {
    store.setState({ count: 5 });
    
    const state = store.getState();
    expect(state.count).toBe(5);
    expect(state.user).toBeNull(); // Other properties preserved
  });

  test('should update state with function', () => {
    store.setState((prevState) => ({
      count: prevState.count + 1
    }));
    
    const state = store.getState();
    expect(state.count).toBe(1);
  });

  test('should merge state updates', () => {
    store.setState({ count: 10 });
    store.setState({ user: { name: 'John' } });
    
    const state = store.getState();
    expect(state.count).toBe(10);
    expect(state.user).toEqual({ name: 'John' });
  });

  test('should notify subscribers on state change', () => {
    const listener = jest.fn();
    store.subscribe(listener);
    
    store.setState({ count: 1 });
    
    expect(listener).toHaveBeenCalledTimes(1);
    
    store.setState({ count: 2 });
    
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('should support multiple subscribers', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    
    store.subscribe(listener1);
    store.subscribe(listener2);
    
    store.setState({ count: 5 });
    
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  test('should unsubscribe listener', () => {
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    
    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    
    unsubscribe();
    
    store.setState({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(1); // Not called again
  });

  test('should handle complex state updates', () => {
    store.setState({ 
      user: { 
        name: 'Alice', 
        email: 'alice@example.com' 
      } 
    });
    
    store.setState((prev) => ({
      user: { ...prev.user, name: 'Bob' }
    }));
    
    const state = store.getState();
    expect(state.user.name).toBe('Bob');
    expect(state.user.email).toBe('alice@example.com');
  });

  test('should not mutate original state', () => {
    const originalState = store.getState();
    const originalCount = originalState.count;
    
    store.setState({ count: 100 });
    
    expect(originalState.count).toBe(originalCount); // Original unchanged
  });
});

describe('Store with empty initial state', () => {
  test('should work with no initial state', () => {
    const store = createStore();
    
    expect(store.getState()).toEqual({});
    
    store.setState({ foo: 'bar' });
    expect(store.getState()).toEqual({ foo: 'bar' });
  });
});
