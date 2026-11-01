import { useEffect, useState } from "react";
import { Award, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { getMe } from "../services/authService";
import { downloadCertificateFile, getMyDonations } from "../services/donationService";
import { getErrorMessage } from "../services/api";
import { formatDate } from "../utils/format";
import Reveal from "../components/Reveal";
import { Alert, EmptyState, Page, PageHeader, Skeleton } from "../components/ui";

export default function MyDonations() {
  const { user, updateUser } = useAuth();
  const { t, lang } = useLang();
  const [donations, setDonations] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    getMyDonations()
      .then(({ data }) => setDonations(data.donations))
      .catch((err) => setError(getErrorMessage(err)));
    // Refresh eligibility, since a donation may have just been verified
    getMe()
      .then(({ data }) => updateUser(data.user))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = async (d) => {
    setBusyId(d._id);
    setError("");
    try {
      await downloadCertificateFile(d);
    } catch {
      setError(t("donations.downloadError"));
    } finally {
      setBusyId("");
    }
  };

  const total = donations?.length || 0;

  return (
    <Page>
      <PageHeader color="yellow" icon={Award} title={t("donations.title")} subtitle={t("donations.subtitle")} />

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="card card-hover text-center">
          <p className="font-head text-5xl font-bold text-brand-red">{total}</p>
          <p className="mt-1 text-sm font-bold">{t("donations.verified")}</p>
        </div>
        <div className="card card-hover !bg-brand-mint text-center">
          <p className="font-head text-5xl font-bold">{total * 3}</p>
          <p className="mt-1 text-sm font-bold">{t("donations.lives")}</p>
        </div>
        <div className="card card-hover !bg-brand-blue text-center">
          {user.isEligible ? (
            <p className="font-head text-2xl font-bold text-emerald-800">{t("donations.eligibleNow")}</p>
          ) : (
            <p className="font-head text-2xl font-bold text-amber-800">{formatDate(user.nextEligibleDate, lang)}</p>
          )}
          <p className="mt-1 text-sm font-bold">
            {user.isEligible ? t("donations.canAgain") : t("donations.nextDate")}
          </p>
        </div>
      </div>

      <Alert>{error}</Alert>

      {!donations && !error && <Skeleton className="h-24" />}

      {donations?.length === 0 && <EmptyState icon={Award} title={t("donations.emptyTitle")} text={t("donations.empty")} />}

      <div className="space-y-4">
        {donations?.map((d, i) => (
          <Reveal key={d._id} delay={Math.min(i, 5) * 50}>
            <div className="card card-hover flex flex-wrap items-center gap-4 !p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center border-[3px] border-black bg-brand-yellow shadow-brutal-sm">
                <Award size={22} />
              </span>
              <div className="min-w-0 flex-1 basis-48">
                <p className="font-head text-lg font-bold">
                  {d.bloodGroup} · {d.hospitalName}
                </p>
                <p className="text-xs font-bold text-slate-600">
                  {formatDate(d.donationDate, lang)} · {d.city} · {d.certificateId}
                </p>
              </div>
              <button onClick={() => download(d)} disabled={busyId === d._id} className="btn-dark btn-sm">
                <Download size={14} />
                {busyId === d._id ? "…" : t("donations.certificate")}
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </Page>
  );
}
