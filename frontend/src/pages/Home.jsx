import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CircleAlert,
  Droplet,
  Heart,
  HeartPulse,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  Siren,
  UserPlus,
  Zap,
} from "lucide-react";
import StatsStrip from "../components/StatsStrip";
import Reveal from "../components/Reveal";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { BLOOD_GROUPS, COMPATIBILITY } from "../data/constants";

const section = "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10";

function GroupGuide({ group, user }) {
  const { t } = useLang();
  const info = COMPATIBILITY[group];

  const chips = (list, tone) => (
    <div className="flex flex-wrap gap-1.5">
      {list.map((g) => (
        <span key={g} className={`pill !text-sm ${tone}`}>
          {g}
        </span>
      ))}
    </div>
  );

  return (
    <div className="border-[3px] border-black bg-white p-5 text-black shadow-brutal-lg">
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <span className="font-head text-xs font-extrabold uppercase tracking-widest text-slate-700">
          {t("home.guide.title")}
        </span>
        <span className="pill bg-brand-mint">{t("home.guide.badge")}</span>
      </div>

      {/* key restarts the pop animation whenever the group changes */}
      <div key={group} className="animate-pop-in mt-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center border-[3px] border-black bg-brand-red font-head text-3xl font-black text-white shadow-brutal-sm">
            {group}
          </div>
          <p className="font-head text-xl font-bold leading-tight">{t("home.guide.group", { group })}</p>
        </div>

        <div>
          <p className="label">{t("home.guide.canGive")}</p>
          {chips(info.canGiveTo, "bg-brand-yellow")}
        </div>
        <div>
          <p className="label">{t("home.guide.canReceive")}</p>
          {chips(info.canReceiveFrom, "bg-brand-blue")}
        </div>
      </div>

      <Link to={user ? `/donors?group=${encodeURIComponent(group)}` : "/register"} className="btn-dark mt-5 w-full">
        <Droplet size={15} className="text-brand-yellow" fill="currentColor" />
        {user ? t("home.guide.find", { group }) : t("home.guide.join")}
      </Link>

      <p className="mt-3 text-center text-[11px] font-bold italic text-slate-600">{t("home.guide.note")}</p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useLang();
  const [group, setGroup] = useState("B+");

  const steps = [
    { n: 1, icon: Zap, title: t("home.step1.title"), text: t("home.step1.text"), tag: t("home.step1.tag"), bg: "bg-white" },
    { n: 2, icon: MapPin, title: t("home.step2.title"), text: t("home.step2.text"), tag: t("home.step2.tag"), bg: "bg-brand-blue" },
    { n: 3, icon: ShieldCheck, title: t("home.step3.title"), text: t("home.step3.text"), tag: t("home.step3.tag"), bg: "bg-brand-pink" },
  ];

  const roles = [
    { icon: Siren, title: t("home.role1.title"), text: t("home.role1.text"), cta: t("home.role1.cta"), to: "/requests/new", bg: "bg-brand-red text-white" },
    { icon: HeartPulse, title: t("home.role2.title"), text: t("home.role2.text"), cta: t("home.role2.cta"), to: "/register", bg: "bg-brand-yellow" },
    { icon: Building2, title: t("home.role3.title"), text: t("home.role3.text"), cta: t("home.role3.cta"), to: user ? "/verify" : "/login", bg: "bg-brand-mint" },
  ];

  const trust = [
    { icon: Lock, title: t("home.trust1.title"), text: t("home.trust1.text") },
    { icon: QrCode, title: t("home.trust2.title"), text: t("home.trust2.text") },
    { icon: ShieldCheck, title: t("home.trust3.title"), text: t("home.trust3.text") },
  ];

  return (
    <>
      {/* HERO */}
      <section className={section}>
        <div className="border-4 border-black bg-brand-red p-6 text-white shadow-brutal-xl sm:p-10 lg:p-14">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <span className="animate-fade-up inline-block border-[3px] border-black bg-brand-yellow px-4 py-1.5 font-head text-xs font-extrabold uppercase tracking-wide text-black shadow-brutal-sm sm:text-sm">
                {t("home.hero.tag")}
              </span>

              <h1
                className="animate-fade-up font-head text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
                style={{ animationDelay: "80ms" }}
              >
                {t("home.hero.title")}
              </h1>

              <p
                className="animate-fade-up max-w-2xl text-base font-bold leading-relaxed sm:text-xl"
                style={{ animationDelay: "160ms" }}
              >
                {t("home.hero.text")}
              </p>

              <div
                className="animate-fade-up flex flex-col gap-4 pt-2 sm:flex-row"
                style={{ animationDelay: "240ms" }}
              >
                <Link to={user ? "/requests/new" : "/login"} className="btn-outline btn-lg">
                  <CircleAlert size={18} className="text-brand-red" />
                  {t("home.hero.need")}
                </Link>
                <Link to={user ? "/requests" : "/register"} className="btn-yellow btn-lg">
                  <Heart size={18} />
                  {user ? t("home.hero.see") : t("home.hero.donate")}
                </Link>
              </div>
            </div>

            <div className="animate-fade-up lg:col-span-5" style={{ animationDelay: "200ms" }}>
              <GroupGuide group={group} user={user} />
            </div>
          </div>
        </div>
      </section>

      {/* BLOOD GROUP STRIP */}
      <section className="border-y-4 border-black bg-black px-4 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 lg:flex-row">
          <div className="flex items-center gap-3 text-center font-head text-base font-bold uppercase tracking-wider sm:text-lg lg:text-left">
            <Droplet size={26} className="shrink-0 text-brand-red" fill="currentColor" />
            <span>{t("home.strip")}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3" role="group" aria-label={t("home.strip")}>
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                aria-pressed={group === g}
                className={`blood-pill min-w-[3.4rem] px-4 py-2 text-sm ${group === g ? "active" : ""}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <StatsStrip />

      {/* THREE STEPS */}
      <section className={section}>
        <Reveal className="mb-8 sm:mb-10">
          <h2 className="inline-flex flex-wrap items-center gap-3 font-head text-4xl font-bold uppercase tracking-tight sm:text-6xl">
            <span>{t("home.steps.a")}</span>
            <span className="border-[3px] border-black bg-brand-yellow px-4 py-1 shadow-brutal-sm">
              {t("home.steps.b")}
            </span>
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {steps.map(({ n, icon: Icon, title, text, tag, bg }, i) => (
            <Reveal key={n} delay={i * 100} className="h-full">
              <div className={`card card-hover flex h-full flex-col justify-between ${bg}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-head text-6xl font-bold leading-none text-brand-red">{n}</span>
                    <span className="grid h-12 w-12 place-items-center border-[3px] border-black bg-white shadow-brutal-sm">
                      <Icon size={22} />
                    </span>
                  </div>
                  <h3 className="font-head text-2xl font-bold uppercase leading-tight">{title}</h3>
                  <p className="text-sm font-bold leading-relaxed text-slate-800">{text}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t-2 border-black pt-3 font-head text-xs font-extrabold uppercase text-brand-red">
                  <span>{tag}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className={section}>
        <Reveal className="mb-8">
          <h2 className="font-head text-3xl font-bold uppercase tracking-tight sm:text-5xl">{t("home.roles.title")}</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {roles.map(({ icon: Icon, title, text, cta, to, bg }, i) => (
            <Reveal key={title} delay={i * 100} className="h-full">
              <Link to={to} className={`card card-hover group flex h-full flex-col gap-4 ${bg}`}>
                <span className="grid h-12 w-12 place-items-center border-[3px] border-black bg-white text-black shadow-brutal-sm transition-transform group-hover:-rotate-6">
                  <Icon size={22} />
                </span>
                <h3 className="font-head text-2xl font-bold leading-tight">{title}</h3>
                <p className="flex-1 text-sm font-bold leading-relaxed">{text}</p>
                <span className="inline-flex items-center gap-2 font-head text-sm font-extrabold uppercase">
                  {cta}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BUILT TO BE TRUSTED */}
      <section className={section}>
        <Reveal>
          <div className="border-4 border-black bg-black p-6 text-white shadow-brutal-xl sm:p-10 lg:p-14">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <span className="inline-block border-[3px] border-black bg-brand-yellow px-3.5 py-1.5 font-head text-xs font-extrabold uppercase tracking-widest text-black">
                  {t("home.trust.badge")}
                </span>
                <h2 className="font-head text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
                  {t("home.trust.title.a")} <span className="text-brand-yellow">{t("home.trust.title.b")}</span>
                </h2>
                <p className="text-base font-bold leading-relaxed text-slate-300 sm:text-lg">{t("home.trust.text")}</p>

                <ul className="space-y-4 pt-2">
                  {trust.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-white bg-white/10">
                        <Icon size={18} className="text-brand-mint" />
                      </span>
                      <div>
                        <p className="font-head text-base font-bold">{title}</p>
                        <p className="text-sm font-semibold text-slate-300">{text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample scan pass */}
              <div className="flex justify-center lg:col-span-5">
                <div className="w-full max-w-sm space-y-4 border-[3px] border-black bg-white p-6 text-center text-black shadow-brutal-lg">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2 font-head text-xs font-bold">
                    <span>{t("home.pass.title")}</span>
                    <span className="font-extrabold text-emerald-700">✓ {t("home.pass.verified")}</span>
                  </div>
                  <div className="relative overflow-hidden border-[3px] border-black bg-brand-bg p-6">
                    <div className="laser-line" />
                    <QrCode size={110} className="mx-auto" />
                  </div>
                  <div className="space-y-1 border-[3px] border-black bg-slate-100 p-3 text-left font-mono text-xs">
                    <div>{t("home.pass.donor")}: <strong>{t("home.pass.sample")}</strong></div>
                    <div>{t("home.pass.group")}: <strong className="text-brand-red">B+</strong></div>
                    <div>{t("home.pass.id")}: <strong>BC-XXXX-XXXX</strong></div>
                  </div>
                  <p className="text-[11px] font-bold italic text-slate-600">{t("home.pass.note")}</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CALL TO ACTION */}
      <section className={`${section} pb-4`}>
        <Reveal>
          <div className="space-y-6 border-4 border-black bg-brand-yellow p-8 text-center shadow-brutal-xl sm:p-12">
            <h2 className="mx-auto max-w-4xl font-head text-3xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
              {user ? t("home.cta.userTitle") : t("home.cta.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-base font-bold sm:text-xl">
              {user ? t("home.cta.userText") : t("home.cta.text")}
            </p>
            <Link to={user ? "/requests/new" : "/register"} className="btn-dark btn-lg">
              {user ? <Droplet size={18} className="text-brand-yellow" fill="currentColor" /> : <UserPlus size={18} className="text-brand-yellow" />}
              {user ? t("home.cta.userBtn") : t("home.cta.btn")}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
