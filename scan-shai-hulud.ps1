# SHAI-Hulud 2.0 NPM Worm Scanner (Windows PowerShell)
# Based on Datadog Security Labs research
# https://securitylabs.datadoghq.com/articles/shai-hulud-2.0-npm-worm/

param(
    [string]$ScanRoot = "."
)

$ErrorActionPreference = "Stop"

$script:FoundIssues = 0
$ScanRoot = (Resolve-Path $ScanRoot).Path

function Write-Red($msg) { Write-Host $msg -ForegroundColor Red }
function Write-Yellow($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Green($msg) { Write-Host $msg -ForegroundColor Green }

Write-Host "=========================================="
Write-Host "  SHAI-Hulud 2.0 NPM Worm Scanner"
Write-Host "=========================================="
Write-Host ""
Write-Host "Scanning: $ScanRoot"
Write-Host "Started:  $(Get-Date)"
Write-Host ""

# Function to check for malicious files
function Check-MaliciousFiles {
    Write-Host "[*] Scanning for malicious files (setup_bun.js, bun_environment.js)..."

    $maliciousFiles = Get-ChildItem -Path $ScanRoot -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -eq "setup_bun.js" -or $_.Name -eq "bun_environment.js" }

    foreach ($file in $maliciousFiles) {
        Write-Red "[!] FOUND MALICIOUS FILE: $($file.FullName)"
        $script:FoundIssues++
    }
}

# Function to check package.json files for suspicious preinstall scripts
function Check-PreinstallScripts {
    Write-Host "[*] Scanning for suspicious preinstall scripts..."

    $packageJsonFiles = Get-ChildItem -Path $ScanRoot -Recurse -File -Filter "package.json" -ErrorAction SilentlyContinue

    foreach ($pkgJson in $packageJsonFiles) {
        try {
            $content = Get-Content -Path $pkgJson.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match "setup_bun\.js|bun_environment\.js") {
                Write-Red "[!] SUSPICIOUS PREINSTALL SCRIPT: $($pkgJson.FullName)"
                $preinstallMatch = $content | Select-String -Pattern '"preinstall"[^}]+' -AllMatches
                if ($preinstallMatch) {
                    Write-Host $preinstallMatch.Matches.Value
                }
                $script:FoundIssues++
            }
        } catch {
            # Skip files that can't be read
        }
    }
}

# Function to check GitHub Actions for malicious runner
function Check-GitHubActions {
    Write-Host "[*] Scanning for malicious GitHub Actions workflows..."

    $workflowFiles = Get-ChildItem -Path $ScanRoot -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { ($_.Extension -eq ".yml" -or $_.Extension -eq ".yaml") -and $_.FullName -match "\.github[\\/]workflows[\\/]" }

    foreach ($workflow in $workflowFiles) {
        try {
            $content = Get-Content -Path $workflow.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match "SHA1HULUD") {
                Write-Red "[!] MALICIOUS GITHUB WORKFLOW: $($workflow.FullName)"
                $script:FoundIssues++
            }
        } catch {
            # Skip files that can't be read
        }
    }
}

