// Route matching and handling
// framework/src/router/route.js
export class Route {
  constructor(path, component, props = {}) {
    this.path = path.replace(/\/$/, '') || '/';
    this.component = component;
    this.props = props;
    this.keys = [];

    // Extract param names like /users/:id
    this.regex = new RegExp(
      '^' +
      this.path
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