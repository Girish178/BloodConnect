import { MapPin } from "lucide-react";
import { BloodTile } from "./Badges";
import { useLang } from "../context/LanguageContext";

export default function DonorCard({ donor }) {
  const { t } = useLang();
  return (
    <div className="card card-hover flex items-center gap-4 !p-4">
      <BloodTile group={donor.bloodGroup} tone="yellow" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-head text-lg font-bold">{donor.name}</h3>
        <p className="flex items-center gap-1 text-sm font-bold text-slate-600">
          <MapPin size={13} /> {donor.city}
        </p>
      </div>
      <div className="text-right">
        <p className="font-head text-xl font-bold">{donor.distanceKm} km</p>
        <span className="pill bg-brand-mint">{t("donor.available")}</span>
      </div>
    </div>
  );
}
