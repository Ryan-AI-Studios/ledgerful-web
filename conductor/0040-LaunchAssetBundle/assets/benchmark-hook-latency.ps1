#!/usr/bin/env pwsh
# Ledgerful hook-latency benchmark - re-runnable A/B differential receipt.
# Measures: git commit with Ledgerful hooks installed (A) vs. without (B).
# Overhead = A - B. Git internals cancel, leaving Ledgerful's true per-commit cost.
#
# Requirements:
#   - hyperfine >= 1.20.0  (installed via scoop)
#   - ledgerful >= 0.1.7   (installed and on PATH)
#   - git                   (Windows Git recommended)
#   - Windows PowerShell 5.1 or pwsh 7+

param(
    [string]$TempRoot = "$env:LOCALAPPDATA\Temp\opencode",
    [string]$RepoName = "ledgerful-benchmark-repo",
    [int]$Warmup = 10,
    [int]$Runs = 20,
    [string]$OutDir = "$PSScriptRoot"
)

$ErrorActionPreference = "Stop"
$repo = Join-Path $TempRoot $RepoName
$hooksOnJson = Join-Path $OutDir "hooks-on.json"
$hooksOffJson = Join-Path $OutDir "hooks-off.json"

function Ensure-FreshRepo {
    if (Test-Path -LiteralPath $repo) {
        Remove-Item -LiteralPath $repo -Recurse -Force
    }
    New-Item -ItemType Directory -Path $repo | Out-Null
    git -C $repo init | Out-Null
    git -C $repo config user.email "bench@ledgerful.test"
    git -C $repo config user.name "Benchmark"
    # Seed an initial commit so every benchmark iteration can reset to HEAD~1.
    git -C $repo commit --allow-empty -m "bench: initial seed" | Out-Null
    Push-Location $repo
    try {
        ledgerful init -f | Out-Null
    } finally {
        Pop-Location
    }
}

function Backup-Hooks {
    $hooks = @("commit-msg", "post-commit", "pre-commit", "pre-push")
    foreach ($h in $hooks) {
        $src = Join-Path (Join-Path $repo ".git\hooks") $h
        $dst = Join-Path (Join-Path $repo ".git\hooks") "$h.ledgerful"
        if (Test-Path -LiteralPath $src) {
            Move-Item -LiteralPath $src -Destination $dst -Force
        }
    }
}

function Restore-Hooks {
    $hooks = @("commit-msg", "post-commit", "pre-commit", "pre-push")
    foreach ($h in $hooks) {
        $src = Join-Path (Join-Path $repo ".git\hooks") "$h.ledgerful"
        $dst = Join-Path (Join-Path $repo ".git\hooks") $h
        if (Test-Path -LiteralPath $src) {
            Move-Item -LiteralPath $src -Destination $dst -Force
        } elseif (Test-Path -LiteralPath $dst) {
            Remove-Item -LiteralPath $dst -Force
        }
    }
}

# --- Build fresh repo and two snapshots (A = hooks on, B = hooks off) ---
Ensure-FreshRepo

$repoA = "$repo-A"
if (Test-Path -LiteralPath $repoA) { Remove-Item -LiteralPath $repoA -Recurse -Force }
Copy-Item -LiteralPath $repo -Destination $repoA -Recurse

Backup-Hooks
$repoB = "$repo-B"
if (Test-Path -LiteralPath $repoB) { Remove-Item -LiteralPath $repoB -Recurse -Force }
Copy-Item -LiteralPath $repo -Destination $repoB -Recurse
Restore-Hooks

# --- Write per-run prepare batch files (avoids shell-escaping hell) ---
$prepareA = Join-Path $OutDir "prepare-a.bat"
$prepareB = Join-Path $OutDir "prepare-b.bat"

@"
@echo off
git -C "$repoA" reset --hard HEAD~1 >NUL 2>NUL
git -C "$repoA" commit --allow-empty -m "preload" >NUL 2>NUL
"@ | Set-Content -LiteralPath $prepareA -Encoding ascii

@"
@echo off
git -C "$repoB" reset --hard HEAD~1 >NUL 2>NUL
git -C "$repoB" commit --allow-empty -m "preload" >NUL 2>NUL
"@ | Set-Content -LiteralPath $prepareB -Encoding ascii

# --- A: hooks ON ---
Write-Host "`n=== A: git commit WITH Ledgerful hooks ==="
hyperfine `
    --warmup $Warmup --runs $Runs `
    --prepare "cmd /c `"$prepareA`"" `
    "git -C `"$repoA`" commit --allow-empty -m 'benchmark'" `
    --export-json $hooksOnJson

