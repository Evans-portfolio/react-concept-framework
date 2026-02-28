/**
 * Virtual DOM diffing and patching
 */

import { createElement, updateProps } from './element.js';

/**
 * Patches a DOM element with a new virtual node
 * @param {HTMLElement} parent - Parent DOM element
 * @param {VNode} oldVNode - Old virtual node
 * @param {VNode} newVNode - New virtual node
 * @param {number} index - Child index
 */
export function patch(parent, oldVNode, newVNode, index = 0) {
  // Node was removed
  if (!newVNode) {
    parent.removeChild(parent.childNodes[index]);
    return;
  }

  // Node was added
  if (!oldVNode) {
    parent.appendChild(createElement(newVNode));
    return;
  }

  // Node changed type
  if (hasChanged(oldVNode, newVNode)) {
    parent.replaceChild(
      createElement(newVNode),
      parent.childNodes[index]
    );
    return;
  }

  // Update text node
  if (newVNode.type === 'TEXT_ELEMENT') {
    if (oldVNode.text !== newVNode.text) {
      parent.childNodes[index].textContent = newVNode.text;
    }
    return;
  }

  // Update element properties
  if (typeof newVNode.type === 'string') {
    updateProps(
      parent.childNodes[index],
      oldVNode.props,
      newVNode.props
    );

    // Recursively patch children
    const oldChildren = oldVNode.children;
    const newChildren = newVNode.children;
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      patch(
        parent.childNodes[index],
        oldChildren[i],
        newChildren[i],
        i
      );
    }
  }
}

/**
 * Compares two virtual nodes to check if they've changed
 * @param {VNode} node1 - First node
 * @param {VNode} node2 - Second node
 * @returns {boolean} True if nodes are different
 */
function hasChanged(node1, node2) {
  return (
    typeof node1 !== typeof node2 ||
    (typeof node1 === 'string' && node1 !== node2) ||
    node1.type !== node2.type
  );
}

/**
 * Computes the difference between two virtual DOM trees
 * @param {VNode} oldVNode - Old virtual node
 * @param {VNode} newVNode - New virtual node
 * @returns {Array} Array of patches
 */
export function diff(oldVNode, newVNode) {
  const patches = [];

  walk(oldVNode, newVNode, patches, []);

  return patches;
}

/**
 * Walks through the virtual DOM tree and collects patches
 * @param {VNode} oldNode - Old node
 * @param {VNode} newNode - New node
 * @param {Array} patches - Patches array
 * @param {Array} path - Current path in the tree
 */
function walk(oldNode, newNode, patches, path) {
  if (!oldNode && !newNode) return;

  if (!newNode) {
    patches.push({ type: 'REMOVE', path });
    return;
  }

  if (!oldNode) {
    patches.push({ type: 'CREATE', node: newNode, path });
    return;
  }

  if (hasChanged(oldNode, newNode)) {
    patches.push({ type: 'REPLACE', node: newNode, path });
    return;
  }

  if (newNode.type === 'TEXT_ELEMENT' && oldNode.text !== newNode.text) {
    patches.push({ type: 'TEXT', text: newNode.text, path });
    return;
  }

  if (typeof newNode.type === 'string') {
    // Check for prop changes
    const propPatches = diffProps(oldNode.props, newNode.props);
    if (propPatches) {
      patches.push({ type: 'PROPS', props: propPatches, path });
    }

    // Recursively diff children
    const oldChildren = oldNode.children || [];
    const newChildren = newNode.children || [];
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      walk(oldChildren[i], newChildren[i], patches, [...path, i]);
    }
  }
}

/**
 * Computes the difference between two props objects
 * @param {Object} oldProps - Old props
 * @param {Object} newProps - New props
 * @returns {Object|null} Props changes
 */
function diffProps(oldProps, newProps) {
  const patches = {};
  let hasChanges = false;

  // Check for changed/removed props
  for (const key in oldProps) {
    if (oldProps[key] !== newProps[key]) {
      patches[key] = newProps[key];
      hasChanges = true;
    }
  }

  // Check for new props
  for (const key in newProps) {
    if (!(key in oldProps)) {
      patches[key] = newProps[key];
      hasChanges = true;
    }
  }

  return hasChanges ? patches : null;
}
