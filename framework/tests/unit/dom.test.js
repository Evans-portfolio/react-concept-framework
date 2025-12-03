/**
 * DOM manipulation and Virtual DOM tests
 */

import { h, createElement, setProp, updateProps } from '../../src/dom/element.js';
import { patch, diff } from '../../src/dom/diff.js';
import { jest } from '@jest/globals';

describe('Virtual DOM - h() function', () => {
  test('should create virtual node', () => {
    const vnode = h('div', { class: 'test' }, 'Hello');
    
    expect(vnode.type).toBe('div');
    expect(vnode.props.class).toBe('test');
    expect(vnode.children).toHaveLength(1);
    expect(vnode.children[0].type).toBe('TEXT_ELEMENT');
  });

  test('should handle nested children', () => {
    const vnode = h('div', {}, 
      h('span', {}, 'Child 1'),
      h('span', {}, 'Child 2')
    );
    
    expect(vnode.children).toHaveLength(2);
    expect(vnode.children[0].type).toBe('span');
    expect(vnode.children[1].type).toBe('span');
  });

  test('should flatten children arrays', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];
    const vnode = h('ul', {}, 
      items.map(item => h('li', {}, item))
    );
    
    expect(vnode.children).toHaveLength(3);
    expect(vnode.children[0].type).toBe('li');
  });

  test('should filter out null and undefined children', () => {
    const vnode = h('div', {},
      h('span', {}, 'Text'),
      null,
      undefined,
      false,
      h('p', {}, 'Paragraph')
    );
    
    expect(vnode.children).toHaveLength(2);
  });

  test('should convert numbers to text nodes', () => {
    const vnode = h('div', {}, 42);
    
    expect(vnode.children[0].type).toBe('TEXT_ELEMENT');
    expect(vnode.children[0].text).toBe('42');
  });
});

describe('createElement - Virtual to Real DOM', () => {
  test('should create text node', () => {
    const vnode = { type: 'TEXT_ELEMENT', text: 'Hello', props: {}, children: [] };
    const element = createElement(vnode);
    
    expect(element.nodeType).toBe(Node.TEXT_NODE);
    expect(element.textContent).toBe('Hello');
  });

  test('should create div element', () => {
    const vnode = h('div', { class: 'test', id: 'my-div' });
    const element = createElement(vnode);
    
    expect(element.tagName).toBe('DIV');
    expect(element.className).toBe('test');
    expect(element.id).toBe('my-div');
  });

  test('should create element with children', () => {
    const vnode = h('ul', {},
      h('li', {}, 'Item 1'),
      h('li', {}, 'Item 2')
    );
    const element = createElement(vnode);
    
    expect(element.tagName).toBe('UL');
    expect(element.children).toHaveLength(2);
    expect(element.children[0].textContent).toBe('Item 1');
  });

  test('should handle onclick event', () => {
    const handler = jest.fn();
    const vnode = h('button', { onclick: handler }, 'Click me');
    const element = createElement(vnode);
    
    element.click();
    
    expect(handler).toHaveBeenCalled();
  });

  test('should support event delegation pattern', () => {
    // Requirement #22: Event handling can be delegated to parent elements
    const parentHandler = jest.fn((e) => {
      if (e.target.matches('[data-action="delete"]')) {
        const id = e.target.dataset.postId;
        parentHandler.lastDeletedId = id;
      }
    });

    // Parent container with delegation handler
    const vnode = h('div', { onclick: parentHandler }, [
      h('button', { 'data-action': 'delete', 'data-post-id': '1' }, 'Delete 1'),
      h('button', { 'data-action': 'delete', 'data-post-id': '2' }, 'Delete 2'),
      h('button', { 'data-action': 'other', 'data-post-id': '3' }, 'Other')
    ]);
    
    const element = createElement(vnode);
    
    // Click on first delete button
    element.children[0].click();
    
    expect(parentHandler).toHaveBeenCalled();
    expect(parentHandler.lastDeletedId).toBe('1');
    
    // Click on second delete button
    parentHandler.mockClear();
    element.children[1].click();
    
    expect(parentHandler).toHaveBeenCalled();
    expect(parentHandler.lastDeletedId).toBe('2');
  });

  test('should support preventDefault and stopPropagation', () => {
    // Requirement #23: It prevents default browser behavior and event bubbling
    const formHandler = jest.fn((e) => {
      e.preventDefault(); // Prevent form submission
    });
    
    const buttonHandler = jest.fn((e) => {
      e.stopPropagation(); // Stop event bubbling
    });

    const vnode = h('form', { onsubmit: formHandler }, [
      h('button', { onclick: buttonHandler }, 'Submit')
    ]);
    
    const element = createElement(vnode);
    
    // Create and dispatch submit event
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    element.dispatchEvent(submitEvent);
    
    expect(formHandler).toHaveBeenCalled();
    expect(submitEvent.defaultPrevented).toBe(true);
    
    // Create and dispatch click event
    const clickEvent = new Event('click', { bubbles: true, cancelable: true });
    element.children[0].dispatchEvent(clickEvent);
    
    expect(buttonHandler).toHaveBeenCalled();
  });
});

