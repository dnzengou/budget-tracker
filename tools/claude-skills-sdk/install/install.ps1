# claude-skills installer (Windows PowerShell) — verifies sha256, refuses on mismatch.
$ErrorActionPreference = "Stop"

$Repo    = "dnzengou/claude-skills-sdk"
$Prefix  = if ($env:CLAUDE_SKILLS_PREFIX) { $env:CLAUDE_SKILLS_PREFIX } else { "$env:LOCALAPPDATA\Programs\claude-skills" }
$Version = if ($env:CLAUDE_SKILLS_VERSION) { $env:CLAUDE_SKILLS_VERSION } else { "latest" }

$Arch = if ([Environment]::Is64BitOperatingSystem) { "x86_64" } else { throw "32-bit Windows not supported" }
$Name = "claude-skills-$Arch-pc-windows-msvc.exe"

if ($Version -eq "latest") {
    $Tag = (Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest").tag_name
} else {
    $Tag = "v$($Version.TrimStart('v'))"
}

$Url    = "https://github.com/$Repo/releases/download/$Tag/$Name"
$ShaUrl = "$Url.sha256"

$Tmp = New-Item -ItemType Directory -Path (Join-Path $env:TEMP "claude-skills-install-$([guid]::NewGuid())") | Select-Object -ExpandProperty FullName
try {
    Write-Host "-> downloading $Url"
    Invoke-WebRequest -Uri $Url    -OutFile (Join-Path $Tmp $Name)
    Invoke-WebRequest -Uri $ShaUrl -OutFile (Join-Path $Tmp "$Name.sha256")

    Write-Host "-> verifying sha256"
    $expected = (Get-Content (Join-Path $Tmp "$Name.sha256")) -split '\s+' | Select-Object -First 1
    $actual   = (Get-FileHash (Join-Path $Tmp $Name) -Algorithm SHA256).Hash.ToLower()
    if ($expected -ne $actual) { throw "sha256 mismatch — refusing to install" }

    New-Item -ItemType Directory -Force -Path $Prefix | Out-Null
    Copy-Item -Force (Join-Path $Tmp $Name) (Join-Path $Prefix "claude-skills.exe")

    Write-Host "OK installed claude-skills $Tag -> $Prefix\claude-skills.exe"
    & (Join-Path $Prefix "claude-skills.exe") list
}
finally {
    Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
}
