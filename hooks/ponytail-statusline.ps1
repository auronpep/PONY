$Flag = Join-Path $HOME ".claude/.ponytail-active"
if (-not (Test-Path -LiteralPath $Flag)) {
    exit 0
}

$Mode = ""
try {
    # Cast before Trim: Get-Content on an empty file yields $null, and $null.Trim()
    # throws into the catch below — so an empty flag rendered no badge at all here
    # while the bash script rendered [PONYTAIL], and the IsNullOrEmpty branch below
    # was unreachable. -LiteralPath so a home directory containing [ or ] is not
    # treated as a wildcard pattern.
    $Mode = "$(Get-Content -LiteralPath $Flag -ErrorAction Stop | Select-Object -First 1)".Trim()
} catch {
    exit 0
}

$Esc = [char]27
if ([string]::IsNullOrEmpty($Mode) -or $Mode -eq "full") {
    [Console]::Write("${Esc}[38;5;108m[PONYTAIL]${Esc}[0m")
} else {
    $Suffix = $Mode.ToUpperInvariant()
    [Console]::Write("${Esc}[38;5;108m[PONYTAIL:$Suffix]${Esc}[0m")
}
