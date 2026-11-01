import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useGeolocation } from "../hooks/useGeolocation";
import LocationField from "../components/LocationField";
import { Alert, Field, Page, PageHeader } from "../components/ui";
import { createRequest } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import { BLOOD_GROUPS } from "../data/constants";

const URGENCY = [
  { value: "critical", hint: "create.hint.critical", on: "bg-brand-red text-white" },
  { value: "urgent", hint: "create.hint.urgent", on: "bg-brand-yellow" },
  { value: "planned", hint: "create.hint.planned", on: "bg-brand-blue" },
];

export default function CreateRequest() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const geo = useGeolocation();

  const [form, setForm] = useState({
    patientName: "",
    bloodGroup: "",
    unitsRequired: 1,
    hospitalName: "",
    city: user.city || "",
    contactNumber: user.phone || "",
    urgency: "urgent",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Try to detect location as soon as the page opens
  useEffect(() => {
    geo.locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!geo.coords) {
      setError(t("create.needLocation"));
      return;
    }
    setLoading(true);
    try {
      const { data } = await createRequest({
        ...form,
        unitsRequired: Number(form.unitsRequired),
        latitude: geo.coords.latitude,
        longitude: geo.coords.longitude,
      });
      navigate(`/requests/${data.request._id}`, {
        replace: true,
        state: { nearby: data.nearbyDonorsCount },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const next = [t("create.next1"), t("create.next2"), t("create.next3")];

  return (
    <Page width="max-w-5xl">
      <PageHeader color="red" icon={Droplet} title={t("create.title")} subtitle={t("create.subtitle")} />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="card space-y-6 lg:col-span-3">
          <Alert>{error}</Alert>

          <div>
            <p className="label">{t("create.group")}</p>
            <div className="grid grid-cols-4 gap-2.5">
              {BLOOD_GROUPS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setForm({ ...form, bloodGroup: g })}
                  aria-pressed={form.bloodGroup === g}
                  className={`blood-pill py-2.5 text-base ${form.bloodGroup === g ? "active-red" : ""}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label">{t("create.urgent")}</p>
            <div className="grid grid-cols-3 gap-2.5">
              {URGENCY.map((u) => (
                <button
                  type="button"
                  key={u.value}
                  onClick={() => setForm({ ...form, urgency: u.value })}
                  aria-pressed={form.urgency === u.value}
                  className={`border-[3px] border-black px-2 py-3 text-center transition hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                    form.urgency === u.value
                      ? `${u.on} -translate-x-0.5 -translate-y-0.5 shadow-brutal`
                      : "bg-white shadow-brutal-sm hover:shadow-brutal"
                  }`}
                >
                  <span className="block font-head text-sm font-bold">{t(`urgency.${u.value}`)}</span>
                  <span className="block text-[11px] font-bold opacity-80">{t(u.hint)}</span>
                </button>
              ))}
            </div>
          </div>

          <Field label={t("create.patient")} htmlFor="patientName">
            <input id="patientName" className="input" name="patientName" placeholder={t("create.patient")} value={form.patientName} onChange={onChange} required />
          </Field>
          <Field label={t("create.hospital")} htmlFor="hospitalName">
            <input id="hospitalName" className="input" name="hospitalName" placeholder={t("create.hospital")} value={form.hospitalName} onChange={onChange} required />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("form.city")} htmlFor="city">
              <input id="city" className="input" name="city" placeholder={t("form.city")} value={form.city} onChange={onChange} required />
            </Field>
            <Field label={t("create.units")} htmlFor="unitsRequired">
              <input id="unitsRequired" className="input" type="number" name="unitsRequired" min={1} max={10} value={form.unitsRequired} onChange={onChange} required />
            </Field>
          </div>

          <Field label={t("create.contact")} htmlFor="contactNumber" hint={t("create.contactHint")}>
            <input id="contactNumber" className="input" name="contactNumber" placeholder="98XXXXXXXX" value={form.contactNumber} onChange={onChange} inputMode="numeric" maxLength={10} required />
          </Field>

          <LocationField {...geo} />

          <button className="btn-primary btn-lg w-full" disabled={loading || !form.bloodGroup}>
            <Send size={18} />
            {loading ? t("create.busy") : t("create.submit")}
          </button>
          {!form.bloodGroup && (
            <p className="text-center text-xs font-bold text-slate-500">{t("create.pickGroup")}</p>
          )}
        </form>

        {/* What happens next */}
        <aside className="card space-y-5 !bg-brand-yellow lg:sticky lg:top-28 lg:col-span-2">
          <h2 className="font-head text-2xl font-bold">{t("create.nextTitle")}</h2>
          <ol className="space-y-4">
            {next.map((text, i) => (
              <li key={text} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center border-[3px] border-black bg-black font-head font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-1 text-sm font-bold leading-snug">{text}</span>
              </li>
            ))}
          </ol>
          <p className="border-[3px] border-black bg-white p-3 text-xs font-bold">{t("create.disclaimer")}</p>
        </aside>
      </div>
    </Page>
  );
}
