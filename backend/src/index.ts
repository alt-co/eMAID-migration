import "reflect-metadata";
import { ReflectiveInjector, Provider } from "injection-js";
import yargs from "yargs";
import dotenv from "dotenv";
import * as env from 'env-var';
import { logger } from "util/logger";
import * as Sentry from '@sentry/node';
import { EnvSource, getEnvVar } from "util/env-source";
import { SupportedCustomerOrigin } from "models/SupportedCustomerOrigins";

import { MintMAIDSetup } from "flows/mint/MAID/MintMAIDCLISetup";
import { MintMAIDFlow } from "flows/mint/MAID/MintMAIDFlow";
import { MintFlow } from "flows/mint/MintFlow";

import { AltcoinomyService } from "infrastructure/altcoinomy/AltcoinomyService";
import { AltcoinomySetup } from "infrastructure/altcoinomy/AltcoinomyCLISetup";
import { SupportedTokens, SupportedTokensProdValues, Token } from "models/SupportedTokens";
import { TokenEventListener } from "infrastructure/ethereum/TokenEventListener";
import { TokenEventListenerSetup } from "infrastructure/ethereum/TokenEventListenerSetup";
import { TokenAddress } from "infrastructure/ethereum/models/TokenEventListenerConfig";

import { setDelay } from "util/delay";
import { StateLogBackup } from "flows/backup/StateLogBackup";

import { PanicStatusSetup } from "infrastructure/panic-status-handler/PanicStatusSetup";
import { PanicStatusHandler } from "infrastructure/panic-status-handler/PanicStatusHandler";
import { GnosisSafeSetup } from "infrastructure/gnosis-safe/GnosisSafeCLISetup";
import { GnosisSafeService } from "infrastructure/gnosis-safe/GnosisSafeService";
import { CosignFlow } from "flows/cosign/CosignFlow";
import { CosignFlowCLISetup } from "flows/cosign/CosignFlowCLISetup";

Sentry.init({
    dsn: "https://f087de0508a5405f84ce887cd0c80445@o542086.ingest.sentry.io/5661241",

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
});

dotenv.config();

const mainInjector = ReflectiveInjector.resolveAndCreate([ { provide: EnvSource, useValue: env } ]);

const panicStatusCheck = async () => {
    const panicCheckConfig = [PanicStatusSetup, PanicStatusHandler];
    const injector = mainInjector.resolveAndCreateChild(panicCheckConfig);
    const panicHandler = injector.get(PanicStatusHandler);
    if (await panicHandler.isPanicOn()) {
        //console.log('Panic mode is ON. Stopping the execution');
        throw new Error('Panic mode is ON. Stopping the execution');
        //return;
    }
}

