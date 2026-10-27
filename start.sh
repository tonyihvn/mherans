#!/bin/bash

# NHERAMS Quick Start Script

echo "======================================"
echo "NHERAMS Pilot Portal - Quick Start"
echo "======================================"
echo ""

# Check if backend/.env exists
if [ ! -f "server/.env" ]; then
    echo "Creating backend .env file..."
    cp server/.env.example server/.env
    echo "✓ Created server/.env"
    echo "  Please update database credentials if needed"
    echo ""
fi

# Check if node_modules exists for server
if [ ! -d "server/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd server
    npm install
    cd ..
    echo "✓ Backend dependencies installed"
    echo ""
fi

# Check if node_modules exists for frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo "✓ Frontend dependencies installed"
    echo ""
fi

# Database check
echo "Checking database..."
if command -v docker &> /dev/null; then
    # Check if MySQL container is running
    if ! docker ps | grep -q nherams-mysql; then
        echo "Starting MySQL container..."
        docker-compose up -d
        echo "✓ MySQL container started"
        sleep 2
    else
        echo "✓ MySQL container already running"
    fi
else
    echo "⚠ Docker not found. Make sure MySQL is running locally"
    echo "  Or install Docker and run: docker-compose up -d"
fi

echo ""
echo "Seeding database..."
cd server
npm run seed > /dev/null 2>&1 || echo "Database may already be seeded"
cd ..
echo "✓ Database ready"
echo ""

echo "======================================"
echo "Starting NHERAMS Services"
echo "======================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000/api"
echo "Health:   http://localhost:5000/api/health"
echo ""

# Start backend in background
echo "Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Start frontend
echo "Starting frontend server..."
npm run dev

# Clean up
kill $BACKEND_PID 2>/dev/null
