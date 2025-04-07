$json = Get-Content -Raw filelist.json | ConvertFrom-Json
foreach ($item in $json) {
    $hash = Get-FileHash -Algorithm MD5 -Path $item.filename | Select-Object -ExpandProperty Hash
    $item.hash = $hash.ToLower()
}
$json | ConvertTo-Json | Set-Content filelist.json
Get-Content filelist.json 