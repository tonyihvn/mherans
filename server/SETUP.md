# NHERAMS Backend Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn package manager

## Installation Steps

### 1. Set Up MySQL Database

Make sure MySQL is running on your system:

```bash
# On Windows, if MySQL is installed:
# Start MySQL from Services or use command line:
mysql.server start

# Or connect to MySQL
mysql -u root -p
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory based on `.env.example`:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nherams_db
SERVER_PORT=5000
NODE_ENV=development
```

### 3. Install Dependencies

```bash
cd server
npm install
```

### 4. Initialize Database & Seed Data

The database tables will be created automatically when the server starts. To seed the database with initial data:

```bash
npm run seed
```

### 5. Start the Server

```bash
# Development mode (with auto-reload on file changes)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Facilities
- `GET /api/facilities` - Get all facilities
- `GET /api/facilities/:id` - Get facility by ID
- `POST /api/facilities` - Create new facility
- `PUT /api/facilities/:id` - Update facility
- `DELETE /api/facilities/:id` - Delete facility

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Audits
- `GET /api/audits` - Get all audits
- `GET /api/audits/facility/:facilityId` - Get latest audit for facility
- `POST /api/audits` - Save new audit
- `DELETE /api/audits/:id` - Delete audit

### Indicator Configuration
- `GET /api/config` - Get current indicator config
- `PUT /api/config` - Update indicator config

### Health Check
- `GET /api/health` - Check if server is running

## Database Schema

### Tables Created Automatically:

1. **facilities** - Healthcare facility information
2. **users** - System users with roles
3. **audits** - Energy and compliance audit data
4. **energy_profiles** - Energy consumption profiles per facility
5. **indicator_config** - Global configuration for energy indicators

## Troubleshooting

### MySQL Connection Issues
- Ensure MySQL is running
- Check credentials in `.env` file
- Verify database user has appropriate permissions

### Port Already in Use
If port 5000 is already in use, change `SERVER_PORT` in `.env`:

```env
SERVER_PORT=5001
```

### CORS Issues
If frontend and backend are on different ports, CORS is configured to allow:
- Origin: `http://localhost:5173` (default Vite frontend port)

Edit `server.js` to add additional origins if needed.

## Development Workflow

1. Start MySQL
2. Set up `.env` file
3. Run `npm install` in server directory
4. Run `npm run seed` to populate database
5. Run `npm run dev` to start server in development mode
6. Start React frontend in another terminal with `npm run dev`

## Data Flow

The NHERAMS application now follows this data flow:

```
React Frontend
    ↓
API Service Layer (services/api.ts)
    ↓
Express Backend Routes
    ↓
Database Models
    ↓
MySQL Database
```

All data is persisted in MySQL and synchronized across the application through the REST API.
