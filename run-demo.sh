#!/bin/bash

# Script to run the example application demo server
# Usage: ./run-demo.sh

echo "🚀 Starting Framework Demo Server..."
echo ""
echo "📁 Server directory: project root (Gitea/frontend-framework)"
echo "🌐 Open in browser:"
echo "   http://localhost:8000/example/public/"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

python3 -m http.server 8000
