import { Component, h } from '../../../framework/src/core/index.js';
import { on, off } from '../../../framework/src/events/index.js';

/**
 * Toast notifications component
 * Demonstrates custom event system (on/emit)
 * Listens for 'notification' events and displays temporary messages
 */
export class Toast extends Component {
  constructor() {
    super();
    this.state = {
      notifications: [] // Array of {id, type, message}
    };
    this._notificationHandler = null;
  }

  mounted() {
    // Listen for custom 'notification' events
    this._notificationHandler = (event) => {
      this.addNotification(event.detail);
    };
    on('notification', this._notificationHandler);
  }

  beforeDestroy() {
    // Clean up event listener
    if (this._notificationHandler) {
      off('notification', this._notificationHandler);
    }
  }

  addNotification({ type = 'info', message, duration = 3000 }) {
    const id = Date.now();
    const notification = { id, type, message };

    this.setState({
      notifications: [...this.state.notifications, notification]
    });

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(id);
    }, duration);
  }

  removeNotification(id) {
    this.setState({
      notifications: this.state.notifications.filter(n => n.id !== id)
    });
  }

  render() {
    const { notifications } = this.state;

    return h('div', { class: 'toast-container' },
      ...notifications.map(notif =>
        h('div', {
          key: notif.id,
          class: `toast toast-${notif.type}`,
          onclick: () => this.removeNotification(notif.id)
        }, [
          h('span', { class: 'toast-icon' }, this.getIcon(notif.type)),
          h('span', { class: 'toast-message' }, notif.message),
          h('button', {
            class: 'toast-close',
            onclick: (e) => {
              e.stopPropagation();
              this.removeNotification(notif.id);
            }
          }, '×')
        ])
      )
    );
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }
}
