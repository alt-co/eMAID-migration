$basedir = "H:\Backups\StakeHound"
$today   = (Get-Date).ToString('MM_dd_yy_HH_mm')

$location = New-Item -Path $basedir -Type Directory -Name $today

Copy-Item 'E:\dev\stakehound-backend - live\state_logs\*' -Destination $location