import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const { t } = useLang();

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center font-head text-lg font-bold">
        <span className="animate-pulse">{t("common.loading")}</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
