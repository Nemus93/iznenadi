# Pripremi poseban GitHub repo za Iznenadi (repo root = Next.js app).
# Pokreni iz iznenadi/web foldera.

param(
  [string]$Destination = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) "iznenadi-app")
)

$Source = Split-Path $PSScriptRoot -Parent
$Exclude = @('node_modules', '.next', '.env.local', '.env')

Write-Host "Source: $Source"
Write-Host "Destination: $Destination"

if (Test-Path $Destination) {
  Write-Host "Ažuriram $Destination (zadržavam .git) ..."
  Get-ChildItem -Path $Destination -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object {
    Remove-Item -Path $_.FullName -Recurse -Force
  }
} else {
  New-Item -ItemType Directory -Force -Path $Destination | Out-Null
}

Get-ChildItem -Path $Source -Force | Where-Object {
  $_.Name -notin $Exclude
} | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $Destination -Recurse -Force
}

# Zadrži git remote ako postoji standalone repo
$gitDir = Join-Path $Destination ".git"
if (-not (Test-Path $gitDir)) {
  Push-Location $Destination
  try {
    git init -q
    git branch -M main
    git remote add origin https://github.com/Nemus93/iznenadi.git 2>$null
  } finally {
    Pop-Location
  }
}

Write-Host "Gotovo. Sledeći koraci:"
Write-Host "  cd $Destination"
Write-Host "  git init"
Write-Host "  git add ."
Write-Host "  git commit -m 'Initial Iznenadi app'"
Write-Host "  git remote add origin https://github.com/Nemus93/iznenadi.git"
Write-Host "  git push -u origin main"
