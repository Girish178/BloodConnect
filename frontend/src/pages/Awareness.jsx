import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, CheckCircle2, ClipboardCheck, GraduationCap, RotateCcw, XCircle } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import Reveal from "../components/Reveal";
import { Alert, Field, Page, PageHeader } from "../components/ui";

/* ---------------- 1. Eligibility checker ---------------- */
const BLOCKERS = ["sick", "pregnant", "tattoo", "surgery", "alcohol", "meds"];

function EligibilityChecker() {
  const { t } = useLang();
  const [form, setForm] = useState({ age: "", weight: "", recent: false });
  const [flags, setFlags] = useState({});
  const [result, setResult] = useState(null); // null | { reasons: [] }
  const [error, setError] = useState("");

  const run = (e) => {
    e.preventDefault();
    const age = Number(form.age);
    const weight = Number(form.weight);
    if (!age || !weight) return setError(t("aw.check.needInfo"));
    setError("");

    const reasons = [];
    if (age < 18 || age > 65) reasons.push("age");
    if (weight < 45) reasons.push("weight");
    if (form.recent) reasons.push("last");
    BLOCKERS.forEach((k) => flags[k] && reasons.push(k));
    setResult({ reasons });
  };

  const reset = () => {
    setForm({ age: "", weight: "", recent: false });
    setFlags({});
    setResult(null);
    setError("");
  };

  return (
    <section id="check" className="scroll-mt-28 space-y-4">
      <div className="card !bg-brand-mint space-y-1">
        <h2 className="flex items-center gap-2 font-head text-2xl font-bold">
          <ClipboardCheck size={24} /> {t("aw.check.title")}
        </h2>
        <p className="text-sm font-bold">{t("aw.check.sub")}</p>
      </div>

      {!result ? (
        <form onSubmit={run} className="card space-y-5">
          <Alert>{error}</Alert>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("aw.check.age")} htmlFor="age">
              <input id="age" type="number" min="1" max="100" className="input" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </Field>
            <Field label={t("aw.check.weight")} htmlFor="weight">
              <input id="weight" type="number" min="1" max="250" className="input" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </Field>
          </div>

          <div>
            <p className="label">{t("aw.check.last")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[false, true].map((v) => (
                <button
                  type="button"
                  key={String(v)}
                  aria-pressed={form.recent === v}
                  onClick={() => setForm({ ...form, recent: v })}
                  className={`border-[3px] border-black p-3 text-left text-sm font-bold transition active:translate-x-0.5 active:translate-y-0.5 ${
                    form.recent === v ? "bg-brand-yellow shadow-brutal-sm" : "bg-white hover:bg-brand-yellow/40"
                  }`}
                >
                  {v ? t("aw.check.last.recent") : t("aw.check.last.never")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label">{t("aw.check.q")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {BLOCKERS.map((k) => (
                <label
                  key={k}
                  className={`flex cursor-pointer items-start gap-2.5 border-[3px] border-black p-3 text-sm font-bold transition ${
                    flags[k] ? "bg-brand-pink" : "bg-white hover:bg-brand-pink/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-black"
                    checked={!!flags[k]}
                    onChange={() => setFlags({ ...flags, [k]: !flags[k] })}
                  />
                  {t(`aw.check.${k}`)}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary">
            {t("aw.check.run")}
          </button>
        </form>
      ) : (
        <div className={`card animate-pop-in space-y-3 ${result.reasons.length ? "!bg-brand-pink" : "!bg-brand-mint"}`}>
          <h3 className="flex items-center gap-2 font-head text-2xl font-bold">
            {result.reasons.length ? <XCircle size={26} /> : <CheckCircle2 size={26} />}
            {result.reasons.length ? t("aw.check.no") : t("aw.check.yes")}
          </h3>
          {result.reasons.length ? (
            <>
              <p className="text-sm font-bold">{t("aw.check.noText")}</p>
              <ul className="space-y-2">
                {result.reasons.map((r) => (
                  <li key={r} className="border-[3px] border-black bg-white p-3 text-sm font-bold">
                    {t(`aw.check.r.${r}`)}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm font-bold">{t("aw.check.yesText")}</p>
          )}
          <p className="text-xs font-bold opacity-70">{t("aw.check.disclaimer")}</p>
          <div className="flex flex-wrap gap-3">
            {!result.reasons.length && (
              <Link to="/camps" className="btn-primary">
                {t("aw.check.cta")}
              </Link>
            )}
            <button onClick={reset} className="btn-outline">
              <RotateCcw size={15} /> {t("aw.check.reset")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------- 2. Before / during / after ---------------- */
const STAGES = [
  { key: "before", bg: "bg-brand-blue" },
  { key: "during", bg: "bg-brand-yellow" },
  { key: "after", bg: "bg-brand-mint" },
];

function DonationDayGuide() {
  const { t } = useLang();
  const [active, setActive] = useState("before");
  const stage = STAGES.find((s) => s.key === active);

  return (
    <section className="space-y-4">
      <h2 className="font-head text-2xl font-bold">{t("aw.guide.title")}</h2>
      <div className="flex gap-2" role="tablist">
        {STAGES.map((s, i) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={active === s.key}
            onClick={() => setActive(s.key)}
            className={`flex-1 border-[3px] border-black px-3 py-2.5 font-head text-sm font-extrabold uppercase transition active:translate-x-0.5 active:translate-y-0.5 ${
              active === s.key ? `${s.bg} shadow-brutal-sm` : "bg-white hover:bg-slate-100"
            }`}
          >
            {i + 1}. {t(`aw.guide.${s.key}`)}
          </button>
        ))}
      </div>
      <div key={active} className={`card animate-pop-in space-y-2.5 ${stage.bg}`}>
        {[1, 2, 3].map((n) => (
          <p key={n} className="flex items-start gap-3 border-[3px] border-black bg-white p-3 text-sm font-bold">
            <Check size={18} className="mt-0.5 shrink-0" /> {t(`aw.guide.${active}.${n}`)}
          </p>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 3. Myths and facts (flip cards) ---------------- */
function MythCard({ n }) {
  const { t } = useLang();
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      className="group h-full min-h-[11rem] w-full text-left [perspective:900px]"
    >
      <span
        className={`relative block h-full min-h-[11rem] transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : "group-hover:-translate-y-1"
        }`}
      >
        <span className="absolute inset-0 flex flex-col justify-between border-[3px] border-black bg-brand-pink p-4 shadow-brutal [backface-visibility:hidden]">
          <span className="w-fit border-2 border-black bg-white px-2 font-head text-xs font-extrabold uppercase">{t("aw.myth")}</span>
          <span className="font-head text-lg font-bold leading-snug">{t(`aw.myth.${n}.m`)}</span>
        </span>
        <span className="absolute inset-0 flex flex-col justify-between gap-2 overflow-y-auto border-[3px] border-black bg-brand-mint p-4 shadow-brutal [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="w-fit border-2 border-black bg-white px-2 font-head text-xs font-extrabold uppercase">{t("aw.fact")}</span>
          <span className="text-sm font-bold leading-snug">{t(`aw.myth.${n}.f`)}</span>
        </span>
      </span>
    </button>
  );
}

function Myths() {
  const { t } = useLang();
  return (
    <section id="myths" className="scroll-mt-28 space-y-4">
      <div>
        <h2 className="font-head text-2xl font-bold">{t("aw.myths.title")}</h2>
        <p className="text-sm font-bold text-slate-600">{t("aw.myths.hint")}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n, i) => (
          <Reveal key={n} delay={i * 60} className="h-full">
            <MythCard n={n} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 4. Quiz ---------------- */
const ANSWERS = ["b", "c", "b", "c", "c", "b"]; // correct option for questions 1..6
const TOTAL = ANSWERS.length;

function Quiz() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const n = i + 1;
  const correct = ANSWERS[i];

  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    if (opt === correct) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 === TOTAL) return setDone(true);
    setI(i + 1);
    setPicked(null);
  };
  const retry = () => {
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  return (
    <section id="quiz" className="scroll-mt-28 space-y-4">
      <div className="card !bg-brand-yellow space-y-1">
        <h2 className="flex items-center gap-2 font-head text-2xl font-bold">
          <GraduationCap size={24} /> {t("aw.quiz.title")}
        </h2>
        <p className="text-sm font-bold">{t("aw.quiz.sub")}</p>
      </div>

      {done ? (
        <div className="card animate-pop-in space-y-3 text-center">
          <p className="font-head text-5xl font-bold text-brand-red">
            {score}/{TOTAL}
          </p>
          <p className="font-head text-xl font-bold">{t("aw.quiz.score", { score, total: TOTAL })}</p>
          <p className="text-sm font-bold text-slate-600">{score >= 4 ? t("aw.quiz.great") : t("aw.quiz.good")}</p>
          <button onClick={retry} className="btn-primary mx-auto">
            <RotateCcw size={15} /> {t("aw.quiz.retry")}
          </button>
        </div>
      ) : (
        <div key={i} className="card animate-fade-up space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-head text-xs font-extrabold uppercase">{t("aw.quiz.q", { n, total: TOTAL })}</p>
            <div className="h-3 w-32 overflow-hidden border-2 border-black bg-white">
              <div className="h-full bg-brand-red transition-all duration-500" style={{ width: `${(n / TOTAL) * 100}%` }} />
            </div>
          </div>
          <h3 className="font-head text-xl font-bold leading-snug">{t(`aw.quiz.${n}.q`)}</h3>

          <div className="grid gap-2.5">
            {["a", "b", "c", "d"].map((opt) => {
              const isRight = picked && opt === correct;
              const isWrong = picked === opt && opt !== correct;
              return (
                <button
                  key={opt}
                  disabled={!!picked}
                  onClick={() => pick(opt)}
                  className={`flex items-center gap-3 border-[3px] border-black p-3 text-left text-sm font-bold transition active:translate-x-0.5 active:translate-y-0.5 ${
                    isRight ? "bg-brand-mint shadow-brutal-sm" : isWrong ? "bg-brand-pink" : "bg-white hover:bg-brand-yellow/40"
                  } ${picked && !isRight && !isWrong ? "opacity-60" : ""}`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center border-2 border-black bg-white font-head text-xs font-extrabold uppercase">
                    {opt}
                  </span>
                  <span className="flex-1">{t(`aw.quiz.${n}.${opt}`)}</span>
                  {isRight && <CheckCircle2 size={20} />}
                  {isWrong && <XCircle size={20} />}
                </button>
              );
            })}
          </div>

          {picked && (
            <div className="animate-pop-in space-y-3 border-[3px] border-black bg-brand-bg p-4">
              <p className="text-sm font-bold">
                <span className="font-head font-extrabold">{picked === correct ? t("aw.quiz.right") : t("aw.quiz.wrong")}</span>{" "}
                {t(`aw.quiz.${n}.e`)}
              </p>
              <button onClick={next} className="btn-primary btn-sm">
                {i + 1 === TOTAL ? t("aw.quiz.finish") : t("aw.quiz.next")}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------------- Page ---------------- */
export default function Awareness() {
  const { t } = useLang();
  const { hash } = useLocation();

  // Links like /awareness#quiz scroll to that section once the page has drawn
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }, [hash]);

  return (
    <Page width="max-w-4xl">
      <PageHeader color="pink" icon={GraduationCap} title={t("aw.title")} subtitle={t("aw.subtitle")} />
      <EligibilityChecker />
      <DonationDayGuide />
      <Myths />
      <Quiz />
    </Page>
  );
}
