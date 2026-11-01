import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { getNotifications, markAllRead, markRead } from "../services/notificationService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import { timeAgo } from "../utils/format";
import Reveal from "../components/Reveal";
import { Alert, EmptyState, Page, PageHeader, Skeleton } from "../components/ui";

export default function Notifications() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [items, setItems] = useState(null);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getNotifications({ limit: 50 })
      .then(({ data }) => {
        setItems(data.notifications);
        setUnread(data.unreadCount);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const open = (n) => {
    if (!n.isRead) {
      setItems((list) => list.map((i) => (i._id === n._id ? { ...i, isRead: true } : i)));
      setUnread((c) => Math.max(0, c - 1));
      markRead(n._id).catch(() => {});
    }
    if (n.relatedId) navigate(`/requests/${n.relatedId}`);
  };

  const readAll = async () => {
    await markAllRead().catch(() => {});
    setItems((list) => list.map((i) => ({ ...i, isRead: true })));
    setUnread(0);
  };

  return (
    <Page width="max-w-2xl">
      <PageHeader
        color="pink"
        icon={Bell}
        title={t("notif.title")}
        subtitle={t("notif.unread", { n: unread })}
        action={
          unread > 0 && (
            <button onClick={readAll} className="btn-outline">
              <CheckCheck size={16} /> {t("bell.markAll")}
            </button>
          )
        }
      />

      <Alert>{error}</Alert>

      {!items && !error && <Skeleton className="h-24" />}

      {items?.length === 0 && <EmptyState icon={BellOff} title={t("notif.emptyTitle")} text={t("notif.empty")} />}

      <div className="space-y-3">
        {items?.map((n, i) => (
          <Reveal key={n._id} delay={Math.min(i, 6) * 40}>
            <button
              onClick={() => open(n)}
              className={`card card-hover block w-full text-left !p-4 ${n.isRead ? "" : "!bg-brand-yellow/50"}`}
            >
              <div className="flex items-start gap-3">
                {!n.isRead && <span className="mt-1.5 h-3 w-3 shrink-0 border-2 border-black bg-brand-red" />}
                <div className="min-w-0">
                  <p className="font-head text-base font-bold">{n.title}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-700">{n.message}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{timeAgo(n.createdAt, t)}</p>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </Page>
  );
}
