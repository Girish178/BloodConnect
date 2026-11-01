import { useLang } from "../context/LanguageContext";

const urgencyStyles = {
  critical: "bg-brand-red text-white",
  urgent: "bg-brand-yellow text-black",
  planned: "bg-brand-blue text-black",
};

const statusStyles = {
  open: "bg-brand-mint",
  matched: "bg-brand-blue",
  completed: "bg-black text-white",
  cancelled: "bg-slate-200 text-slate-600",
  accepted: "bg-brand-mint",
  selected: "bg-brand-yellow",
  declined: "bg-slate-200 text-slate-600",
  withdrawn: "bg-slate-200 text-slate-600",
};

export function UrgencyBadge({ urgency }) {
  const { t } = useLang();
  return <span className={`pill ${urgencyStyles[urgency] || "bg-white"}`}>{t(`urgency.${urgency}`)}</span>;
}

export function StatusBadge({ status }) {
  const { t } = useLang();
  return <span className={`pill ${statusStyles[status] || "bg-white"}`}>{t(`status.${status}`)}</span>;
}

export function BloodTile({ group, size = "md", tone = "red" }) {
  const sizes = {
    sm: "h-10 w-10 text-base",
    md: "h-14 w-14 text-xl",
    lg: "h-20 w-20 text-3xl",
  };
  const tones = {
    red: "bg-brand-red text-white",
    yellow: "bg-brand-yellow text-black",
    white: "bg-white text-brand-red",
  };
  return (
    <div
      className={`grid shrink-0 place-items-center border-[3px] border-black font-head font-black shadow-brutal-sm ${sizes[size]} ${tones[tone]}`}
    >
      {group}
    </div>
  );
}
