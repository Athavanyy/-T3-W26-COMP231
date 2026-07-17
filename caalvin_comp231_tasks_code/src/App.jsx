import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BrowseClubs from './pages/student/BrowseClubs.jsx';
import ClubDetails from './pages/student/ClubDetails.jsx';
import JoinConfirmation from './pages/student/JoinConfirmation.jsx';
import SelectEvent from './pages/student/SelectEvent.jsx';
import ExecutiveDashboard from './pages/executive/ExecutiveDashboard.jsx';
import ViewMemberList from './pages/executive/ViewMemberList.jsx';
import ManageMembers from './pages/executive/ManageMembers.jsx';
import ManageEvents from './pages/executive/ManageEvents.jsx';
import EnterEventDetails from './pages/executive/EnterEventDetails.jsx';
import EditEvent from './pages/executive/EditEvent.jsx';
import PublishedEvents from './pages/executive/PublishedEvents.jsx';
import PublishEventValidation from './pages/executive/PublishEventValidation.jsx';
import PostAnnouncements from './pages/executive/PostAnnouncements.jsx';
import ApproveJoinRequest from './pages/executive/ApproveJoinRequest.jsx';
import UpdateUserRoleValidation from './pages/admin/UpdateUserRoleValidation.jsx';
import ApproveClubValidation from './pages/admin/ApproveClubValidation.jsx';
import ApproveClub from './pages/admin/ApproveClub.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import RegisterEvent from './pages/student/RegisterEvent.jsx';

function Unauthorized() {
  return (
    <main className="page narrow">
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to view this page, or your account is disabled.</p>
    </main>
  );
}

export default function App() {
  const { user } = useAuth();

  const homePath = user?.role === 'Club Executive'
    ? '/executive/dashboard'
    : user?.role === 'Administrator'
      ? '/admin/users/test-user-001/role'
      : '/student/clubs';

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to={homePath} replace />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* Caalvin task: RS-02 */}
        <Route
          path="student/clubs"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <BrowseClubs />
            </ProtectedRoute>
          }
        />

        {/* Caalvin task: RS-06 */}
        <Route
          path="student/clubs/:clubId"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <ClubDetails />
            </ProtectedRoute>
          }
        />

        {/* Caalvin task: RS-10 */}
        <Route
          path="student/join-confirmation/:requestId?"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <JoinConfirmation />
            </ProtectedRoute>
          }
        />

        {/* Caalvin task: RS-16 */}
        <Route
          path="student/events/select"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <SelectEvent />
            </ProtectedRoute>
          }
        />

        {/* Richard Phu: RS-15 */}
        <Route
          path="student/events/register/:eventId"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <RegisterEvent />
            </ProtectedRoute>
          }
        />

        {/* Caalvin task: RCE-01 */}
        <Route
          path="executive/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <ExecutiveDashboard />
            </ProtectedRoute>
          }
        />

        {/* Caalvin task: RCE-12 */}
        <Route
          path="executive/events"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <ManageEvents />
            </ProtectedRoute>
          }
        />

        {/* Richard Phu: RCE-14 */}

        <Route
          path="executive/events/create"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <EnterEventDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="executive/events/edit"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="executive/events/published"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <PublishedEvents />
            </ProtectedRoute>
          }
        />

        {/* Caalvin task: RCE-15 Task 2 */}
        <Route
          path="executive/events/:eventId/publish"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <PublishEventValidation />
            </ProtectedRoute>
          }
        />

        {/* Richard Phu: RCE-07 */}
        <Route
          path="executive/members/list"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <ViewMemberList />
            </ProtectedRoute>
          }
        />

        {/* Richard Phu: RCE-06 */}
        <Route
          path="executive/members"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <ManageMembers />
            </ProtectedRoute>
          }
        />

        {/* Richard Phu: RCE-09 */}
        <Route
          path="executive/join-requests"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <ApproveJoinRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="executive/announcements"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <PostAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/users/manage"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/clubs/approve"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <ApproveClub />
            </ProtectedRoute>
          }
        />

        {/* Caalvin task: RA-05 Task 2 */}
        <Route
          path="admin/users/:userId/role"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <UpdateUserRoleValidation />
            </ProtectedRoute>
          }
        />

        {/* Caalvin task: RA-09 Task 2 */}
        <Route
          path="admin/clubs/:clubId/approve"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <ApproveClubValidation />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
