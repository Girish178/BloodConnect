import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Droplet, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import NotificationBell from "./NotificationBell";
import LangToggle from "./LangToggle";

const desktopLink = ({ isActive }) =>
  `whitespace-nowrap border-2 px-2.5 py-2 font-head text-[12px] font-extrabold uppercase transition ${
    isActive
      ? "border-black bg-brand-yellow shadow-brutal-sm"
      : "border-transparent hover:border-black hover:bg-brand-yellow/50"
  }`;

const mobileLink = ({ isActive }) =>
  `flex items-center justify-between border-[3px] border-black px-4 py-3 font-head text-base font-extrabold uppercase transition active:translate-x-0.5 active:translate-y-0.5 ${
    isActive ? "bg-brand-yellow shadow-brutal-sm" : "bg-white hover:bg-brand-yellow/40"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Stop the page behind the menu from scrolling
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const isAdmin = user?.role === "admin";
  const canVerify = user && ["verifier", "admin"].includes(user.role);

  const links = [
    { to: "/", label: t("nav.home"), end: true },
    ...(user
      ? [
          { to: "/donors", label: t("nav.findDonors") },
          { to: "/requests", label: t("nav.requests") },
          { to: "/donations", label: t("nav.donations") },
          { to: "/dashboard", label: t("nav.dashboard") },
        ]
      : []),
    { to: "/camps", label: t("nav.camps") },
    { to: "/awareness", label: t("nav.learn") },
    ...(canVerify ? [{ to: "/verify", label: t("nav.verify") }] : []),
    ...(isAdmin ? [{ to: "/admin", label: t("nav.admin"), end: true }] : []),
  ];

  const tickerItems = [t("ticker.1"), t("ticker.2"), t("ticker.3"), t("ticker.4")];

  return (
    <>
      {/* Info ticker */}
      <div className="marquee overflow-hidden border-b-4 border-black bg-black py-1.5 text-white">
        <div className="marquee-track" aria-label={tickerItems.join(". ")}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {tickerItems.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-3 px-5 font-head text-xs font-bold uppercase tracking-wider"
                >
                  <Droplet size={12} className="text-brand-red" fill="currentColor" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header (relative bits live here so the bell dropdown can anchor to it) */}
      <header className="sticky top-0 z-40 border-b-4 border-black bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="BloodConnect">
            <span className="grid h-10 w-10 place-items-center border-[3px] border-black bg-brand-red text-white shadow-brutal-sm transition-transform group-hover:rotate-6">
              <Droplet size={20} fill="currentColor" className="animate-heartbeat" />
            </span>
            <span className="font-head text-xl font-bold tracking-tight sm:text-2xl">
              Blood<span className="text-brand-red">Connect</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 xl:flex">
            {links.filter((l) => l.to !== "/").map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={desktopLink}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LangToggle />
            {user && <NotificationBell />}

            {user ? (
              <button onClick={handleLogout} className="btn-outline btn-sm hidden xl:inline-flex" aria-label={t("nav.logout")}>
                <LogOut size={14} /> <span className="hidden 2xl:inline">{t("nav.logout")}</span>
              </button>
            ) : (
              <div className="hidden items-center gap-2 xl:flex">
                <Link to="/login" className="btn-outline btn-sm">
                  {t("nav.login")}
                </Link>
                <Link to="/register" className="btn-yellow btn-sm">
                  {t("nav.becomeDonor")}
                </Link>
              </div>
            )}

            <button
              className="grid h-10 w-10 place-items-center border-[3px] border-black bg-brand-yellow shadow-brutal-sm transition active:translate-x-0.5 active:translate-y-0.5 xl:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={t("nav.menu")}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="animate-slide-down max-h-[calc(100vh-7rem)] overflow-y-auto border-t-4 border-black bg-brand-bg px-4 py-4 xl:hidden">
            <div className="mx-auto flex max-w-md flex-col gap-2.5">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={mobileLink}>
                  {l.label}
                  <span aria-hidden="true">→</span>
                </NavLink>
              ))}

              <div className="mt-2 flex flex-col gap-2.5">
                {user ? (
                  <button onClick={handleLogout} className="btn-dark w-full">
                    <LogOut size={16} /> {t("nav.logout")}
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="btn-outline w-full">
                      {t("nav.login")}
                    </Link>
                    <Link to="/register" className="btn-primary w-full">
                      {t("nav.becomeDonor")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
