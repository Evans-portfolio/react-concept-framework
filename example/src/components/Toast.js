import { Component } from '../../../framework/src/core/component.js';

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
  }

  componentDidMount() {
    // Listen for custom 'notification' events
    this.on('notification', (event) => {
      this.addNotification(event.detail);
    });
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

    return {
      type: 'div',
      props: { 
        class: 'toast-container'
      },
      children: notifications.map(notif => ({
        type: 'div',
        props: {
          key: notif.id,
          class: `toast toast-${notif.type}`,
          onclick: () => this.removeNotification(notif.id)
        },
        children: [
          {
            type: 'span',
            props: { class: 'toast-icon' },
            children: [this.getIcon(notif.type)]
          },
          {
            type: 'span',
            props: { class: 'toast-message' },
            children: [notif.message]
          },
          {
            type: 'button',
            props: {
              class: 'toast-close',
              onclick: (e) => {
                e.stopPropagation();
                this.removeNotification(notif.id);
              }
            },
            children: ['×']
          }
        ]
      }))
    };
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
