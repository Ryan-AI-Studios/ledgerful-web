// src/lib/content/install.ts
//
// Plain (non-"use client") module — safe to import from both Server and
// Client Components. INSTALL_COMMAND was previously exported from the
// "use client" module install-command.tsx, which caused a React
// client-reference proxy error when interpolated server-side on /install
// (Track 0060). Plain data consumed by both server and client belongs in a
// plain module; "use client" files should export only components/hooks.
//
// Track 0051: package-manager + prebuilt channels live beside the source
// install. Status is truth-gated — only channels that are public and
// verified appear as "available". winget stays "coming" until the first
// microsoft/winget-pkgs package is accepted.

/** Canonical source-build install. Crates.io is not used for distribution. */
export const INSTALL_COMMAND =
  "cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful";

/** cargo-binstall path (prebuilt when assets match; may compile as fallback). */
export const BINSTALL_COMMAND =
  "cargo binstall --git https://github.com/Ryan-AI-Studios/Ledgerful";

/** Official Homebrew tap formula (CLI formula, not a cask). */
export const BREW_COMMAND = "brew install Ryan-AI-Studios/tap/ledgerful";

/** Scoop multi-step install (bucket + package). */
export const SCOOP_COMMANDS = [
  "scoop bucket add ledgerful https://github.com/Ryan-AI-Studios/scoop-bucket",
  "scoop install ledgerful",
] as const;

/** One-line installers (download release archive when available; fall back to cargo). */
export const INSTALL_SCRIPT_UNIX =
  "curl -fsSL https://raw.githubusercontent.com/Ryan-AI-Studios/Ledgerful/main/install/install.sh | sh";

export const INSTALL_SCRIPT_WINDOWS =
  "iwr https://raw.githubusercontent.com/Ryan-AI-Studios/Ledgerful/main/install/install.ps1 -UseBasicParsing | iex";

/**
 * Interim macOS Gatekeeper bypass when a downloaded binary is quarantined.
 * Release macOS artifacts are not yet codesigned/notarized (0051 Phase 0).
 */
export const QUARANTINE_BYPASS =
  'xattr -d com.apple.quarantine "$(which ledgerful)"';

export type ChannelStatus = "available" | "coming";

export type InstallChannel = {
  id: string;
  name: string;
  /** Short platform/scope label shown in the card header. */
  scope: string;
  status: ChannelStatus;
  /**
   * Primary install command(s). Empty when status is "coming" so truth
   * checks never ship a fabricated/unverified install path as live.
   */
  commands: readonly string[];
  summary: string;
  notes?: string;
  prereq?: string;
};

/**
 * Package-manager and prebuilt channels for /install (0051 DoD-5).
 * Flip winget to "available" and fill `commands` only after the first
 * microsoft/winget-pkgs package is accepted.
 */
export const packageChannels: readonly InstallChannel[] = [
  {
    id: "homebrew",
    name: "Homebrew",
    scope: "macOS · Linux",
    status: "available",
    commands: [BREW_COMMAND],
    summary:
      "Official tap formula. Installs the prebuilt release binary for Apple Silicon, Intel macOS, or Linuxbrew.",
    notes:
      "macOS release binaries are not yet codesigned or notarized. Homebrew formula installs usually avoid browser quarantine; if Gatekeeper reports “developer cannot be verified”, run the quarantine bypass below.",
    prereq: "Homebrew (brew.sh)",
  },
  {
    id: "cargo-binstall",
    name: "cargo binstall",
    scope: "any · Rust users",
    status: "available",
    commands: [BINSTALL_COMMAND],
    summary:
      "Uses Cargo.toml [package.metadata.binstall] to resolve the matching GitHub release archive. Prefer this over a full workspace cargo install when a prebuilt asset exists. No crates.io publish required.",
    notes:
      "Requires cargo-binstall on the machine. Resolves the latest git version with matching release assets; if no matching prebuilt asset exists, binstall may fall back to compiling from source.",
    prereq: "cargo-binstall (cargo install cargo-binstall)",
  },
  {
    id: "scoop",
    name: "Scoop",
    scope: "Windows",
    status: "available",
    commands: [...SCOOP_COMMANDS],
    summary:
      "Official Scoop bucket for the portable Windows x86_64 zip (ledgerful.exe at archive root — no 7-Zip prerequisite).",
    notes:
      "Manifest version/hash are bumped from published release .sha256 sidecars by engine release automation.",
    prereq: "Scoop (scoop.sh)",
  },
  {
    id: "winget",
    name: "winget",
    scope: "Windows",
    status: "coming",
    commands: [],
    summary:
      "Ledgerful.Ledgerful on microsoft/winget-pkgs. Command ships after the first package is accepted by winget review.",
    notes:
      "Bootstrap manifests are prepared; first submission is owner-approved. Do not treat the package id as installable until listed as Available.",
  },
  {
    id: "cargo-source",
    name: "Cargo (source)",
    scope: "any · full toolchain",
    status: "available",
    commands: [INSTALL_COMMAND],
    summary:
      "Canonical source build from the public GitHub repository. Crates.io is not used for distribution.",
    notes:
      "Requires Rust 1.85+ via rustup. First build takes several minutes; subsequent installs reuse the cargo cache.",
    prereq: "Rust 1.85+ (rustup.rs)",
  },
];

/** One-line release installers (download release archive when present). */
export const scriptChannels: readonly InstallChannel[] = [
  {
    id: "install-sh",
    name: "One-line (macOS / Linux)",
    scope: "Unix",
    status: "available",
    commands: [INSTALL_SCRIPT_UNIX],
    summary:
      "Downloads the matching prebuilt release archive when one exists for your platform, then installs it under ~/.local/bin. Falls back to cargo install when no asset matches. Does not re-verify published .sha256 sidecars (use release verification docs for that).",
  },
  {
    id: "install-ps1",
    name: "One-line (Windows)",
    scope: "PowerShell",
    status: "available",
    commands: [INSTALL_SCRIPT_WINDOWS],
    summary:
      "Downloads the portable Windows zip when available and installs under %USERPROFILE%\\.ledgerful\\bin. Falls back to cargo install when needed. Does not re-verify published .sha256 sidecars (use release verification docs for that).",
  },
];
