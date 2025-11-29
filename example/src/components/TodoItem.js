// TodoItem component
import { h } from '../../../framework/src/dom/index.js';

export default function TodoItem({ todo, onToggle, onDelete }) {
  return h('li', { 
    class: todo.completed ? 'todo-item completed' : 'todo-item',
    'data-id': todo.id,
    key: todo.id // Key for reconciliation
  }, [
    h('input', {
      type: 'checkbox',
      checked: todo.completed,
      'data-todo-id': todo.id,
      onclick: (e) => {
        const todoId = parseInt(e.target.getAttribute('data-todo-id'));
        onToggle(todoId);
      }
    }),
    h('span', { class: 'todo-text' }, todo.text),
    h('button', {
      class: 'delete-btn',
      'data-todo-id': todo.id,
      onclick: (e) => {
        const todoId = parseInt(e.target.getAttribute('data-todo-id'));
        onDelete(todoId);
      }
    }, '✕')
  ]);
}
