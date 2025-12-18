import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Public
import Landing from "./pages/Landing";
import CustomerLoading from "./pages/CustomerLoading";
import ProviderLoading from "./pages/ProviderLoading";

// Auth
import CustomerLogin from "./pages/auth/CustomerLogin";
import CustomerSignup from "./pages/auth/CustomerSignup";
import ProviderLogin from "./pages/auth/ProviderLogin";
import ProviderSignup from "./pages/auth/ProviderSignup";
import AdminLogin from "./pages/auth/AdminLogin";

// Guards
import CustomerGuard from "./routes/CustomerGuard";
import ProviderGuard from "./routes/ProviderGuard";
import AdminGuard from "./routes/AdminGuard";

// Customer
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/CustomerProfile";
import SmartRequest from "./pages/customer/SmartRequest";
import ProviderList from "./pages/customer/ProviderList";
import CustomerConfirm from "./pages/customer/CustomerConfirm";
// Provider
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderKycUpload from "./pages/provider/ProviderKycUpload";
import ProviderKycPending from "./pages/provider/ProviderKycPending";
import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderJobDetail from "./pages/provider/ProviderJobDetail";
// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminKycQueue from "./pages/admin/AdminKycQueue";
import AdminKycReview from "./pages/admin/AdminKycReview";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import CustomerRequestDetails from "./pages/customer/CustomerRequestDetails";


function AppContent() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/customer/loading" element={<CustomerLoading />} />
      <Route path="/provider/loading" element={<ProviderLoading />} />

      {/* Customer Auth */}
      <Route path="/auth/customer/login" element={<CustomerLogin />} />
      <Route path="/auth/customer/signin" element={<CustomerSignup />} />

      {/* Provider Auth */}
      <Route path="/auth/provider/login" element={<ProviderLogin />} />
      <Route path="/auth/provider/signin" element={<ProviderSignup />} />
      <Route path="/auth/admin/login" element={<AdminLogin />} />

      {/* Admin Auth */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* ================= CUSTOMER (PROTECTED) ================= */}
      <Route element={<CustomerGuard />}>
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/providers" element={<ProviderList />} />
        <Route path="/customer/confirm" element={<CustomerConfirm />} />
        <Route path="/customer/requests/:id" element={<CustomerRequestDetails />} />
        <Route path="/customer/request/smart" element={<SmartRequest />} />
      </Route>

      {/* ================= PROVIDER (PROTECTED) ================= */}
      <Route element={<ProviderGuard />}>
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route path="/provider/kyc" element={<ProviderKycUpload />} />
        <Route path="/provider/jobs/:id" element={<ProviderJobDetail />} />
        <Route path="/provider/kyc-pending" element={<ProviderKycPending />} />
      </Route>

      {/* ================= ADMIN (PROTECTED + LAYOUT) ================= */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/kyc" element={<AdminKycQueue />} />
          <Route path="/admin/kyc/:providerId" element={<AdminKycReview />} />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
