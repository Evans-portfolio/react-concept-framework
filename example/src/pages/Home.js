// Home page
import { h } from '../../../framework/src/dom/index.js';
import { Component } from '../../../framework/src/core/index.js';
import Header from '../components/Header.js';
import TodoList from '../components/TodoList.js';
import Footer from '../components/Footer.js';

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newTodo: '',
      todos: this.loadTodos(),
      filter: 'all'
    };
    
    // Bind methods to avoid recreating functions
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleClearCompleted = this.handleClearCompleted.bind(this);
  }

  loadTodos() {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  }

  saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  handleInput(e) {
    this.setState({ newTodo: e.target.value });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && this.state.newTodo.trim()) {
      this.addTodo(this.state.newTodo.trim());
    }
  }

  addTodo(text) {
    const todos = [
      ...this.state.todos,
      { id: Date.now(), text, completed: false }
    ];
    this.setState({ todos, newTodo: '' });
    this.saveTodos(todos);
  }

  handleToggle(id) {
    this.toggleTodo(id);
  }

  toggleTodo(id) {
    const todos = this.state.todos.map(todo =>
      todo.id === id ? { ...todo, completed : !todo.completed } : todo
    );
    this.setState({ todos });
    this.saveTodos(todos);
  }

  handleDelete(id) {
    this.deleteTodo(id);
  }

  deleteTodo(id) {
    const todos = this.state.todos.filter(todo => todo.id !== id);
    this.setState({ todos });
    this.saveTodos(todos);
  }

  handleFilterChange(newFilter) {
    if (this.state.filter !== newFilter) {
      this.setState({ filter: newFilter });
    }
  }

  handleClearCompleted() {
    this.clearCompleted();
  }

  clearCompleted() {
    const todos = this.state.todos.filter(todo => !todo.completed);
    this.setState({ todos });
    this.saveTodos(todos);
  }

  getFilteredTodos() {
    const { todos, filter } = this.state;
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  render() {
    const filteredTodos = this.getFilteredTodos();
    const activeCount = this.state.todos.filter(t => !t.completed).length;

    return h('div', { class: 'home-page' }, [
      Header(),
      h('div', { class: 'todo-container' }, [
        h('input', {
          type: 'text',
          class: 'new-todo',
          placeholder: 'What needs to be done?',
          value: this.state.newTodo,
          oninput: this.handleInput,
          onkeypress: this.handleKeyPress
        }),
        TodoList({
          todos: filteredTodos,
          onToggle: this.handleToggle,
          onDelete: this.handleDelete
        }),
        Footer({
          activeCount,
          filter: this.state.filter,
          onFilterChange: this.handleFilterChange,
          onClearCompleted: this.handleClearCompleted
        })
      ])
    ]);
  }
}
