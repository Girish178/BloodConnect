import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import VerifierRoute from "./components/VerifierRoute";
import { useLang } from "./context/LanguageContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateRequest from "./pages/CreateRequest";
import FindDonors from "./pages/FindDonors";
import Requests from "./pages/Requests";
import RequestDetail from "./pages/RequestDetail";
import MyRequests from "./pages/MyRequests";
import Notifications from "./pages/Notifications";
import DonationQR from "./pages/DonationQR";
import MyDonations from "./pages/MyDonations";
import AdminVerify from "./pages/AdminVerify";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";

function Layout() {
  const { pathname } = useLocation();

  // Start each page at the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* key makes the page fade in again on every route change */}
      <main key={pathname} className="page-enter flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="font-head text-7xl font-bold text-brand-red">404</p>
      <p className="mt-2 font-head text-xl font-bold">{t("common.notFound")}</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/donors" element={<FindDonors />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/new" element={<CreateRequest />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          <Route path="/requests/:id/qr" element={<DonationQR />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/donations" element={<MyDonations />} />
        </Route>

        <Route element={<VerifierRoute />}>
          <Route path="/verify" element={<AdminVerify />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
