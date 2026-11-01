import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Siren } from "lucide-react";
import { getRequests } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import RequestCard from "../components/RequestCard";
import Reveal from "../components/Reveal";
import { Alert, EmptyState, Page, PageHeader, Skeleton } from "../components/ui";
import { BLOOD_GROUPS } from "../data/constants";

export default function Requests() {
  const { t } = useLang();
  const [filters, setFilters] = useState({ bloodGroup: "", urgency: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = { page, limit: 8 };
    if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
    if (filters.urgency) params.urgency = filters.urgency;

    setLoading(true);
    getRequests(params)
      .then(({ data }) => {
        setData(data);
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const setFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  return (
    <Page>
      <PageHeader
        color="red"
        icon={Siren}
        title={t("requests.title")}
        subtitle={t("requests.subtitle")}
        action={
          <Link to="/requests/new" className="btn-yellow">
            <Plus size={16} /> {t("requests.new")}
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <select className="input" aria-label={t("requests.allGroups")} value={filters.bloodGroup} onChange={(e) => setFilter("bloodGroup", e.target.value)}>
          <option value="">{t("requests.allGroups")}</option>
          {BLOOD_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select className="input" aria-label={t("requests.anyUrgency")} value={filters.urgency} onChange={(e) => setFilter("urgency", e.target.value)}>
          <option value="">{t("requests.anyUrgency")}</option>
          <option value="critical">{t("urgency.critical")}</option>
          <option value="urgent">{t("urgency.urgent")}</option>
          <option value="planned">{t("urgency.planned")}</option>
        </select>
      </div>

      <Alert>{error}</Alert>

      {loading && !data ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : data?.requests.length === 0 ? (
        <EmptyState title={t("requests.emptyTitle")} text={t("requests.empty")} />
      ) : (
        <div className="space-y-5">
          {data?.requests.map((r, i) => (
            <Reveal key={r._id} delay={Math.min(i, 5) * 50}>
              <RequestCard request={r} />
            </Reveal>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button className="btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={16} /> {t("common.prev")}
          </button>
          <span className="font-head text-sm font-bold">{t("common.page", { page: data.page, pages: data.pages })}</span>
          <button className="btn-outline btn-sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
            {t("common.next")} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </Page>
  );
}