const argv = yargs(process.argv.slice(2))
.fail(function (msg, err, yargs) {
    Sentry.captureException(err);
    logger.fatal(err);
    console.error(err);
    process.exit(1);
}).command(
    'altcoinomy-subscriptions',
    'List altcoinomy subscriptions',
    ()=>{},
    async (_) => {
        const injector = mainInjector.resolveAndCreateChild([ AltcoinomySetup, AltcoinomyService ]);
        const altcoinomyApi = injector.get(AltcoinomyService);
        console.log(await altcoinomyApi.subscriptions());
}).command(
    'altcoinomy-subscription [id]',
    'List altcoinomy subscription details',
    ()=>{},
    async (argv) => {
        const injector = mainInjector.resolveAndCreateChild([ AltcoinomySetup, AltcoinomyService ]);
        const altcoinomyApi = injector.get(AltcoinomyService);
        console.log(await altcoinomyApi.subscription(argv.id as string));
}).command(
    'mint',
    'Mint new tokens from the altcoinomy CSV snapshot',
    (yargs) => yargs.options({
        'dryRun': {
            demandOption: false,
            type: 'boolean',
            describe: 'Do not commit changes',
        },
        'token': {
            demandOption: true,
            type: 'string',
            describe: 'Symbol of the token to mint',
        },
        'origin': {
            demandOption: false,
            type: 'string',
            describe: 'Origin of the funds to mint',
        }
    }),
    async (argv) => {
        let mint: MintFlow<'MAID', 'Altcoinomy'>;
        if (argv.token === 'MAID') {
            const config = [ MintMAIDSetup, MintMAIDFlow ];
            const injector = mainInjector.resolveAndCreateChild(config);
            mint = injector.get(MintMAIDFlow);
        } else {
            throw new Error("Unsupported token");
        }

        await mint.execute(argv.dryRun as boolean, argv.origin as SupportedCustomerOrigin);
    },
    [panicStatusCheck]
).command(
    'mint-token-completed',
    'Get minting completed events',
    (yargs) => yargs.options({
        'token': {
            demandOption: true,
            type: 'string',
            describe: 'Symbol of the token to process',
        },
    }),
    async (argv) => {
        let tokenAddressEnvVar = `STAKED_TOKEN_ADDRESS_${argv.token.toUpperCase()}`;

        const config = [ 
            { provide: TokenAddress,  useFactory: getEnvVar(tokenAddressEnvVar), deps: [ EnvSource ] },
            TokenEventListenerSetup, 
            TokenEventListener 
        ];

        const injector = mainInjector.resolveAndCreateChild(config);
        const eventListener = injector.get(TokenEventListener);
        await eventListener.getMintEvents(argv.token);
    }
).command(
    'pause',
    'Pause',
    (yargs) => yargs.options({
        'token': {
            demandOption: true,
            type: 'string',
            describe: 'Token',
        },
    }),
    async (argv) => {
        let tokenWalletEnvVar = `STAKED_TOKEN_FIREBLOCKS_WALLET_ID_${argv.token}`;
        if (argv.token === 'XZC') {
            tokenWalletEnvVar = `STAKED_TOKEN_FIREBLOCKS_WALLET_ID_FIRO`;
        }

        const config = [
            GnosisSafeSetup,
            GnosisSafeService,
            { provide: Token, useValue: argv.token},
            { provide: SupportedTokens, useValue: SupportedTokensProdValues },
        ];
        const injector = mainInjector.resolveAndCreateChild(config);
        const supplyController = injector.get(GnosisSafeService) as GnosisSafeService;

        console.log(`Pausing ${argv.token}`);

        await supplyController.proposePause();
    }
).command(
    'unpause',
    'unpause',
    (yargs) => yargs.options({
        'token': {
            demandOption: true,
            type: 'string',
            describe: 'Token',
        },
    }),
    async (argv) => {
        let tokenWalletEnvVar = `STAKED_TOKEN_FIREBLOCKS_WALLET_ID_${argv.token}`;
        if (argv.token === 'XZC') {
            tokenWalletEnvVar = `STAKED_TOKEN_FIREBLOCKS_WALLET_ID_FIRO`;
        }

        const config = [
            GnosisSafeSetup,
            GnosisSafeService,
            { provide: Token, useValue: argv.token},
            { provide: SupportedTokens, useValue: SupportedTokensProdValues },
        ];
        const injector = mainInjector.resolveAndCreateChild(config);
        const supplyController = injector.get(GnosisSafeService) as GnosisSafeService;

        console.log(`UNpausing ${argv.token}`);

        await supplyController.proposeUnpause();
    }
).command(
    'aws-s3-backup',
    'Backup state logs',
    (yargs) => yargs.options({
        'prod': {
            demandOption: false,
            type: 'boolean',
            describe: 'Production backup',
        },
    }),
    async (argv: any) => {
        const backup = new StateLogBackup();
        await backup.execute(argv.prod ? 'sh-state-logs-backup' : 'sh-state-logs-backup-dev');
    }
).command(
    'cosign',
    'Cosign Gnosis Safe transactions',
    (yargs) => yargs.options({
        'dryRun': {
            demandOption: false,
            type: 'boolean',
            describe: 'Do not commit changes',
        },
    }),
    async (argv: any) => {
        const config = [ 
            CosignFlow,
            CosignFlowCLISetup,
        ];

        const injector = mainInjector.resolveAndCreateChild(config);
        const cosignFlow = injector.get(CosignFlow) as CosignFlow;
        await cosignFlow.execute(argv.dryRun);
    }
).help()
.argv;

logger.info(argv);