describe('DOM Diffing and Patching', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should add new element', () => {
    const oldVNode = null;
    const newVNode = h('div', { class: 'new' }, 'Hello');
    
    patch(container, oldVNode, newVNode);
    
    expect(container.children).toHaveLength(1);
    expect(container.children[0].className).toBe('new');
    expect(container.children[0].textContent).toBe('Hello');
  });

  test('should remove element', () => {
    const oldVNode = h('div', {}, 'Old');
    const element = createElement(oldVNode);
    container.appendChild(element);
    
    const newVNode = null;
    patch(container, oldVNode, newVNode, 0);
    
    expect(container.children).toHaveLength(0);
  });

  test('should replace element type', () => {
    const oldVNode = h('div', {}, 'Text');
    const element = createElement(oldVNode);
    container.appendChild(element);
    
    const newVNode = h('span', {}, 'Text');
    patch(container, oldVNode, newVNode, 0);
    
    expect(container.children[0].tagName).toBe('SPAN');
  });

  test('should update text content', () => {
    const oldVNode = h('div', {}, 'Old text');
    const element = createElement(oldVNode);
    container.appendChild(element);
    
    const newVNode = h('div', {}, 'New text');
    patch(container, oldVNode, newVNode, 0);
    
    expect(container.children[0].textContent).toBe('New text');
  });

  test('should update attributes', () => {
    const oldVNode = h('div', { class: 'old' });
    const element = createElement(oldVNode);
    container.appendChild(element);
    
    const newVNode = h('div', { class: 'new' });
    patch(container, oldVNode, newVNode, 0);
    
    expect(container.children[0].className).toBe('new');
  });

  test('should handle key-based reconciliation', () => {
    const oldVNode = h('ul', {},
      h('li', { key: 'a' }, 'Item A'),
      h('li', { key: 'b' }, 'Item B')
    );
    const element = createElement(oldVNode);
    container.appendChild(element);
    
    // Reverse order - with keys, should reorder not recreate
    const newVNode = h('ul', {},
      h('li', { key: 'b' }, 'Item B'),
      h('li', { key: 'a' }, 'Item A')
    );
    
    patch(container, oldVNode, newVNode, 0);
    
    expect(container.children[0].children).toHaveLength(2);
    expect(container.children[0].children[0].textContent).toBe('Item B');
    expect(container.children[0].children[1].textContent).toBe('Item A');
  });
});

describe('Performance - Key-based reconciliation', () => {
  test('should detect differences efficiently', () => {
    const oldVNode = h('div', { id: 'test' }, 'Same text');
    const newVNode = h('div', { id: 'test' }, 'Same text');
    
    const differences = diff(oldVNode, newVNode);
    
    // No changes, should be minimal diff
    expect(differences).toBeDefined();
  });
});
