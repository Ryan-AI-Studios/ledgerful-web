// src/lib/content/install.ts
//
// Plain (non-"use client") module — safe to import from both Server and
// Client Components. INSTALL_COMMAND was previously exported from the
// "use client" module install-command.tsx, which caused a React
// client-reference proxy error when interpolated server-side on /install
// (Track 0060). Plain data consumed by both server and client belongs in a
// plain module; "use client" files should export only components/hooks.

// Real, canonical install command. Cargo-from-source is the only supported
// install path for v0.1.x; crates.io is not used. Do not change this string
// without also updating /install and keeping both in sync.
export const INSTALL_COMMAND =
  "cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful";
