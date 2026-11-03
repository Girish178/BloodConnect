import { Link } from "react-router-dom";
import { Clock, MapPin, Users } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { dateParts, formatTime, isCampToday } from "../utils/format";

// Small coloured status chip shown on a camp card
function Chip({ children, className = "" }) {
  return (
    <span className={`border-2 border-black px-2 py-0.5 font-head text-[11px] font-extrabold uppercase ${className}`}>
      {children}
    </span>
  );
}

export default function CampCard({ camp, registered = false }) {
  const { t, lang } = useLang();
  const { day, month } = dateParts(camp.date, lang);
  const cancelled = camp.status === "cancelled";
  const full = camp.spotsLeft === 0;

  let chip = <Chip className="bg-brand-mint">{camp.spotsLeft == null ? t("camps.open") : t("camps.spots", { n: camp.spotsLeft })}</Chip>;
  if (cancelled) chip = <Chip className="bg-brand-red text-white">{t("camps.cancelled")}</Chip>;
  else if (camp.isPast) chip = <Chip className="bg-slate-200">{t("camps.ended")}</Chip>;
  else if (full) chip = <Chip className="bg-brand-pink">{t("camps.full")}</Chip>;

  return (
    <Link
      to={`/camps/${camp._id}`}
      className={`card card-hover flex gap-4 !p-4 sm:!p-5 ${cancelled || camp.isPast ? "opacity-80" : ""}`}
    >
      <div
        className={`grid h-20 w-20 shrink-0 place-content-center border-[3px] border-black text-center shadow-brutal-sm ${
          cancelled ? "bg-slate-200" : "bg-brand-yellow"
        }`}
      >
        <span className="font-head text-3xl font-bold leading-none">{day}</span>
        <span className="mt-1 font-head text-xs font-extrabold uppercase">{month}</span>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-head text-lg font-bold leading-tight">{camp.title}</h3>
          {isCampToday(camp.date) && !camp.isPast && !cancelled && (
            <Chip className="bg-brand-red text-white">{t("camps.today")}</Chip>
          )}
          {registered && <Chip className="bg-brand-blue">{t("camps.youAreIn")}</Chip>}
        </div>

        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">
            {camp.venue}, {camp.city}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {formatTime(camp.startTime)} – {formatTime(camp.endTime)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} /> {t("camps.registered", { n: camp.registeredCount })}
          </span>
          {chip}
        </div>
      </div>
    </Link>
  );
}
