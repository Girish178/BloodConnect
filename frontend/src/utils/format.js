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
