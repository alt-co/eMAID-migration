import BigNumber from "bignumber.js";
import { ethers } from "ethers";

export module MintablePausableToken {
    const ABI = [
        'function mint(address account, uint256 amount)',
        'function pause()',
        'function unpause()',
    ];
    const iface = new ethers.utils.Interface(ABI);

    export function encodeMint(account: string, amount: BigNumber): string {
        const params = [ account, amount.toString(10) ];

        return iface.encodeFunctionData('mint', params);
    }

    export function encodePause() {
        return iface.encodeFunctionData('pause');
    }
    
    export function encodeUnpause() {
        return iface.encodeFunctionData('unpause');
    }
}