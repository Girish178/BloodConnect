import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Building2, CheckCircle2, MapPin, Phone, QrCode } from "lucide-react";
import { BloodTile, StatusBadge, UrgencyBadge } from "../components/Badges";
import ReportButton from "../components/ReportButton";
import { Alert, Page, Skeleton } from "../components/ui";
import {
  cancelRequest,
  getRequestById,
  getResponses,
  respondToRequest,
  selectDonor,
} from "../services/requestService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import { timeAgo } from "../utils/format";

const stripe = {
  critical: "bg-brand-red",
  urgent: "bg-brand-yellow",
  planned: "bg-brand-blue",
};

export default function RequestDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useLang();
  const nearby = location.state?.nearby;

  const [info, setInfo] = useState(null); // { request, isOwner, myResponse }
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await getRequestById(id);
      setInfo(res.data);
      if (res.data.isOwner) {
        const r = await getResponses(id);
        setResponses(r.data.responses);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Page width="max-w-2xl">
        <Skeleton className="h-64" />
      </Page>
    );
  }

  if (!info) {
    return (
      <Page width="max-w-2xl">
        <Alert>{error || t("detail.notFound")}</Alert>
      </Page>
    );
  }

  const { request, isOwner, myResponse } = info;
  const isActive = ["open", "matched"].includes(request.status);
  const iAccepted = myResponse && ["accepted", "selected"].includes(myResponse.status);
  const done = request.unitsFulfilled || 0;
  const pct = Math.min(100, Math.round((done / request.unitsRequired) * 100));

  return (
    <Page width="max-w-2xl">
      {typeof nearby === "number" && (
        <Alert type="success">{t("detail.posted", { n: nearby })}</Alert>
      )}

      <Alert>{error}</Alert>

      {/* Main card */}
      <div className="card animate-fade-up !p-0">
        <div className={`h-3 border-b-[3px] border-black ${stripe[request.urgency] || "bg-white"}`} />
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <BloodTile group={request.bloodGroup} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="font-head text-3xl font-bold leading-tight">{request.patientName}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <UrgencyBadge urgency={request.urgency} />
                <StatusBadge status={request.status} />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm font-bold text-slate-700">
            <p className="flex items-center gap-2">
              <Building2 size={16} className="shrink-0" /> {request.hospitalName}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} className="shrink-0" /> {request.city}
            </p>
            <p className="text-xs text-slate-500">
              {t("detail.posted.by", { time: timeAgo(request.createdAt, t) })}
              {request.createdBy?.name && <> · {request.createdBy.name}</>}
            </p>
          </div>

          {/* Units progress */}
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="label !mb-0">{t("detail.units")}</span>
              <span className="font-head text-xl font-bold">
                {done} / {request.unitsRequired}
              </span>
            </div>
            <div className="h-5 overflow-hidden border-[3px] border-black bg-white">
              <div className="h-full border-r-[3px] border-black bg-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {request.contactNumber ? (
            <a href={`tel:${request.contactNumber}`} className="btn-primary btn-lg w-full">
              <Phone size={18} /> {t("detail.call", { phone: request.contactNumber })}
            </a>
          ) : (
            !isOwner && <p className="alert alert-info">{t("detail.contactHidden")}</p>
          )}
        </div>
      </div>

      {/* Donor QR (only once the requester has selected this donor) */}
      {!isOwner && myResponse?.status === "selected" && (
        <Link to={`/requests/${id}/qr`} className="btn-yellow btn-lg w-full">
          <QrCode size={18} /> {t("detail.showQr")}
        </Link>
      )}

      {/* Donor actions */}
      {!isOwner && isActive && (
        <div className="card animate-fade-up space-y-4 !bg-brand-mint">
          <h2 className="font-head text-2xl font-bold">{t("detail.canDonate")}</h2>

          {myResponse && (
            <p className="flex items-center gap-2 text-sm font-bold">
              {t("detail.yourResponse")} <StatusBadge status={myResponse.status} />
            </p>
          )}

          {iAccepted ? (
            <button
              className="btn-outline w-full"
              disabled={busy}
              onClick={() => run(() => respondToRequest(id, { status: "withdrawn" }))}
            >
              {t("detail.withdraw")}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                className="btn-dark"
                disabled={busy}
                onClick={() => run(() => respondToRequest(id, { status: "accepted" }))}
              >
                <CheckCircle2 size={16} /> {t("detail.accept")}
              </button>
              <button
                className="btn-outline"
                disabled={busy}
                onClick={() => run(() => respondToRequest(id, { status: "declined" }))}
              >
                {t("detail.decline")}
              </button>
            </div>
          )}
          <p className="text-xs font-bold text-slate-700">{t("detail.hospitalConfirms")}</p>
        </div>
      )}

      {/* Owner view */}
      {isOwner && (
        <div className="card animate-fade-up space-y-4">
          <h2 className="font-head text-2xl font-bold">{t("detail.responses", { n: responses.length })}</h2>

          {responses.length === 0 && (
            <p className="text-sm font-bold text-slate-600">{t("detail.noResponses")}</p>
          )}

          {responses.map((r) => (
            <div
              key={r._id}
              className={`flex flex-wrap items-center gap-3 border-[3px] border-black p-3 ${
                r.status === "selected" ? "bg-brand-yellow/60" : "bg-white"
              }`}
            >
              <BloodTile group={r.donorId.bloodGroup} size="sm" />
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate font-head text-base font-bold">{r.donorId.name}</p>
                <p className="text-xs font-bold text-slate-600">
                  {r.donorId.city} · {r.donorId.phone}
                </p>
                {r.message && <p className="text-xs font-semibold italic text-slate-600">“{r.message}”</p>}
              </div>
              <div className="flex items-center gap-2">
                {r.status === "selected" ? (
                  <StatusBadge status="selected" />
                ) : (
                  isActive && (
                    <button className="btn-yellow btn-sm" disabled={busy} onClick={() => run(() => selectDonor(id, r._id))}>
                      {t("detail.select")}
                    </button>
                  )
                )}
                <a href={`tel:${r.donorId.phone}`} className="btn-dark btn-sm">
                  <Phone size={13} /> {t("detail.callShort")}
                </a>
              </div>
            </div>
          ))}

          {isActive && (
            <button
              className="btn-outline w-full !text-brand-red"
              disabled={busy}
              onClick={() => {
                if (window.confirm(t("detail.cancelConfirm"))) run(() => cancelRequest(id));
              }}
            >
              {t("detail.cancel")}
            </button>
          )}
        </div>
      )}

      {!isOwner && <ReportButton requestId={id} />}

      <Link to="/requests" className="block text-center font-head text-sm font-extrabold uppercase text-brand-red underline decoration-2 underline-offset-4">
        ← {t("detail.back")}
      </Link>
    </Page>
  );
}
