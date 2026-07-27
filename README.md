# Campus Club Management System - Steven Backend + Working Frontend

This project keeps Steven's Node/Express/MySQL backend and adds a complete browser frontend served by the same Express server.

## What is included

### Backend
- Authentication: register, login, current user
- Student APIs: browse/search clubs, club details, join request, browse events, event details, event registration, announcements
- Club Executive APIs: club profile, members, join requests, approve/reject, events, registrations, announcements
- Admin APIs: users, roles, enable/disable, clubs, approve/status/remove, announcements, activity monitoring, reports
- Added admin-only `/api/admin/all-data` endpoint to show every main table in one page

### Frontend
Open the app in the browser and login as one of the roles.

Student screens:
- Browse/search clubs
- View club details
- Submit join request
- Browse/search events
- View event details
- Register for event
- View announcements

Club Executive screens:
- View/update assigned club profile
- View active members
- View pending join requests
- Approve/reject join requests
- Remove members
- Create/edit/publish/cancel events
- View event registrations
- Create/edit/publish announcements

Admin screens:
- View/filter users
- Update user role
- Enable/disable users
- View/filter clubs
- Approve clubs
- Update club status
- Remove/inactivate clubs
- View/remove announcements
- View activities
- Generate reports
- View all database tables

## Setup steps

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` and rename the copy to `.env`.

3. Put your Railway MySQL password in `.env`:

```env
DB_PASSWORD=your_actual_password_here
```

4. Run the database SQL files in Railway or MySQL Workbench:

```text
database/schema.sql
database/seed.sql
```

5. Start the app:

```bash
npm run dev
```

6. Open:

```text
http://localhost:5000
```

## Demo accounts

All demo passwords are:

```text
password123
```

Accounts:

```text
student@college.ca
executive@college.ca
admin@college.ca
```

## Important notes

- Student APIs intentionally show student-available public data, such as ACTIVE clubs and PUBLISHED events/announcements.
- Executive APIs show data for the club assigned to the executive in `club_executives`.
- Admin can see all users/clubs/announcements/reports, plus the added All Database Data page.
- The project does not include `node_modules` or real `.env` secrets.
