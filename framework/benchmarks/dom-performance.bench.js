/**
 * DOM Performance Benchmarks
 * Validates performance claims for Virtual DOM reconciliation
 */

import { h } from '../src/dom/element.js';
import { Component } from '../src/core/component.js';

/**
 * Measures execution time of a function
 * @param {Function} fn - Function to measure
 * @param {number} iterations - Number of times to run
 * @returns {Object} Performance results
 */
function measurePerformance(fn, iterations = 1) {
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  return {
    avg: Number(avg.toFixed(3)),
    min: Number(min.toFixed(3)),
    max: Number(max.toFixed(3)),
    median: Number(times.sort((a, b) => a - b)[Math.floor(times.length / 2)].toFixed(3)),
    iterations
  };
}

/**
 * Benchmark: List rendering with keys vs without keys
 */
export function benchmarkKeyedReconciliation() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  class ListWithKeys extends Component {
    constructor(props) {
      super(props);
      this.state = { items: props.items || [] };
    }

    render() {
      return h('ul', {},
        this.state.items.map(item =>
          h('li', { key: item.id }, `Item ${item.id}: ${item.text}`)
        )
      );
    }
  }

  class ListWithoutKeys extends Component {
    constructor(props) {
      super(props);
      this.state = { items: props.items || [] };
    }

    render() {
      return h('ul', {},
        this.state.items.map(item =>
          h('li', {}, `Item ${item.id}: ${item.text}`)
        )
      );
    }
  }

  const results = {};

  // Test with different list sizes
  [10, 50, 100, 200].forEach(size => {
    const items = Array.from({ length: size }, (_, i) => ({
      id: i,
      text: `Text ${i}`
    }));

    // Benchmark with keys
    const withKeys = new ListWithKeys({ items });
    withKeys.mount(container);

    const withKeysPerf = measurePerformance(() => {
      // Simulate re-render by updating items
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      withKeys.setState({ items: shuffled });
    }, 10);

    container.innerHTML = '';

    // Benchmark without keys
    const withoutKeys = new ListWithoutKeys({ items });
    withoutKeys.mount(container);

    const withoutKeysPerf = measurePerformance(() => {
      // Simulate re-render by updating items
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      withoutKeys.setState({ items: shuffled });
    }, 10);

    container.innerHTML = '';

    results[`${size} items`] = {
      withKeys: withKeysPerf,
      withoutKeys: withoutKeysPerf,
      speedup: Number((withoutKeysPerf.avg / withKeysPerf.avg).toFixed(2))
    };
  });

  document.body.removeChild(container);

  return results;
}

/**
 * Benchmark: Virtual DOM vs Direct DOM manipulation
 */
export function benchmarkVirtualDomVsDirectDom() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  class VirtualDomList extends Component {
    constructor(props) {
      super(props);
      this.state = { items: props.items || [] };
    }

    render() {
      return h('div', {}, [
        h('h2', {}, 'Todo List'),
        h('ul', {},
          this.state.items.map(item =>
            h('li', { key: item.id, class: item.completed ? 'completed' : '' }, [
              h('input', { type: 'checkbox', checked: item.completed }),
              h('span', {}, item.text),
              h('button', {}, 'Delete')
            ])
          )
        )
      ]);
    }
  }

  const items = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    text: `Task ${i}`,
    completed: Math.random() > 0.5
  }));

  // Benchmark Virtual DOM
  const vdomComponent = new VirtualDomList({ items });
  vdomComponent.mount(container);

  const vdomPerf = measurePerformance(() => {
    // Update all items
    const updated = items.map(item => ({
      ...item,
      completed: !item.completed
    }));
    vdomComponent.setState({ items: updated });
  }, 20);

  container.innerHTML = '';

  // Benchmark Direct DOM
  function renderDirectDom(items) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = 'Todo List';
    wrapper.appendChild(h2);

    const ul = document.createElement('ul');
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = item.completed ? 'completed' : '';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item.completed;

      const span = document.createElement('span');
      span.textContent = item.text;

      const button = document.createElement('button');
      button.textContent = 'Delete';

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(button);
      ul.appendChild(li);
    });

    wrapper.appendChild(ul);
    container.appendChild(wrapper);
  }

  renderDirectDom(items);

  const directDomPerf = measurePerformance(() => {
    const updated = items.map(item => ({
      ...item,
      completed: !item.completed
    }));
    renderDirectDom(updated);
  }, 20);

  document.body.removeChild(container);

  return {
    virtualDom: vdomPerf,
    directDom: directDomPerf,
    speedup: Number((directDomPerf.avg / vdomPerf.avg).toFixed(2))
  };
}

