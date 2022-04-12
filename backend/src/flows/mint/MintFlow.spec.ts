import BigNumber from "bignumber.js";
import { expect } from "chai";
import { StakedTokenAddress, TokenNetwork } from "infrastructure/gnosis-safe/models/GnosisSafeConfig";
import { Inject, Injectable, Provider, ReflectiveInjector } from "injection-js";
import { CustomerMap } from "models/Customer";
import { EventFilterConfig } from "models/EventFilterConfig";
import { AnyLogEntry } from "models/events/EventLogEntry";
import { SupplyControllerTransaction } from "models/SupplyControllerTransaction";
import { SupportedCustomerOrigin } from "models/SupportedCustomerOrigins";
import { SupportedToken, SupportedTokens } from "models/SupportedTokens";
import { timer } from "rxjs";
import { scan, takeUntil } from "rxjs/operators";
import { CustomerSource } from "services/CustomerSource";
import { EventLogger } from "services/EventLogger";
import { SupplyController } from "services/SupplyController";
import { VirtualEventLogger, PastEvents } from "services/test/EventLogger/VirtualEventLogger";
import { logger } from "util/logger";
import { MintFlow } from "./MintFlow";
import { MintingThreshold } from "./models/MintFlowConfig";
import { OvermintProtector } from "./OvermintProtector";

