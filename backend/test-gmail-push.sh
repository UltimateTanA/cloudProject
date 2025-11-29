#!/bin/bash

# Quick test script for Gmail Push Notifications
# Make sure your server is running on http://localhost:3000

BASE_URL="http://localhost:3000"
USERNAME="testuser"
PASSWORD="testpass123"

echo "🧪 Testing Gmail Push Notification Setup"
echo "=========================================="
echo ""

# Step 1: Signup
echo "1️⃣  Creating user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

echo "   Response: $SIGNUP_RESPONSE"
echo ""

# Step 2: Login
echo "2️⃣  Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "   Token: ${TOKEN:0:50}..."
echo ""

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Check your server logs."
  exit 1
fi

# Step 3: Get Gmail Connect URL
echo "3️⃣  Getting Gmail OAuth URL..."
GMAIL_URL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/gmail/connect" \
  -H "Authorization: Bearer $TOKEN")

OAUTH_URL=$(echo $GMAIL_URL_RESPONSE | grep -o '"url":"[^"]*' | cut -d'"' -f4)
echo "   OAuth URL: $OAUTH_URL"
echo ""
echo "   ⚠️  Open this URL in your browser to connect Gmail:"
echo "   $OAUTH_URL"
echo ""

# Step 4: Test List Messages (after OAuth)
echo "4️⃣  Testing message list (requires Gmail connected)..."
MESSAGES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/gmail/messages" \
  -H "Authorization: Bearer $TOKEN")

if echo "$MESSAGES_RESPONSE" | grep -q "Gmail not connected"; then
  echo "   ⚠️  Gmail not connected yet. Complete OAuth flow first."
else
  echo "   ✅ Messages retrieved successfully"
  echo "   Response preview: ${MESSAGES_RESPONSE:0:200}..."
fi
echo ""

# Step 5: Test Watch (after OAuth)
echo "5️⃣  Testing watch setup (requires Gmail connected)..."
WATCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/gmail/watch" \
  -H "Authorization: Bearer $TOKEN")

if echo "$WATCH_RESPONSE" | grep -q "Gmail not connected"; then
  echo "   ⚠️  Gmail not connected yet. Complete OAuth flow first."
elif echo "$WATCH_RESPONSE" | grep -q "expiration"; then
  echo "   ✅ Watch started successfully"
  echo "   Response: $WATCH_RESPONSE"
else
  echo "   ⚠️  Watch may have failed. Check server logs."
  echo "   Response: $WATCH_RESPONSE"
fi
echo ""

echo "✅ Basic API tests complete!"
echo ""
echo "Next steps:"
echo "1. Complete Gmail OAuth in browser"
echo "2. Set up Pub/Sub topic and subscription (see TESTING_GUIDE.md)"
echo "3. Send a test email to your connected Gmail account"
echo "4. Check server logs for push notifications"

