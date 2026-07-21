"use client";

import { useEffect } from "react";

/**
 * Old homepage #legend anchor moved to /editions#legend (full 5-state glossary).
 * Client effect avoids React 19's "script tag inside component" warning and the
 * CSP/hash churn of an inline executable <script> in the page body.
 */
export function LegendHashRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#legend") {
      window.location.replace("/editions#legend");
    }
  }, []);
  return null;
}