/**
 * Benchmark: Component mounting performance
 */
export function benchmarkComponentMounting() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  class SimpleComponent extends Component {
    constructor(props) {
      super(props);
      this.state = { count: 0 };
    }

    render() {
      return h('div', {}, [
        h('h1', {}, `Count: ${this.state.count}`),
        h('button', { onclick: () => this.setState({ count: this.state.count + 1 }) }, 'Increment')
      ]);
    }
  }

  const mountPerf = measurePerformance(() => {
    const component = new SimpleComponent();
    component.mount(container);
    container.innerHTML = '';
  }, 100);

  document.body.removeChild(container);

  return mountPerf;
}

/**
 * Benchmark: State update performance
 */
export function benchmarkStateUpdates() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  class Counter extends Component {
    constructor(props) {
      super(props);
      this.state = { count: 0 };
    }

    render() {
      return h('div', {}, [
        h('h1', {}, `Count: ${this.state.count}`),
        h('p', {}, `Double: ${this.state.count * 2}`),
        h('p', {}, `Square: ${this.state.count * this.state.count}`)
      ]);
    }
  }

  const component = new Counter();
  component.mount(container);

  const updatePerf = measurePerformance(() => {
    for (let i = 0; i < 10; i++) {
      component.setState({ count: i });
    }
  }, 10);

  document.body.removeChild(container);

  return updatePerf;
}

/**
 * Benchmark: Large list rendering (stress test)
 */
export function benchmarkLargeListRendering() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  class LargeList extends Component {
    constructor(props) {
      super(props);
      this.state = { items: props.items || [] };
    }

    render() {
      return h('ul', {},
        this.state.items.map(item =>
          h('li', { key: item.id }, [
            h('strong', {}, item.title),
            h('p', {}, item.description)
          ])
        )
      );
    }
  }

  const results = {};

  [100, 500, 1000].forEach(size => {
    const items = Array.from({ length: size }, (_, i) => ({
      id: i,
      title: `Item ${i}`,
      description: `Description for item ${i}`
    }));

    const component = new LargeList({ items });

    const perf = measurePerformance(() => {
      component.mount(container);
      container.innerHTML = '';
    }, 5);

    results[`${size} items`] = perf;
  });

  document.body.removeChild(container);

  return results;
}

/**
 * Run all benchmarks
 */
export function runAllBenchmarks() {
  console.log('🚀 Starting Performance Benchmarks...\n');

  const results = {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
    benchmarks: {}
  };

  console.log('📊 Benchmark 1: Keyed vs Non-Keyed Reconciliation');
  results.benchmarks.keyedReconciliation = benchmarkKeyedReconciliation();
  console.log(results.benchmarks.keyedReconciliation);
  console.log('');

  console.log('📊 Benchmark 2: Virtual DOM vs Direct DOM');
  results.benchmarks.virtualDomVsDirectDom = benchmarkVirtualDomVsDirectDom();
  console.log(results.benchmarks.virtualDomVsDirectDom);
  console.log('');

  console.log('📊 Benchmark 3: Component Mounting');
  results.benchmarks.componentMounting = benchmarkComponentMounting();
  console.log(results.benchmarks.componentMounting);
  console.log('');

  console.log('📊 Benchmark 4: State Updates');
  results.benchmarks.stateUpdates = benchmarkStateUpdates();
  console.log(results.benchmarks.stateUpdates);
  console.log('');

  console.log('📊 Benchmark 5: Large List Rendering');
  results.benchmarks.largeListRendering = benchmarkLargeListRendering();
  console.log(results.benchmarks.largeListRendering);
  console.log('');

  console.log('✅ All benchmarks completed!');

  return results;
}
