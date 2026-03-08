-- Enable PostGIS

CREATE EXTENSION IF NOT EXISTS postgis;

-- Users Table for Authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'self' or 'company'
    company_name VARCHAR(255),
    identification_type VARCHAR(50) NOT NULL, -- 'aadhar', 'pan', 'cin', 'gst', 'tin'
    identification_number VARCHAR(100) NOT NULL,
    office_address TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    document_path VARCHAR(500), -- Path to uploaded document
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roads Table
CREATE TABLE IF NOT EXISTS roads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    owner VARCHAR(100),
    surface_type VARCHAR(50),
    geom GEOMETRY(Geometry, 4326)
);
CREATE INDEX IF NOT EXISTS idx_roads_geom ON roads USING GIST (geom);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    purpose TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    geom GEOMETRY(Geometry, 4326), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_apps_geom ON applications USING GIST (geom);

-- Regions Table
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    geom GEOMETRY(Geometry, 4326)
);
CREATE INDEX IF NOT EXISTS idx_regions_geom ON regions USING GIST (geom);

-- Wards Table
CREATE TABLE IF NOT EXISTS wards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    geom GEOMETRY(Geometry, 4326)
);
CREATE INDEX IF NOT EXISTS idx_wards_geom ON wards USING GIST (geom);
