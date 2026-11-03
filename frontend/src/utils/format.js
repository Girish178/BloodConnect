// `t` is the translate function from useLang()
export const timeAgo = (date, t) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return t("time.now");
  const m = Math.floor(s / 60);
  if (m < 60) return t("time.min", { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t("time.hr", { n: h });
  return t("time.day", { n: Math.floor(h / 24) });
};

// Date in the active language, e.g. "1 Nov 2026" or "१ नोव्हें, २०२६"
export const formatDate = (date, lang = "en") =>
  new Date(date).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

// Camp dates are stored as UTC midnight, so always read them in UTC
export const formatCampDate = (date, lang = "en") =>
  new Date(date).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

// "14:30" -> "2:30 PM"
export const formatTime = (hhmm = "") => {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return hhmm;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

// Day number and short month for the date block on camp cards
export const dateParts = (date, lang = "en") => {
  const d = new Date(date);
  const loc = lang === "mr" ? "mr-IN" : "en-IN";
  return {
    day: d.toLocaleDateString(loc, { day: "numeric", timeZone: "UTC" }),
    month: d.toLocaleDateString(loc, { month: "short", timeZone: "UTC" }),
  };
};

// True when the camp date is today (India time)
export const isCampToday = (date) => {
  const ist = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
  return new Date(date).toISOString().slice(0, 10) === ist;
};
