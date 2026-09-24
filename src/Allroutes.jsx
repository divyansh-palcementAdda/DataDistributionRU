import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "./layouts/authlayout/AuthLayout";
import MainLayout from "./layouts/mainLayout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import PermissionRoute from "./PermissionRoute";
import RoleRoute from "./RoleRoute";

// Auth Pages
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import ForgotPassword from "./pages/auth/forgotpassword";
import OtpVerify from "./pages/auth/otpVerify";
import ResetPassword from "./pages/auth/resetPassword";

// Main Pages (src/ mein exist karte hain)
import Dashboard from "./pages/Dashboards/adminDashboard";
import HeadDashboard from "./pages/Dashboards/headDashboard";
import CallersDashboard from "./pages/Dashboards/callersDashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import FollowUps from "./pages/FollowUps";
import Counselors from "./pages/Counselors";
import Reports from "./pages/Reports";
import Courses from "./pages/Courses";
import Settings from "./pages/Settings";
import Leadsourse from "./pages/DataSource";
import DataSourceDetails from "./pages/dataSourceDetails";
import CourseType from "./pages/CourseType";
import CourseTypeDetails from "./pages/CourseTypeDetails";
import CourseDetails from "./pages/CourseDetails";
import LeadStatus from "./pages/Lead-status";
import LeadStatusDetails from "./pages/LeadStatusDetails";
import Grades from "./pages/Grades";
import GradesDetails from "./pages/gradesDetails";
import Boards from "./pages/Boards";
import BoardDetails from "./pages/boardsDetails";
import CounselorDetails from "./pages/counselorsDetails";
import Department from "./pages/Department";
import DepartmentDetails from "./pages/departmentDetails";
import Programs from "./pages/Programs";
import ProgramDetails from "./pages/ProgramDetails";

// Settings Sub-pages
import UserManagement from "./pages/settings/UserManagement";
import Notifications from "./pages/settings/Notifications";
import CRMConfig from "./pages/settings/CRMConfig";
import RolesAndPermissions from "./pages/settings/RolesAndPermissions";
import EmailSettings from "./pages/settings/EmailSettings";

import Datasegregation from "./pages/Data-segregation";
import DatasegregationDetail from "./pages/datasegregationDetail";


// Reusable Components / Standalone Pages
import StudentForm from "./component/reusable/studentForm";
import QRCodePage from "./component/reusable/qrCode";
import RoleBasedDashboardRedirect from "./RoleBasedDashboardRedirect";

