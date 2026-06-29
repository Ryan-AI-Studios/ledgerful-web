// Captured from real v0.1.6 runs on Windows x86_64.
// Source files: public/evidence/{version,doctor,verify-health}.txt
// Generating commands:
//   - version.txt       : ledgerful --version
//   - doctor.txt        : ledgerful doctor
//   - verify-health.txt : ledgerful verify --health
// PowerShell `2>&1` capture wrappers (ErrorRecord blocks) are stripped from the
// source files; program stdout is reproduced verbatim below.

export const capturedEvidence = {
  version: {
    command: "ledgerful --version",
    description: "Binary version",
    lines: ["ledgerful 0.1.6"],
  },
  doctor: {
    command: "ledgerful doctor",
    description: "Environment health check",
    lines: [
      "Ledgerful Doctor - Environment Health Check",
      "==================================================",
      "Environment:         Windows",
      "Active Shell:        Powershell",
      "LEDGERFUL_PLATFORM:  os=windows, arch=x86_64, family=windows, target_triple=x86_64-pc-windows-msvc",
      "",
      "Tools:",
      "  git                Found (C:\\Program Files\\Git\\cmd\\git.exe)",
      "  gemini             Found (C:\\Users\\RyanB\\AppData\\Roaming\\npm\\gemini.cmd)",
      "",
      "Current Path:        C:\\dev\\ledgerful",
      "Path Type:           Native",
      "",
      "Active Ask Backend:  Gemini (Cloud)",
      "Embedding Model:     nomic-embed-text (768 dims) @ http://127.0.0.1:8083",
      "Completion Model:    gemma-4-E4B-it-Q6_K.gguf @ http://127.0.0.1:8081",
      "Native Graph:        Ready (CozoDB active, 7462 nodes, 31911 edges)",
      "",
      "Index Health:",
      "  \u2022 Search index: OK (1526 documents)",
      "  \u2022 Graph state: Current",
      "  \u2022 Impact report: Current (Clean tree)",
      "GPU VRAM:            0.0 GB / 11.1 GB (Driver limitation: zero-usage reporting on Intel Arc)",
    ],
  },
  verifyHealth: {
    command: "ledgerful verify --health",
    description: "Verification dependency check",
    lines: [
      "Verification Health Check",
      "Checking verification dependencies...",
      "",
      "  Checking cargo...",
      "  [OK] cargo is available.",
      "  Checking git...",
      "  [OK] git is available.",
      "  Checking ledger state...",
      "  [OK] Ledger is clean.",
      "  [OK] Runner: cargo test (nextest available)",
      "",
      "All verification dependencies are available.",
    ],
  },
} as const;

export const panelOrder = ["version", "doctor", "verifyHealth"] as const;