// Route matching and handling
// framework/src/router/route.js
export class Route {
  constructor(path, component, props = {}) {
    this.path = path;
    this.component = component;
    this.props = props;
    this.keys = [];

    // Handle wildcard route
    if (path === '*') {
      this.regex = /.*/; // Match anything
      return;
    }

    // Normalize path
    const normalizedPath = path.replace(/\/$/, '') || '/';

    // Extract param names like /users/:id
    this.regex = new RegExp(
      '^' +
      normalizedPath
        .replace(/:[^\/]+/g, (match) => {
          this.keys.push(match.slice(1));
          return '([^\\/]+)';
        })
        .replace(/\//g, '\\/') +
      '(?:\\/)?$'
    );
  }

  match(pathname) {
    const match = pathname.match(this.regex);
    if (!match) return null;

    const params = {};
    this.keys.forEach((key, i) => {
      params[key] = match[i + 1];
    });

    return { params, query: new URLSearchParams(location.search) };
  }
}