import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, ShieldCheck, ToggleRight, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { getErrorMessage } from "../services/api";
import { BLOOD_GROUPS } from "../data/constants";
import { Alert, Field } from "../components/ui";

export default function Register() {
  const { register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bloodGroup: "",
    city: "",
  });
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError(t("loc.unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setError(t("register.locDenied")),
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, isDonor: true, ...(coords || {}) });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { icon: ToggleRight, text: t("register.p1") },
    { icon: ShieldCheck, text: t("register.p2") },
    { icon: Heart, text: t("register.p3") },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-5 lg:gap-0">
      {/* Info panel */}
      <div className="flex flex-col justify-between gap-8 border-4 border-black bg-brand-yellow p-6 shadow-brutal-lg sm:p-9 lg:col-span-2 lg:border-r-0 lg:shadow-none">
        <div className="space-y-4">
          <h2 className="font-head text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
            {t("register.panelTitle")}
          </h2>
          <p className="text-base font-bold">{t("register.panelText")}</p>
        </div>
        <ul className="space-y-3">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 border-[3px] border-black bg-white p-3 text-sm font-bold shadow-brutal-sm">
              <Icon size={18} className="shrink-0 text-brand-red" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="card animate-fade-up space-y-4 !p-6 sm:!p-9 lg:col-span-3 lg:!shadow-brutal-lg">
        <div>
          <h1 className="font-head text-3xl font-bold tracking-tight">{t("register.title")}</h1>
          <p className="mt-1 text-sm font-bold text-slate-600">{t("register.subtitle")}</p>
        </div>

        <Alert>{error}</Alert>

        <Field label={t("form.name")} htmlFor="name">
          <input id="name" className="input" name="name" autoComplete="name" placeholder={t("form.name")} value={form.name} onChange={onChange} required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("form.email")} htmlFor="email">
            <input id="email" className="input" type="email" name="email" autoComplete="email" placeholder={t("form.email")} value={form.email} onChange={onChange} required />
          </Field>
          <Field label={t("form.phone")} htmlFor="phone">
            <input id="phone" className="input" name="phone" placeholder={t("form.phonePlaceholder")} value={form.phone} onChange={onChange} inputMode="numeric" maxLength={10} required />
          </Field>
        </div>

        <Field label={t("form.password")} htmlFor="password">
          <input id="password" className="input" type="password" name="password" autoComplete="new-password" placeholder={t("form.passwordHint")} value={form.password} onChange={onChange} minLength={8} required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("form.bloodGroup")} htmlFor="bloodGroup">
            <select id="bloodGroup" className="input" name="bloodGroup" value={form.bloodGroup} onChange={onChange} required>
              <option value="">{t("form.bloodGroup")}</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("form.city")} htmlFor="city">
            <input id="city" className="input" name="city" placeholder={t("form.city")} value={form.city} onChange={onChange} required />
          </Field>
        </div>

        <button type="button" onClick={useMyLocation} className={`w-full ${coords ? "btn-mint" : "btn-outline"}`}>
          <MapPin size={16} />
          {coords ? t("register.locAdded") : t("register.locUse")}
        </button>

        <button className="btn-primary btn-lg w-full" disabled={loading}>
          <UserPlus size={18} />
          {loading ? t("register.busy") : t("register.submit")}
        </button>

        <p className="text-center text-sm font-bold text-slate-600">
          {t("register.already")}{" "}
          <Link to="/login" className="text-brand-red underline decoration-2 underline-offset-4">
            {t("register.login")}
          </Link>
        </p>
      </form>
    </div>
  );
}
