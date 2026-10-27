# Email Verification Manual Test Script (Windows PowerShell)
# Usage: powershell -ExecutionPolicy Bypass -File test-email-manual.ps1

$ErrorActionPreference = "Stop"

# Colors
$ColorCyan = "Cyan"
$ColorGreen = "Green"
$ColorRed = "Red"
$ColorYellow = "Yellow"

$API_URL = "http://localhost:5000/api"
$TIMESTAMP = [DateTime]::Now.Ticks
$TEST_EMAIL = "test-email-$TIMESTAMP@example.com"
$TEST_PASSWORD = "TestPassword123"
$TEST_NAME = "Test User"

Write-Host "═══════════════════════════════════════" -ForegroundColor $ColorCyan
Write-Host "NHERAMS Email Verification Manual Test" -ForegroundColor $ColorCyan
Write-Host "═══════════════════════════════════════" -ForegroundColor $ColorCyan
Write-Host ""

# Check if server is running
Write-Host "Step 1: Checking API Server..." -ForegroundColor $ColorCyan
try {
    $response = Invoke-RestMethod -Uri "$API_URL/users" -Method Get -ErrorAction Stop
    Write-Host "✓ API server is running" -ForegroundColor $ColorGreen
} catch {
    Write-Host "✗ API server not responding on $API_URL" -ForegroundColor $ColorRed
    Write-Host "Start the server with: cd server && npm run dev" -ForegroundColor $ColorYellow
    exit 1
}
Write-Host ""

# Register user
Write-Host "Step 2: Registering test user..." -ForegroundColor $ColorCyan
Write-Host "Email: $TEST_EMAIL"
Write-Host "Password: $TEST_PASSWORD"
Write-Host "Name: $TEST_NAME"
Write-Host ""

try {
    $body = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
        name = $TEST_NAME
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$API_URL/users/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body

    Write-Host "✓ User registered successfully" -ForegroundColor $ColorGreen
    Write-Host "Response: $($registerResponse | ConvertTo-Json)"
    Write-Host ""

    $USER_ID = $registerResponse.id
    Write-Host "User ID: $USER_ID"
    Write-Host ""
} catch {
    Write-Host "✗ Registration failed" -ForegroundColor $ColorRed
    Write-Host "Error: $($_.Exception.Message)"
    exit 1
}

# Next steps
Write-Host "Step 3: Check for verification email..." -ForegroundColor $ColorCyan
Write-Host "→ Check server logs for 'Test email preview URL'" -ForegroundColor $ColorYellow
Write-Host "→ Or check your email inbox for verification message" -ForegroundColor $ColorYellow
Write-Host "→ Extract the verification token from the link" -ForegroundColor $ColorYellow
Write-Host ""

# Resend verification
Write-Host "Step 4: Resend verification email (if needed)..." -ForegroundColor $ColorCyan
Write-Host "Running: POST $API_URL/users/resend-verification" -ForegroundColor $ColorCyan
Write-Host ""

try {
    $resendBody = @{
        email = $TEST_EMAIL
    } | ConvertTo-Json

    $resendResponse = Invoke-RestMethod -Uri "$API_URL/users/resend-verification" `
        -Method Post `
        -ContentType "application/json" `
        -Body $resendBody

    Write-Host "✓ Verification email resent" -ForegroundColor $ColorGreen
} catch {
    Write-Host "⚠ Resend might not be needed yet" -ForegroundColor $ColorYellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor $ColorCyan
Write-Host "Manual Test Setup Complete!" -ForegroundColor $ColorGreen
Write-Host "═══════════════════════════════════════" -ForegroundColor $ColorCyan
Write-Host ""

Write-Host "To verify email token manually:" -ForegroundColor $ColorYellow
Write-Host "1. Get the token from your email link (or server logs)"
Write-Host "2. Run this PowerShell command:" -ForegroundColor $ColorYellow
Write-Host ""
Write-Host '$token = "<YOUR_TOKEN_HERE>"' -ForegroundColor DarkGray
Write-Host '$body = @{ token = $token } | ConvertTo-Json' -ForegroundColor DarkGray
Write-Host 'Invoke-RestMethod -Uri "$API_URL/users/verify-email" -Method Post -ContentType "application/json" -Body $body' -ForegroundColor DarkGray
Write-Host ""

Write-Host "Useful commands:" -ForegroundColor $ColorYellow
Write-Host "• Check server logs: Check server console window or setup.log file"
Write-Host "• Restart server: cd server && npm run dev"
Write-Host "• Test again with different email"
Write-Host ""

Write-Host "Test email address for copy-paste:" -ForegroundColor $ColorCyan
Write-Host $TEST_EMAIL -ForegroundColor $ColorGreen
Write-Host ""
