"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  applyTheme,
  cyclePreference,
  persistPreference,
  readInitialPreference,
  type ThemePreference,
} from "@/lib/theme";

const icons: Record<ThemePreference, typeof Monitor> = {
  system: Monitor,
  dark: Moon,
  light: Sun,
};

const labels: Record<ThemePreference, string> = {
  system: "System theme",
  dark: "Dark theme",
  light: "Light theme",
};

/**
 * Cycles System → Dark → Light.
 *
 * Renders a non-interactive placeholder until mounted (avoids hydration mismatch:
 * server cannot know localStorage / system preference). After mount, writes
 * preference via applyTheme() so CSS [data-theme] and brand assets update.
 */
export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference | null>(null);

  useEffect(() => {
    const initial = readInitialPreference();
    applyTheme(initial);
    // Mount gate: only after client paint is preference known. Direct setState
    // here is intentional (not a data-fetch loop) — same pattern as next-themes.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate for theme UI
    setPreference(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      const pref =
        (document.documentElement.getAttribute(
          "data-theme-preference",
        ) as ThemePreference | null) ?? "system";
      if (pref === "system") {
        applyTheme("system");
      }
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncSystemTheme);
    } else {
      media.addListener(syncSystemTheme);
    }
    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", syncSystemTheme);
      } else {
        media.removeListener(syncSystemTheme);
      }
    };
  }, []);

  function cycle() {
    const current = preference ?? "system";
    const next = cyclePreference(current);
    persistPreference(next);
    applyTheme(next);
    setPreference(next);
  }

  if (preference === null) {
    return (
      <div className="theme-toggle theme-toggle--compact" aria-hidden="true">
        <span className="theme-toggle-icon">
          <Monitor size={18} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
    );
  }

  const Icon = icons[preference];
  return (
    <button
      type="button"
      className="theme-toggle theme-toggle--compact"
      aria-label={`Color theme: ${labels[preference]}`}
      title={labels[preference]}
      onClick={cycle}
      data-theme-choice={preference}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="theme-toggle-label" aria-hidden="true">
        {labels[preference]}
      </span>
    </button>
  );
}
