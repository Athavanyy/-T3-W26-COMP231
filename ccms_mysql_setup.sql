CREATE DATABASE IF NOT EXISTS railway
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE railway;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clubs (
    club_id INT AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    meeting_details VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS club_executives (
    club_executive_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_club_executives UNIQUE (user_id, club_id),
    CONSTRAINT fk_club_executives_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_club_executives_club
        FOREIGN KEY (club_id) REFERENCES clubs(club_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS join_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    request_status VARCHAR(50) NOT NULL,
    request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_join_requests UNIQUE (user_id, club_id),
    CONSTRAINT fk_join_requests_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_join_requests_club
        FOREIGN KEY (club_id) REFERENCES clubs(club_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS memberships (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_memberships UNIQUE (user_id, club_id),
    CONSTRAINT fk_memberships_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_memberships_club
        FOREIGN KEY (club_id) REFERENCES clubs(club_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_club
        FOREIGN KEY (club_id) REFERENCES clubs(club_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_status VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_event_registrations UNIQUE (event_id, user_id),
    CONSTRAINT fk_event_registrations_event
        FOREIGN KEY (event_id) REFERENCES events(event_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_event_registrations_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcements_club
        FOREIGN KEY (club_id) REFERENCES clubs(club_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO users (full_name, email, password_hash, role, status)
VALUES
    ('Sarah Student', 'sarah.student@campus.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6T1vKqv7l9Q5zL3jYbqL0oQwQ2l1y', 'STUDENT', 'ACTIVE'),
    ('Daniel Executive', 'daniel.executive@campus.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6T1vKqv7l9Q5zL3jYbqL0oQwQ2l1y', 'CLUB_EXECUTIVE', 'ACTIVE'),
    ('Michael Admin', 'michael.admin@campus.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6T1vKqv7l9Q5zL3jYbqL0oQwQ2l1y', 'ADMIN', 'ACTIVE'),
    ('Aman Student', 'aman.student@campus.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6T1vKqv7l9Q5zL3jYbqL0oQwQ2l1y', 'STUDENT', 'ACTIVE'),
    ('Priya Student', 'priya.student@campus.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6T1vKqv7l9Q5zL3jYbqL0oQwQ2l1y', 'STUDENT', 'ACTIVE')
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    status = VALUES(status);

INSERT INTO clubs (club_name, category, description, meeting_details, status)
VALUES
    ('Photography Club', 'Arts', 'A club for students interested in photography, editing, and visual storytelling.', 'Meets every Tuesday at 6:00 PM in Room B12', 'ACTIVE'),
    ('Code Club', 'Technology', 'A community for students who want to learn programming and build cool projects.', 'Meets every Thursday at 5:30 PM in Lab 3', 'ACTIVE'),
    ('Music Club', 'Arts', 'A place for students to explore music performance, composition, and live events.', 'Meets every Wednesday at 7:00 PM in Studio A', 'ACTIVE'),
    ('Business Club', 'Business', 'A club for aspiring entrepreneurs and students interested in startup culture.', 'Meets every Friday at 4:00 PM in Hall C', 'ACTIVE')
ON DUPLICATE KEY UPDATE
    category = VALUES(category),
    description = VALUES(description),
    meeting_details = VALUES(meeting_details),
    status = VALUES(status);

INSERT INTO club_executives (user_id, club_id)
SELECT u.user_id, c.club_id
FROM users u
JOIN clubs c ON c.club_name IN ('Photography Club', 'Code Club')
WHERE u.email = 'daniel.executive@campus.edu'
ON DUPLICATE KEY UPDATE club_id = VALUES(club_id);

INSERT INTO join_requests (user_id, club_id, request_status)
SELECT u.user_id, c.club_id, 'PENDING'
FROM users u
JOIN clubs c ON c.club_name = 'Photography Club'
WHERE u.email = 'sarah.student@campus.edu'
ON DUPLICATE KEY UPDATE request_status = VALUES(request_status);

INSERT INTO join_requests (user_id, club_id, request_status)
SELECT u.user_id, c.club_id, 'PENDING'
FROM users u
JOIN clubs c ON c.club_name = 'Code Club'
WHERE u.email = 'aman.student@campus.edu'
ON DUPLICATE KEY UPDATE request_status = VALUES(request_status);

INSERT INTO join_requests (user_id, club_id, request_status)
SELECT u.user_id, c.club_id, 'APPROVED'
FROM users u
JOIN clubs c ON c.club_name = 'Music Club'
WHERE u.email = 'priya.student@campus.edu'
ON DUPLICATE KEY UPDATE request_status = VALUES(request_status);

INSERT INTO memberships (user_id, club_id, status)
SELECT u.user_id, c.club_id, 'ACTIVE'
FROM users u
JOIN clubs c ON c.club_name = 'Photography Club'
WHERE u.email = 'sarah.student@campus.edu'
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO memberships (user_id, club_id, status)
SELECT u.user_id, c.club_id, 'ACTIVE'
FROM users u
JOIN clubs c ON c.club_name = 'Code Club'
WHERE u.email = 'aman.student@campus.edu'
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO memberships (user_id, club_id, status)
SELECT u.user_id, c.club_id, 'ACTIVE'
FROM users u
JOIN clubs c ON c.club_name = 'Music Club'
WHERE u.email = 'priya.student@campus.edu'
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO events (club_id, title, description, event_date, event_time, location, status)
SELECT c.club_id, 'Campus Photography Walk', 'A guided photo walk across campus with tips on composition and storytelling.', '2026-08-05', '14:00:00', 'Main Quad', 'PUBLISHED'
FROM clubs c
WHERE c.club_name = 'Photography Club'
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    event_date = VALUES(event_date),
    event_time = VALUES(event_time),
    location = VALUES(location),
    status = VALUES(status);

INSERT INTO events (club_id, title, description, event_date, event_time, location, status)
SELECT c.club_id, 'Intro Coding Workshop', 'A beginner-friendly workshop covering HTML, CSS, and JavaScript basics.', '2026-08-12', '16:30:00', 'Innovation Lab', 'PUBLISHED'
FROM clubs c
WHERE c.club_name = 'Code Club'
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    event_date = VALUES(event_date),
    event_time = VALUES(event_time),
    location = VALUES(location),
    status = VALUES(status);

INSERT INTO events (club_id, title, description, event_date, event_time, location, status)
SELECT c.club_id, 'Startup Pitch Practice', 'A rehearsal session for students preparing for startup pitch competitions.', '2026-08-20', '18:00:00', 'Business Hall', 'DRAFT'
FROM clubs c
WHERE c.club_name = 'Business Club'
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    event_date = VALUES(event_date),
    event_time = VALUES(event_time),
    location = VALUES(location),
    status = VALUES(status);

INSERT INTO event_registrations (event_id, user_id, registration_status)
SELECT e.event_id, u.user_id, 'CONFIRMED'
FROM events e
JOIN users u ON u.email = 'sarah.student@campus.edu'
WHERE e.title = 'Campus Photography Walk'
ON DUPLICATE KEY UPDATE registration_status = VALUES(registration_status);

INSERT INTO event_registrations (event_id, user_id, registration_status)
SELECT e.event_id, u.user_id, 'CONFIRMED'
FROM events e
JOIN users u ON u.email = 'aman.student@campus.edu'
WHERE e.title = 'Intro Coding Workshop'
ON DUPLICATE KEY UPDATE registration_status = VALUES(registration_status);

INSERT INTO event_registrations (event_id, user_id, registration_status)
SELECT e.event_id, u.user_id, 'PENDING'
FROM events e
JOIN users u ON u.email = 'priya.student@campus.edu'
WHERE e.title = 'Intro Coding Workshop'
ON DUPLICATE KEY UPDATE registration_status = VALUES(registration_status);

INSERT INTO announcements (club_id, title, message, status)
SELECT c.club_id, 'Photography Club Kickoff', 'Welcome to the new semester! Join us for our upcoming photography walk and creative sessions.', 'PUBLISHED'
FROM clubs c
WHERE c.club_name = 'Photography Club'
ON DUPLICATE KEY UPDATE
    message = VALUES(message),
    status = VALUES(status);

INSERT INTO announcements (club_id, title, message, status)
SELECT c.club_id, 'Code Club New Members Welcome', 'We are excited to welcome new members to our coding community and workshop series.', 'DRAFT'
FROM clubs c
WHERE c.club_name = 'Code Club'
ON DUPLICATE KEY UPDATE
    message = VALUES(message),
    status = VALUES(status);

SELECT * FROM users;
SELECT * FROM clubs;
SELECT * FROM club_executives;
SELECT * FROM join_requests;
SELECT * FROM memberships;
SELECT * FROM events;
SELECT * FROM event_registrations;
SELECT * FROM announcements;
