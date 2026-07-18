import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import WireframePage from './components/WireframePage.jsx';
import BrowseClubs from './pages/student/BrowseClubs.jsx';
import ClubDetails from './pages/student/ClubDetails.jsx';
import JoinConfirmation from './pages/student/JoinConfirmation.jsx';
import SelectEvent from './pages/student/SelectEvent.jsx';
import ExecutiveDashboard from './pages/executive/ExecutiveDashboard.jsx';
import ManageEvents from './pages/executive/ManageEvents.jsx';
import PublishEventValidation from './pages/executive/PublishEventValidation.jsx';
import PostAnnouncements from './pages/executive/PostAnnouncements.jsx';
import UpdateUserRoleValidation from './pages/admin/UpdateUserRoleValidation.jsx';
import ApproveClubValidation from './pages/admin/ApproveClubValidation.jsx';
import LoginPage from './pages/LoginPage.jsx';

function Unauthorized() {
  return (
    <main className="page narrow">
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to view this page, or your account is disabled.</p>
    </main>
  );
}

function Home() {
  return (
    <WireframePage title="Home" subtitle="Welcome to Campus Clubs">
      <section className="page narrow">
        <p>Use the role selector (top-right) to switch test users and navigate the app.</p>
      </section>
    </WireframePage>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<LoginPage />} />
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

        {/* Caalvin task: RCE-15 Task 2 */}
        <Route
          path="executive/events/:eventId/publish"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <PublishEventValidation />
            </ProtectedRoute>
          }
        />

        {/* Caalvin task: RCE-18 */}
        <Route
          path="executive/announcements"
          element={
            <ProtectedRoute allowedRoles={["Club Executive"]}>
              <PostAnnouncements />
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
