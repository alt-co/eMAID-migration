export interface OmniExplorerTransaction {
    "amount": string,
    "block": number,
    "blockhash": string,
    "blocktime": number,
    "confirmations": number,
    "divisible": boolean,
    "fee": string,
    "flags": any,
    "ismine": boolean,
    "positioninblock"?: number,
    "propertyid": number,
    "propertyname": string,
    "referenceaddress": string,
    "sendingaddress": string,
    "txid": string,
    "type": string,
    "type_int": number,
    "valid": boolean,
    "version": number,
}