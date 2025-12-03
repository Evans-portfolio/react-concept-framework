#!/bin/bash

# Framework Project Management Script
# Usage: ./run-demo.sh [command]
# Commands:
#   install  - Install all dependencies (framework + example)
#   test     - Run framework tests
#   demo     - Start demo server (default)
#   help     - Show this help message

COMMAND=${1:-demo}

function show_help() {
  echo "Framework Project Management"
  echo ""
  echo "Usage: ./run-demo.sh [command]"
  echo ""
  echo "Commands:"
  echo "  install  - Install dependencies for framework and example"
  echo "  test     - Run framework unit tests"
  echo "  demo     - Start demo server (default)"
  echo "  help     - Show this help message"
  echo ""
}

function install_deps() {
  echo "📦 Installing project dependencies..."
  echo ""
  
  # Check if npm is installed
  if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
  fi
  
  # Install framework dependencies (locally in framework/)
  echo "1️⃣  Installing framework dependencies..."
  cd framework
  if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
      echo "✅ Framework dependencies installed"
    else
      echo "❌ Failed to install framework dependencies"
      cd ..
      exit 1
    fi
  else
    echo "⚠️  No package.json found in framework/"
  fi
  cd ..
  
  # Install example dependencies (locally in example/)
  echo ""
  echo "2️⃣  Installing example dependencies..."
  cd example
  if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
      echo "✅ Example dependencies installed"
    else
      echo "❌ Failed to install example dependencies"
      cd ..
      exit 1
    fi
  else
    echo "⚠️  No package.json found in example/"
  fi
  cd ..
  
  echo ""
  echo "✨ Installation complete!"
  echo ""
  echo "Next steps:"
  echo "  ./run-demo.sh demo   - Start the demo server"
  echo "  ./run-demo.sh test   - Run tests"
}

function run_tests() {
  echo "🧪 Running Framework Tests..."
  echo ""
  
  # Check if dependencies are installed (works with npm workspaces)
  if [ ! -d "node_modules" ] && [ ! -d "framework/node_modules" ]; then
    echo "⚠️  Dependencies not installed."
    echo "Run './run-demo.sh install' first."
    exit 1
  fi
  
  cd framework
  npm test
  cd ..
}

function start_demo() {
  echo "🚀 Starting Framework Demo Server..."
  echo ""
  echo "📁 Server directory: project root"
  echo "🌐 Open in browser:"
  echo "   http://localhost:8000/example/public/"
  echo ""
  echo "Press Ctrl+C to stop the server"
  echo "================================"
  echo ""
  
  python3 -m http.server 8000
}

# Main command handler
case "$COMMAND" in
  install)
    install_deps
    ;;
  test)
    run_tests
    ;;
  demo)
    start_demo
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "❌ Unknown command: $COMMAND"
    echo ""
    show_help
    exit 1
    ;;
esac
