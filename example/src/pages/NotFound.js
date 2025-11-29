// NotFound page
import { h } from '../../../framework/src/dom/index.js';
import { Component } from '../../../framework/src/core/index.js';
import { Link } from '../../../framework/src/router/index.js';
import Header from '../components/Header.js';

export default class NotFoundPage extends Component {
  render() {
    return h('div', { class: 'not-found' }, [
      Header(),
      h('div', { class: 'error-content' }, [
        h('h1', {}, '404'),
        h('p', {}, 'Page not found'),
        Link({ to: '/', children: '← Go back to home' })
      ])
    ]);
  }
}
