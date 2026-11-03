import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarHeart, ClipboardCheck, HelpCircle, Lightbulb } from "lucide-react";
import { listCamps } from "../services/campService";
import { useLang } from "../context/LanguageContext";
import CampCard from "./CampCard";
import Reveal from "./Reveal";
import { EmptyState, Skeleton } from "./ui";

const TEASERS = [
  { key: "check", icon: ClipboardCheck, bg: "bg-brand-mint", hash: "#check" },
  { key: "quiz", icon: HelpCircle, bg: "bg-brand-yellow", hash: "#quiz" },
  { key: "myths", icon: Lightbulb, bg: "bg-brand-pink", hash: "#myths" },
];

// Home page: next few camps, then three shortcuts into the awareness page
export default function UpcomingCamps() {
  const { t } = useLang();
  const [camps, setCamps] = useState(null);

  useEffect(() => {
    listCamps({ scope: "upcoming" })
      .then(({ data }) => setCamps(data.camps.slice(0, 3)))
      .catch(() => setCamps([]));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-head text-3xl font-bold tracking-tight sm:text-4xl">{t("home.camps.title")}</h2>
          <p className="mt-1 text-sm font-bold text-slate-600 sm:text-base">{t("home.camps.sub")}</p>
        </div>
        <Link to="/camps" className="btn-outline btn-sm">
          {t("home.camps.all")} <ArrowRight size={14} />
        </Link>
      </Reveal>

      {!camps && <Skeleton className="h-28" />}
      {camps?.length === 0 && (
        <EmptyState icon={CalendarHeart} title={t("home.camps.emptyTitle")} text={t("home.camps.empty")} />
      )}
      <div className="grid gap-5 lg:grid-cols-3">
        {camps?.map((c, i) => (
          <Reveal key={c._id} delay={i * 80} className="h-full">
            <CampCard camp={c} />
          </Reveal>
        ))}
      </div>

      <div className="mt-12">
        <Reveal className="mb-6">
          <h2 className="font-head text-2xl font-bold tracking-tight sm:text-3xl">{t("home.learn.title")}</h2>
          <p className="mt-1 text-sm font-bold text-slate-600">{t("home.learn.sub")}</p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {TEASERS.map(({ key, icon: Icon, bg, hash }, i) => (
            <Reveal key={key} delay={i * 90} className="h-full">
              <Link to={`/awareness${hash}`} className={`card card-hover flex h-full flex-col gap-2 ${bg}`}>
                <span className="grid h-12 w-12 place-items-center border-[3px] border-black bg-white shadow-brutal-sm">
                  <Icon size={22} />
                </span>
                <h3 className="font-head text-xl font-bold">{t(`home.learn.${key}`)}</h3>
                <p className="flex-1 text-sm font-semibold">{t(`home.learn.${key}Text`)}</p>
                <span className="mt-1 inline-flex items-center gap-1 font-head text-sm font-extrabold uppercase">
                  {t("home.learn.open")} <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
