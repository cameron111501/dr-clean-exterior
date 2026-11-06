# Rebuilds the minified files the pages actually load:
#   css/style.css          -> css/style.min.css
#   js/script.js           -> js/script.min.js
#   js/quote-wizard.js     -> js/quote-wizard.min.js
#   js/address-autocomplete.js -> js/address-autocomplete.min.js
# Edit the readable source files, then run:   powershell -File tools\minify.ps1
# (Whitespace/comment stripping only - no renaming - so behaviour is identical.)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Protect([string]$s, [hashtable]$store) {
  # swap quoted strings and url(...) for placeholders so whitespace edits can't touch them
  $script:n = 0
  $rx = [regex]'("(?:\\.|[^"\\])*"|''(?:\\.|[^''\\])*''|url\([^)]*\))'
  return $rx.Replace($s, { param($m) $k = "`u{E000}$($store.Count)`u{E001}"; $store[$k] = $m.Value; $k })
}
function Restore([string]$s, [hashtable]$store) {
  foreach ($k in $store.Keys) { $s = $s.Replace($k, $store[$k]) }
  return $s
}

function Min-Css($src) {
  $store = @{}
  $c = [regex]::Replace($src, '/\*[\s\S]*?\*/', '')          # comments (none contain strings we care about)
  $c = Protect $c $store
  $c = [regex]::Replace($c, '\s+', ' ')
  $c = [regex]::Replace($c, '\s*([{};,>])\s*', '$1')          # around braces, semicolons, commas, child combinator
  $c = [regex]::Replace($c, ':\s+', ':')                      # "prop: value" -> "prop:value"
  $c = $c.Replace(';}', '}')
  return (Restore $c.Trim() $store)
}

function Min-Js($src) {
  $out = New-Object System.Collections.Generic.List[string]
  $inBlock = $false
  foreach ($line in ($src -split "`r?`n")) {
    $t = $line.Trim()
    if ($inBlock) { if ($t -match '\*/') { $inBlock = $false }; continue }
    if ($t -eq '') { continue }
    if ($t.StartsWith('//')) { continue }
    if ($t.StartsWith('/*')) { if ($t -notmatch '\*/') { $inBlock = $true }; continue }
    # trailing " // comment" - only when the text before it has balanced quotes and the comment has none
    $i = $t.IndexOf(' // ')
    if ($i -gt 0) {
      $before = $t.Substring(0, $i); $after = $t.Substring($i + 4)
      $q = { param($x) ($x.ToCharArray() | ? { $_ -in @([char]34, [char]39, [char]96) }).Count }
      if ((& $q $before) % 2 -eq 0 -and (& $q $after) -eq 0 -and $after -notmatch '[\{\}\(\)=;]') { $t = $before.TrimEnd() }
    }
    $out.Add($t)
  }
  return ($out -join "`n") + "`n"
}

$css = [System.IO.File]::ReadAllText("$root\css\style.css")
[System.IO.File]::WriteAllText("$root\css\style.min.css", (Min-Css $css), $utf8)
foreach ($n in 'script', 'quote-wizard', 'address-autocomplete') {
  $js = [System.IO.File]::ReadAllText("$root\js\$n.js")
  [System.IO.File]::WriteAllText("$root\js\$n.min.js", (Min-Js $js), $utf8)
}
Get-ChildItem "$root\css\style*.css", "$root\js\*.js" | Select-Object Name, @{n = 'KB'; e = { [math]::Round($_.Length / 1KB, 1) } }
