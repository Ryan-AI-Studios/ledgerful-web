"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";

// Real, canonical install command — matches src/app/install/page.tsx line ~152
// exactly. Cargo-from-source is the only supported install path for v0.1.x;
// crates.io is not used. Do not change this string without also updating
// /install (owned by a later track) and keeping both in sync.
export const INSTALL_COMMAND =
  "cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful";

/**
 * The install CTA used on the homepage and reused on /install. Always renders
 * a real `<Link href="/install">` so it works with JavaScript disabled — the
 * copy-to-clipboard button is a separate control layered beside it as
 * progressive enhancement, never a replacement for the link.
 *
 * The copy button is disabled until the component mounts on the client
 * (WEB-0023 — folded from review). Before hydration completes, clicking it
 * would silently do nothing (`navigator.clipboard` access from an
 * unattached handler), which is dead UI. Rendering it `disabled` server-side
 * removes it from the tab order and from the accessibility tree's set of
 * actionable controls until the click handler is actually live, at which
 * point it flips to enabled with no layout shift.
 *
 * `variant="compact"` (hero use): the primary button plus a small icon-only
 * copy button on the same line — sized to stay out of the way on narrow
 * viewports. The real command string isn't reprinted here; it is shown in
 * full in the `variant="expanded"` block below (closing CTA) and on
 * /install, so it is never hidden from the page, just not duplicated twice
 * above the fold.
 * `variant="expanded"` (closing CTA use): the full command rendered in the
 * site's shared `.terminal-window.annotated` block, matching the CodeBlock
 * convention used on /install, with the same copy button in its annotation
 * row.
 */
export function InstallCommand({
  variant = "compact",
  linkLabel = "Install Ledgerful",
  showLink = true,
}: {
  variant?: "compact" | "expanded";
  linkLabel?: string;
  /** Set false when the surrounding page already is /install (e.g. the
   * install page's own hero) so the terminal block doesn't sit beside a
   * redundant link back to the page it's already on. */
  showLink?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  // Hydration guard: the copy button must not be clickable/focusable-as-
  // active before the client-side handler is attached. See the doc comment
  // above.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deferred via setTimeout(0), matching the existing ThemeToggle
    // hydration-guard pattern — avoids the synchronous setState-in-effect
    // lint rule while still flipping to enabled on the very next tick after
    // mount (imperceptible to a real user).
    const enable = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(enable);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked by permissions policy or unsupported
      // in some browsers; the full command is always visible in the
      // expanded block and on /install, so copying it by hand still works.
    }
  }

  const copyLabel = !mounted
    ? "Copy install command (enabling)"
    : copied
      ? "Install command copied"
      : "Copy install command";

  if (variant === "expanded") {
    return (
      <div className="install-command install-command--expanded">
        <div className="terminal-window annotated">
          <div className="terminal-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{INSTALL_COMMAND}</code>
          </pre>
          <div className="terminal-annotation">
            <span className="terminal-caption">install · cargo · source build</span>
            <button
              type="button"
              className="install-command-copy"
              onClick={handleCopy}
              disabled={!mounted}
              aria-label={copyLabel}
            >
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
        {showLink ? (
          <Link className="button-primary" href="/install">
            {linkLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="install-command install-command--compact">
      <Link className="button-primary" href="/install">
        {linkLabel}
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
      <button
        type="button"
        className="install-command-copy install-command-copy--icon"
        onClick={handleCopy}
        disabled={!mounted}
        aria-label={copyLabel}
        title={INSTALL_COMMAND}
      >
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        <span className="visually-hidden">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
