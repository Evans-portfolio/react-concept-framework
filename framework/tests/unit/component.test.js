/**
 * Component unit tests
 */

import { Component, createComponent } from '../../src/core/component.js';
import { h } from '../../src/dom/element.js';

describe('Component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should create a component instance', () => {
    class TestComponent extends Component {
      render() {
        return h('div', {}, 'Hello World');
      }
    }

    const component = new TestComponent({ title: 'Test' });
    expect(component).toBeInstanceOf(Component);
    expect(component.props.title).toBe('Test');
  });

  test('should mount component to DOM', () => {
    class TestComponent extends Component {
      render() {
        return h('div', { id: 'test' }, 'Hello World');
      }
    }

    const component = new TestComponent();
    component.mount(container);

    expect(container.querySelector('#test')).toBeTruthy();
    expect(container.textContent).toBe('Hello World');
  });

  test('should call lifecycle hooks in order', () => {
    const lifecycleCalls = [];

    class TestComponent extends Component {
      beforeCreate() {
        lifecycleCalls.push('beforeCreate');
      }
      created() {
        lifecycleCalls.push('created');
      }
      beforeMount() {
        lifecycleCalls.push('beforeMount');
      }
      mounted() {
        lifecycleCalls.push('mounted');
      }
      render() {
        return h('div', {}, 'Test');
      }
    }

    const component = new TestComponent();
    expect(lifecycleCalls).toContain('beforeCreate');
    expect(lifecycleCalls).toContain('created');

    component.mount(container);
    expect(lifecycleCalls).toEqual(['beforeCreate', 'created', 'beforeMount', 'mounted']);
  });

  test('should update state and re-render', (done) => {
    class TestComponent extends Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
      }

      render() {
        return h('div', { id: 'counter' }, `Count: ${this.state.count}`);
      }
    }

    const component = new TestComponent();
    component.mount(container);

    expect(container.textContent).toBe('Count: 0');

    component.setState({ count: 5 }, () => {
      expect(container.textContent).toBe('Count: 5');
      done();
    });
  });

  test('should update state using function', () => {
    class TestComponent extends Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
      }

      render() {
        return h('div', {}, `Count: ${this.state.count}`);
      }
    }

    const component = new TestComponent();
    component.mount(container);

    component.setState((state) => ({ count: state.count + 1 }));
    expect(component.state.count).toBe(1);
  });

  test('should unmount component', () => {
    const lifecycleCalls = [];

    class TestComponent extends Component {
      beforeDestroy() {
        lifecycleCalls.push('beforeDestroy');
      }
      destroyed() {
        lifecycleCalls.push('destroyed');
      }
      render() {
        return h('div', { id: 'test' }, 'Test');
      }
    }

    const component = new TestComponent();
    component.mount(container);

    expect(container.querySelector('#test')).toBeTruthy();

    component.unmount();
    expect(container.querySelector('#test')).toBeNull();
    expect(lifecycleCalls).toEqual(['beforeDestroy', 'destroyed']);
  });

  test('should create functional component', () => {
    const TestComponent = createComponent((props, state) => {
      return h('div', {}, `Hello ${props.name}`);
    });

    const component = new TestComponent({ name: 'World' });
    component.mount(container);

    expect(container.textContent).toBe('Hello World');
  });

  test('should handle props changes', () => {
    const updateCalls = [];

    class TestComponent extends Component {
      beforeUpdate(oldProps, newProps) {
        updateCalls.push({ old: oldProps, new: newProps });
      }

      render() {
        return h('div', {}, `Hello ${this.props.name}`);
      }
    }

    const component = new TestComponent({ name: 'World' });
    component.mount(container);

    component.props = { name: 'React' };
    component.forceUpdate();

    expect(updateCalls.length).toBeGreaterThan(0);
  });
});
