import { NavLink, Outlet } from "react-router-dom";
import { clsx } from "clsx";
import { Bookmark, LayoutGrid, PenLine, Users } from "lucide-react";

/**
 * The app frame. Deliberately quiet: a hairline top bar and nothing else, so
 * the cards are the only thing on the page asking for attention.
 */

const NAV = [
  { to: "/", label: "Decks", icon: LayoutGrid, end: true },
  { to: "/group", label: "Group", icon: Users, end: false },
  { to: "/saved", label: "Saved", icon: Bookmark, end: false },
  { to: "/studio", label: "Studio", icon: PenLine, end: false },
];

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={clsx("font-semibold tracking-[-0.02em]", className)}>
      IMPACT<span style={{ color: "#D2542F" }}>x</span>
    </span>
  );
}

export default function Shell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <NavLink to="/" className="text-[17px]">
            <Wordmark />
          </NavLink>

          <nav className="flex items-center gap-0.5" aria-label="Main">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    "flex h-9 items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-colors sm:px-3.5",
                    isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink",
                  )
                }
              >
                <Icon className="h-[17px] w-[17px]" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-10 pt-16 sm:px-8">
        <div className="flex flex-col gap-2 border-t border-line pt-6 text-[13px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            <Wordmark className="text-ink-soft" /> · Conversation cards for two and up.
          </p>
          <p>Nothing to sign up for. What you save stays on your device.</p>
        </div>
      </footer>
    </div>
  );
}
