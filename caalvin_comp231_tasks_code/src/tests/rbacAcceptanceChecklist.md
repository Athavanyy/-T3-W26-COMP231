# C-01 Role-Based Access Control - Caalvin Task 3

Run these checks before marking C-01 Task 3 complete.

## Test Users

| Test User | Role | Disabled? |
|---|---|---|
| Test Student | Student | No |
| Test Executive | Club Executive | No |
| Test Admin | Administrator | No |
| Disabled User | Student | Yes |

## Acceptance Tests

| Scenario | Steps | Expected Result | Result |
|---|---|---|---|
| Student allowed | Switch to Test Student and open `/student/clubs` | Browse Clubs page opens | TBD |
| Student denied executive page | Switch to Test Student and open `/executive/dashboard` | Redirects to Unauthorized | TBD |
| Student denied admin page | Switch to Test Student and open `/admin/users/test-user-001/role` | Redirects to Unauthorized | TBD |
| Club Executive allowed | Switch to Test Executive and open `/executive/dashboard` | Club Executive Dashboard opens | TBD |
| Club Executive allowed view member list | Switch to Test Executive and open `/executive/members/list` | View Member List page opens showing active members | TBD |
| Club Executive can edit draft events | Switch to Test Executive and open `/executive/events/edit` | Edit Event page loads draft event cards or prototype draft data; missing event fields show validation warnings | TBD |
| Club Executive denied admin page | Switch to Test Executive and open `/admin/clubs/club-001/approve` | Redirects to Unauthorized | TBD |
| Administrator allowed | Switch to Test Admin and open `/admin/users/test-user-001/role` | Update User Role page opens | TBD |
| Administrator allowed Manage Users | Switch to Test Admin and open `/admin/users/manage` | Manage Users page opens showing user list and Add User button | TBD |
| Disabled account denied | Switch to Disabled User and open `/student/clubs` | Redirects to Unauthorized | TBD |
| Student submit join request | Submit a join request and open `/student/join/confirmation/:requestId` | Confirmation page shows request ID, status, and success message; invalid or missing request ID shows a validation error | TBD |

## Double-Check Before Complete

- [ ] Correct role can access assigned workflow.
- [ ] Wrong role is denied or redirected.
- [ ] Disabled account is denied.
- [ ] Page loads without browser console errors.
- [ ] Navigation links work.
- [ ] Success, error, loading, and empty states are visible where needed.
