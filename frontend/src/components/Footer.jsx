import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import LangToggle from "./LangToggle";

export default function Footer() {
  const { user } = useAuth();
  const { t } = useLang();

  const links = user
    ? [
        { to: "/donors", label: t("nav.findDonors") },
        { to: "/requests", label: t("nav.requests") },
        { to: "/requests/new", label: t("footer.requestBlood") },
        { to: "/dashboard", label: t("nav.dashboard") },
      ]
    : [
        { to: "/login", label: t("nav.login") },
        { to: "/register", label: t("nav.becomeDonor") },
      ];

  return (
    <footer className="mt-10 border-t-4 border-black bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-12 lg:px-8">
        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center border-2 border-white bg-brand-red">
              <Droplet size={18} fill="currentColor" />
            </span>
            <span className="font-head text-xl font-bold">
              Blood<span className="text-brand-red">Connect</span>
            </span>
          </div>
          <p className="max-w-sm text-sm font-semibold text-slate-300">{t("footer.tagline")}</p>
        </div>

        <div className="lg:col-span-4">
          <p className="mb-3 font-head text-xs font-extrabold uppercase tracking-widest text-brand-yellow">
            {t("footer.explore")}
          </p>
          <ul className="space-y-2 text-sm font-bold">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="link-slide">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 lg:col-span-3">
          <p className="font-head text-xs font-extrabold uppercase tracking-widest text-brand-yellow">
            {t("footer.language")}
          </p>
          <LangToggle />
        </div>
      </div>

      <div className="border-t-2 border-white/20 px-4 py-4 text-center text-xs font-semibold text-slate-400">
        {t("footer.disclaimer")}
      </div>
    </footer>
  );
}