describe('Mint flow', function() {
  @Injectable()
  class TestEmptyCustomerDataSource extends CustomerSource<'Altcoinomy'> {
    public readonly customerSourceName = 'Altcoinomy';

    public async getAddressesToMint(_: SupportedToken): Promise<CustomerMap<'Altcoinomy'>> {
      return {};
    }
  }

  @Injectable()
  class VirtualCustomerDataSource1 extends CustomerSource<'Altcoinomy'> {
    public readonly customerSourceName = 'Altcoinomy';

    public async getAddressesToMint(_: SupportedToken): Promise<CustomerMap<'Altcoinomy'>> {
      return {
        'addr1': { origin: 'Altcoinomy', address: 'addr1', amount: new BigNumber(1), payload: [] },
        'addr2': { origin: 'Altcoinomy', address: 'addr2', amount: new BigNumber(2), payload: [] },
        'addr3': { origin: 'Altcoinomy', address: 'addr3', amount: new BigNumber(0), payload: [] },
      };
    }
  }

  class TestCustomerDataSource2 extends CustomerSource<'CopperOTC'> {
    public readonly customerSourceName = 'CopperOTC';

    public async getAddressesToMint(_: SupportedToken): Promise<CustomerMap<'CopperOTC'>> {
      return {
        'addr4': { origin: 'CopperOTC', address: 'addr4', amount: new BigNumber(1), payload: [] },
        'addr5': { origin: 'CopperOTC', address: 'addr5', amount: new BigNumber(2), payload: [] },
      };
    }
  }

  @Injectable()
  class VirtualSupplyController extends SupplyController {
    public async proposeRebase(amount: BigNumber): Promise<SupplyControllerTransaction> {
      return { id: 'RebaseId', data: amount.toString() };
    }

    public async proposeMint(to: string, amount: BigNumber): Promise<SupplyControllerTransaction> {
      return { id: 'MintId', data: amount + ' -> ' + to };
    }

    public async proposeBurn(amount: BigNumber): Promise<SupplyControllerTransaction> {
      return { id: 'BurnId', data: amount.toString() };
    }

    public async proposeAddDownstreamTransaction(address: string, data: string): Promise<SupplyControllerTransaction> {
      return { id: 'AddDownstreamTransactionId', data: `${address}: ${data}` };
    }

    public async estimateRebaseNetworkFee() {
      return new BigNumber('0.1');
    }
  }

  @Injectable()
  class TestOvermintProtector extends OvermintProtector<'MAID', 'Altcoinomy'> {
    public readonly tokenSymbol = 'MAID';

    public async checkForOvermint(toMint: CustomerMap<"Altcoinomy">, customerSource: CustomerSource<"Altcoinomy">): Promise<void> {
        return;
    }
  }

  @Injectable()
  class TestedMintFlow<K extends SupportedCustomerOrigin> extends MintFlow<'MAID', K> {
    public readonly tokenSymbol = 'MAID';

    constructor(
      @Inject(CustomerSource) public readonly customerDataSource: CustomerSource<K> | CustomerSource<K>[],
      protected readonly supplyController: SupplyController,
      protected readonly eventLogger: EventLogger,
      @Inject(MintingThreshold) readonly mintingThreshold: string,
      @Inject(OvermintProtector) readonly overmintProtector: OvermintProtector<'MAID', K>,
    ) {
      super(customerDataSource, supplyController, eventLogger, mintingThreshold, overmintProtector);
    }
  }

  const filterCfg: EventFilterConfig = {
    filter: ({ type }) => type === 'TokenMintingRequested',
    source: '',
    start: 0,
  };

  const loggerFns: typeof logger = {} as unknown as typeof logger;
  let mintFlowConfig: Provider[];

  beforeEach(function() {
    for (const method of [ 'info', 'warn', 'debug' ] as const) {
      loggerFns[method] = logger[method];
      logger[method] = (() => {}) as any;
    }

    mintFlowConfig = [
      { provide: SupplyController, useClass: VirtualSupplyController },
      { provide: CustomerSource, useClass: VirtualCustomerDataSource1 },
      { provide: EventLogger, useClass: VirtualEventLogger },
      { provide: PastEvents, useValue: [] },
      { provide: MintFlow, useClass: TestedMintFlow },
      { provide: MintingThreshold, useValue: '0' },
      { provide: OvermintProtector, useClass: TestOvermintProtector },
    ];
  });

  afterEach(function() {
    for (const method of [ 'info', 'warn', 'debug' ] as const) {
      logger[method] = loggerFns[method];
    }
  });

  it('should execute a mint flow', async function() {
    const injector = ReflectiveInjector.resolveAndCreate(mintFlowConfig);
    const mintFlow = injector.get(MintFlow) as MintFlow<'MAID', 'Altcoinomy'>;
    const eventLogger = injector.get(EventLogger) as EventLogger;

    expect(mintFlow.tokenSymbol).to.equal('MAID');

    await mintFlow.execute(false, 'Altcoinomy');
    const log = await eventLogger.select(filterCfg).pipe(
      scan((a, c) => a.concat(c), [] as AnyLogEntry[]),
      takeUntil(timer(100)),
    ).toPromise();

    log.forEach(l => {
      expect(typeof l.timestamp).to.equal('number');
      l.timestamp = 0;
    });

    expect(log[1]).to.deep.equal({
      type: 'TokenMintingRequested',
      id: 1,
      timestamp: 0,
      source: '',
      payload: {
        currency: 'MAID',
        customer: { origin: 'Altcoinomy', address: 'addr2', amount: new BigNumber(2), payload: [] },
        supplyControllerTransaction: {
          data: `2 -> addr2`,
          id: 'MintId',
        },
      }
    });

    expect(log[0]).to.deep.equal({
      type: 'TokenMintingRequested',
      id: 0,
      timestamp: 0,
      source: '',
      payload: {
        currency: 'MAID',
        customer: { origin: 'Altcoinomy', address: 'addr1', amount: new BigNumber(1), payload: [] },
        supplyControllerTransaction: {
          data: `1 -> addr1`,
          id: 'MintId',
        },
      }
    });
  });

  it('should dry run for mint flow', async function() {
    const injector = ReflectiveInjector.resolveAndCreate(mintFlowConfig);
    const mintFlow = injector.get(MintFlow) as MintFlow<'MAID', 'Altcoinomy'>;
    const eventLogger = injector.get(EventLogger) as EventLogger;

    await mintFlow.execute(true, 'Altcoinomy');

    const log = await eventLogger.select(filterCfg).pipe(takeUntil(timer(100))).toPromise();

    expect(log).to.be.equal(undefined);
  });

  it('should not mint 0 amounts', async function() {
    let injector = ReflectiveInjector.resolveAndCreate(mintFlowConfig);
    let mintFlow = injector.get(MintFlow) as MintFlow<'MAID', 'Altcoinomy'>;
    let eventLogger = injector.get(EventLogger) as EventLogger;

    await mintFlow.execute(false, 'Altcoinomy');

    let log = await eventLogger.select(filterCfg).pipe(
      scan((a, c) => a.concat(c), [] as AnyLogEntry[]),
      takeUntil(timer(100)),
    ).toPromise();

    expect(log.length).to.equal(2);
  });

  it('should not mint below threshold', async function() {
    const injector = ReflectiveInjector.resolveAndCreate([
      mintFlowConfig,
      { provide: MintingThreshold, useValue: '1.5' },
    ]);
    const mintFlow = injector.get(MintFlow) as MintFlow<'MAID', 'Altcoinomy'>;
    const eventLogger = injector.get(EventLogger) as EventLogger;

    await mintFlow.execute(false, 'Altcoinomy');

    const log = await eventLogger.select(filterCfg).pipe(
      scan((a, c) => a.concat(c), [] as AnyLogEntry[]),
      takeUntil(timer(100)),
    ).toPromise();

    expect(log.length).to.equal(1);
  });

  it('should stop the flow if no address to mint', async function() {
    const injector = ReflectiveInjector.resolveAndCreate([
      mintFlowConfig,
      { provide: CustomerSource, useClass: TestEmptyCustomerDataSource },
    ]);

    const mintFlow = injector.get(MintFlow) as MintFlow<'MAID', 'Altcoinomy'>;
    const eventLogger = injector.get(EventLogger) as EventLogger;

    await mintFlow.execute(false, 'Altcoinomy');

    const log = await eventLogger.select(filterCfg).pipe(
      scan((a, c) => a.concat(c), [] as AnyLogEntry[]),
      takeUntil(timer(100)),
    ).toPromise();

    expect(log).to.equal(undefined);
  });

  it('should accept multiple customer origins', async function() {
    const injector = ReflectiveInjector.resolveAndCreate([
      { provide: SupplyController, useClass: VirtualSupplyController },
      { provide: CustomerSource, useClass: VirtualCustomerDataSource1, multi: true },
      { provide: CustomerSource, useClass: TestCustomerDataSource2, multi: true },
      { provide: EventLogger, useClass: VirtualEventLogger },
      { provide: PastEvents, useValue: [] },
      { provide: MintFlow, useClass: TestedMintFlow },
      { provide: MintingThreshold, useValue: '0' },
      { provide: OvermintProtector, useClass: TestOvermintProtector },
    ]);

    const mintFlow = injector.get(MintFlow) as MintFlow<'MAID', 'Altcoinomy' | 'CopperOTC'>;
    const eventLogger = injector.get(EventLogger) as EventLogger;

    await mintFlow.execute(false, 'Altcoinomy');
    await mintFlow.execute(false, 'CopperOTC');

    const log = await eventLogger.select(filterCfg).pipe(
      scan((a, c) => a.concat(c), [] as AnyLogEntry[]),
      takeUntil(timer(100)),
    ).toPromise();

    expect(log.length).to.equal(4);
  });

  it('should only mint for known origins', async function() {
    const injector = ReflectiveInjector.resolveAndCreate([
      { provide: SupplyController, useClass: VirtualSupplyController },
      { provide: CustomerSource, useClass: VirtualCustomerDataSource1, multi: true },
      { provide: EventLogger, useClass: VirtualEventLogger },
      { provide: PastEvents, useValue: [] },
      { provide: MintFlow, useClass: TestedMintFlow },
      { provide: MintingThreshold, useValue: '0' },
      { provide: OvermintProtector, useClass: TestOvermintProtector },
    ]);

    const mintFlow = injector.get(MintFlow) as MintFlow<'MAID', 'Altcoinomy'>;
    const eventLogger = injector.get(EventLogger) as EventLogger;

    await mintFlow.execute(false, 'CopperOTC');

    const log = await eventLogger.select(filterCfg).pipe(
      scan((a, c) => a.concat(c), [] as AnyLogEntry[]),
      takeUntil(timer(100)),
    ).toPromise();

    expect(log).to.equal(undefined);
  });

  it('should mint for all known origins if origin is not specified', async function() {
    const injector = ReflectiveInjector.resolveAndCreate([
      { provide: SupplyController, useClass: VirtualSupplyController },
      { provide: CustomerSource, useClass: VirtualCustomerDataSource1, multi: true },
      { provide: CustomerSource, useClass: TestCustomerDataSource2, multi: true },
      { provide: EventLogger, useClass: VirtualEventLogger },
      { provide: PastEvents, useValue: [] },
      { provide: MintFlow, useClass: TestedMintFlow },
      { provide: MintingThreshold, useValue: '0' },
      { provide: OvermintProtector, useClass: TestOvermintProtector },
    ]);

    const mintFlow = injector.get(MintFlow) as MintFlow<'MAID', 'Altcoinomy' | 'CopperOTC'>;
    const eventLogger = injector.get(EventLogger) as EventLogger;

    await mintFlow.execute(false);

    const log = await eventLogger.select(filterCfg).pipe(
      scan((a, c) => a.concat(c), [] as AnyLogEntry[]),
      takeUntil(timer(100)),
    ).toPromise();

    expect(log.length).to.equal(4);
  });
});