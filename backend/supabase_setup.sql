-- SQL Script for Supabase (PostgreSQL)
-- Run this in the Supabase SQL Editor

-- 1. Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'NGO', 'MESS_HEAD', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Food Categories Table
CREATE TABLE food_categories (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'VEG', 'NON-VEG'
    category VARCHAR(255) NOT NULL
);

-- 3. Create Food Items Table
CREATE TABLE food_items (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES food_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

-- 4. Create Packages Table
CREATE TABLE packages (
    id BIGSERIAL PRIMARY KEY,
    package_code VARCHAR(255) UNIQUE NOT NULL,
    hostel_name VARCHAR(255),
    remarks TEXT,
    created_by BIGINT REFERENCES users(id),
    date DATE,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'DELIVERED'
    accepted_by BIGINT REFERENCES users(id),
    rating INT DEFAULT 0,
    feedback TEXT,
    feedback_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Package Items Table
CREATE TABLE package_items (
    id BIGSERIAL PRIMARY KEY,
    package_id BIGINT REFERENCES packages(id) ON DELETE CASCADE,
    food_item_id BIGINT REFERENCES food_items(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1
);

-- 6. Create Deliveries Table
CREATE TABLE deliveries (
    id BIGSERIAL PRIMARY KEY,
    package_id BIGINT REFERENCES packages(id) ON DELETE CASCADE,
    ngo_id BIGINT REFERENCES users(id),
    delivery_person_name VARCHAR(255),
    delivery_person_contact VARCHAR(255),
    arrival_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add sample data (optional)
INSERT INTO food_categories (type, category) VALUES ('VEG', 'Meals'), ('NON-VEG', 'Meals'), ('VEG', 'Snacks');