# --- B: hooks OFF ---
Write-Host "`n=== B: git commit WITHOUT Ledgerful hooks ==="
hyperfine `
    --warmup $Warmup --runs $Runs `
    --prepare "cmd /c `"$prepareB`"" `
    "git -C `"$repoB`" commit --allow-empty -m 'benchmark'" `
    --export-json $hooksOffJson

# --- Compute differential from exported JSON ---
function Read-Mean($path) {
    (Get-Content -LiteralPath $path | ConvertFrom-Json).results[0].mean
}

$meanA = Read-Mean $hooksOnJson
$meanB = Read-Mean $hooksOffJson
$overhead = $meanA - $meanB

Write-Host "`n=== Differential ==="
Write-Host "A mean (hooks on):  $([math]::Round($meanA * 1000, 3)) ms"
Write-Host "B mean (hooks off): $([math]::Round($meanB * 1000, 3)) ms"
Write-Host "Ledgerful overhead: $([math]::Round($overhead * 1000, 3)) ms"

# --- Capture machine spec ---
$os = Get-CimInstance Win32_OperatingSystem
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$disk = Get-CimInstance Win32_DiskDrive | Select-Object -First 1

$machineSpec = @{
    OS = "$($os.Caption) $($os.Version)"
    CPU = $cpu.Name
    Cores = $cpu.NumberOfCores
    Logical = $cpu.NumberOfLogicalProcessors
    RAM_GB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
    Disk = $disk.Model
    DiskType = if ($disk.MediaType -like "*SSD*") { "SSD" } else { $disk.MediaType }
    Hyperfine = (hyperfine --version)
    Ledgerful = (ledgerful --version)
}

# --- Write the markdown receipt ---
$receipt = Join-Path $OutDir "hook-latency.md"
$jsonA = Get-Content -LiteralPath $hooksOnJson | ConvertFrom-Json
$jsonB = Get-Content -LiteralPath $hooksOffJson | ConvertFrom-Json
$resultA = $jsonA.results[0]
$resultB = $jsonB.results[0]

$claim = [math]::Round($overhead * 1000, 1)
$meanAms = [math]::Round($resultA.mean * 1000, 3)
$stdAms = [math]::Round($resultA.stddev * 1000, 3)
$minAms = [math]::Round($resultA.min * 1000, 3)
$maxAms = [math]::Round($resultA.max * 1000, 3)
$runsA = $resultA.times.Count

$meanBms = [math]::Round($resultB.mean * 1000, 3)
$stdBms = [math]::Round($resultB.stddev * 1000, 3)
$minBms = [math]::Round($resultB.min * 1000, 3)
$maxBms = [math]::Round($resultB.max * 1000, 3)
$runsB = $resultB.times.Count

$overheadMs = [math]::Round($overhead * 1000, 3)
$overheadRound = [math]::Round($overhead * 1000, 0)
$stdRound = [math]::Round($resultA.stddev * 1000, 0)
$rangeLow = [math]::Round(($overhead - $resultA.stddev) * 1000, 0)
$rangeHigh = [math]::Round(($overhead + $resultA.stddev) * 1000, 0)

# Serialize data for the Python receipt generator, which avoids PowerShell string-escaping pain.
$payload = @{
    claim = $claim
    meanAms = $meanAms
    stdAms = $stdAms
    minAms = $minAms
    maxAms = $maxAms
    runsA = $runsA
    meanBms = $meanBms
    stdBms = $stdBms
    minBms = $minBms
    maxBms = $maxBms
    runsB = $runsB
    overheadMs = $overheadMs
    overheadRound = $overheadRound
    stdRound = $stdRound
    rangeLow = $rangeLow
    rangeHigh = $rangeHigh
    os = $machineSpec.OS
    cpu = $machineSpec.CPU
    cores = $machineSpec.Cores
    logical = $machineSpec.Logical
    ram = $machineSpec.RAM_GB
    disk = $machineSpec.Disk
    diskType = $machineSpec.DiskType
    hyperfine = $machineSpec.Hyperfine
    ledgerful = $machineSpec.Ledgerful
    receipt = $receipt
} | ConvertTo-Json

$payloadPath = Join-Path $OutDir "receipt-payload.json"
$payload | Out-File -LiteralPath $payloadPath -Encoding utf8 -Force

python "$PSScriptRoot\make-receipt-from-payload.py" "$payloadPath"
