/**
 * Theme preference helpers for the public site.
 *
 * Architecture (aligned with next-themes / overreacted.io patterns):
 * 1. A CSP-hashed blocking script in root layout reads localStorage and sets
 *    data-theme + data-theme-preference on <html> before paint (no FOUC).
 * 2. ThemeToggle mutates those attributes + localStorage on user action.
 * 3. CSS tokens and brand assets react to [data-theme] — no React context required
 *    for styling. Components that need preference state read the DOM after mount.
 *
 * Do not put data-theme on the React <html> props — React would re-apply the
 * server value on layout re-renders and cancel client changes.
 */

export type ThemePreference = "system" | "dark" | "light";
export type EffectiveTheme = "dark" | "light";

export const THEME_STORAGE_KEY = "ledgerful-theme";
export const THEME_PREFERENCES = ["system", "dark", "light"] as const satisfies readonly ThemePreference[];

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value === "system" || value === "dark" || value === "light";
}

export function effectiveTheme(preference: ThemePreference): EffectiveTheme {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

/** Apply preference to <html>. Safe to call only in the browser. */
export function applyTheme(preference: ThemePreference): EffectiveTheme {
  const theme = effectiveTheme(preference);
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-theme-preference", preference);
  root.style.colorScheme = theme;
  return theme;
}

export function readStoredPreference(): ThemePreference | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function readDomPreference(): ThemePreference | null {
  const fromDom = document.documentElement.getAttribute("data-theme-preference");
  return isThemePreference(fromDom) ? fromDom : null;
}

export function readInitialPreference(): ThemePreference {
  return readStoredPreference() ?? readDomPreference() ?? "system";
}

export function persistPreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Privacy modes may block storage; session still works via attributes.
  }
}

export function cyclePreference(current: ThemePreference): ThemePreference {
  const index = THEME_PREFERENCES.indexOf(current);
  return THEME_PREFERENCES[(index + 1) % THEME_PREFERENCES.length]!;
}
