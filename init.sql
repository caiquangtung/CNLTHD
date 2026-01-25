-- Event Booking System Database Initialization
-- This file will be executed when the PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('active', 'expired', 'converted', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'paid', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('active', 'used', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
-- These will be created when tables are created, but we can prepare the functions

-- Sample data for development
-- You can uncomment and modify these inserts for testing

/*
-- Insert admin user (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@eventbooking.com',
    crypt('admin123', gen_salt('bf')),
    'System Administrator',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample user (password: user123)
INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'user@example.com',
    crypt('user123', gen_salt('bf')),
    'Sample User',
    'user',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample event
INSERT INTO events (id, slug, name, description, location, start_time, end_time, status, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'sample-event-2024',
    'Sample Music Festival 2024',
    'A great music festival with multiple artists and amazing atmosphere.',
    'Ho Chi Minh City, Vietnam',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '31 days',
    'published',
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;
*/