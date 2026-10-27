# NHERAMS Quick Start Script for Windows

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "NHERAMS Pilot Portal - Quick Start" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend .env exists
if (-Not (Test-Path "server\.env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "✓ Created server\.env" -ForegroundColor Green
    Write-Host "  Please update database credentials if needed" -ForegroundColor Gray
    Write-Host ""
}

# Check if server node_modules exists
if (-Not (Test-Path "server\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location server
    npm install
    Pop-Location
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Check if frontend node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Database check
Write-Host "Checking database..." -ForegroundColor Yellow
$dockerInstalled = docker --version 2>$null

if ($dockerInstalled) {
    # Check if MySQL container is running
    $containerRunning = docker ps --format "table {{.Names}}" | Select-String "nherams-mysql"
    
    if (-Not $containerRunning) {
        Write-Host "Starting MySQL container..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host "✓ MySQL container started" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "✓ MySQL container already running" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ Docker not found. Make sure MySQL is running locally" -ForegroundColor Yellow
    Write-Host "  Or install Docker Desktop and run: docker-compose up -d" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Seeding database..." -ForegroundColor Yellow
Push-Location server
npm run seed 2>$null | Out-Null
Pop-Location
Write-Host "✓ Database ready" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Starting NHERAMS Services" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "Health:   http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""

Write-Host "Follow the next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open a new PowerShell window and run:" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "2. In this window, run:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "3. Open browser to: http://localhost:5173" -ForegroundColor White
Write-Host ""
