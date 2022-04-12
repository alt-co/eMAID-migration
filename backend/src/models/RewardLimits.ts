import BigNumber from "bignumber.js";
import { InjectionToken } from "injection-js";

export const RewardLimitValues = {
    "ETH": {
        minAmount: new BigNumber(10),
        useAmount: false,
        minRewardFeeRatio: new BigNumber(6),
        useRewardFeeRatio: true,
    },
    "XZC": {
        minAmount: new BigNumber(10),
        useAmount: false,
        minRewardFeeRatio: new BigNumber(2),
        useRewardFeeRatio: true,
    },
    "XEM": {
        minAmount: new BigNumber(10),
        useAmount: false,
        minRewardFeeRatio: new BigNumber(3),
        useRewardFeeRatio: true,
    },
    "XYM": {
        minAmount: new BigNumber(10),
        useAmount: false,
        minRewardFeeRatio: new BigNumber(3),
        useRewardFeeRatio: true,
    },
    "ZEN": {
        minAmount: new BigNumber(10),
        useAmount: false,
        minRewardFeeRatio: new BigNumber(2),
        useRewardFeeRatio: true,
    },
    "DASH": {
        minAmount: new BigNumber(10),
        useAmount: false,
        minRewardFeeRatio: new BigNumber(5),
        useRewardFeeRatio: true,
    },
    "DOT": {
        minAmount: new BigNumber(10),
        useAmount: false,
        minRewardFeeRatio: new BigNumber(5),
        useRewardFeeRatio: true
    },
    "DIVI": {
        minAmount: new BigNumber(10),
        useAmount: false,
        minRewardFeeRatio: new BigNumber(5),
        useRewardFeeRatio: true,
    },
    "MATIC": {
        minAmount: new BigNumber(10),
        useAmount: false,
        minRewardFeeRatio: new BigNumber(5),
        useRewardFeeRatio: true,
    },
}

export type RewardLimits = typeof RewardLimitValues;

export const RewardLimits = new InjectionToken<typeof RewardLimitValues>('RewardLimits');
