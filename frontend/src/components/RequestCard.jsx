import { Link } from "react-router-dom";
import { Building2, Clock, MapPin } from "lucide-react";
import { BloodTile, StatusBadge, UrgencyBadge } from "./Badges";
import { useLang } from "../context/LanguageContext";
import { timeAgo } from "../utils/format";

const stripe = {
  critical: "bg-brand-red",
  urgent: "bg-brand-yellow",
  planned: "bg-brand-blue",
};

export default function RequestCard({ request, showStatus = false }) {
  const { t } = useLang();
  const done = request.unitsFulfilled || 0;
  const pct = Math.min(100, Math.round((done / request.unitsRequired) * 100));

  return (
    <Link to={`/requests/${request._id}`} className="card card-hover block !p-0">
      <div className={`h-2.5 border-b-[3px] border-black ${stripe[request.urgency] || "bg-white"}`} />
      <div className="flex gap-4 p-4 sm:p-5">
        <BloodTile group={request.bloodGroup} />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-head text-lg font-bold leading-tight">{request.patientName}</h3>
            <UrgencyBadge urgency={request.urgency} />
            {showStatus && <StatusBadge status={request.status} />}
          </div>

          <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
            <Building2 size={14} className="shrink-0" /> <span className="truncate">{request.hospitalName}</span>
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {request.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {timeAgo(request.createdAt, t)}
            </span>
            {typeof request.acceptedCount === "number" && (
              <span className="bg-brand-mint px-1.5 text-black">
                {t("card.accepted", { n: request.acceptedCount })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="h-3 flex-1 overflow-hidden border-2 border-black bg-white">
              <div className="h-full bg-brand-red transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-head text-xs font-extrabold">
              {t("card.units", { done, total: request.unitsRequired })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
