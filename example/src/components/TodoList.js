// TodoList component
import { h } from '../../../framework/src/dom/index.js';
import TodoItem from './TodoItem.js';

export default function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return h('div', { class: 'empty-state' }, 'No todos yet. Add one!');
  }

  return h('ul', { class: 'todo-list' }, 
    todos.map(todo => 
      TodoItem({ todo, onToggle, onDelete })
    )
  );
}
