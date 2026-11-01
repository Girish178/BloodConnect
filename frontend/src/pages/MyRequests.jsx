import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Plus } from "lucide-react";
import { getMyRequests } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import RequestCard from "../components/RequestCard";
import Reveal from "../components/Reveal";
import { Alert, EmptyState, Page, PageHeader, Skeleton } from "../components/ui";

export default function MyRequests() {
  const { t } = useLang();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyRequests()
      .then(({ data }) => setRequests(data.requests))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <Page>
      <PageHeader
        color="mint"
        icon={ClipboardList}
        title={t("mine.title")}
        subtitle={t("mine.subtitle")}
        action={
          <Link to="/requests/new" className="btn-primary">
            <Plus size={16} /> {t("requests.new")}
          </Link>
        }
      />

      <Alert>{error}</Alert>

      {!requests && !error && <Skeleton className="h-28" />}

      {requests?.length === 0 && (
        <EmptyState title={t("mine.emptyTitle")} text={t("mine.empty")}>
          <Link to="/requests/new" className="btn-primary">
            {t("create.submit")}
          </Link>
        </EmptyState>
      )}

      <div className="space-y-5">
        {requests?.map((r, i) => (
          <Reveal key={r._id} delay={Math.min(i, 5) * 50}>
            <RequestCard request={r} showStatus />
          </Reveal>
        ))}
      </div>
    </Page>
  );
}
