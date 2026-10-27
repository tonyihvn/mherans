#!/bin/bash

# Email Verification Manual Test Script (Bash/Linux/Mac)
# Usage: bash test-email-manual.sh

set -e

COLOR_RESET='\033[0m'
COLOR_CYAN='\033[36m'
COLOR_GREEN='\033[32m'
COLOR_RED='\033[31m'
COLOR_YELLOW='\033[33m'

API_URL="http://localhost:5000/api"
TIMESTAMP=$(date +%s%N | cut -b1-13)
TEST_EMAIL="test-email-$TIMESTAMP@example.com"
TEST_PASSWORD="TestPassword123"
TEST_NAME="Test User"

echo -e "${COLOR_CYAN}═══════════════════════════════════════${COLOR_RESET}"
echo -e "${COLOR_CYAN}NHERAMS Email Verification Manual Test${COLOR_RESET}"
echo -e "${COLOR_CYAN}═══════════════════════════════════════${COLOR_RESET}\n"

# Check if server is running
echo -e "${COLOR_CYAN}Step 1: Checking API Server...${COLOR_RESET}"
if ! curl -s "${API_URL}/users" > /dev/null 2>&1; then
    echo -e "${COLOR_RED}✗ API server not responding on ${API_URL}${COLOR_RESET}"
    echo -e "${COLOR_YELLOW}Start the server with: cd server && npm run dev${COLOR_RESET}"
    exit 1
fi
echo -e "${COLOR_GREEN}✓ API server is running${COLOR_RESET}\n"

# Register user
echo -e "${COLOR_CYAN}Step 2: Registering test user...${COLOR_RESET}"
echo -e "Email: ${TEST_EMAIL}"
echo -e "Password: ${TEST_PASSWORD}"
echo -e "Name: ${TEST_NAME}\n"

REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"name\": \"${TEST_NAME}\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "error"; then
    echo -e "${COLOR_RED}✗ Registration failed${COLOR_RESET}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

echo -e "${COLOR_GREEN}✓ User registered successfully${COLOR_RESET}"
echo "Response: $REGISTER_RESPONSE\n"

# Extract user details
USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "User ID: ${USER_ID}\n"

# Next steps
echo -e "${COLOR_CYAN}Step 3: Check for verification email...${COLOR_RESET}"
echo -e "${COLOR_YELLOW}→ Check server logs for 'Test email preview URL'${COLOR_RESET}"
echo -e "${COLOR_YELLOW}→ Or check your email inbox for verification message${COLOR_RESET}"
echo -e "${COLOR_YELLOW}→ Extract the verification token from the link\n${COLOR_RESET}"

# Resend verification
echo -e "${COLOR_CYAN}Step 4: Resend verification email (if needed)...${COLOR_RESET}"
echo -e "Running: POST ${API_URL}/users/resend-verification\n"

RESEND_RESPONSE=$(curl -s -X POST "${API_URL}/users/resend-verification" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${TEST_EMAIL}\"}")

if echo "$RESEND_RESPONSE" | grep -q "error"; then
    echo -e "${COLOR_YELLOW}⚠ Resend might not be needed yet${COLOR_RESET}"
else
    echo -e "${COLOR_GREEN}✓ Verification email resent${COLOR_RESET}"
fi

echo -e "\n${COLOR_CYAN}═══════════════════════════════════════${COLOR_RESET}"
echo -e "${COLOR_GREEN}Manual Test Setup Complete!${COLOR_RESET}"
echo -e "${COLOR_CYAN}═══════════════════════════════════════${COLOR_RESET}\n"

echo -e "${COLOR_YELLOW}To verify email token manually:${COLOR_RESET}"
echo -e "1. Get the token from your email link (or server logs)"
echo -e "2. Run this command:\n"
echo -e "curl -X POST ${API_URL}/users/verify-email \\"
echo -e "  -H \"Content-Type: application/json\" \\"
echo -e "  -d '{\"token\": \"<YOUR_TOKEN_HERE>\"}'\n"

echo -e "${COLOR_YELLOW}Useful commands:${COLOR_RESET}"
echo -e "• Check server logs: tail -f server/setup.log"
echo -e "• Restart server: cd server && npm run dev"
echo -e "• Test again with different email"
echo ""
