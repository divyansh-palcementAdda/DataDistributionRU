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
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Pipeline from "./pages/Pipeline";
import LeadDetail from "./pages/LeadDetail";
import FollowUps from "./pages/FollowUps";
import Counselors from "./pages/Counselors";
import Reports from "./pages/Reports";
import Courses from "./pages/Courses";
import Settings from "./pages/Settings";
import Leadsourse from "./pages/LeadSource";
import CourseType from "./pages/CourseType";
import CourseTypeDetails from "./pages/CourseTypeDetails";
import CourseDetails from "./pages/CourseDetails";

// Reusable Components / Standalone Pages
import StudentForm from "./component/reusable/studentForm";
import QRCodePage from "./component/reusable/qrCode";
import FollowupForm from './pages/FollowupForm';

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
        <Route path="/leads" element={<Leads />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/lead-detail" element={<LeadDetail />} />
        <Route path="/lead-detail/:id" element={<LeadDetail />} />
        <Route path="/followups" element={<FollowUps />} />
        <Route path="/counselors" element={<Counselors />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/lead-source" element={<Leadsourse />} />
        <Route path="/courses-types" element={<CourseType />} />
        <Route path="/courses-types/:id" element={<CourseTypeDetails />} />
        <Route path="/course-details/:id" element={<CourseDetails />} />

         <Route path="/followup-form" element={<FollowupForm />} />

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
