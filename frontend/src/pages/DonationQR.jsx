import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import { getDonationQr } from "../services/donationService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import { Alert, Page, Skeleton } from "../components/ui";

export default function DonationQR() {
  const { id } = useParams();
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getDonationQr(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <Page width="max-w-md">
      <div className="border-4 border-black bg-brand-blue p-5 text-center shadow-brutal-lg">
        <h1 className="font-head text-3xl font-bold">{t("qr.title")}</h1>
        <p className="mt-1 text-sm font-bold">{t("qr.subtitle")}</p>
      </div>

      <div className="card animate-pop-in space-y-4 text-center">
        {error && (
          <div className="space-y-3">
            <Alert>{error}</Alert>
            <Link to="/donations" className="btn-outline">
              {t("nav.donations")}
            </Link>
          </div>
        )}

        {!data && !error && <Skeleton className="mx-auto h-64 w-64" />}

        {data && (
          <>
            <p className="text-sm font-bold text-slate-700">
              {t("qr.showAt", { hospital: data.hospitalName, group: data.bloodGroup })}
            </p>
            <div className="mx-auto w-fit border-4 border-black bg-white p-3 shadow-brutal">
              <img src={data.qr} alt={t("qr.alt")} className="h-60 w-60 max-w-full sm:h-64 sm:w-64" />
            </div>
            <button onClick={copy} className={`w-full ${copied ? "btn-mint" : "btn-outline"}`}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? t("qr.copied") : t("qr.copy")}
            </button>
            <p className="text-xs font-bold text-slate-500">{t("qr.valid", { days: data.expiresInDays })}</p>
          </>
        )}
      </div>

      <Link to={`/requests/${id}`} className="block text-center font-head text-sm font-extrabold uppercase text-brand-red underline decoration-2 underline-offset-4">
        ← {t("qr.back")}
      </Link>
    </Page>
  );
}
