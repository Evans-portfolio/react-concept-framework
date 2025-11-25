/**
 * Creates a virtual DOM element (like JSX's h function or React.createElement)
 * @param {string|Function} type - HTML tag name or Component class
 * @param {Object} props - Element properties/attributes
 * @param {...(VNode|string|number)} children - Child elements
 * @returns {VNode} Virtual DOM node
 */
export function h(type, props = {}, ...children) {
  // Flatten children array and filter out null/undefined
  const flatChildren = children
    .flat(Infinity)
    .filter(child => child != null && child !== false);

  return {
    type,
    props: props || {},
    children: flatChildren.map(child =>
      typeof child === 'object' ? child : createTextNode(child)
    )
  };
}

/**
 * Creates a text node
 * @param {string|number} text - Text content
 * @returns {VNode} Text node
 */
function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {},
    children: [],
    text: String(text)
  };
}

/**
 * Creates a real DOM element from a virtual node
 * @param {VNode} vnode - Virtual DOM node
 * @returns {HTMLElement|Text} Real DOM element
 */
export function createElement(vnode) {
  if (!vnode) return null;

  // Handle text nodes
  if (vnode.type === 'TEXT_ELEMENT') {
    return document.createTextNode(vnode.text);
  }

  // Handle component nodes (will be handled by Component class)
  if (typeof vnode.type === 'function') {
    return null; // Components handle their own rendering
  }

  // Create HTML element
  const element = document.createElement(vnode.type);

  // Set properties and attributes
  setProps(element, vnode.props);

  // Append children
  vnode.children.forEach(child => {
    const childElement = createElement(child);
    if (childElement) {
      element.appendChild(childElement);
    }
  });

  return element;
}

/**
 * Sets properties and attributes on a DOM element
 * @param {HTMLElement} element - DOM element
 * @param {Object} props - Properties to set
 */
export function setProps(element, props) {
  Object.keys(props).forEach(key => {
    setProp(element, key, props[key]);
  });
}

/**
 * Sets a single property on a DOM element
 * @param {HTMLElement} element - DOM element
 * @param {string} name - Property name
 * @param {*} value - Property value
 */
export function setProp(element, name, value) {
  if (name === 'className') {
    element.className = value;
  } else if (name === 'style' && typeof value === 'object') {
    Object.assign(element.style, value);
  } else if (name.startsWith('on')) {
    // Event handlers are handled by the event system
    const eventType = name.substring(2).toLowerCase();
    element.addEventListener(eventType, value);
  } else if (name === 'ref') {
    // Handle refs (callback that receives the DOM element)
    if (typeof value === 'function') {
      value(element);
    } else if (value && typeof value === 'object') {
      value.current = element;
    }
  } else if (typeof value === 'boolean') {
    if (value) {
      element.setAttribute(name, '');
    } else {
      element.removeAttribute(name);
    }
  } else if (value != null) {
    element.setAttribute(name, value);
  }
}

/**
 * Removes a property from a DOM element
 * @param {HTMLElement} element - DOM element
 * @param {string} name - Property name
 * @param {*} value - Property value
 */
export function removeProp(element, name, value) {
  if (name === 'className') {
    element.className = '';
  } else if (name === 'style') {
    element.style.cssText = '';
  } else if (name.startsWith('on')) {
    const eventType = name.substring(2).toLowerCase();
    element.removeEventListener(eventType, value);
  } else {
    element.removeAttribute(name);
  }
}

/**
 * Updates properties on a DOM element
 * @param {HTMLElement} element - DOM element
 * @param {Object} oldProps - Old properties
 * @param {Object} newProps - New properties
 */
export function updateProps(element, oldProps = {}, newProps = {}) {
  // Remove old props
  Object.keys(oldProps).forEach(key => {
    if (!(key in newProps)) {
      removeProp(element, key, oldProps[key]);
    }
  });

  // Set new props
  Object.keys(newProps).forEach(key => {
    if (oldProps[key] !== newProps[key]) {
      setProp(element, key, newProps[key]);
    }
  });
}
