"use client";

import { useEffect, useState } from "react";

/**
 * The deep-dive sections of /docs/security, in canonical order.
 * Source of truth for the section nav and the page itself — keep
 * in sync with the `<section id="...">` order in `app/docs/security/page.tsx`.
 */
export const trustSections: { id: string; label: string }[] = [
  { id: "summary", label: "1. Executive summary" },
  { id: "boundary-table", label: "2. Reads / writes / uploads" },
  { id: "data-flow", label: "3. Data flow" },
  { id: "three-surface", label: "4. Three-surface boundary" },
  { id: "dashboard-security", label: "5. Dashboard & token model" },
  { id: "signing", label: "6. Signing & key storage" },
  { id: "release-verification", label: "7. Release verification" },
  { id: "supply-chain-attestation", label: "8. Supply chain attestation" },
  { id: "telemetry", label: "9. Telemetry schema" },
  { id: "soc2-export", label: "10. Redacted evidence export" },
  { id: "prove-dont", label: "11. What we prove / what we don't" },
  { id: "policy-as-code", label: "12. Policy as code" },
  { id: "threat-model", label: "13. Threat model & non-goals" },
  { id: "subprocessors", label: "14. Subprocessors" },
];

/**
 * Sticky desktop section nav (left rail) + native mobile `<details>`
 * disclosure. Does NOT obscure headings — every section anchor target
 * applies `scroll-margin-top` equal to the chrome stack (see
 * `.trust-section` rule in globals.css).
 *
 * Tracks scroll position to highlight the active section in the rail.
 */
export function TrustSectionNav() {
  const [activeId, setActiveId] = useState<string>(trustSections[0]!.id);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sectionEls = trustSections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that's still
        // intersecting — that's the section the reader is currently in.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Top margin pushes the trigger line below the sticky chrome;
        // bottom margin keeps the previous section "active" until the
        // next section's top crosses that line.
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      },
    );

    for (const el of sectionEls) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Desktop rail (≥ 901px) — sticky on the left of the content */}
      <nav
        className="trust-section-nav trust-section-nav--rail"
        aria-label="Trust page sections"
      >
        <p className="trust-section-nav-heading">On this page</p>
        <ol>
          {trustSections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={activeId === s.id ? "true" : undefined}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Mobile disclosure (≤ 900px) — native <details> */}
      <details className="trust-section-nav trust-section-nav--disclosure">
        <summary>
          <span className="trust-section-nav-heading">On this page</span>
          <span className="trust-section-nav-current" aria-live="polite">
            {trustSections.find((s) => s.id === activeId)?.label.replace(
              /^\d+\.\s*/,
              "",
            ) ?? "Jump to section"}
          </span>
        </summary>
        <ol>
          {trustSections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={activeId === s.id ? "true" : undefined}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}
