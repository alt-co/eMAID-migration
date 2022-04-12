import Safe, { EthersAdapter, EthSignSignature } from "@gnosis.pm/safe-core-sdk";
import { SafeTransactionData } from "@gnosis.pm/safe-core-sdk-types";
import EthSafeTransaction from "@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/SafeTransaction";
import { ZERO_ADDRESS } from "@gnosis.pm/safe-core-sdk/dist/src/utils/constants";
import SafeServiceClient, { SafeMultisigTransactionListResponse, SafeMultisigTransactionResponse } from "@gnosis.pm/safe-service-client";
import { Relayer  } from 'defender-relay-client';
import { DefenderRelaySigner, DefenderRelayProvider  } from 'defender-relay-client/lib/ethers';
import { ethers, Signer } from "ethers";
import { SafeAddress, TokenNetwork } from "infrastructure/gnosis-safe/models/GnosisSafeConfig";
import { Inject } from "injection-js";
import { logger } from "util/logger";
import { CosignDelayInHours, OpenzeppelinRelayerApiKey, OpenzeppelinRelayerApiSecret } from "./models/CosignFlowConfig";


export class CosignFlow {
    protected readonly safeService: SafeServiceClient;
    private relayer: Relayer;
    private signer: Signer;

    constructor(
        @Inject(CosignDelayInHours) protected readonly delayInHours: string,
        @Inject(TokenNetwork) protected readonly safeNetwork: string,    
        @Inject(SafeAddress) protected readonly safeAddress: string,
        @Inject(OpenzeppelinRelayerApiKey) readonly relayerApiKey: string,
        @Inject(OpenzeppelinRelayerApiSecret) readonly relayerApiSecret: string,
    ) {
        // Set up OpenZeppelin Relayer
        const credentials = { apiKey: relayerApiKey, apiSecret: relayerApiSecret };
        this.relayer = new Relayer(credentials);

        // Set up ethers to use OpenZeppelin relayer
        const provider = new DefenderRelayProvider(credentials);
        this.signer = new DefenderRelaySigner(credentials, provider, { speed: 'average' });   
        
        // Set up Gnosis Safe Service
        const txServiceUrls: {[network: string]: string} = {
            'mainnet': 'https://safe-transaction.gnosis.io',
            'rinkeby': 'https://safe-transaction.rinkeby.gnosis.io',
        };
      
        if (!(safeNetwork in txServiceUrls)) {
            throw new Error(`Gnosis Safe network "${safeNetwork}" not supported`);
        }
      
        this.safeService = new SafeServiceClient(txServiceUrls[safeNetwork]);
    }

    public async execute(dryRun: boolean) {
        if(dryRun) {
            logger.warn("DryRun activated, transactions will not be executed!");
        }

        // 1. List transactions
        const gnosisPendingTxs: SafeMultisigTransactionResponse[] = 
            (await this.safeService.getPendingTransactions(this.safeAddress)).results;

        // Query pending transactions from Relay
        const relayerTxs = await this.relayer.list({
            status: 'pending',
        });

        // Filter transactions by delay and not already pending in Relayer
        const now = Date.now();
        const iface = new ethers.utils.Interface(['function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 dataGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures)'])
        const gnosisFilteredTxs = gnosisPendingTxs.filter(gnosisTx => {
            // Filter by time delay
            const isSufficientDelay = (now - (new Date(gnosisTx.submissionDate)).getTime())/3600000 > parseFloat(this.delayInHours);
            if (!isSufficientDelay) return false; 

            // Filter already queued transactions by contents
            const relayerPendingTxIndex = relayerTxs.findIndex(relayTx => {
                try {
                    const params = iface.decodeFunctionData('execTransaction', relayTx.data!);
                    const relayTo = params[0];
                    const relayData = params[2];

                    return relayTo === gnosisTx.to && relayData === gnosisTx.data;                   
                } catch (e) {
                    return false;
                }
            });

            if (relayerPendingTxIndex >= 0) {
                logger.debug("Found a duplicate pending transaction in Relay", relayerTxs[relayerPendingTxIndex]);
                
                // Remove transaction from Relay list, to prevent repeated matching
                relayerTxs.splice(relayerPendingTxIndex, 1);

                // Remove already pending tx
                return false;
            }

            // Keep transaction in list
            return true;
        }).sort((a,b) => {
            return a.nonce - b.nonce;
        });

        // Sign and execute transactions
        const safeSdk = await this.safeSdk();
        logger.info(`Found ${gnosisFilteredTxs.length} pending transactions`);
        for (const tx of gnosisFilteredTxs) {
            logger.info(`${!dryRun ? 'Executing ':''}Transaction, nonce: ${tx.nonce}, hash: ${tx.safeTxHash}`);
            logger.debug(tx);
            if (!dryRun) {
                // Convert transaction to correct format
                const safeTransaction = await this.convertToSafeSdkTransaction(tx, safeSdk);

                // Add final signature
                const hash = tx.safeTxHash;
                const signature = await safeSdk.signTransactionHash(hash);
                safeTransaction.addSignature(signature);

                // Execute transaction 
                const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
                logger.info("Transaction submitted", executeTxResponse.hash);

                // Disable waiting for transaction completion
                // const receipt = executeTxResponse.transactionResponse && (await executeTxResponse.transactionResponse.wait());
                // logger.info("Transaction submitted", receipt);
            }
        }
    }

    /**
     * Convert a SafeServie transaction to safeSdk transaction
     * @param tx 
     * @param safeSdk 
     * @returns 
     */
    private async convertToSafeSdkTransaction(tx: SafeMultisigTransactionResponse, safeSdk: Safe) {
        const safeTransactionData: SafeTransactionData = {
            to: tx.to,
            value: tx.value,
            data: tx.data || "",
            operation: tx.operation,
            baseGas: tx.baseGas ?? 0,
            gasPrice: parseInt(tx.gasPrice) ?? 0,
            gasToken: tx.gasToken,
            refundReceiver: tx.refundReceiver || ZERO_ADDRESS,
            nonce: tx.nonce,
            safeTxGas: tx.safeTxGas,
        };

        const safeTransaction = await safeSdk.createTransaction(safeTransactionData);
        tx.confirmations!.forEach(confirmation => {
            const signature = new EthSignSignature(confirmation.owner, confirmation.signature);
            safeTransaction.addSignature(signature);
        });
        return safeTransaction;
    }

    /**
     * Get an instance of the Gnosis Safe
     * @returns An instance of a Safe
     */
    private safeSdk(): Promise<Safe> {
        const ethAdapter = new EthersAdapter({ ethers, signer: this.signer });
        return Safe.create({ ethAdapter, safeAddress: this.safeAddress });
    }
}