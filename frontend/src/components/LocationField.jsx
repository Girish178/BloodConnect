import { useState } from "react";
import { MapPin } from "lucide-react";
import { useLang } from "../context/LanguageContext";

export default function LocationField({ coords, setCoords, error, loading, locate }) {
  const { t } = useLang();
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const onManual = (nextLat, nextLng) => {
    setLat(nextLat);
    setLng(nextLng);
    const a = parseFloat(nextLat);
    const b = parseFloat(nextLng);
    if (!isNaN(a) && !isNaN(b) && a >= -90 && a <= 90 && b >= -180 && b <= 180) {
      setCoords({ latitude: a, longitude: b });
    } else {
      setCoords(null);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={locate}
        disabled={loading}
        className={`w-full ${coords ? "btn-mint" : "btn-outline"}`}
      >
        <MapPin size={16} className={loading ? "animate-pulse" : ""} />
        {loading
          ? t("loc.detecting")
          : coords
            ? t("loc.set", { lat: coords.latitude.toFixed(3), lng: coords.longitude.toFixed(3) })
            : t("loc.use")}
      </button>

      {error && <p className="text-xs font-bold text-amber-800">{error}</p>}

      <details className="text-sm font-bold text-slate-600">
        <summary className="cursor-pointer select-none">{t("loc.manual")}</summary>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <input
            className="input"
            placeholder={t("loc.lat")}
            value={lat}
            inputMode="decimal"
            onChange={(e) => onManual(e.target.value, lng)}
          />
          <input
            className="input"
            placeholder={t("loc.lng")}
            value={lng}
            inputMode="decimal"
            onChange={(e) => onManual(lat, e.target.value)}
          />
        </div>
      </details>
    </div>
  );
}
