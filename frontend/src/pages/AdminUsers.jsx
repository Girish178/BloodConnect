import { useEffect, useState } from "react";
import { Search, UserCog } from "lucide-react";
import { listUsers, setUserRole } from "../services/adminService";
import { getErrorMessage } from "../services/api";
import { useLang } from "../context/LanguageContext";
import Reveal from "../components/Reveal";
import { Alert, EmptyState, Page, PageHeader, Skeleton } from "../components/ui";

const roleStyle = {
  admin: "bg-black text-white",
  verifier: "bg-brand-blue",
  user: "bg-white",
};

export default function AdminUsers() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  // Which row is currently asking for a hospital name
  const [editingId, setEditingId] = useState("");
  const [hospital, setHospital] = useState("");

  const load = async () => {
    setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (role) params.role = role;
      const { data } = await listUsers(params);
      setUsers(data.users);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const onSearch = (e) => {
    e.preventDefault();
    load();
  };

  const change = async (user, nextRole, hospitalName) => {
    setBusyId(user._id);
    setError("");
    try {
      const { data } = await setUserRole(user._id, { role: nextRole, hospitalName });
      setUsers((list) => list.map((u) => (u._id === user._id ? data.user : u)));
      setEditingId("");
      setHospital("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId("");
    }
  };

  return (
    <Page>
      <PageHeader color="blue" icon={UserCog} title={t("staff.title")} subtitle={t("staff.subtitle")} />

      <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          className="input"
          aria-label={t("staff.search")}
          placeholder={t("staff.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input sm:w-44" aria-label={t("staff.allRoles")} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">{t("staff.allRoles")}</option>
          <option value="verifier">{t("staff.verifiers")}</option>
          <option value="user">{t("staff.users")}</option>
          <option value="admin">{t("staff.admins")}</option>
        </select>
        <button className="btn-primary">
          <Search size={16} /> {t("staff.searchBtn")}
        </button>
      </form>

      <Alert>{error}</Alert>

      {!users && !error && <Skeleton className="h-24" />}

      {users?.length === 0 && <EmptyState title={t("staff.empty")} />}

      <div className="space-y-4">
        {users?.map((u, i) => (
          <Reveal key={u._id} delay={Math.min(i, 5) * 40}>
            <div className="card space-y-3 !p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-head text-lg font-bold">{u.name}</p>
                  <p className="truncate text-xs font-bold text-slate-600">
                    {u.email} · {u.city}
                  </p>
                  {u.role === "verifier" && u.hospitalName && (
                    <p className="text-xs font-extrabold text-blue-800">{u.hospitalName}</p>
                  )}
                </div>
                <span className={`pill ${roleStyle[u.role]}`}>{t(`role.${u.role}`)}</span>

                {u.role === "user" && editingId !== u._id && (
                  <button
                    className="btn-yellow btn-sm"
                    onClick={() => {
                      setEditingId(u._id);
                      setHospital("");
                    }}
                  >
                    {t("staff.makeVerifier")}
                  </button>
                )}
                {u.role === "verifier" && (
                  <button
                    className="btn-outline btn-sm !text-brand-red"
                    disabled={busyId === u._id}
                    onClick={() => {
                      if (window.confirm(t("staff.removeConfirm", { name: u.name }))) {
                        change(u, "user");
                      }
                    }}
                  >
                    {t("staff.remove")}
                  </button>
                )}
              </div>

              {editingId === u._id && (
                <div className="animate-pop-in flex flex-col gap-2 sm:flex-row">
                  <input
                    className="input"
                    placeholder={t("staff.hospitalPlaceholder")}
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                  />
                  <button
                    className="btn-primary"
                    disabled={busyId === u._id || hospital.trim().length < 2}
                    onClick={() => change(u, "verifier", hospital.trim())}
                  >
                    {t("common.save")}
                  </button>
                  <button className="btn-outline" onClick={() => setEditingId("")}>
                    {t("common.cancel")}
                  </button>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Page>
  );
}
