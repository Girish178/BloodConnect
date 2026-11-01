import { useState } from "react";
import { Flag } from "lucide-react";
import { createReport } from "../services/reportService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import { Alert } from "./ui";

const REASONS = ["fake", "spam", "wrong_info", "abusive", "other"];

export default function ReportButton({ requestId }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("fake");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createReport({ requestId, reason, details: details.trim() || undefined });
      setDone(true);
      setOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return <Alert type="success">{t("report.thanks")}</Alert>;
  }

  return (
    <div className="text-center">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 border-b-2 border-transparent text-xs font-extrabold text-slate-600 transition hover:border-brand-red hover:text-brand-red"
        >
          <Flag size={13} /> {t("report.open")}
        </button>
      ) : (
        <form onSubmit={submit} className="card animate-pop-in space-y-3 text-left">
          <p className="font-head text-base font-bold">{t("report.open")}</p>
          <Alert>{error}</Alert>
          <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {t(`reason.${r}`)}
              </option>
            ))}
          </select>
          <textarea
            className="input min-h-20"
            placeholder={t("report.details")}
            maxLength={300}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? t("common.sending") : t("report.submit")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
