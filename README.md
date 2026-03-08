# C-MARKS - Chennai Road Cut Management System

A comprehensive web-based platform for managing road cutting permissions and Right-of-Way (RoW) in Chennai.

## Features

- 🗺️ Interactive map interface with Mapbox GL JS
- 📍 Real-time road network visualization
- 📝 Road cutting application workflow
- 🔍 Google Street View integration for virtual inspection
- 👨‍💼 Admin dashboard for application approval/rejection
- 🌓 Dark/Light mode support
- 🎨 Modern glassmorphism UI design

## Tech Stack

### Frontend
- React 18 with Vite
- Mapbox GL JS for mapping
- Lucide React for icons
- CSS Variables for theming

### Backend
- Node.js with Express 5
- PostgreSQL with PostGIS extension
- RESTful API architecture

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ with PostGIS
- Mapbox API token

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Roadcuttingtool
```

2. **Install dependencies**
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. **Configure environment variables**

Backend (`server/.env`):
```env
PORT=5001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=cmarks
DB_PASSWORD=your_password
DB_PORT=5432
```

Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5001
VITE_MAPBOX_TOKEN=your_mapbox_token
```

4. **Set up database**
```bash
# Create database
createdb cmarks

# Run schema
psql -d cmarks -f server/src/schema.sql

# Seed data
node server/src/seed.js
```

5. **Run the application**
```bash
# Backend (from server directory)
node src/index.js

# Frontend (from client directory)
npm run dev
```

Access the application at `http://localhost:5173`

## Azure Deployment

See [Azure Deployment Plan](./azure_deployment_plan.md) for detailed deployment instructions.

## Project Structure

```
Roadcuttingtool/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── index.css      # Global styles
│   └── public/            # Static assets
├── server/                # Backend Node.js API
│   └── src/
│       ├── routes/        # API routes
│       ├── db.js          # Database connection
│       ├── index.js       # Server entry point
│       └── schema.sql     # Database schema
└── images/                # KML files and assets
```

## API Endpoints

- `GET /api/roads` - Fetch all roads
- `GET /api/applications` - Fetch all applications
- `POST /api/applications` - Create new application
- `PATCH /api/applications/:id/status` - Update application status
- `GET /api/boundaries/regions` - Fetch region boundaries
- `GET /api/boundaries/wards` - Fetch ward boundaries

## License

ISC

## Author

Developed for Chennai Municipal Corporation
