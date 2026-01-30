-- V4__seed_demo_data.sql

-- 1. Schema Changes (Safely add columns if missing)
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS capacity INT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS city VARCHAR(255);

-- 2. Clean Slate
TRUNCATE TABLE booking_seats CASCADE;
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE seats CASCADE;
TRUNCATE TABLE venues CASCADE;

-- ==========================================
-- STEP 1: CREATE VENUES
-- ==========================================
INSERT INTO venues (id, name, city, capacity) VALUES
                                                  (101, 'Wankhede Stadium', 'Mumbai', 33000),
                                                  (102, 'Narendra Modi Stadium', 'Ahmedabad', 132000),
                                                  (103, 'Bangalore International Centre', 'Bangalore', 5000),
                                                  (104, 'Rajiv Gandhi Intl Stadium', 'Hyderabad', 55000),
                                                  (105, 'Jawaharlal Nehru Stadium', 'Delhi', 60000)
    ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STEP 2: CREATE SEATS (For ALL Venues)
-- ==========================================
-- This generates 50 seats for EACH venue (101-105)
-- It calculates a unique ID (101, 102... 350) for every row.

INSERT INTO seats (id, venue_id, seat_number, price)
SELECT
    ROW_NUMBER() OVER (ORDER BY v.id, s.n) + 100, -- Generates IDs: 101, 102, 103...
    v.id,                                         -- Venue ID: 101, 102...
    s.n,
    1000.00
FROM venues v
         CROSS JOIN generate_series(1, 60) as s(n)
    ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STEP 3: CREATE USER
-- ==========================================
INSERT INTO users (id, name, email, password_hash, role, created_at, version)
VALUES (1, 'Demo User','demo@example.com', '$2a$10$D8bZ.2.9.8.7.6.5.4.3.2.1', 'ROLE_USER', NOW(), 0)
    ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STEP 4: CREATE EVENTS
-- ==========================================
INSERT INTO events (id, name, event_time, venue_id, image_url, created_at)
SELECT
    generate_series,
    CASE
        WHEN generate_series % 4 = 0 THEN 'Coldplay: Music of the Spheres'
        WHEN generate_series % 4 = 1 THEN 'IPL Final: CSK vs MI'
        WHEN generate_series % 4 = 2 THEN 'Tech Summit 2026'
        ELSE 'Trevor Noah: Off The Record'
        END || ' - ' || (ARRAY['Mumbai', 'Delhi', 'Bangalore'])[floor(random() * 3 + 1)],
    NOW() + (floor(random() * 60) || ' days')::interval,
    floor(random() * 5 + 101),
    CASE
        WHEN generate_series % 4 = 0 THEN 'https://images.unsplash.com/photo-1459749411177-2a2965bda36c?auto=format&fit=crop&w=800&q=80'
        WHEN generate_series % 4 = 1 THEN 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'
        WHEN generate_series % 4 = 2 THEN 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80'
END,
    NOW()
FROM generate_series(1, 100)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STEP 5: CREATE BOOKINGS
-- ==========================================
INSERT INTO bookings (id, event_id, user_id, status, created_at, expires_at, version)
SELECT
    generate_series,
    floor(random() * 50 + 1),
    1,
    'CONFIRMED',
    NOW(),
    NOW() + INTERVAL '1 day',
    0
FROM generate_series(1, 200)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STEP 6: CREATE BOOKING SEATS
-- ==========================================
INSERT INTO booking_seats (booking_id, seat_id)
SELECT
    generate_series,
    generate_series + 100
FROM generate_series(1, 200)
    ON CONFLICT DO NOTHING;


SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));