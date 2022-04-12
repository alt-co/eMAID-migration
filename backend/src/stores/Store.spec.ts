import { Injectable, ReflectiveInjector } from "injection-js";
import { expect } from "chai";
import { map, scan } from "rxjs/operators";

import { PauseableObservable } from "models/events/EventLogEntry";
import { VirtualLogEntry, VirtualEventLogger, PastEvents } from "services/test/EventLogger/VirtualEventLogger";
import { Store } from "./Store";

describe('Event reactive store', function() {
  @Injectable()
  class DummyStore extends Store {
    public readonly source: PauseableObservable<VirtualLogEntry>;

    constructor(eventLogger: VirtualEventLogger) {
      super(eventLogger);

      this.source = this.eventLogger.select<VirtualLogEntry>();
    }

    public async init() {}

    get last() {
      return this.source.pipe(
        map(e => e.payload),
      );
    }

    get sum() {
      return this.source.pipe(
        scan((a, c) => c.payload + a, 0),
      )
    }

    get max() {
      return this.source.pipe(
        scan((a, c) => c.payload > a ? c.payload : a, 0),
      )
    }
  }

  const setupConfig = [
    VirtualEventLogger,
    DummyStore,
  ];

  it('should emit only latest values', async function() {
    const pastEvents = [ 1, 6, 3 ].map((e, i) => new VirtualLogEntry(i, '', e));
    const config = [ setupConfig, { provide: PastEvents, useValue: pastEvents } ];
    const store: DummyStore = ReflectiveInjector.resolveAndCreate(config).get(DummyStore);

    expect(await store.sum.toPromise()).to.equal(10);
    expect(await store.max.toPromise()).to.equal(6);
    expect(await store.last.toPromise()).to.equal(3);
  });

  it('should compute reduced values form incoming events', async function() {
    const pastEvents = [ 1, 3, 6 ].map((e, i) => new VirtualLogEntry(i, '', e));
    const config = [ setupConfig, { provide: PastEvents, useValue: pastEvents } ];
    const injector = ReflectiveInjector.resolveAndCreate(config);
    const store: DummyStore = injector.get(DummyStore);
    const logger: VirtualEventLogger = injector.get(VirtualEventLogger);

    await Promise.all([ logger.emit(VirtualLogEntry, 10), logger.emit(VirtualLogEntry, 1) ]);

    expect(logger.getLatestEventId('')).to.equal(4);

    expect(await store.sum.toPromise()).to.equal(21);
    expect(await store.max.toPromise()).to.equal(10);
    expect(await store.last.toPromise()).to.equal(1);
  });

  xit('should emit default value when source have never emitted', async function() {
    const config = [ setupConfig, { provide: PastEvents, useValue: [] } ];
    const store: DummyStore = ReflectiveInjector.resolveAndCreate(config).get(DummyStore);

    expect(await store.sum.toPromise()).to.equal(0);
    expect(await store.max.toPromise()).to.equal(0);
    expect(await store.last.toPromise()).to.equal(null);
  });
});