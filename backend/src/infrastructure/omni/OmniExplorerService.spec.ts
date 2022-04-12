//import BigNumber from "bignumber.js";
import BigNumber from "bignumber.js";
import { expect } from "chai";
import { Provider, ReflectiveInjector } from "injection-js";
import { OmniExplorerApiUrl, OmniRequiredConfirmations, OmniTokenPropertyId, OmniBurnAddress } from "./models/OmniExplorerConfig";
import { OmniExplorerService } from "./OmniExplorerService";


describe('Omni Explorer Service', () => {  
  let config: Provider[];
  const burnAddress = '1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu';

  const transactions =  [
    {
      "amount": "9920",
      "block": 613532,
      "blockhash": "00000000000000000012559ad709d0536043a1b9dadd5b397e66ccd0a84ca71e",
      "blocktime": 1579432742,
      "confirmations": 98716,
      "divisible": false,
      "fee": "0.00100000",
      "flags": null,
      "ismine": false,
      "positioninblock": 5,
      "propertyid": 3,
      "propertyname": "MaidSafeCoin",
      "referenceaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "sendingaddress": "1Po1oWkD2LmodfkBYiAktwh76vkF93LKnh",
      "txid": "39adc34e94f6779c1815115930321b70268e328fc84da55e8f6dfb2ec649ed02",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    },
    {
      "amount": "19889",
      "block": 608290,
      "blockhash": "00000000000000000011aa7d1497ffaabc4cf91e9134bb3b5cee7bb71f57b58c",
      "blocktime": 1576463681,
      "confirmations": 103958,
      "divisible": false,
      "fee": "0.00100000",
      "flags": null,
      "ismine": false,
      "positioninblock": 21,
      "propertyid": 3,
      "propertyname": "MaidSafeCoin",
      "referenceaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "sendingaddress": "1Po1oWkD2LmodfkBYiAktwh76vkF93LKnh",
      "txid": "fffffa0f6dd6ecac5d1cfe79af5e374764f9845629d0eeea59b1a2b000a013d5",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    },
    {
      "amount": "538",
      "block": 601551,
      "blockhash": "000000000000000000080148e80adec3c05c2031386dfe9d31121d483571c3c4",
      "blocktime": 1572377438,
      "confirmations": 110697,
      "divisible": false,
      "fee": "0.00100000",
      "flags": null,
      "ismine": false,
      "positioninblock": 5,
      "propertyid": 3,
      "propertyname": "MaidSafeCoin",
      "referenceaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "sendingaddress": "1Po1oWkD2LmodfkBYiAktwh76vkF93LKnh",
      "txid": "ce7f0f080c3973b422da02849bf5aaf10a9c3a6977ddc50e6f1c1873fa2bb94b",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    },
    {
      "amount": "918",
      "block": 601033,
      "blockhash": "00000000000000000008e34f189eda1e7d6ff04afda58b2207943eba2a145982",
      "blocktime": 1572037625,
      "confirmations": 111215,
      "divisible": false,
      "fee": "0.00100000",
      "flags": null,
      "ismine": false,
      "positioninblock": 2,
      "propertyid": 3,
      "propertyname": "MaidSafeCoin",
      "referenceaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "sendingaddress": "1Po1oWkD2LmodfkBYiAktwh76vkF93LKnh",
      "txid": "8290cfc085fa75dfbae191ad3a1d377fbdf565da70c0d42872485b8f5bfda36c",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    },
    {
      "amount": "1818.00000000",
      "block": 529686,
      "blockhash": "00000000000000000004a323562d46e2c816bd009d96d39076418a65b28270ef",
      "blocktime": 1530240845,
      "confirmations": 182562,
      "divisible": true,
      "fee": "0.00025043",
      "flags": null,
      "ismine": false,
      "positioninblock": 689,
      "propertyid": 358,
      "propertyname": "MoshiachCoin",
      "referenceaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "sendingaddress": "1Ft9S4pwazQ9hfcLMmdJShNzqLhWGzhmUF",
      "txid": "1f5170f04b6a4625a3695c9d45bb8a3e544a571eadf7aa47fe6e92b5ed8fbc16",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    },
    {
      "amount": "8",
      "block": 496898,
      "blockhash": "0000000000000000008dcc0d3f596543afbdd34f7f7e50d2d62b3039d76ae6bd",
      "blocktime": 1512071221,
      "confirmations": 215350,
      "divisible": false,
      "fee": "0.00041390",
      "flags": null,
      "ismine": false,
      "positioninblock": 223,
      "propertyid": 3,
      "propertyname": "MaidSafeCoin",
      "referenceaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "sendingaddress": "1DUb2YYbQA1jjaNYzVXLZ7ZioEhLXtbUru",
      "txid": "fae8ab55684402c630a5df883e7ba8654d754049dbaf577ae935a220cdae27d1",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    },
    {
      "amount": "956",
      "block": 496897,
      "blockhash": "000000000000000000c848c8af9fe67116023b9899bae8c5bf6bc1dce10f1db0",
      "blocktime": 1512071179,
      "confirmations": 215351,
      "divisible": false,
      "fee": "0.00049776",
      "flags": null,
      "ismine": false,
      "positioninblock": 446,
      "propertyid": 3,
      "propertyname": "MaidSafeCoin",
      "referenceaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "sendingaddress": "1DUb2YYbQA1jjaNYzVXLZ7ZioEhLXtbUru",
      "txid": "2b40253ec11daffcef75aa93d45587b908e2fe41064092c1d778e6890d6bad9b",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    },
    {
      "amount": "18",
      "block": 496895,
      "blockhash": "0000000000000000009cff68b16d9cab70d7c87fdc764e17378f315af32a0cec",
      "blocktime": 1512070476,
      "confirmations": 215353,
      "divisible": false,
      "fee": "0.00050034",
      "flags": null,
      "ismine": false,
      "positioninblock": 657,
      "propertyid": 3,
      "propertyname": "MaidSafeCoin",
      "referenceaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "sendingaddress": "1DUb2YYbQA1jjaNYzVXLZ7ZioEhLXtbUru",
      "txid": "a8b05c8e4caac077dcc9f40445a9b58206295bd31b3a0a6f1beae6b3f9568d6c",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    },
    {
      "amount": "10",
      "block": 477611,
      "blockhash": "0000000000000000013c8c8faee5de8bc15b2ad1f0330a4afd2ebec58182bea1",
      "blocktime": 1501044549,
      "confirmations": 234637,
      "divisible": false,
      "fee": "0.00040485",
      "flags": null,
      "ismine": false,
      "positioninblock": 1458,
      "propertyid": 3,
      "propertyname": "MaidSafeCoin",
      "referenceaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "sendingaddress": "1DUb2YYbQA1jjaNYzVXLZ7ZioEhLXtbUru",
      "txid": "5334994c2cf0ad15d5a9b26e625f0892c84c3cfddacfacf4bf8364eb709a0a84",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    },
    {
      "amount": "0.21601551",
      "block": 403135,
      "blockhash": "000000000000000005f78bb9a22b775946d5135cca251dfaecd5ba7497c0f97a",
      "blocktime": 1458255400,
      "confirmations": 309113,
      "divisible": true,
      "fee": "0.00010000",
      "flags": {
        "registered": true
      },
      "ismine": false,
      "propertyid": 1,
      "propertyname": "Omni Token",
      "referenceaddress": "16QbAc9j7bFs5fNpSWBEtkEJUQbXL12NHV",
      "sendingaddress": "1ARjWDkZ7kT9fwjPrjcQyvbXDkEySzKHwu",
      "txid": "8dea44c5c613b674727cd2ebd3f83c3289817a2bfbdf94a8265d28d457e281a3",
      "type": "Simple Send",
      "type_int": 0,
      "valid": true,
      "version": 0
    }
  ];

  beforeEach(() => {
    config = [
      { provide: OmniExplorerApiUrl, useValue: 'https://api.omniexplorer.info/' },
      { provide: OmniRequiredConfirmations, useValue:  2 },
      { provide: OmniTokenPropertyId, useValue:  3 },
      { provide: OmniBurnAddress, useValue: burnAddress},
      OmniExplorerService,
    ]
  });

  it('should filter transactions by sender', async () => {
    const injector = ReflectiveInjector.resolveAndCreate(config);
    const omniExplorer: OmniExplorerService = injector.get(OmniExplorerService);

    const filteredTransactions = omniExplorer.filterBurnTransactionsForAddress('1Po1oWkD2LmodfkBYiAktwh76vkF93LKnh', transactions);

    expect(filteredTransactions).to.be.lengthOf(4);
    expect(filteredTransactions[0]).to.equal(transactions[0]);
  });

  it('should filter transactions by property id', async () => {
    const injector = ReflectiveInjector.resolveAndCreate(config);
    const omniExplorer: OmniExplorerService = injector.get(OmniExplorerService);

    const filteredTransactions = omniExplorer.filterBurnTransactionsForAddress('1Ft9S4pwazQ9hfcLMmdJShNzqLhWGzhmUF', transactions);

    expect(filteredTransactions).to.be.lengthOf(0);
  });

  it('should filter transactions by confirmations', async () => {
    config.push({ provide: OmniRequiredConfirmations, useValue:  105000 });
    const injector = ReflectiveInjector.resolveAndCreate(config);
    const omniExplorer: OmniExplorerService = injector.get(OmniExplorerService);

    const filteredTransactions = omniExplorer.filterBurnTransactionsForAddress('1Po1oWkD2LmodfkBYiAktwh76vkF93LKnh', transactions);

    expect(filteredTransactions).to.be.lengthOf(2);
    expect(filteredTransactions[0]).to.equal(transactions[2]);
  });

  it('should sum amounts', async () => {
    const injector = ReflectiveInjector.resolveAndCreate(config);
    const omniExplorer: OmniExplorerService = injector.get(OmniExplorerService);

    const filteredTransactions = omniExplorer.filterBurnTransactionsForAddress('1Po1oWkD2LmodfkBYiAktwh76vkF93LKnh', transactions);
    const totalBurned = omniExplorer.sumAmounts(filteredTransactions);

    expect(totalBurned.toString()).to.equal(new BigNumber("31265").toString());
  });

  it('should query all transactions in an address', async () => {
    const injector = ReflectiveInjector.resolveAndCreate(config);
    const omniExplorer: OmniExplorerService = injector.get(OmniExplorerService);

    const transactions = await omniExplorer.transactions('13thNtwwBVWqagQsGmzVdoQtRzhj8nq5UZ');

    expect(transactions).length.greaterThanOrEqual(11);
  }).timeout(60000);

});