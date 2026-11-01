import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, LogIn, QrCode } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { getErrorMessage } from "../services/api";
import { Alert, Field } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const points = [
    { icon: Bell, text: t("login.p1") },
    { icon: QrCode, text: t("login.p2") },
    { icon: CheckCircle2, text: t("login.p3") },
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-0">
      {/* Info panel */}
      <div className="flex flex-col justify-between gap-8 border-4 border-black bg-brand-red p-6 text-white shadow-brutal-lg sm:p-9 lg:border-r-0 lg:shadow-none">
        <div className="space-y-4">
          <span className="inline-block border-[3px] border-black bg-brand-yellow px-3 py-1 font-head text-xs font-extrabold uppercase text-black shadow-brutal-sm">
            {t("home.hero.tag")}
          </span>
          <h2 className="font-head text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
            {t("login.panelTitle")}
          </h2>
          <p className="text-base font-bold">{t("login.panelText")}</p>
        </div>
        <ul className="space-y-3">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 border-[3px] border-black bg-white p-3 text-sm font-bold text-black shadow-brutal-sm">
              <Icon size={18} className="shrink-0 text-brand-red" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="card animate-fade-up space-y-5 !p-6 sm:!p-9 lg:!shadow-brutal-lg">
        <div>
          <h1 className="font-head text-3xl font-bold tracking-tight">{t("login.title")}</h1>
          <p className="mt-1 text-sm font-bold text-slate-600">{t("login.subtitle")}</p>
        </div>

        <Alert>{error}</Alert>

        <Field label={t("form.email")} htmlFor="email">
          <input
            id="email"
            className="input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t("form.email")}
            value={form.email}
            onChange={onChange}
            required
          />
        </Field>
        <Field label={t("form.password")} htmlFor="password">
          <input
            id="password"
            className="input"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder={t("form.password")}
            value={form.password}
            onChange={onChange}
            required
          />
        </Field>

        <button className="btn-primary btn-lg w-full" disabled={loading}>
          <LogIn size={18} />
          {loading ? t("login.busy") : t("login.submit")}
        </button>

        <p className="text-center text-sm font-bold text-slate-600">
          {t("login.new")}{" "}
          <Link to="/register" className="text-brand-red underline decoration-2 underline-offset-4">
            {t("login.create")}
          </Link>
        </p>
      </form>
    </div>
  );
}
