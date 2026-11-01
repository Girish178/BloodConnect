import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
} from "../services/notificationService";
import { timeAgo } from "../utils/format";

export default function NotificationBell() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const ref = useRef(null);

  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCount = useCallback(() => {
    getUnreadCount()
      .then(({ data }) => setUnread(data.unreadCount))
      .catch(() => {});
  }, []);

  // Poll the unread count every 30 seconds while the tab is visible
  useEffect(() => {
    if (!user) return;
    refreshCount();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refreshCount();
    }, 30000);
    return () => clearInterval(timer);
  }, [user, refreshCount]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
    };
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setLoading(true);
    try {
      const { data } = await getNotifications({ limit: 8 });
      setItems(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const openItem = async (n) => {
    setOpen(false);
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
    // No "relative" here on purpose: the panel anchors to the sticky header,
    // so it can span the screen on phones.
    <div ref={ref}>
      <button
        onClick={toggle}
        aria-label={t("bell.title")}
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center border-[3px] border-black bg-white shadow-brutal-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5"
      >
        <Bell size={18} className={unread > 0 ? "animate-wiggle" : ""} />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 grid h-5 min-w-5 animate-pop-in place-items-center border-2 border-black bg-brand-red px-1 font-head text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-pop-in absolute left-3 right-3 top-full z-50 mt-3 overflow-hidden border-4 border-black bg-white shadow-brutal-xl sm:left-auto sm:right-8 sm:w-96">
          <div className="flex items-center justify-between border-b-4 border-black bg-brand-yellow px-4 py-3">
            <span className="font-head text-sm font-extrabold uppercase">{t("bell.title")}</span>
            {unread > 0 && (
              <button onClick={readAll} className="text-xs font-extrabold underline">
                {t("bell.markAll")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="p-4 text-sm font-bold text-slate-500">{t("common.loading")}</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm font-bold text-slate-500">{t("bell.empty")}</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => openItem(n)}
                  className={`block w-full border-b-2 border-black px-4 py-3 text-left transition last:border-0 hover:bg-brand-blue/50 ${
                    n.isRead ? "bg-white" : "bg-brand-pink/60"
                  }`}
                >
                  <p className="text-sm font-extrabold">{n.title}</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700">{n.message}</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">
                    {timeAgo(n.createdAt, t)}
                  </p>
                </button>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t-4 border-black bg-black py-2.5 text-center font-head text-xs font-extrabold uppercase text-white transition hover:bg-brand-red"
          >
            {t("bell.viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
