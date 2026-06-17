# Sync iznenadi/web → iznenadi-app → GitHub

param(
  [string]$Message = "chore: sync from iznenadi/web"
)

$WebDir = Split-Path $PSScriptRoot -Parent
$AppDir = Join-Path (Split-Path $WebDir -Parent) "iznenadi-app"

& (Join-Path $WebDir "scripts\prepare-standalone-repo.ps1") -Destination $AppDir

Push-Location $AppDir
try {
  git add -A
  $status = git status --porcelain
  if (-not $status) {
    Write-Host "Nema izmena za commit."
    exit 0
  }
  git commit -m $Message
  git push origin main
  Write-Host "Push završen: origin/main"
} finally {
  Pop-Location
}
