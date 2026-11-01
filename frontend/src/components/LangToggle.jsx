import { Globe } from "lucide-react";
import { useLang } from "../context/LanguageContext";

// Two-segment switch: the active language is highlighted in yellow.
export default function LangToggle({ className = "" }) {
  const { lang, setLang } = useLang();

  const seg = (value, label) => (
    <button
      type="button"
      onClick={() => setLang(value)}
      aria-pressed={lang === value}
      className={`px-2.5 py-1.5 font-head text-xs font-extrabold transition-colors ${
        lang === value ? "bg-brand-yellow text-black" : "bg-white text-black hover:bg-brand-yellow/40"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center border-[3px] border-black bg-white shadow-brutal-sm ${className}`}
    >
      <span className="hidden items-center border-r-[3px] border-black bg-white px-2 sm:flex">
        <Globe size={14} className="text-brand-red" />
      </span>
      {seg("en", "EN")}
      <span className="w-[3px] self-stretch bg-black" />
      {seg("mr", "मराठी")}
    </div>
  );
}
