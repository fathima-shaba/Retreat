-- Supabase PostgreSQL Migration Script for Hostel Management System
-- Run this complete script inside Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Enable UUID Extension (Optional utility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    floor VARCHAR(10) DEFAULT 'A' NOT NULL,
    status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create room_sharing_rates Table
CREATE TABLE IF NOT EXISTS room_sharing_rates (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    sharing_type INT NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT room_sharing_unique UNIQUE (room_id, sharing_type)
);

-- 5. Create members Table
CREATE TABLE IF NOT EXISTS members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    dob DATE,
    aadhar_number VARCHAR(20),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(50),
    room_id BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
    sharing_type INT,
    address TEXT,
    joined_date DATE,
    admission_fee NUMERIC(10, 2) DEFAULT 0.00,
    deposit_fee NUMERIC(10, 2) DEFAULT 0.00,
    rent_fee NUMERIC(10, 2) DEFAULT 0.00,
    next_due_date DATE,
    member_type VARCHAR(50) DEFAULT 'Other',
    institution_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Overdue')),
    payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create expense_categories Table
CREATE TABLE IF NOT EXISTS expense_categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Seed Default Expense Categories
INSERT INTO expense_categories (name) VALUES 
    ('Mess'), ('Food'), ('Electricity'), ('Water'), ('Maintenance'),
    ('Cleaning'), ('Labor / Workers'), ('Worker Salary'), ('Rent/Lease'),
    ('Internet'), ('Repairs'), ('Supplies'), ('Other')
ON CONFLICT (name) DO NOTHING;

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_members_room_id ON members(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_room_sharing_rates_room_id ON room_sharing_rates(room_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
