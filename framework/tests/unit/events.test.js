/**
 * Events unit tests
 */

import { EventDispatcher, on, off, emit, once } from '../../src/events/dispatcher.js';

describe('EventDispatcher', () => {
  let dispatcher;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    dispatcher = new EventDispatcher(container);
  });

  afterEach(() => {
    dispatcher.clear();
    document.body.removeChild(container);
  });

  test('should register and trigger event listener', () => {
    const handler = jest.fn();
    dispatcher.on('click', handler);

    const event = new Event('click', { bubbles: true });
    container.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
  });

  test('should handle delegated events with selector', () => {
    const button = document.createElement('button');
    button.className = 'test-btn';
    container.appendChild(button);

    const handler = jest.fn();
    dispatcher.on('click', '.test-btn', handler);

    button.click();

    expect(handler).toHaveBeenCalled();
  });

  test('should remove event listener', () => {
    const handler = jest.fn();
    dispatcher.on('click', handler);
    dispatcher.off('click', handler);

    const event = new Event('click', { bubbles: true });
    container.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  test('should emit custom events', () => {
    const handler = jest.fn();
    container.addEventListener('custom-event', handler);

    dispatcher.emit('custom-event', { data: 'test' });

    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.data).toBe('test');
  });

  test('should handle once option', () => {
    const handler = jest.fn();
    dispatcher.on('click', handler, { once: true });

    const event1 = new Event('click', { bubbles: true });
    const event2 = new Event('click', { bubbles: true });

    container.dispatchEvent(event1);
    container.dispatchEvent(event2);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should handle multiple listeners for same event', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    dispatcher.on('click', handler1);
    dispatcher.on('click', handler2);

    const event = new Event('click', { bubbles: true });
    container.dispatchEvent(event);

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  test('should match elements by selector', () => {
    const div1 = document.createElement('div');
    div1.className = 'target';
    const div2 = document.createElement('div');
    div2.className = 'other';

    container.appendChild(div1);
    container.appendChild(div2);

    const handler = jest.fn();
    dispatcher.on('click', '.target', handler);

    div1.click();
    expect(handler).toHaveBeenCalledTimes(1);

    div2.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should clear all listeners', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    dispatcher.on('click', handler1);
    dispatcher.on('keydown', handler2);

    dispatcher.clear();

    const clickEvent = new Event('click', { bubbles: true });
    const keyEvent = new Event('keydown', { bubbles: true });

    container.dispatchEvent(clickEvent);
    container.dispatchEvent(keyEvent);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  test('should handle errors in event handlers gracefully', () => {
    const errorHandler = jest.fn(() => {
      throw new Error('Test error');
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    dispatcher.on('click', errorHandler);

    const event = new Event('click', { bubbles: true });
    expect(() => container.dispatchEvent(event)).not.toThrow();

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('Global event helpers', () => {
  test('should use global dispatcher', () => {
    const handler = jest.fn();
    on('test-event', handler);

    emit('test-event', { test: true });

    expect(handler).toHaveBeenCalled();

    off('test-event', handler);
  });

  test('should support once helper', () => {
    const handler = jest.fn();
    once('test-once', handler);

    emit('test-once');
    emit('test-once');

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
