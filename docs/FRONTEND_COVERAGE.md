# Frontend Coverage

This frontend was built specifically against Steven's backend route structure.

## Auth
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me

## Student
- GET /api/student/clubs
- GET /api/student/clubs/categories
- GET /api/student/clubs/:clubId
- POST /api/student/membership/join
- GET /api/student/events
- GET /api/student/events/:eventId
- POST /api/student/events/register
- GET /api/student/announcements
- GET /api/student/announcements/:announcementId

## Club Executive
- GET /api/executive/club
- PUT /api/executive/club
- GET /api/executive/members
- GET /api/executive/members/requests
- PUT /api/executive/members/approve
- PUT /api/executive/members/reject
- DELETE /api/executive/members/remove
- GET /api/executive/events
- POST /api/executive/events
- PUT /api/executive/events/:eventId
- PUT /api/executive/events/:eventId/publish
- DELETE /api/executive/events/:eventId
- GET /api/executive/events/:eventId/registrations
- GET /api/executive/registrations
- GET /api/executive/announcements
- POST /api/executive/announcements
- PUT /api/executive/announcements/:announcementId
- PUT /api/executive/announcements/:announcementId/publish

## Admin
- GET /api/admin/users
- GET /api/admin/users/:userId
- PUT /api/admin/users/:userId/role
- PUT /api/admin/users/:userId/disable
- PUT /api/admin/users/:userId/enable
- GET /api/admin/clubs
- PUT /api/admin/clubs/:clubId/approve
- PUT /api/admin/clubs/:clubId/status
- DELETE /api/admin/clubs/:clubId
- GET /api/admin/activities/recent
- GET /api/admin/activities/logs
- GET /api/admin/activities/failed
- GET /api/admin/reports/generate
- GET /api/admin/announcements
- DELETE /api/admin/announcements/:announcementId
- GET /api/admin/all-data
