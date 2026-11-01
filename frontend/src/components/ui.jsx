// Small shared UI pieces: Alert, PageHeader, Skeleton, EmptyState, Page, Field
import { Inbox } from "lucide-react";

export function Alert({ type = "error", children }) {
  if (!children) return null;
  return (
    <p role={type === "error" ? "alert" : "status"} className={`alert alert-${type}`}>
      {children}
    </p>
  );
}

const headerColors = {
  red: "bg-brand-red text-white",
  yellow: "bg-brand-yellow text-black",
  mint: "bg-brand-mint text-black",
  blue: "bg-brand-blue text-black",
  pink: "bg-brand-pink text-black",
  black: "bg-black text-white",
};

// Coloured title block shown at the top of every inner page
export function PageHeader({ title, subtitle, color = "yellow", icon: Icon, action, children }) {
  return (
    <div
      className={`animate-fade-up flex flex-wrap items-center justify-between gap-4 border-4 border-black p-5 shadow-brutal-lg sm:p-7 ${headerColors[color]}`}
    >
      <div className="flex min-w-0 items-center gap-4">
        {Icon && (
          <span className="hidden h-14 w-14 shrink-0 place-items-center border-[3px] border-black bg-white text-black shadow-brutal-sm sm:grid">
            <Icon size={26} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-head text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 max-w-xl text-sm font-bold opacity-90 sm:text-base">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className = "h-24" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function EmptyState({ title, text, children, icon: Icon = Inbox }) {
  return (
    <div className="card animate-pop-in flex flex-col items-center gap-2 py-10 text-center">
      <span className="grid h-14 w-14 place-items-center border-[3px] border-black bg-brand-yellow shadow-brutal-sm">
        <Icon size={26} />
      </span>
      <p className="font-head text-lg font-bold">{title}</p>
      {text && <p className="max-w-md text-sm font-semibold text-slate-600">{text}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

// Standard page wrapper: width, padding and vertical rhythm
export function Page({ children, width = "max-w-3xl" }) {
  return <div className={`mx-auto ${width} space-y-6 px-4 py-8 sm:px-6 sm:py-10`}>{children}</div>;
}

export function Field({ label, htmlFor, children, hint }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p>}
    </div>
  );
}
