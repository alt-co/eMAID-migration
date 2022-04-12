//import BigNumber from "bignumber.js";
import { expect } from "chai";
import { Injectable, ReflectiveInjector, Provider } from "injection-js";
import { SupportedTokens, SupportedTokensProdValues } from "models/SupportedTokens";
import { InfuraApiKey, ZapierApiUrl } from './models/TokenEventListenerConfig';
import {  PastEvents, VirtualEventLogger } from "services/test/EventLogger/VirtualEventLogger";
import { EventLogger } from "services/EventLogger";
import { CustomerStore } from "stores/CustomerStore";
import { MintCompletedStore } from "stores/MintCompletedStore";
import { TokenEventListener } from "./TokenEventListener";
import { TokenAddress } from "infrastructure/ethereum/models/TokenEventListenerConfig";

describe('Mint token completed listener', () => {
  // Define all the stuff we need/use there
  @Injectable()
  class VirtualMintCompletedStore extends CustomerStore {
    sourceSuffix = 'mint-completed';
    eventType = 'TokenMintingCompleted';
    public async init() {}
    public async getLastProcessedBlock() {
      return null;
    }
  }
  let config: Provider[];
  
  beforeEach(() => {
    config = [
      { provide: SupportedTokens, useValue: SupportedTokensProdValues },
      { provide: InfuraApiKey, useValue: '12345678' },
      { provide: ZapierApiUrl, useValue: '' },
      { provide: TokenAddress, useValue: '0x12345678' },
      { provide: EventLogger, useClass: VirtualEventLogger },      
      { provide: PastEvents, useValue: [] },
      { provide: MintCompletedStore, useClass: VirtualMintCompletedStore },
      TokenEventListener
    ]
  })

  it('should instantiate a TokenEventListener', () => {
    
    const injector = ReflectiveInjector.resolveAndCreate(config);
    const tokenEventListener = injector.get(TokenEventListener);

    expect(tokenEventListener).to.be.instanceOf(TokenEventListener);
  })

  it('should throw error if no initial block is found', async () => {
    const injector = ReflectiveInjector.resolveAndCreate(config);
    const tokenEventListener = injector.get(TokenEventListener);
    let erroCaught = false;
    try {
      await tokenEventListener.getMintEvents('DASH', '0x123');
    } catch (err) {
      erroCaught = true;
    }

    expect(erroCaught).to.equal(true);
  });

});