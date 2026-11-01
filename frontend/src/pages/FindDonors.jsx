import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, UserSearch } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useGeolocation } from "../hooks/useGeolocation";
import LocationField from "../components/LocationField";
import DonorCard from "../components/DonorCard";
import Reveal from "../components/Reveal";
import { Alert, EmptyState, Field, Page, PageHeader } from "../components/ui";
import { searchDonors } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import { BLOOD_GROUPS } from "../data/constants";

const RADII = [5, 10, 20, 50];

export default function FindDonors() {
  const { t } = useLang();
  const geo = useGeolocation();
  const [params] = useSearchParams();
  const initialGroup = BLOOD_GROUPS.includes(params.get("group")) ? params.get("group") : "";

  const [bloodGroup, setBloodGroup] = useState(initialGroup);
  const [radius, setRadius] = useState(10);
  const [donors, setDonors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    geo.locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    setError("");
    if (!geo.coords) {
      setError(t("donors.needLocation"));
      return;
    }
    setLoading(true);
    try {
      const { data } = await searchDonors({
        bloodGroup,
        lat: geo.coords.latitude,
        lng: geo.coords.longitude,
        radius,
      });
      setDonors(data.donors);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <PageHeader color="blue" icon={UserSearch} title={t("donors.title")} subtitle={t("donors.subtitle")} />

      <form onSubmit={onSearch} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("form.bloodGroup")} htmlFor="group">
            <select id="group" className="input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required>
              <option value="">{t("form.bloodGroup")}</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("donors.radius")} htmlFor="radius">
            <select id="radius" className="input" value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
              {RADII.map((r) => (
                <option key={r} value={r}>
                  {t("donors.within", { r })}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <LocationField {...geo} />

        <Alert>{error}</Alert>

        <button className="btn-primary btn-lg w-full" disabled={loading || !bloodGroup}>
          <Search size={18} className={loading ? "animate-pulse" : ""} />
          {loading ? t("donors.searching") : t("donors.search")}
        </button>
      </form>

      {donors && (
        <section className="space-y-4">
          <p className="font-head text-sm font-extrabold uppercase">{t("donors.found", { n: donors.length })}</p>

          {donors.length === 0 ? (
            <EmptyState title={t("donors.noneTitle", { r: radius })} text={t("donors.noneText")}>
              <Link to="/requests/new" className="btn-primary">
                {t("donors.postRequest")}
              </Link>
            </EmptyState>
          ) : (
            <>
              <div className="space-y-4">
                {donors.map((d, i) => (
                  <Reveal key={d._id} delay={Math.min(i, 6) * 60}>
                    <DonorCard donor={d} />
                  </Reveal>
                ))}
              </div>
              <Link to="/requests/new" className="btn-dark btn-lg w-full">
                {t("donors.postToNotify")}
              </Link>
            </>
          )}
        </section>
      )}
    </Page>
  );
}
