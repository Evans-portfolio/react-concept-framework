// Fetch wrapper with error handling
// framework/src/http/client.js
/**
 * Tiny, promise-based HTTP client
 * Returns JSON by default, works perfectly with reactive state
 */

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

export class HttpClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  async request(method, url, data = null, options = {}) {
    const headers = { ...DEFAULT_HEADERS };
    
    // Note: Add API keys here if needed for specific services
    // Example: if (url.includes('api.example.com')) {
    //   headers['X-API-KEY'] = 'your-key';
    // }
    
    const config = {
      method,
      headers: { ...headers, ...options.headers },
    };

    if (data) {
      config.body = typeof data === 'object' ? JSON.stringify(data) : data;
    }

    const response = await fetch(this.baseURL + url, config);

    if (!response.ok) {
      const error = new Error(response.statusText || 'Request failed');
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  get(url, options = {}) {
    return this.request('GET', url, null, options);
  }

  post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }

  put(url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }

  delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }
}

// Default instance
export const http = new HttpClient();