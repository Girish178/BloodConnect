import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flag } from "lucide-react";
import { listReports, resolveReport } from "../services/adminService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import { StatusBadge } from "../components/Badges";
import Reveal from "../components/Reveal";
import { Alert, EmptyState, Page, PageHeader, Skeleton } from "../components/ui";
import { timeAgo } from "../utils/format";

const TABS = ["open", "resolved", "dismissed"];

export default function AdminReports() {
  const { t } = useLang();
  const [status, setStatus] = useState("open");
  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = async (s) => {
    setReports(null);
    setError("");
    try {
      const { data } = await listReports({ status: s });
      setReports(data.reports);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load(status);
  }, [status]);

  const act = async (report, action) => {
    const text = action === "cancel_request" ? t("reports.confirmRemove") : t("reports.confirmDismiss");
    if (!window.confirm(text)) return;

    setBusyId(report._id);
    setError("");
    try {
      await resolveReport(report._id, action);
      await load(status);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId("");
    }
  };

  return (
    <Page>
      <PageHeader color="pink" icon={Flag} title={t("reports.title")} subtitle={t("reports.subtitle")} />

      <div className="flex flex-wrap gap-2.5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            aria-pressed={status === tab}
            className={`blood-pill px-4 py-2 text-sm ${status === tab ? "active" : ""}`}
          >
            {t(`reports.tab.${tab}`)}
          </button>
        ))}
      </div>

      <Alert>{error}</Alert>

      {!reports && !error && <Skeleton className="h-28" />}

      {reports?.length === 0 && <EmptyState title={t("reports.empty")} />}

      <div className="space-y-5">
        {reports?.map((r, i) => {
          const req = r.requestId;
          return (
            <Reveal key={r._id} delay={Math.min(i, 5) * 50}>
              <div className="card space-y-3 !p-4 sm:!p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill bg-brand-yellow">{t(`reason.${r.reason}`)}</span>
                  <span className="text-xs font-bold text-slate-500">
                    {t("reports.by", { name: r.reporterId?.name || t("reports.aUser") })} · {timeAgo(r.createdAt, t)}
                  </span>
                </div>

                {r.details && <p className="text-sm font-semibold italic text-slate-700">“{r.details}”</p>}

                {req ? (
                  <div className="space-y-1 border-[3px] border-black bg-brand-bg p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2 font-bold">
                      <b>{req.bloodGroup}</b> · <b>{req.patientName}</b>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-xs font-bold text-slate-600">
                      {req.hospitalName}, {req.city} · {t("reports.postedBy", { name: req.createdBy?.name || "?" })}
                    </p>
                    <Link to={`/requests/${req._id}`} className="text-xs font-extrabold text-brand-red underline underline-offset-2">
                      {t("reports.openRequest")} →
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-500">{t("reports.gone")}</p>
                )}

                {r.status === "open" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button className="btn-outline" disabled={busyId === r._id} onClick={() => act(r, "dismiss")}>
                      {t("reports.dismiss")}
                    </button>
                    <button className="btn-primary" disabled={busyId === r._id} onClick={() => act(r, "cancel_request")}>
                      {t("reports.remove")}
                    </button>
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </Page>
  );
}
