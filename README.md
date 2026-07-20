# Ledgerful Web

Public marketing, docs, pricing, and trust center for [Ledgerful](https://www.ledgerful.dev) — a local-first, signed change-record tool for git repos.

- **Live site:** https://www.ledgerful.dev
- **Docs:** https://www.ledgerful.dev/docs
- **Engine repository:** https://github.com/Ryan-AI-Studios/Ledgerful
- **Security reports:** see [SECURITY.md](SECURITY.md)

## Community routing

- **Questions and setup help:** [GitHub Discussions](https://github.com/Ryan-AI-Studios/ledgerful-web/discussions)
- **Bug reports:** [GitHub Issues](https://github.com/Ryan-AI-Studios/ledgerful-web/issues)
- **Security reports:** see [SECURITY.md](SECURITY.md)

## Install the CLI

Public install paths (see also [ledgerful.dev/install](https://www.ledgerful.dev/install)):

```bash
# Homebrew (macOS / Linuxbrew) — prebuilt
brew install Ryan-AI-Studios/tap/ledgerful

# cargo binstall — prefers prebuilt release binary via metadata (may fall back to source)
cargo binstall --git https://github.com/Ryan-AI-Studios/Ledgerful

# Cargo source build (canonical; no crates.io)
cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful
```

```powershell
# Scoop (Windows) — portable zip
scoop bucket add ledgerful https://github.com/Ryan-AI-Studios/scoop-bucket
scoop install ledgerful
```

winget (`Ledgerful.Ledgerful`) is planned until the first microsoft/winget-pkgs package is accepted.

## Scope

This repository contains the public website only. The Ledgerful engine, CLI, and local dashboard live in the [Ledgerful](https://github.com/Ryan-AI-Studios/Ledgerful) repository.
