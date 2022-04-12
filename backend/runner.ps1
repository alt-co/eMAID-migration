while ($true) {
    yarn start-ts mint --token XEM
    yarn start-ts mint --token XZC
    # yarn start-ts mint --token ETH
    yarn start-ts mint --token DASH
    yarn start-ts mint --token ZEN
    yarn start-ts mint --token XYM
    yarn start-ts burn-copper-otc --token XEM
    yarn start-ts burn --token XEM
    yarn start-ts burn --token XZC
    yarn start-ts burn --token ZEN
    yarn start-ts burn --token XYM
    # yarn start-ts burn-copper-otc --token XZC
    Start-Sleep -Seconds 300
}