import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "./layouts/authlayout/AuthLayout";
import MainLayout from "./layouts/mainLayout/MainLayout";

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

const Allroutes = () => {
  return (
    <Routes>
      {/* Auth routes — wrapped in AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Main app routes — wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/head-dashboard" element={<HeadDashboard />} />
        <Route path="/callers-dashboard" element={<CallersDashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/lead-detail" element={<LeadDetail />} />
        <Route path="/lead-detail/:id" element={<LeadDetail />} />
        <Route path="/followups" element={<FollowUps />} />
        <Route path="/counselors" element={<Counselors />} />
        <Route path="/counselor-details/:id" element={<CounselorDetails />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/settings" element={<Settings />}>
          <Route path="user-management" element={<UserManagement />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="crm-config" element={<CRMConfig />} />
          <Route path="roles-permissions" element={<RolesAndPermissions />} />
          <Route path="email-settings" element={<EmailSettings />} />
        </Route>
        <Route path="/lead-source" element={<Leadsourse />} />
        <Route path="/lead-source-details/:id" element={<DataSourceDetails />} />
        <Route path="/course-types" element={<CourseType />} />
        <Route path="/course-types/:id" element={<CourseTypeDetails />} />
        <Route path="/course-details/:id" element={<CourseDetails />} />
        <Route path="/lead-status" element={<LeadStatus />} />
        <Route path="/lead-status-details/:id" element={<LeadStatusDetails />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/grade-details/:id" element={<GradesDetails />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/board-details/:id" element={<BoardDetails />} />
        <Route path="/department" element={<Department />} />
        <Route path="/departments" element={<Department />} />
        <Route path="/department-details/:id" element={<DepartmentDetails />} />
        <Route path="/data-segregation" element={<Datasegregation />} />
        <Route path="/data-segregation-details/:id" element={<DatasegregationDetail />} />
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
