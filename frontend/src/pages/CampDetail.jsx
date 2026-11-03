import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, CalendarDays, Check, Clock, MapPin, Pencil, Phone, Users, XCircle } from "lucide-react";
import {
  cancelCamp,
  cancelRegistration,
  getAttendees,
  getCamp,
  markAttendance,
  registerForCamp,
} from "../services/campService";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { formatCampDate, formatDate, formatTime } from "../utils/format";
import { BloodTile } from "../components/Badges";
import Reveal from "../components/Reveal";
import { Alert, Page, Skeleton } from "../components/ui";

export default function CampDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [data, setData] = useState(null); // { camp, isRegistered, canManage, eligibility }
  const [attendees, setAttendees] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    getCamp(id)
      .then(({ data: d }) => setData(d))
      .catch((err) => setError(err.response?.status === 404 ? t("camp.notFound") : getErrorMessage(err)));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?._id]);

  useEffect(() => {
    if (data?.canManage) {
      getAttendees(id)
        .then(({ data: d }) => setAttendees(d.attendees))
        .catch(() => setAttendees([]));
    }
  }, [id, data?.canManage, data?.camp?.registeredCount]);

  // Runs an action, shows its message, then refreshes the page data
  const act = async (fn, okMessage, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      if (okMessage) setNotice(okMessage);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleAttended = async (a) => {
    const next = !a.attended;
    setAttendees((list) => list.map((x) => (x.registrationId === a.registrationId ? { ...x, attended: next } : x)));
    try {
      await markAttendance(id, a.registrationId, next);
    } catch (err) {
      setAttendees((list) => list.map((x) => (x.registrationId === a.registrationId ? { ...x, attended: !next } : x)));
      setError(getErrorMessage(err));
    }
  };

  if (error && !data) {
    return (
      <Page>
        <Link to="/camps" className="btn-outline btn-sm w-fit">
          <ArrowLeft size={14} /> {t("camp.back")}
        </Link>
        <Alert>{error}</Alert>
      </Page>
    );
  }
  if (!data) {
    return (
      <Page>
        <Skeleton className="h-64" />
      </Page>
    );
  }

  const { camp, isRegistered, canManage, eligibility } = data;
  const cancelled = camp.status === "cancelled";
  const full = camp.spotsLeft === 0;
  const open = !cancelled && !camp.isPast;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [camp.venue, camp.address, camp.city].filter(Boolean).join(", ")
  )}`;
  const pct = camp.capacity > 0 ? Math.min(100, Math.round((camp.registeredCount / camp.capacity) * 100)) : 0;

  // What the register area should say / do
  let action;
  if (cancelled) action = <Alert type="error">{t("camp.isCancelled")}</Alert>;
  else if (camp.isPast) action = <Alert type="info">{t("camp.isPast")}</Alert>;
  else if (!user)
    action = (
      <Link to="/login" state={{ from: `/camps/${camp._id}` }} className="btn-primary w-full">
        {t("camp.loginToRegister")}
      </Link>
    );
  else if (isRegistered)
    action = (
      <div className="space-y-3">
        <p className="flex items-center gap-2 border-[3px] border-black bg-brand-mint p-3 font-head text-sm font-extrabold">
          <Check size={18} /> {t("camp.youAreRegistered")}
        </p>
        <button
          disabled={busy}
          onClick={() => act(() => cancelRegistration(id), null, t("camp.confirmCancelReg"))}
          className="btn-outline w-full"
        >
          {t("camp.cancelReg")}
        </button>
      </div>
    );
  else if (full) action = <Alert type="info">{t("camp.isFull")}</Alert>;
  else if (eligibility && !eligibility.eligible)
    action = (
      <Alert type="info">
        {t("camp.notEligible", { date: formatDate(eligibility.nextEligibleDate, lang) })}
      </Alert>
    );
  else
    action = (
      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-700">{t("camp.eligibleOn")}</p>
        <button
          disabled={busy}
          onClick={() => act(() => registerForCamp(id), t("camp.registeredOk"))}
          className="btn-primary w-full"
        >
          {busy ? t("camp.registering") : t("camp.register")}
        </button>
      </div>
    );

  return (
    <Page width="max-w-4xl">
      <Link to="/camps" className="btn-outline btn-sm w-fit">
        <ArrowLeft size={14} /> {t("camp.back")}
      </Link>

      <Alert type="success">{notice}</Alert>
      <Alert>{error}</Alert>

      <div className="card animate-fade-up space-y-5 !p-0">
        <div className={`border-b-[3px] border-black p-5 sm:p-7 ${cancelled ? "bg-slate-200" : "bg-brand-yellow"}`}>
          <h1 className="font-head text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{camp.title}</h1>
          {camp.organizer && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold">
              <Building2 size={15} /> {t("camp.organizer")}: {camp.organizer}
            </p>
          )}
        </div>

        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2 sm:px-7 sm:pb-7">
          <InfoBlock icon={CalendarDays} label={t("camp.when")} bg="bg-brand-blue">
            <p className="font-head text-lg font-bold">{formatCampDate(camp.date, lang)}</p>
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Clock size={14} /> {formatTime(camp.startTime)} – {formatTime(camp.endTime)}
            </p>
          </InfoBlock>

          <InfoBlock icon={MapPin} label={t("camp.where")} bg="bg-brand-pink">
            <p className="font-head text-lg font-bold">{camp.venue}</p>
            <p className="text-sm font-bold">{[camp.address, camp.city].filter(Boolean).join(", ")}</p>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="link-slide mt-1 inline-block text-sm font-extrabold">
              {t("camp.directions")} →
            </a>
          </InfoBlock>

          <InfoBlock icon={Users} label={t("camp.seats")} bg="bg-brand-mint">
            <p className="font-head text-lg font-bold">
              {camp.capacity > 0 ? `${camp.registeredCount} / ${camp.capacity}` : t("camps.registered", { n: camp.registeredCount })}
            </p>
            {camp.capacity > 0 && (
              <div className="mt-1 h-3 overflow-hidden border-2 border-black bg-white">
                <div className="h-full bg-brand-red transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            )}
          </InfoBlock>

          <InfoBlock icon={Phone} label={t("camp.contact")} bg="bg-white">
            <a href={`tel:${camp.contactPhone}`} className="font-head text-lg font-bold underline decoration-2">
              {camp.contactPhone}
            </a>
          </InfoBlock>
        </div>

        {camp.description && (
          <div className="px-5 pb-5 sm:px-7">
            <h2 className="font-head text-lg font-bold">{t("camp.about")}</h2>
            <p className="mt-1 whitespace-pre-line text-sm font-semibold text-slate-700">{camp.description}</p>
          </div>
        )}
      </div>

      {open && <Reveal><div className="card !bg-white">{action}</div></Reveal>}
      {!open && <Reveal>{action}</Reveal>}

      <Reveal>
        <div className="card !bg-brand-yellow/40">
          <h2 className="font-head text-lg font-bold">{t("camp.prep.title")}</h2>
          <ul className="mt-2 space-y-1.5">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex items-start gap-2 text-sm font-bold">
                <Check size={16} className="mt-0.5 shrink-0" /> {t(`camp.prep.${n}`)}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {canManage && (
        <Reveal>
          <div className="card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-head text-xl font-bold">{t("camp.manage")}</h2>
              {open && (
                <div className="flex flex-wrap gap-2">
                  <Link to={`/camps/${camp._id}/edit`} className="btn-yellow btn-sm">
                    <Pencil size={14} /> {t("camp.edit")}
                  </Link>
                  <button
                    disabled={busy}
                    className="btn-outline btn-sm"
                    onClick={() =>
                      act(() => cancelCamp(id), t("camp.cancelledDone"), t("camp.confirmCancel"))
                    }
                  >
                    <XCircle size={14} /> {t("camp.cancelCamp")}
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-head text-base font-bold">
                {t("camp.attendees", { n: attendees?.length ?? camp.registeredCount })}
              </h3>
              <p className="text-xs font-bold text-slate-500">{t("camp.markHint")}</p>
            </div>

            {!attendees && <Skeleton className="h-16" />}
            {attendees?.length === 0 && <p className="text-sm font-bold text-slate-600">{t("camp.noAttendees")}</p>}

            <ul className="space-y-2">
              {attendees?.map((a) => (
                <li
                  key={a.registrationId}
                  className={`flex flex-wrap items-center gap-3 border-[3px] border-black p-3 transition ${
                    a.attended ? "bg-brand-mint" : "bg-white"
                  }`}
                >
                  <BloodTile group={a.bloodGroup} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-head font-bold">{a.name}</p>
                    <p className="text-xs font-bold text-slate-600">{a.city}</p>
                  </div>
                  <a href={`tel:${a.phone}`} className="btn-dark btn-sm">
                    <Phone size={13} /> {t("camp.call")}
                  </a>
                  <label className="flex cursor-pointer items-center gap-2 font-head text-xs font-extrabold uppercase">
                    <input
                      type="checkbox"
                      checked={a.attended}
                      onChange={() => toggleAttended(a)}
                      className="h-5 w-5 accent-black"
                    />
                    {t("camp.attended")}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}
    </Page>
  );
}

function InfoBlock({ icon: Icon, label, bg, children }) {
  return (
    <div className={`space-y-1 border-[3px] border-black p-4 shadow-brutal-sm ${bg}`}>
      <p className="flex items-center gap-1.5 font-head text-xs font-extrabold uppercase">
        <Icon size={14} /> {label}
      </p>
      {children}
    </div>
  );
}
