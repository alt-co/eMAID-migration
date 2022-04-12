$scriptpath = $MyInvocation.MyCommand.Path
$dir = Split-Path $scriptpath
Push-Location $dir

yarn start-ts reward --token ETH
yarn start-ts reward --token XEM
yarn start-ts reward --token XZC
yarn start-ts reward --token DASH
yarn start-ts reward --token ZEN
yarn start-ts reward --token MATIC
yarn start-ts reward --token DOT

# yarn start-ts stake --token ETH --deposit --createNodes
# yarn start-ts stake --token ZEN --deposit
# yarn start-ts matic-restake-rewards

yarn start-ts compute-fees ./exports/fees-eth.csv --token ETH
yarn start-ts compute-fees ./exports/fees-xzc.csv --token XZC
yarn start-ts compute-fees ./exports/fees-xem.csv --token XEM
yarn start-ts compute-fees ./exports/fees-dash.csv --token DASH
yarn start-ts compute-fees ./exports/fees-zen.csv --token ZEN
yarn start-ts compute-fees ./exports/fees-xym.csv --token XYM
yarn start-ts compute-fees ./exports/fees-dot.csv --token DOT
yarn start-ts compute-fees ./exports/fees-matic.csv --token MATIC

yarn start-ts aws-s3-backup --prod