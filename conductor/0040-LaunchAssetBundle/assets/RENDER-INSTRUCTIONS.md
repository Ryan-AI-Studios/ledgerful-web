# VHS Render Instructions

The `.tape` scripts in this directory are the regenerable artifacts (per spec scope item 4).

## Known issue: VHS on Windows is broken (upstream bug #721)

The bundled `ttyd.win32.exe` (MinGW cross-compiled) fails with `CreateProcessW`
error 123 on Windows 11 25H2, and the headless Chrome canvas renderer produces
blank frames. See: https://github.com/charmbracelet/vhs/issues/721

**Workaround: run VHS in Docker.** The Linux ttyd inside the container works
correctly. This is the method used to produce the current GIFs.

## Prerequisites

- Docker Desktop
- `ledgerful` must be installed **inside the container** (the Docker image does
  not include it). Mount the host binary or install it in the container.
- The `*-docker.tape` scripts use `Set Shell "bash"` and container-relative paths.

## Rendering via Docker

```powershell
# Primary capture (20-35s): change → commit → signed receipt → verify → VALID
docker run --rm `
  -v "C:\dev\ledgerful-web:/vhs" `
  -v "C:\dev\ledgerful-web\public\demo:/output" `
  -v "C:\dev\ledgerful-web\conductor\0040-LaunchAssetBundle\assets:/tapes" `
  ghcr.io/charmbracelet/vhs /tapes/demo-core-loop-docker.tape

# Full walkthrough (60-90s): core loop + evidence export + trust-boundary framing
docker run --rm `
  -v "C:\dev\ledgerful-web:/vhs" `
  -v "C:\dev\ledgerful-web\public\demo:/output" `
  -v "C:\dev\ledgerful-web\conductor\0040-LaunchAssetBundle\assets:/tapes" `
  ghcr.io/charmbracelet/vhs /tapes/demo-full-walkthrough-docker.tape
```

The `ledgerful` binary must be on PATH inside the container. Mount it:

```powershell
# Add -v for the binary if ledgerful is not in the container's PATH:
-v "C:\Users\<user>\.cargo\bin:/usr/local/bin"
```

## Native Windows rendering (when upstream bug is fixed)

The original `.tape` scripts (without `-docker` suffix) use `Set Shell "powershell"`
and Windows paths. Once the ttyd ConPTY bug is fixed upstream, render with:

```powershell
vhs demo-core-loop.tape
vhs demo-full-walkthrough.tape
```

## Expected outputs

| File | Target duration | Final frame |
|---|---|---|
| `demo-core-loop.gif` | 20-35s | `VALID` from `ledgerful verify --signatures` |
| `demo-full-walkthrough.gif` | 60-90s | `VALID` from `ledgerful verify --signatures` |

## MP4 conversion (optional)

```powershell
ffmpeg -i public\demo\demo-core-loop.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" public\demo\demo-core-loop.mp4
ffmpeg -i public\demo\demo-full-walkthrough.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" public\demo\demo-full-walkthrough.mp4
```

## Tape scripts

| File | Shell | Use case |
|---|---|---|
| `demo-core-loop.tape` | PowerShell | Native Windows (when ttyd bug is fixed) |
| `demo-full-walkthrough.tape` | PowerShell | Native Windows (when ttyd bug is fixed) |
| `demo-core-loop-docker.tape` | Bash | Docker rendering (current working method) |
| `demo-full-walkthrough-docker.tape` | Bash | Docker rendering (current working method) |

<!-- Receipt: spec scope item 4 — "Scripts checked into the engine repo (regenerable every release)" -->
<!-- Receipt: VHS v0.11.0 MIT license — https://github.com/charmbracelet/vhs -->
<!-- Receipt: upstream bug — https://github.com/charmbracelet/vhs/issues/721 -->