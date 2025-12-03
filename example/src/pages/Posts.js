// Posts page with DummyJSON API
import { h } from '../../../framework/src/dom/index.js';
import { Component } from '../../../framework/src/core/index.js';
import { http } from '../../../framework/src/http/index.js';
import { emit } from '../../../framework/src/events/index.js';
import { Link } from '../../../framework/src/router/index.js';
import { store } from '../store.js';
import Header from '../components/Header.js';

export default class PostsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: true,
      error: null,
      creating: false
    };

    this.handleCreatePost = this.handleCreatePost.bind(this);
  }

  async mounted() {
    await this.loadPosts();
  }

  async loadPosts() {
    try {
      this.setState({ loading: true, error: null });
      
      // Load first 10 posts from DummyJSON
      const response = await http.get('https://dummyjson.com/posts?limit=10');
      
      this.setState({ posts: response.posts, loading: false });
    } catch (error) {
      this.setState({ 
        error: 'Failed to load posts', 
        loading: false 
      });
      emit('notification', { 
        type: 'error', 
        message: 'Failed to load posts from server' 
      });
    }
  }

  async handleCreatePost(e) {
    e.preventDefault();
    
    // Get values from form elements instead of state
    const titleInput = e.target.querySelector('#post-title');
    const bodyInput = e.target.querySelector('#post-body');
    const newPostTitle = titleInput.value;
    const newPostBody = bodyInput.value;

    if (!newPostTitle.trim() || !newPostBody.trim()) {
      emit('notification', { 
        type: 'error', 
        message: 'Please fill in title and body' 
      });
      return;
    }

    try {
      this.setState({ creating: true });

      // Create post via DummyJSON API
      const newPost = await http.post('https://dummyjson.com/posts/add', {
        title: newPostTitle,
        body: newPostBody,
        userId: store.getState().user.id || 1
      });

      // Add to local state (server won't persist it, but we show it)
      this.setState({
        posts: [newPost, ...this.state.posts],
        creating: false
      });

      // Clear form
      titleInput.value = '';
      bodyInput.value = '';

      emit('notification', { 
        type: 'success', 
        message: 'Post created successfully!' 
      });

    } catch (error) {
      this.setState({ creating: false });
      emit('notification', { 
        type: 'error', 
        message: 'Failed to create post' 
      });
    }
  }

  async handleDeletePost(postId) {
    try {
      // Check if post is from server (ID <= 251) or local (ID > 251)
      const isServerPost = postId <= 251;
      
      if (isServerPost) {
        // Try to delete via DummyJSON API (only works for real posts)
        await http.delete(`https://dummyjson.com/posts/${postId}`);
      }
      // For local posts (created by user), just remove from state without API call

      // Remove from local state
      this.setState({
        posts: this.state.posts.filter(p => p.id !== postId)
      });

      emit('notification', { 
        type: 'success', 
        message: 'Post deleted' 
      });

    } catch (error) {
      // If API delete fails, still remove from local state (optimistic delete)
      this.setState({
        posts: this.state.posts.filter(p => p.id !== postId)
      });
      
      emit('notification', { 
        type: 'success', 
        message: 'Post deleted locally' 
      });
    }
  }

  render() {
    const { posts, loading, error, creating } = this.state;
    const user = store.getState().user;

    return h('div', { class: 'posts-page' }, [
      Header(),
      h('div', { class: 'posts-container' }, [
        h('h2', {}, 'Posts'),
        h('p', { class: 'posts-hint' }, 'Loaded from DummyJSON API'),

        // Create post form
        user.isAuth ? h('div', { class: 'create-post-card' }, [
          h('h3', {}, 'Create New Post'),
          h('form', { onsubmit: this.handleCreatePost }, [
            h('input', {
              type: 'text',
              class: 'form-input',
              placeholder: 'Post title',
              name: 'title',
              id: 'post-title',
              disabled: creating
            }),
            h('textarea', {
              class: 'form-textarea',
              placeholder: 'Post body',
              name: 'body',
              id: 'post-body',
              disabled: creating,
              rows: 3
            }),
            h('button', {
              type: 'submit',
              class: 'btn-create-post',
              disabled: creating
            }, creating ? 'Creating...' : 'Create Post')
          ])
        ]) : h('div', { class: 'auth-notice' }, [
          h('p', {}, 'Please '),
          Link({ to: '/login', children: 'login' }),
          h('span', {}, ' to create posts')
        ]),

        // Loading state
        loading ? h('div', { class: 'loading' }, 'Loading posts...') : null,

        // Error state
        error ? h('div', { class: 'error-message' }, error) : null,

        // Posts list
        !loading && !error ? h('div', { class: 'posts-list' }, 
          posts.map(post => 
            h('div', { class: 'post-card', key: post.id }, [
              h('h3', { class: 'post-title' }, post.title),
              h('p', { class: 'post-body' }, post.body),
              h('div', { class: 'post-actions' }, [
                h('span', { class: 'post-id' }, `ID: ${post.id}`),
                user.isAuth ? h('button', {
                  class: 'btn-delete',
                  onclick: () => this.handleDeletePost(post.id)
                }, 'Delete') : null
              ])
            ])
          )
        ) : null
      ])
    ]);
  }
}
