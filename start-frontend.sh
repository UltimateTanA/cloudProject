#!/bin/bash

# Simple script to start the frontend server

echo "🚀 Starting Frontend Server..."
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python HTTP server..."
    cd frontend
    python3 -m http.server 8000
elif command -v php &> /dev/null; then
    echo "Using PHP server..."
    cd frontend
    php -S localhost:8000
else
    echo "❌ No HTTP server found!"
    echo ""
    echo "Please install one of:"
    echo "  - Python 3 (python3 -m http.server)"
    echo "  - PHP (php -S)"
    echo "  - Node.js http-server (npm install -g http-server)"
    echo ""
    echo "Or simply open frontend/index.html in your browser"
    exit 1
fi

