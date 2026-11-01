import { useEffect, useState } from "react";
import { Activity, HeartHandshake, QrCode, Users } from "lucide-react";
import { getPublicStats } from "../services/statsService";
import { useLang } from "../context/LanguageContext";
import Reveal from "./Reveal";

function Counter({ value, lang }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 1000;
    const tick = (time) => {
      const p = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{n.toLocaleString(lang === "mr" ? "mr-IN" : "en-IN")}</>;
}

const ITEMS = [
  { key: "donors", label: "stats.donors", icon: Users, bg: "bg-white", num: "text-brand-red" },
  { key: "donations", label: "stats.donations", icon: QrCode, bg: "bg-brand-yellow", num: "text-black" },
  { key: "activeRequests", label: "stats.active", icon: Activity, bg: "bg-white", num: "text-brand-red" },
  { key: "connections", label: "stats.connections", icon: HeartHandshake, bg: "bg-brand-mint", num: "text-black" },
];

export default function StatsStrip() {
  const { t, lang } = useLang();
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getPublicStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => setFailed(true));
  }, []);

  // Never show a broken section on the landing page
  if (failed) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {ITEMS.map(({ key, label, icon: Icon, bg, num }, i) => (
          <Reveal key={key} delay={i * 80}>
            <div className={`card card-hover flex h-full flex-col justify-between ${bg}`}>
              <div className="flex items-start justify-between gap-2">
                <p className={`font-head text-3xl font-bold tracking-tight sm:text-5xl ${num}`}>
                  {stats ? <Counter value={stats[key]} lang={lang} /> : <span className="opacity-30">–</span>}
                </p>
                <Icon size={22} className="shrink-0" />
              </div>
              <p className="mt-3 border-t-2 border-black pt-2 font-head text-xs font-extrabold uppercase tracking-wide">
                {t(label)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
