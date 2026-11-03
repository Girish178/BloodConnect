import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarHeart, Plus, Search } from "lucide-react";
import { getManagedCamps, getMyCamps, listCamps } from "../services/campService";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import CampCard from "../components/CampCard";
import Reveal from "../components/Reveal";
import { Alert, EmptyState, Page, PageHeader, Skeleton } from "../components/ui";

export default function Camps() {
  const { user } = useAuth();
  const { t } = useLang();
  const canOrganise = user && ["verifier", "admin"].includes(user.role);

  const tabs = [
    { id: "upcoming", label: t("camps.tab.upcoming") },
    { id: "past", label: t("camps.tab.past") },
    ...(user ? [{ id: "mine", label: t("camps.tab.mine") }] : []),
    ...(canOrganise ? [{ id: "managed", label: t("camps.tab.managed") }] : []),
  ];

  const [tab, setTab] = useState("upcoming");
  const [items, setItems] = useState(null); // [{ camp, registered }]
  const [error, setError] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    let alive = true;
    setItems(null);
    setError("");

    const load =
      tab === "mine"
        ? getMyCamps().then(({ data }) => data.registrations.map((r) => ({ camp: r.camp, registered: true })))
        : tab === "managed"
          ? getManagedCamps().then(({ data }) => data.camps.map((camp) => ({ camp })))
          : listCamps({ scope: tab }).then(({ data }) => data.camps.map((camp) => ({ camp })));

    load
      .then((rows) => alive && setItems(rows))
      .catch((err) => alive && setError(getErrorMessage(err)));
    return () => {
      alive = false;
    };
  }, [tab]);

  // City search runs in the browser, no extra request
  const shown = useMemo(() => {
    const q = city.trim().toLowerCase();
    if (!items) return null;
    return q ? items.filter(({ camp }) => camp.city.toLowerCase().includes(q)) : items;
  }, [items, city]);

  const emptyText = tab === "mine" ? t("camps.emptyMine") : tab === "managed" ? t("camps.emptyManaged") : t("camps.empty");

  return (
    <Page width="max-w-4xl">
      <PageHeader
        color="blue"
        icon={CalendarHeart}
        title={t("camps.title")}
        subtitle={t("camps.subtitle")}
        action={
          canOrganise && (
            <Link to="/camps/new" className="btn-primary">
              <Plus size={16} /> {t("camps.new")}
            </Link>
          )
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist">
          {tabs.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={`border-[3px] border-black px-3.5 py-2 font-head text-xs font-extrabold uppercase transition active:translate-x-0.5 active:translate-y-0.5 ${
                tab === x.id ? "bg-brand-yellow shadow-brutal-sm" : "bg-white hover:bg-brand-yellow/40"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input !pl-9"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("camps.search")}
            aria-label={t("camps.search")}
          />
        </div>
      </div>

      <Alert>{error}</Alert>
      {!shown && !error && (
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}

      {shown?.length === 0 && (
        <EmptyState icon={CalendarHeart} title={t("camps.emptyTitle")} text={emptyText}>
          {tab === "mine" && (
            <button className="btn-primary" onClick={() => setTab("upcoming")}>
              {t("camps.browse")}
            </button>
          )}
        </EmptyState>
      )}

      <div className="space-y-4">
        {shown?.map(({ camp, registered }, i) => (
          <Reveal key={camp._id} delay={Math.min(i, 5) * 50}>
            <CampCard camp={camp} registered={registered} />
          </Reveal>
        ))}
      </div>
    </Page>
  );
}
