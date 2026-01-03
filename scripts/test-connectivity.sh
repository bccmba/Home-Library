#!/bin/bash

# Quick connectivity test script
# Usage: ./scripts/test-connectivity.sh

API_URL="${EXPO_PUBLIC_DOMAIN:-http://192.168.68.63:3000}"

echo "🔍 Testing server connectivity..."
echo ""

# Test 1: Health endpoint
echo "1️⃣ Testing health endpoint..."
if curl -s -f "${API_URL}/api/health" > /dev/null 2>&1; then
  echo "   ✅ Health check passed"
  curl -s "${API_URL}/api/health" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/health"
else
  echo "   ❌ Health check failed"
  echo "   Make sure the server is running: npm run server:dev"
fi
echo ""

# Test 2: Books endpoint
echo "2️⃣ Testing books endpoint..."
if curl -s -f "${API_URL}/api/books" > /dev/null 2>&1; then
  echo "   ✅ Books endpoint accessible"
  BOOK_COUNT=$(curl -s "${API_URL}/api/books" | jq '. | length' 2>/dev/null || echo "unknown")
  echo "   Found $BOOK_COUNT books"
else
  echo "   ❌ Books endpoint failed"
fi
echo ""

# Test 3: Network interface check
echo "3️⃣ Checking network interfaces..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
  echo "   Your IP: $IP"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  IP=$(hostname -I | awk '{print $1}')
  echo "   Your IP: $IP"
else
  echo "   Run: ipconfig (Windows) or ifconfig (Mac/Linux)"
fi
echo ""

# Test 4: Port check
echo "4️⃣ Checking if port 3000 is in use..."
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "   ✅ Port 3000 is in use (server likely running)"
  lsof -ti:3000 | xargs ps -p 2>/dev/null | head -2 || echo "   Process found on port 3000"
else
  echo "   ❌ Port 3000 is not in use"
  echo "   Start server with: npm run server:dev"
fi
echo ""

# Summary
echo "📋 Summary:"
echo "   API URL: $API_URL"
echo "   Test in browser: ${API_URL}/api/health"
echo "   Test from phone: Open ${API_URL}/api/health in Safari/Chrome"
echo ""

