// Login page
import { h } from '../../../framework/src/dom/index.js';
import { Component } from '../../../framework/src/core/index.js';
import { http } from '../../../framework/src/http/index.js';
import { emit } from '../../../framework/src/events/index.js';
import { navigate } from '../../../framework/src/router/index.js';
import { isEmail } from '../../../framework/src/utils/validator.js';
import { store } from '../store.js';
import Header from '../components/Header.js';

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loading: false,
      error: null
    };

    this.handleEmailInput = this.handleEmailInput.bind(this);
    this.handlePasswordInput = this.handlePasswordInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEmailInput(e) {
    this.setState({ email: e.target.value, error: null });
  }

  handlePasswordInput(e) {
    this.setState({ password: e.target.value, error: null });
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const { email, password } = this.state;

    // Validation
    if (!email || !password) {
      this.setState({ error: 'Please fill in all fields' });
      emit('notification', { type: 'error', message: 'Please fill in all fields' });
      return;
    }

    if (!isEmail(email)) {
      this.setState({ error: 'Invalid email format' });
      emit('notification', { type: 'error', message: 'Invalid email format' });
      return;
    }

    if (password.length < 6) {
      this.setState({ error: 'Password must be at least 6 characters' });
      emit('notification', { type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    // Login via ReqRes.in API
    this.setState({ loading: true, error: null });

    try {
      const response = await http.post('https://reqres.in/api/login', {
        email,
        password
      });

      // Success - save user to global store
      store.setState({
        user: {
          email,
          name: email.split('@')[0],
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
        message: 'Login failed. Try: eve.holt@reqres.in / cityslicka' 
      });
    }
  }

  render() {
    const { email, password, loading, error } = this.state;

    return h('div', { class: 'login-page' }, [
      Header(),
      h('div', { class: 'login-container' }, [
        h('div', { class: 'login-card' }, [
          h('h2', {}, 'Login'),
          h('p', { class: 'login-hint' }, 'Demo credentials: eve.holt@reqres.in / cityslicka'),
          
          h('form', { onsubmit: this.handleSubmit }, [
            h('div', { class: 'form-group' }, [
              h('label', { for: 'email' }, 'Email'),
              h('input', {
                id: 'email',
                type: 'email',
                class: 'form-input',
                placeholder: 'eve.holt@reqres.in',
                value: email,
                disabled: loading,
                oninput: this.handleEmailInput
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
