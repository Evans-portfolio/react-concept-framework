// Footer component
import { h } from '../../../framework/src/dom/index.js';

export default function Footer({ activeCount, filter, onFilterChange, onClearCompleted }) {
  return h('footer', { class: 'footer' }, [
    h('span', { class: 'todo-count' }, `${activeCount} items left`),
    h('div', { class: 'filters' }, [
      h('button', {
        class: filter === 'all' ? 'filter-btn active' : 'filter-btn',
        onclick: () => onFilterChange('all')
      }, 'All'),
      h('button', {
        class: filter === 'active' ? 'filter-btn active' : 'filter-btn',
        onclick: () => onFilterChange('active')
      }, 'Active'),
      h('button', {
        class: filter === 'completed' ? 'filter-btn active' : 'filter-btn',
        onclick: () => onFilterChange('completed')
      }, 'Completed')
    ]),
    h('button', { 
      class: 'clear-completed',
      onclick: onClearCompleted 
    }, 'Clear completed')
  ]);
}
