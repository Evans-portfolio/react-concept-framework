// Header component
import { h } from '../../../framework/src/dom/index.js';
import { Link, navigate } from '../../../framework/src/router/index.js';
import { store } from '../store.js';

export default function Header() {
  const state = store.getState();
  const isAuth = state.user.isAuth;
  const userName = state.user.name;

  return h('header', { class: 'header' }, [
    h('div', { class: 'header-content' }, [
      h('h1', {}, 'Framework Demo App'),
      h('nav', { class: 'nav' }, [
        Link({ to: '/', children: 'Todo' }),
        h('span', {}, ' | '),
        Link({ to: '/posts', children: 'Posts' }),
        h('span', {}, ' | '),
        Link({ to: '/about', children: 'About' }),
        h('span', {}, ' | '),
        isAuth 
          ? h('span', { class: 'user-info' }, [
              h('span', {}, `👤 ${userName} `),
              h('button', { 
                class: 'btn-logout',
                onclick: () => {
                  store.setState({ 
                    user: { name: '', email: '', token: '', isAuth: false } 
                  });
                  navigate('/login');
                }
              }, 'Logout')
            ])
          : Link({ to: '/login', children: 'Login' })
      ])
    ])
  ]);
}
