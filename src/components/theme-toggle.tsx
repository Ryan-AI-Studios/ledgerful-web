"use client";

import { useEffect, useState } from "react";

export type ThemePreference = "system" | "dark" | "light";

const choices: readonly ThemePreference[] = ["system", "dark", "light"];
const storageKey = "ledgerful-theme";

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
      : "dark";
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

  function choose(next: ThemePreference) {
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // Storage can be blocked by privacy policy; the current-session choice still works.
    }
    setPreference(next);
    applyTheme(next);
  }

  if (preference === null) {
    return <div className="theme-toggle-placeholder" aria-hidden="true" />;
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {choices.map((choice) => (
        <button
          type="button"
          key={choice}
          data-theme-choice={choice}
          aria-pressed={preference === choice}
          onClick={() => choose(choice)}
        >
          {choice[0].toUpperCase() + choice.slice(1)}
        </button>
      ))}
    </div>
  );
}
