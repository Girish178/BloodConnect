import { useState } from "react";
import { Link } from "react-router-dom";
import { Award, Bell, ClipboardList, Droplet, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { getErrorMessage } from "../services/api";
import { setAvailability } from "../services/authService";
import { formatDate } from "../utils/format";
import { Alert, Page } from "../components/ui";
import { BloodTile } from "../components/Badges";
import Reveal from "../components/Reveal";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const { t, lang } = useLang();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await setAvailability(!user.isAvailable);
      updateUser(data.user);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const tiles = [
    { to: "/requests/new", icon: Droplet, label: t("dash.tile.request"), text: t("dash.tile.requestText"), bg: "bg-brand-red text-white" },
    { to: "/donors", icon: Search, label: t("nav.findDonors"), text: t("dash.tile.donorsText"), bg: "bg-brand-blue" },
    { to: "/my-requests", icon: ClipboardList, label: t("dash.tile.mine"), text: t("dash.tile.mineText"), bg: "bg-brand-mint" },
    { to: "/donations", icon: Award, label: t("nav.donations"), text: t("dash.tile.donationsText"), bg: "bg-brand-yellow" },
    { to: "/notifications", icon: Bell, label: t("dash.tile.alerts"), text: t("dash.tile.alertsText"), bg: "bg-brand-pink" },
    ...(["verifier", "admin"].includes(user.role)
      ? [{ to: "/verify", icon: ShieldCheck, label: t("nav.verify"), text: t("dash.tile.verifyText"), bg: "bg-white" }]
      : []),
  ];

  return (
    <Page width="max-w-5xl">
      {/* Profile */}
      <div className="animate-fade-up flex flex-wrap items-center gap-5 border-4 border-black bg-brand-yellow p-5 shadow-brutal-lg sm:p-7">
        <BloodTile group={user.bloodGroup} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-head text-xs font-extrabold uppercase tracking-widest">{t("dash.welcome")}</p>
          <h1 className="truncate font-head text-3xl font-bold leading-tight sm:text-4xl">{user.name}</h1>
          <p className="truncate text-sm font-bold">
            {user.city} · {user.email}
          </p>
        </div>
        <Link to="/requests/new" className="btn-primary">
          <Droplet size={16} fill="currentColor" /> {t("dash.tile.request")}
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Availability */}
        <div
          className={`card space-y-4 transition-colors duration-300 md:col-span-3 ${
            user.isAvailable ? "!bg-brand-mint" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-head text-xl font-bold">{t("dash.avail.title")}</h2>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {user.isAvailable ? t("dash.avail.on") : t("dash.avail.off")}
              </p>
            </div>

            <button
              onClick={toggle}
              disabled={busy}
              role="switch"
              aria-checked={user.isAvailable}
              aria-label={t("dash.avail.title")}
              className={`relative h-10 w-[4.5rem] shrink-0 border-[3px] border-black shadow-brutal-sm transition-colors duration-200 hover:shadow-brutal disabled:opacity-60 ${
                user.isAvailable ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-7 w-7 border-[3px] border-black bg-white transition-all duration-200 ${
                  user.isAvailable ? "left-[2.05rem]" : "left-0.5"
                }`}
              />
            </button>
          </div>
          <Alert>{error}</Alert>
        </div>

        {/* Eligibility */}
        <div className="card md:col-span-2">
          <p className="label">{t("dash.elig.title")}</p>
          {user.isEligible ? (
            <>
              <p className="font-head text-2xl font-bold text-emerald-700">{t("dash.elig.yes")}</p>
              <div className="mt-3 h-4 border-2 border-black bg-emerald-500" />
            </>
          ) : (
            <>
              <p className="font-head text-2xl font-bold text-amber-700">
                {t("dash.elig.until", { date: formatDate(user.nextEligibleDate, lang) })}
              </p>
              <div className="mt-3 h-4 border-2 border-black bg-amber-300" />
            </>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ to, icon: Icon, label, text, bg }, i) => (
          <Reveal key={to} delay={i * 70} className="h-full">
            <Link to={to} className={`card card-hover group flex h-full flex-col gap-3 ${bg}`}>
              <span className="grid h-11 w-11 place-items-center border-[3px] border-black bg-white text-black shadow-brutal-sm transition-transform group-hover:-rotate-6">
                <Icon size={20} />
              </span>
              <h3 className="font-head text-xl font-bold">{label}</h3>
              <p className="text-sm font-bold opacity-90">{text}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </Page>
  );
}
