$ErrorActionPreference = "Stop"

Write-Host "Relyo Nebius live smoke automation" -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($env:NEBIUS_API_KEY)) {
    throw "NEBIUS_API_KEY is not set in this PowerShell session. Set it once, then rerun this script."
}

$repoCandidates = @(
    (Join-Path $HOME "Relyo"),
    (Join-Path $HOME "Desktop\Relyo"),
    (Join-Path $HOME "Documents\Relyo"),
    (Join-Path $HOME "Downloads\Relyo")
)

$repo = $null
foreach ($candidate in $repoCandidates) {
    if (Test-Path (Join-Path $candidate ".git")) {
        $repo = $candidate
        break
    }
}

if (-not $repo) {
    $repo = Join-Path $HOME "Relyo"
    if (Test-Path $repo) {
        throw "Found $repo but it is not a Git repository. Move/rename that folder or clone Relyo manually once."
    }
    Write-Host "Relyo repo not found locally. Cloning automatically..." -ForegroundColor Yellow
    git clone https://github.com/Saidur-droid/Relyo.git $repo
}

Set-Location $repo
Write-Host "Using repo: $repo"

git fetch origin competition/relyo-2026
git checkout competition/relyo-2026
git pull --ff-only origin competition/relyo-2026

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm not found. Enabling Corepack..." -ForegroundColor Yellow
    corepack enable
    corepack prepare pnpm@10.15.1 --activate
}

Write-Host "Installing exact locked dependencies..." -ForegroundColor Cyan
pnpm install --frozen-lockfile

Write-Host "Running live Nebius Token Factory / NVIDIA Nemotron smoke..." -ForegroundColor Cyan
pnpm --filter @relyo/web exec vitest run test/nebius-live.test.ts

if ($LASTEXITCODE -ne 0) {
    throw "Nebius live smoke FAILED with exit code $LASTEXITCODE."
}

Write-Host ""
Write-Host "PASS: Nebius Token Factory + NVIDIA Nemotron live integration is working." -ForegroundColor Green
Write-Host "The API key was read only from the current environment and was never written to Git." -ForegroundColor Green
