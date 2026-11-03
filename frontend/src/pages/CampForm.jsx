import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import { createCamp, getCamp, updateCamp } from "../services/campService";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { Alert, Field, Page, PageHeader, Skeleton } from "../components/ui";

const todayIST = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

export default function CampForm() {
  const { id } = useParams(); // present when editing
  const editing = Boolean(id);
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    organizer: "",
    description: "",
    date: "",
    startTime: "09:00",
    endTime: "14:00",
    venue: "",
    city: user?.city || "",
    address: "",
    contactPhone: user?.phone || "",
    capacity: 0,
  });
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;
    getCamp(id)
      .then(({ data }) => {
        const c = data.camp;
        setForm({
          title: c.title,
          organizer: c.organizer || "",
          description: c.description || "",
          date: new Date(c.date).toISOString().slice(0, 10),
          startTime: c.startTime,
          endTime: c.endTime,
          venue: c.venue,
          city: c.city,
          address: c.address || "",
          contactPhone: c.contactPhone,
          capacity: c.capacity || 0,
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.endTime <= form.startTime) return setError("End time must be after start time");
    setSaving(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) || 0 };
      const { data } = editing ? await updateCamp(id, payload) : await createCamp(payload);
      navigate(`/camps/${data.camp._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Page>
      <PageHeader
        color="yellow"
        icon={CalendarPlus}
        title={editing ? t("campForm.titleEdit") : t("campForm.titleNew")}
        subtitle={t("campForm.subtitle")}
      />

      {loading ? (
        <Skeleton className="h-96" />
      ) : (
        <form onSubmit={submit} className="card animate-fade-up space-y-5">
          <Alert>{error}</Alert>

          <Field label={t("campForm.name")} htmlFor="title">
            <input id="title" className="input" required value={form.title} onChange={set("title")} placeholder={t("campForm.namePh")} />
          </Field>

          <Field label={t("campForm.organizer")} htmlFor="organizer">
            <input id="organizer" className="input" value={form.organizer} onChange={set("organizer")} placeholder={t("campForm.organizerPh")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("campForm.date")} htmlFor="date">
              <input id="date" type="date" className="input" required min={editing ? undefined : todayIST()} value={form.date} onChange={set("date")} />
            </Field>
            <Field label={t("campForm.start")} htmlFor="start">
              <input id="start" type="time" className="input" required value={form.startTime} onChange={set("startTime")} />
            </Field>
            <Field label={t("campForm.end")} htmlFor="end">
              <input id="end" type="time" className="input" required value={form.endTime} onChange={set("endTime")} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("campForm.venue")} htmlFor="venue">
              <input id="venue" className="input" required value={form.venue} onChange={set("venue")} placeholder={t("campForm.venuePh")} />
            </Field>
            <Field label={t("campForm.city")} htmlFor="city">
              <input id="city" className="input" required value={form.city} onChange={set("city")} />
            </Field>
          </div>

          <Field label={t("campForm.address")} htmlFor="address">
            <input id="address" className="input" value={form.address} onChange={set("address")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("campForm.phone")} htmlFor="phone">
              <input id="phone" className="input" required inputMode="numeric" maxLength={10} value={form.contactPhone} onChange={set("contactPhone")} />
            </Field>
            <Field label={t("campForm.capacity")} htmlFor="cap" hint={t("campForm.capacityHint")}>
              <input id="cap" type="number" min="0" max="5000" className="input" value={form.capacity} onChange={set("capacity")} />
            </Field>
          </div>

          <Field label={t("campForm.about")} htmlFor="desc">
            <textarea id="desc" rows={4} maxLength={500} className="input" value={form.description} onChange={set("description")} placeholder={t("campForm.aboutPh")} />
          </Field>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? t("campForm.saving") : editing ? t("campForm.save") : t("campForm.publish")}
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
              {t("campForm.back")}
            </button>
          </div>
        </form>
      )}
    </Page>
  );
}
