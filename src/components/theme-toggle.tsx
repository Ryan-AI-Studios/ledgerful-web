"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

export type ThemePreference = "system" | "dark" | "light";

const choices: readonly ThemePreference[] = ["system", "dark", "light"];
const storageKey = "ledgerful-theme";

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

function effectiveTheme(preference: ThemePreference) {
  return preference === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : preference;
}

function applyTheme(preference: ThemePreference) {
  const theme = effectiveTheme(preference);
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference | null>(null);

  useEffect(() => {
    const saved = document.documentElement.dataset.themePreference;
    const initial = choices.includes(saved as ThemePreference)
      ? (saved as ThemePreference)
      : "system";
    applyTheme(initial);
    const syncControl = window.setTimeout(() => setPreference(initial), 0);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      if (document.documentElement.dataset.themePreference === "system") {
        applyTheme("system");
      }
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncSystemTheme);
    } else {
      media.addListener(syncSystemTheme);
    }
    return () => {
      window.clearTimeout(syncControl);
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", syncSystemTheme);
      } else {
        media.removeListener(syncSystemTheme);
      }
    };
  }, []);

  function cycle() {
    const next =
      preference === null
        ? "system"
        : choices[(choices.indexOf(preference) + 1) % choices.length];
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // Storage can be blocked by privacy policy; the current-session choice still works.
    }
    setPreference(next);
    applyTheme(next);
  }

  if (preference === null) {
    return (
      <div
        className="theme-toggle theme-toggle--compact"
        aria-hidden="true"
      >
        <span className="theme-toggle-icon" />
      </div>
    );
  }

  const Icon = icons[preference];
  return (
    <button
      type="button"
      className="theme-toggle theme-toggle--compact"
      aria-label={`Color theme: ${labels[preference]}`}
      onClick={cycle}
      data-theme-choice={preference}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <span className="theme-toggle-label" aria-hidden="true">
        {labels[preference]}
      </span>
    </button>
  );
}
