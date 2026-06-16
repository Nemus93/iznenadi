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
  Write-Host "Brisanje postojećeg $Destination ..."
  Remove-Item -Recurse -Force $Destination
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null

Get-ChildItem -Path $Source -Force | Where-Object {
  $_.Name -notin $Exclude
} | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $Destination -Recurse -Force
}

Write-Host "Gotovo. Sledeći koraci:"
Write-Host "  cd $Destination"
Write-Host "  git init"
Write-Host "  git add ."
Write-Host "  git commit -m 'Initial Iznenadi app'"
Write-Host "  git remote add origin https://github.com/Nemus93/iznenadi.git"
Write-Host "  git push -u origin main"
