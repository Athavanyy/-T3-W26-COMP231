-- Demo data for Steven's backend. Password for all demo users is: password123
-- This seed uses INSERT IGNORE so rerunning will not duplicate users or executive assignments.

INSERT IGNORE INTO users (user_id, full_name, email, password_hash, role, status) VALUES
(1, 'Admin User', 'admin@college.ca', 'password123', 'ADMIN', 'ACTIVE'),
(2, 'Student User', 'student@college.ca', 'password123', 'STUDENT', 'ACTIVE'),
(3, 'Executive User', 'executive@college.ca', 'password123', 'CLUB_EXECUTIVE', 'ACTIVE'),
(4, 'Maya Patel', 'maya@college.ca', 'password123', 'STUDENT', 'ACTIVE'),
(5, 'Jordan Lee', 'jordan@college.ca', 'password123', 'STUDENT', 'ACTIVE');

INSERT IGNORE INTO clubs (club_id, club_name, description, category, meeting_details, status) VALUES
(1, 'Coding Club', 'A club for students interested in programming, hackathons, and software projects.', 'Technology', 'Mondays 5 PM, Room B201', 'ACTIVE'),
(2, 'Photography Club', 'Students meet to practice photography, editing, and portfolio building.', 'Arts', 'Wednesdays 4 PM, Studio A', 'ACTIVE'),
(3, 'Robotics Club', 'Build robots and learn hardware, sensors, and automation.', 'Technology', 'Fridays 3 PM, Lab C12', 'PENDING'),
(4, 'Volunteer Club', 'Community service and campus volunteering opportunities.', 'Community', 'Tuesdays 2 PM, Student Centre', 'ACTIVE');

INSERT IGNORE INTO club_executives (executive_id, user_id, club_id) VALUES
(1, 3, 1);

INSERT IGNORE INTO memberships (membership_id, user_id, club_id, status) VALUES
(1, 2, 1, 'ACTIVE'),
(2, 4, 1, 'ACTIVE'),
(3, 5, 2, 'ACTIVE');

INSERT IGNORE INTO join_requests (request_id, user_id, club_id, request_status) VALUES
(1, 2, 2, 'PENDING'),
(2, 4, 1, 'PENDING'),
(3, 5, 1, 'APPROVED');

INSERT IGNORE INTO events (event_id, club_id, title, description, event_date, event_time, location, status) VALUES
(1, 1, 'Intro to JavaScript Workshop', 'Beginner-friendly coding workshop for JavaScript basics.', '2027-02-10', '17:00:00', 'Room B201', 'PUBLISHED'),
(2, 1, 'Hackathon Planning Meeting', 'Planning meeting for the next campus hackathon.', '2027-02-18', '16:30:00', 'Room B201', 'DRAFT'),
(3, 2, 'Campus Photo Walk', 'Outdoor photo walk around campus with basic composition practice.', '2027-03-05', '14:00:00', 'Main Entrance', 'PUBLISHED');

INSERT IGNORE INTO event_registrations (registration_id, event_id, user_id, registration_status) VALUES
(1, 1, 2, 'REGISTERED'),
(2, 1, 4, 'REGISTERED'),
(3, 3, 5, 'REGISTERED');

INSERT IGNORE INTO announcements (announcement_id, club_id, title, message, status) VALUES
(1, 1, 'Welcome to Coding Club', 'Welcome everyone. Our first meeting will cover project ideas and team formation.', 'PUBLISHED'),
(2, 1, 'Draft: Hackathon Volunteers Needed', 'We are preparing volunteer roles for the upcoming hackathon.', 'DRAFT'),
(3, 2, 'Photography Contest', 'Submit your best campus photo by the end of the month.', 'PUBLISHED');
