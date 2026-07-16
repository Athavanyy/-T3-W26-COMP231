# Campus Club Management System

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

- No changes have been pushed to GitHub.
- The project structure is now organized around the active app folders.