# Function to check against known IOC list
function Check-AgainstIOCList {
    Write-Host "[*] Checking installed packages against known IOC list..."

    $iocUrl = "https://raw.githubusercontent.com/DataDog/indicators-of-compromise/main/shai-hulud-2.0/shai-hulud-2.0.csv"
    $iocFile = [System.IO.Path]::GetTempFileName()

    try {
        # Download IOC list
        try {
            Invoke-WebRequest -Uri $iocUrl -OutFile $iocFile -UseBasicParsing
            $iocLines = Get-Content $iocFile
            Write-Host "    Downloaded IOC list from Datadog ($($iocLines.Count) entries)"
        } catch {
            Write-Yellow "[~] Could not download IOC list, skipping package check"
            return
        }

        # Parse IOC entries (skip header)
        $iocEntries = @()
        foreach ($line in ($iocLines | Select-Object -Skip 1)) {
            if ($line -match '^"?([^",]+)"?,\s*"?([^",]+)"?') {
                $iocEntries += @{
                    Name = $Matches[1].Trim()
                    Version = $Matches[2].Trim()
                }
            }
        }

        # Check package-lock.json files
        $lockFiles = Get-ChildItem -Path $ScanRoot -Recurse -File -Filter "package-lock.json" -ErrorAction SilentlyContinue
        foreach ($lockfile in $lockFiles) {
            Write-Host "    Scanning: $($lockfile.FullName)"
            try {
                $content = Get-Content -Path $lockfile.FullName -Raw -ErrorAction SilentlyContinue
                foreach ($ioc in $iocEntries) {
                    if ($ioc.Name -and $ioc.Version) {
                        $pattern1 = [regex]::Escape("`"$($ioc.Name)`"") + ".*" + [regex]::Escape("`"$($ioc.Version)`"")
                        $pattern2 = [regex]::Escape("$($ioc.Name)@$($ioc.Version)")
                        if ($content -match $pattern1 -or $content -match $pattern2) {
                            Write-Red "[!] COMPROMISED PACKAGE FOUND: $($ioc.Name)@$($ioc.Version) in $($lockfile.FullName)"
                            $script:FoundIssues++
                        }
                    }
                }
            } catch {
                # Skip files that can't be read
            }
        }

        # Check yarn.lock files
        $yarnLocks = Get-ChildItem -Path $ScanRoot -Recurse -File -Filter "yarn.lock" -ErrorAction SilentlyContinue
        foreach ($lockfile in $yarnLocks) {
            Write-Host "    Scanning: $($lockfile.FullName)"
            try {
                $content = Get-Content -Path $lockfile.FullName -Raw -ErrorAction SilentlyContinue
                foreach ($ioc in $iocEntries) {
                    if ($ioc.Name -and $ioc.Version) {
                        $namePattern = [regex]::Escape("`"$($ioc.Name)@")
                        $versionPattern = "version `"" + [regex]::Escape($ioc.Version) + "`""
                        if ($content -match $namePattern -and $content -match $versionPattern) {
                            Write-Red "[!] COMPROMISED PACKAGE FOUND: $($ioc.Name)@$($ioc.Version) in $($lockfile.FullName)"
                            $script:FoundIssues++
                        }
                    }
                }
            } catch {
                # Skip files that can't be read
            }
        }

        # Check pnpm-lock.yaml files
        $pnpmLocks = Get-ChildItem -Path $ScanRoot -Recurse -File -Filter "pnpm-lock.yaml" -ErrorAction SilentlyContinue
        foreach ($lockfile in $pnpmLocks) {
            Write-Host "    Scanning: $($lockfile.FullName)"
            try {
                $content = Get-Content -Path $lockfile.FullName -Raw -ErrorAction SilentlyContinue
                foreach ($ioc in $iocEntries) {
                    if ($ioc.Name -and $ioc.Version) {
                        $pattern = "/" + [regex]::Escape("$($ioc.Name)@$($ioc.Version)")
                        if ($content -match $pattern) {
                            Write-Red "[!] COMPROMISED PACKAGE FOUND: $($ioc.Name)@$($ioc.Version) in $($lockfile.FullName)"
                            $script:FoundIssues++
                        }
                    }
                }
            } catch {
                # Skip files that can't be read
            }
        }
    } finally {
        # Cleanup temp file
        if (Test-Path $iocFile) {
            Remove-Item $iocFile -Force -ErrorAction SilentlyContinue
        }
    }
}

# Main execution
Check-MaliciousFiles
Write-Host ""

Check-PreinstallScripts
Write-Host ""

Check-GitHubActions
Write-Host ""

Check-AgainstIOCList
Write-Host ""

# Summary
Write-Host "=========================================="
Write-Host "  Scan Complete"
Write-Host "=========================================="

if ($script:FoundIssues -gt 0) {
    Write-Red "[!] Found $script:FoundIssues potential indicators of compromise!"
    Write-Host ""
    Write-Host "Recommended actions:"
    Write-Host "  1. Remove any compromised packages immediately"
    Write-Host "  2. Rotate all GitHub tokens and credentials"
    Write-Host "  3. Audit GitHub Actions and self-hosted runners"
    Write-Host "  4. Check for unauthorized GitHub repository access"
    Write-Host "  5. Review npm publish history for your packages"
    exit 1
} else {
    Write-Green "[+] No indicators of compromise found."
    Write-Host ""
    Write-Host "Stay safe:"
    Write-Host "  - Keep dependencies updated"
    Write-Host "  - Use npm audit regularly"
    Write-Host "  - Enable 2FA on npm and GitHub"
    Write-Host "  - Review preinstall scripts before installing packages"
    exit 0
}