const Allroutes = () => {
  return (
    <Routes>
      {/* Auth routes — wrapped in AuthLayout and AuthRoute */}
      <Route
        element={
          <AuthRoute>
            <AuthLayout />
          </AuthRoute>
        }
      >
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Main app routes — wrapped in MainLayout and ProtectedRoute */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleBasedDashboardRedirect />} />
        <Route path="/head-dashboard" element={
          <RoleRoute allowedRoles={["HEAD", "HOD"]}>
            <HeadDashboard />
          </RoleRoute>
        } />
        <Route path="/callers-dashboard" element={
          <RoleRoute allowedRoles={["COUNSELOR"]}>
            <CallersDashboard />
          </RoleRoute>
        } />

        <Route path="/leads" element={
          <PermissionRoute requiredPermission="LEAD_READ">
            <Leads />
          </PermissionRoute>
        } />
        <Route path="/lead-detail" element={
          <PermissionRoute requiredPermission="LEAD_READ">
            <LeadDetail />
          </PermissionRoute>
        } />
        <Route path="/lead-detail/:id" element={
          <PermissionRoute requiredPermission="LEAD_READ">
            <LeadDetail />
          </PermissionRoute>
        } />

        <Route path="/followups" element={
          <PermissionRoute requiredPermission="FOLLOWUP_VIEW">
            <FollowUps />
          </PermissionRoute>
        } />

        <Route path="/counselors" element={
          <PermissionRoute requiredPermission="USER_READ">
            <Counselors />
          </PermissionRoute>
        } />
        <Route path="/counselor-details/:id" element={
          <PermissionRoute requiredPermission="USER_READ">
            <CounselorDetails />
          </PermissionRoute>
        } />

        <Route path="/reports" element={<Reports />} />

        <Route path="/courses" element={
          <PermissionRoute requiredPermission="COURSE_VIEW">
            <Courses />
          </PermissionRoute>
        } />
        <Route path="/course-details/:id" element={
          <PermissionRoute requiredPermission="COURSE_VIEW">
            <CourseDetails />
          </PermissionRoute>
        } />

        <Route path="/settings" element={
          <PermissionRoute anyOfPermissions={[
            "SETTINGS_USER_MANAGEMENT",
            "SETTINGS_NOTIFICATIONS",
            "SETTINGS_PROJECT_CONFIGURATION",
            "SETTINGS_ROLES_AND_PERMISSIONS",
            "EMAIL_LOG_VIEW"
          ]}>
            <Settings />
          </PermissionRoute>
        }>
          <Route path="user-management" element={
            <PermissionRoute requiredPermission="SETTINGS_USER_MANAGEMENT">
              <UserManagement />
            </PermissionRoute>
          } />
          <Route path="notifications" element={
            <PermissionRoute requiredPermission="SETTINGS_NOTIFICATIONS">
              <Notifications />
            </PermissionRoute>
          } />
          <Route path="crm-config" element={
            <PermissionRoute requiredPermission="SETTINGS_PROJECT_CONFIGURATION">
              <CRMConfig />
            </PermissionRoute>
          } />
          <Route path="roles-permissions" element={
            <PermissionRoute requiredPermission="SETTINGS_ROLES_AND_PERMISSIONS">
              <RolesAndPermissions />
            </PermissionRoute>
          } />
          <Route path="email-settings" element={
            <PermissionRoute requiredPermission="EMAIL_LOG_VIEW">
              <EmailSettings />
            </PermissionRoute>
          } />
        </Route>

        <Route path="/lead-source" element={
          <PermissionRoute requiredPermission="LEADSOURCE_READ">
            <Leadsourse />
          </PermissionRoute>
        } />
        <Route path="/lead-source-details/:id" element={
          <PermissionRoute requiredPermission="LEADSOURCE_READ">
            <DataSourceDetails />
          </PermissionRoute>
        } />

        <Route path="/course-types" element={
          <PermissionRoute requiredPermission="COURSE_TYPE_VIEW">
            <CourseType />
          </PermissionRoute>
        } />
        <Route path="/course-types/:id" element={
          <PermissionRoute requiredPermission="COURSE_TYPE_VIEW">
            <CourseTypeDetails />
          </PermissionRoute>
        } />

        <Route path="/lead-status" element={
          <PermissionRoute requiredPermission="LEAD_STATUS_VIEW">
            <LeadStatus />
          </PermissionRoute>
        } />
        <Route path="/lead-status-details/:id" element={
          <PermissionRoute requiredPermission="LEAD_STATUS_VIEW">
            <LeadStatusDetails />
          </PermissionRoute>
        } />

        <Route path="/grades" element={
          <PermissionRoute requiredPermission="GRADE_VIEW">
            <Grades />
          </PermissionRoute>
        } />
        <Route path="/grade-details/:id" element={
          <PermissionRoute requiredPermission="GRADE_VIEW">
            <GradesDetails />
          </PermissionRoute>
        } />

        <Route path="/boards" element={
          <PermissionRoute requiredPermission="BOARD_VIEW">
            <Boards />
          </PermissionRoute>
        } />
        <Route path="/board-details/:id" element={
          <PermissionRoute requiredPermission="BOARD_VIEW">
            <BoardDetails />
          </PermissionRoute>
        } />

        <Route path="/department" element={
          <PermissionRoute requiredPermission="DEPARTMENT_VIEW">
            <Department />
          </PermissionRoute>
        } />
        <Route path="/departments" element={
          <PermissionRoute requiredPermission="DEPARTMENT_VIEW">
            <Department />
          </PermissionRoute>
        } />
        <Route path="/department-details/:id" element={
          <PermissionRoute requiredPermission="DEPARTMENT_VIEW">
            <DepartmentDetails />
          </PermissionRoute>
        } />

        <Route path="/data-segregation" element={
          <PermissionRoute requiredPermission="DATA_SEGREGATION_VIEW">
            <Datasegregation />
          </PermissionRoute>
        } />
        <Route path="/data-segregation-details/:id" element={
          <PermissionRoute requiredPermission="DATA_SEGREGATION_VIEW">
            <DatasegregationDetail />
          </PermissionRoute>
        } />

        <Route path="/programs" element={
          <PermissionRoute requiredPermission="PROGRAM_VIEW">
            <Programs />
          </PermissionRoute>
        } />
        <Route path="/program-details/:id" element={
          <PermissionRoute requiredPermission="PROGRAM_VIEW">
            <ProgramDetails />
          </PermissionRoute>
        } />
      </Route>

      {/* Standalone Route for Student Form from QR */}
      <Route path="/student-form" element={<StudentForm />} />
      <Route path="/qr-code" element={<QRCodePage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Allroutes;
