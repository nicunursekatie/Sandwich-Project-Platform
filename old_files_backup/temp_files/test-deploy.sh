#!/bin/bash
echo "=== DEPLOYMENT TEST SCRIPT ==="
echo "Testing production deployment scenario..."

# Kill any existing processes
pkill -f "node dist/index.js" 2>/dev/null || true
sleep 2

# Test the exact npm start command
echo "Running: npm run start"
NODE_ENV=production node dist/index.js &
PID=$!
echo "Started process with PID: $PID"

# Wait for server to start
sleep 8

# Test connectivity
echo "Testing connectivity..."
curl -s -w "\nHTTP Code: %{http_code}\n" http://localhost:5000/health || echo "CURL FAILED"

# Check if process is still running
if kill -0 $PID 2>/dev/null; then
    echo "✓ Process still running with PID: $PID"
    ps aux | grep $PID | grep -v grep
else
    echo "✗ Process died with PID: $PID"
fi

# Cleanup
kill $PID 2>/dev/null || true