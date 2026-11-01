import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

export default function VerifierRoute() {
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
  if (!["verifier", "admin"].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
