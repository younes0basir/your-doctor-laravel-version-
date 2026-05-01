-- =============================================
-- Your Doctor Database Schema for Neon PostgreSQL
-- =============================================

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin', 'assistant')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    image VARCHAR(255) NULL,
    date_of_birth DATE NULL,
    gender VARCHAR(50) NULL CHECK (gender IN ('male', 'female', 'other')),
    address TEXT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Indexes for users table
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);

-- 2. Personal Access Tokens Table (for Sanctum authentication)
CREATE TABLE personal_access_tokens (
    id SERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Index for tokens
CREATE INDEX idx_personal_access_tokens_tokenable ON personal_access_tokens(tokenable_type, tokenable_id);

-- 3. Doctors Table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(255) NOT NULL,
    license_number VARCHAR(255) UNIQUE NOT NULL,
    education TEXT NULL,
    experience_years INTEGER DEFAULT 0,
    consultation_fee DECIMAL(10, 2) DEFAULT 0,
    about TEXT NULL,
    available_days JSON NULL,
    available_time_start TIME NULL,
    available_time_end TIME NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Indexes for doctors table
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_doctors_status ON doctors(status);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);

-- 4. Appointments Table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    type VARCHAR(50) NOT NULL DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow-up', 'emergency')),
    reason TEXT NOT NULL,
    notes TEXT NULL,
    amount DECIMAL(10, 2) DEFAULT 0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Indexes for appointments table
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);

-- 5. Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Indexes for reviews table
CREATE INDEX idx_reviews_doctor_id ON reviews(doctor_id);
CREATE INDEX idx_reviews_patient_id ON reviews(patient_id);
CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id);

-- 6. Migrations Table (to track migrations)
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INTEGER NOT NULL
);

-- =============================================
-- Sample Data (Optional - for testing)
-- =============================================

-- Insert sample admin user (password: password)
INSERT INTO users (first_name, last_name, email, password, role, status, phone, created_at, updated_at)
VALUES (
    'Admin',
    'User',
    'admin@yourdoctor.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'active',
    '+33123456789',
    NOW(),
    NOW()
);

-- Insert sample doctors
INSERT INTO users (first_name, last_name, email, password, role, status, phone, created_at, updated_at)
VALUES 
('Jean', 'Dupont', 'dr.dupont@yourdoctor.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', 'active', '+33612345678', NOW(), NOW()),
('Marie', 'Martin', 'dr.martin@yourdoctor.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', 'active', '+33623456789', NOW(), NOW()),
('Pierre', 'Bernard', 'dr.bernard@yourdoctor.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', 'active', '+33634567890', NOW(), NOW());

-- Insert doctor profiles
INSERT INTO doctors (user_id, specialty, license_number, education, experience_years, consultation_fee, status, available_days, available_time_start, available_time_end, created_at, updated_at)
VALUES
(2, 'Cardiology', 'CARD-001', 'MD from University of Paris', 15, 100.00, 'approved', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]', '09:00:00', '17:00:00', NOW(), NOW()),
(3, 'Pediatrics', 'PED-001', 'MD from University of Paris', 10, 80.00, 'approved', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]', '09:00:00', '17:00:00', NOW(), NOW()),
(4, 'Dermatology', 'DERM-001', 'MD from University of Paris', 8, 90.00, 'approved', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]', '09:00:00', '17:00:00', NOW(), NOW());

-- Insert sample patients
INSERT INTO users (first_name, last_name, email, password, role, status, phone, created_at, updated_at)
VALUES 
('Sophie', 'Petit', 'sophie@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient', 'active', '+33645678901', NOW(), NOW()),
('Lucas', 'Robert', 'lucas@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient', 'active', '+33656789012', NOW(), NOW()),
('Emma', 'Richard', 'emma@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient', 'active', '+33667890123', NOW(), NOW());

-- Insert migration records
INSERT INTO migrations (migration, batch) VALUES
('2014_10_12_000000_create_users_table', 1),
('2019_12_14_000001_create_personal_access_tokens_table', 1),
('2024_01_01_000001_create_doctors_table', 1),
('2024_01_01_000002_create_appointments_table', 1),
('2024_01_01_000003_create_reviews_table', 1);

-- =============================================
-- Done! Database is ready to use.
-- =============================================
