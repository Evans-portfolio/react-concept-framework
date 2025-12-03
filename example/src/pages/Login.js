// Login page
import { h } from '../../../framework/src/dom/index.js';
import { Component } from '../../../framework/src/core/index.js';
import { http } from '../../../framework/src/http/index.js';
import { emit } from '../../../framework/src/events/index.js';
import { navigate } from '../../../framework/src/router/index.js';
import { store } from '../store.js';
import Header from '../components/Header.js';

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loading: false,
      error: null
    };

    this.handleUsernameInput = this.handleUsernameInput.bind(this);
    this.handlePasswordInput = this.handlePasswordInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUsernameInput(e) {
    this.setState({ username: e.target.value, error: null });
  }

  handlePasswordInput(e) {
    this.setState({ password: e.target.value, error: null });
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const { username, password } = this.state;

    // Validation
    if (!username || !password) {
      this.setState({ error: 'Please fill in all fields' });
      emit('notification', { type: 'error', message: 'Please fill in all fields' });
      return;
    }

    if (username.length < 3) {
      this.setState({ error: 'Username must be at least 3 characters' });
      emit('notification', { type: 'error', message: 'Username must be at least 3 characters' });
      return;
    }

    if (password.length < 6) {
      this.setState({ error: 'Password must be at least 6 characters' });
      emit('notification', { type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    // Login via DummyJSON API
    this.setState({ loading: true, error: null });

    try {
      const response = await http.post('https://dummyjson.com/auth/login', {
        username,
        password
      });

      // Success - save user to global store
      store.setState({
        user: {
          email: response.email,
          name: response.firstName + ' ' + response.lastName,
          token: response.token,
          isAuth: true
        }
      });

      emit('notification', { type: 'success', message: 'Login successful!' });

      // Redirect to posts
      setTimeout(() => {
        navigate('/posts');
      }, 500);

    } catch (error) {
      this.setState({ 
        error: error.message || 'Invalid credentials',
        loading: false 
      });
      emit('notification', { 
        type: 'error', 
        message: 'Login failed. Try: emilys / emilyspass' 
      });
    }
  }

  render() {
    const { username, password, loading, error } = this.state;

    return h('div', { class: 'login-page' }, [
      Header(),
      h('div', { class: 'login-container' }, [
        h('div', { class: 'login-card' }, [
          h('h2', {}, 'Login'),
          h('p', { class: 'login-hint' }, 'Demo credentials: emilys / emilyspass'),
          
          h('form', { onsubmit: this.handleSubmit }, [
            h('div', { class: 'form-group' }, [
              h('label', { for: 'username' }, 'Username'),
              h('input', {
                id: 'username',
                type: 'text',
                class: 'form-input',
                placeholder: 'emilys',
                value: username,
                disabled: loading,
                oninput: this.handleUsernameInput
              })
            ]),

            h('div', { class: 'form-group' }, [
              h('label', { for: 'password' }, 'Password'),
              h('input', {
                id: 'password',
                type: 'password',
                class: 'form-input',
                placeholder: 'Enter password',
                value: password,
                disabled: loading,
                oninput: this.handlePasswordInput
              })
            ]),

            error ? h('div', { class: 'error-message' }, error) : null,

            h('button', {
              type: 'submit',
              class: 'btn-login',
              disabled: loading
            }, loading ? 'Logging in...' : 'Login')
          ])
        ])
      ])
    ]);
  }
}
