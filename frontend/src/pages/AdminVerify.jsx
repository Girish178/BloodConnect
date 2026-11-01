import { useState } from "react";
import { Camera, CheckCircle2, Download, ScanLine } from "lucide-react";
import QrScanner from "../components/QrScanner";
import { BloodTile } from "../components/Badges";
import { Alert, Page, PageHeader } from "../components/ui";
import { downloadCertificateFile, inspectToken, verifyToken } from "../services/donationService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import { formatDate } from "../utils/format";

export default function AdminVerify() {
  const { t, lang } = useLang();
  const [token, setToken] = useState("");
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const lookup = async (value) => {
    const clean = value.trim();
    if (!clean) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await inspectToken(clean);
      setToken(clean);
      setPreview(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onScan = (text) => {
    setScanning(false);
    lookup(text);
  };

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await verifyToken(token);
      setResult(data);
      setPreview(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setToken("");
    setPreview(null);
    setResult(null);
    setError("");
  };

  return (
    <Page width="max-w-xl">
      <PageHeader color="mint" icon={ScanLine} title={t("verify.title")} subtitle={t("verify.subtitle")} />

      <Alert>{error}</Alert>

      {/* Step 1: scan or paste */}
      {!preview && !result && (
        <div className="card animate-pop-in space-y-5">
          {scanning ? (
            <>
              <QrScanner
                onScan={onScan}
                onError={(m) => {
                  setScanning(false);
                  setError(m);
                }}
              />
              <button onClick={() => setScanning(false)} className="btn-outline w-full">
                {t("verify.stop")}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setError("");
                setScanning(true);
              }}
              className="btn-primary btn-lg w-full"
            >
              <Camera size={18} /> {t("verify.scan")}
            </button>
          )}

          <div className="space-y-2 border-t-[3px] border-black pt-4">
            <p className="label">{t("verify.orPaste")}</p>
            <textarea
              className="input min-h-24 font-mono !text-xs"
              placeholder={t("verify.placeholder")}
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button onClick={() => lookup(token)} disabled={busy || token.trim().length < 20} className="btn-dark w-full">
              {busy ? t("verify.checking") : t("verify.lookup")}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: preview and confirm */}
      {preview && (
        <div className="card animate-pop-in space-y-4">
          <div className="flex items-center gap-4">
            <BloodTile group={preview.donor.bloodGroup} />
            <div>
              <p className="font-head text-xl font-bold">{preview.donor.name}</p>
              <p className="text-sm font-bold text-slate-600">{preview.donor.city}</p>
            </div>
          </div>

          <div className="space-y-1 border-[3px] border-black bg-brand-bg p-3 text-sm font-semibold">
            <p>
              {t("verify.patient")}: <b>{preview.request.patientName}</b>
            </p>
            <p>
              {t("verify.hospital")}:{" "}
              <b>
                {preview.request.hospitalName}, {preview.request.city}
              </b>
            </p>
            <p>
              {t("verify.groupNeeded")}: <b>{preview.request.bloodGroup}</b> · {t("detail.units")}:{" "}
              <b>
                {preview.request.unitsFulfilled}/{preview.request.unitsRequired}
              </b>
            </p>
          </div>

          {!preview.donor.isEligible && (
            <Alert type="info">
              {t("verify.cooldown", { date: formatDate(preview.donor.nextEligibleDate, lang) })}
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={reset} className="btn-outline" disabled={busy}>
              {t("common.cancel")}
            </button>
            <button onClick={confirm} className="btn-primary" disabled={busy || !preview.donor.isEligible}>
              {busy ? t("common.saving") : t("verify.confirm")}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: result */}
      {result && (
        <div className="card animate-pop-in space-y-4 !bg-brand-mint text-center">
          <CheckCircle2 className="mx-auto animate-heartbeat" size={52} />
          <div>
            <h2 className="font-head text-2xl font-bold">{t("verify.done")}</h2>
            <p className="text-sm font-bold">
              {result.donorName} · {result.donation.certificateId}
            </p>
            <p className="mt-1 text-sm font-bold">
              {t("detail.units")}:{" "}
              <b>
                {result.unitsFulfilled}/{result.unitsRequired}
              </b>
              {result.requestStatus === "completed" && (
                <span className="pill ml-2 bg-black text-white">{t("verify.completed")}</span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => downloadCertificateFile(result.donation).catch(() => setError(t("donations.downloadError")))}
              className="btn-outline"
            >
              <Download size={16} /> {t("donations.certificate")}
            </button>
            <button onClick={reset} className="btn-dark">
              {t("verify.another")}
            </button>
          </div>
        </div>
      )}
    </Page>
  );
}
