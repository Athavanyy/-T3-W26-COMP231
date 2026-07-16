# Campus Club Management System

This repository contains the T3-W26-COMP231 project, including the ASP.NET backend, the Vite frontend, and the backend/database integration work for Railway MySQL.

## Repository structure

- client/ - Vite + React frontend
- CCMS.Api/ - ASP.NET Core backend implementation
- CCMS.Tests/ - backend test suite
- server/ - Node.js reference backend
- caalvin_comp231_tasks_code/ - task notes and acceptance checklist
- _scaffold_extract/ - scaffold examples and reference files
- docs/ - project organization notes

## Current setup

- The active backend is the ASP.NET project in CCMS.Api/
- The active frontend is the Vite app in client/
- The Node backend in server/ is kept as a reference implementation only

## Local run steps

1. Start the backend:
   ```powershell
   dotnet run --project CCMS.Api/CCMS.Api.csproj
   ```

2. Start the frontend:
   ```powershell
   cd client
   npm install
   npm run dev
   ```

3. Use the frontend to exercise the available API routes.

## Verification

- Backend tests: `dotnet test CCMS.slnx` ✓
- Frontend build: `npm run build` inside client/ ✓

## Notes

- The backend/database integration has been verified and pushed to the feature branch.
- The project structure is now organized around the active app folders.

## Railway MySQL Backend Integration

The ASP.NET backend connects to the Railway MySQL database through a MySQL connection factory and repository layer.

### Required Environment Variables

Configure these values locally:

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

Do not commit real database credentials or the .env file to GitHub.

### Backend Setup

Restore the project dependencies:

```bash
dotnet restore
```

Build the solution:

```bash
dotnet build
```

Run the automated tests:

```bash
dotnet test CCMS.slnx
```

If the solution file has a different name, use the correct .sln or .slnx filename.

### Verified API Endpoints

The backend provides database retrieval endpoints for:

- /api/users
- /api/clubs
- /api/events
- /api/announcements
- /api/memberships
- /api/join-requests
- /api/club-executives

These endpoints retrieve records from the Railway MySQL database and return JSON responses.

### Database Tables

The integration supports the following tables:

- users
- clubs
- club_executives
- join_requests
- memberships
- events
- event_registrations
- announcements

### Files That Must Not Be Committed

Make sure .gitignore excludes:

- .env
- .env.*
- !.env.example
- bin/
- obj/
- node_modules/
- dist/
- build/
- TestResults/
- .vs/
- *.user
- *.suo

### Integration Verification

The following checks should be completed before merging:

- Database connection succeeds
- Environment variables are loaded correctly
- No real credentials are hardcoded
- API routes return successful HTTP responses
- Users are retrieved successfully
- Clubs are retrieved successfully
- Events are retrieved successfully
- Announcements are retrieved successfully
- Memberships are retrieved successfully
- Join requests are retrieved successfully
- Club executives are retrieved successfully
- All automated tests pass
