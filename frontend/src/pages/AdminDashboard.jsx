import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, LayoutDashboard, Users } from "lucide-react";
import { getOverview } from "../services/adminService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import Reveal from "../components/Reveal";
import { Alert, Page, PageHeader, Skeleton } from "../components/ui";

function StatCard({ label, value, bg = "bg-white", num = "text-black" }) {
  return (
    <div className={`card card-hover !p-4 ${bg}`}>
      <p className={`font-head text-4xl font-bold ${num}`}>{value}</p>
      <p className="mt-1 border-t-2 border-black pt-1.5 text-xs font-extrabold">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOverview()
      .then(({ data }) => setData(data.overview))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) {
    return (
      <Page width="max-w-5xl">
        <Alert>{error}</Alert>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page width="max-w-5xl">
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </Page>
    );
  }

  const maxDay = Math.max(1, ...data.donationsByDay.map((d) => d.count));
  const maxGroup = Math.max(1, ...data.donorsByGroup.map((g) => g.total));
  const { requests } = data;
  const totalRequests = requests.open + requests.matched + requests.completed + requests.cancelled;

  return (
    <Page width="max-w-5xl">
      <PageHeader
        color="black"
        icon={LayoutDashboard}
        title={t("admin.title")}
        subtitle={t("admin.subtitle")}
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/reports" className="btn-yellow">
              <Flag size={15} /> {t("admin.reports")}
              {data.openReports > 0 && (
                <span className="border-2 border-black bg-brand-red px-1.5 text-xs text-white">{data.openReports}</span>
              )}
            </Link>
            <Link to="/admin/users" className="btn-outline">
              <Users size={15} /> {t("admin.staff")}
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t("admin.s.users")} value={data.users.total} />
        <StatCard label={t("admin.s.donors")} value={data.users.donors} bg="bg-brand-yellow" />
        <StatCard label={t("admin.s.available")} value={data.users.availableNow} bg="bg-brand-mint" />
        <StatCard label={t("admin.s.verifiers")} value={data.users.verifiers} bg="bg-brand-blue" />
        <StatCard label={t("admin.s.donations")} value={data.donations.total} num="text-brand-red" />
        <StatCard label={t("admin.s.last30")} value={data.donations.last30} num="text-brand-red" />
        <StatCard label={t("admin.s.active")} value={requests.open + requests.matched} bg="bg-brand-pink" />
        <StatCard
          label={t("admin.s.reports")}
          value={data.openReports}
          bg={data.openReports > 0 ? "bg-brand-red" : "bg-white"}
          num={data.openReports > 0 ? "text-white" : "text-black"}
        />
      </div>

      {/* Donations per day */}
      <Reveal>
        <div className="card">
          <h2 className="font-head text-xl font-bold">{t("admin.chart.title")}</h2>
          <div className="mt-4 flex h-44 items-end gap-1 sm:gap-2">
            {data.donationsByDay.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
                <span className="text-[10px] font-extrabold">{d.count > 0 ? d.count : ""}</span>
                <div
                  className="w-full border-2 border-black bg-brand-red transition-all duration-700 hover:bg-brand-yellow"
                  style={{
                    height: `${Math.max((d.count / maxDay) * 100, d.count > 0 ? 6 : 2)}%`,
                    opacity: d.count > 0 ? 1 : 0.25,
                  }}
                  title={`${d.date}: ${d.count}`}
                />
                <span className="text-[9px] font-bold text-slate-600">{d.date.slice(8)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">{t("admin.chart.note")}</p>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="card h-full space-y-3">
            <h2 className="font-head text-xl font-bold">{t("admin.groups.title")}</h2>
            {data.donorsByGroup.map((g) => (
              <div key={g.bloodGroup} className="flex items-center gap-3 text-sm">
                <span className="w-9 font-head font-bold">{g.bloodGroup}</span>
                <div className="relative h-4 flex-1 overflow-hidden border-2 border-black bg-white">
                  <div className="absolute inset-y-0 left-0 bg-brand-yellow" style={{ width: `${(g.total / maxGroup) * 100}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-emerald-500" style={{ width: `${(g.available / maxGroup) * 100}%` }} />
                </div>
                <span className="w-14 text-right text-xs font-extrabold">
                  {g.available}/{g.total}
                </span>
              </div>
            ))}
            <p className="text-xs font-bold text-slate-500">{t("admin.groups.note")}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="card h-full space-y-3">
            <h2 className="font-head text-xl font-bold">{t("admin.status.title", { n: totalRequests })}</h2>
            {[
              { label: t("status.open"), value: requests.open, color: "bg-emerald-500" },
              { label: t("status.matched"), value: requests.matched, color: "bg-blue-500" },
              { label: t("status.completed"), value: requests.completed, color: "bg-black" },
              { label: t("status.cancelled"), value: requests.cancelled, color: "bg-slate-400" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-xs font-extrabold">{r.label}</span>
                <div className="h-4 flex-1 overflow-hidden border-2 border-black bg-white">
                  <div className={`h-full ${r.color} transition-all duration-700`} style={{ width: `${totalRequests ? (r.value / totalRequests) * 100 : 0}%` }} />
                </div>
                <span className="w-8 text-right font-head font-bold">{r.value}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Page>
  );
}
