import { ReflectiveInjector } from "injection-js";
import { expect } from "chai";
import { Observable } from "rxjs";
import { bufferTime, map, take, timeout, toArray } from "rxjs/operators";

import { AnyLogEntry } from "models/events/EventLogEntry";
import { VirtualLogEntry, VirtualEventLogger, PastEvents } from "services/test/EventLogger/VirtualEventLogger";

describe('Event logging', function() {

  const setupConfig = [
    VirtualEventLogger,
  ];

  it('should should return null when there is no event emitted', async function() {
    const config = [ setupConfig, { provide: PastEvents, useValue: [] } ];
    const dummyLogger: VirtualEventLogger = ReflectiveInjector.resolveAndCreate(config).get(VirtualEventLogger);

    await dummyLogger.getLastEvent();

    expect(dummyLogger.getLatestEventId()).to.equal(null);

    await dummyLogger.emit(VirtualLogEntry, 5);
    await dummyLogger.emit(VirtualLogEntry, 0);

    expect(dummyLogger.getLatestEventId()).to.equal(1);
  });

  it('should throw if getHead() is called before initialization', async function() {
    const config = [ setupConfig, { provide: PastEvents, useValue: [] } ];
    const dummyLogger: VirtualEventLogger = ReflectiveInjector.resolveAndCreate(config).get(VirtualEventLogger);

    expect(dummyLogger.getLatestEventId).to.throw();
  });

  it('should emit event and update head', async function() {
    const config = [ setupConfig, { provide: PastEvents, useValue: [] } ];
    const dummyLogger: VirtualEventLogger = ReflectiveInjector.resolveAndCreate(config).get(VirtualEventLogger);

    await dummyLogger.emit(VirtualLogEntry, 0);
    await dummyLogger.emit(VirtualLogEntry, 2);

    const result = await dummyLogger.select().pipe(
      map(e => e.payload),
      take(2),
      toArray()
    ).toPromise();

    expect(result).to.deep.equal([ 0, 2 ]);
  });

  it('should emit events and assign id when persisted', async function() {
    const config = [ setupConfig, { provide: PastEvents, useValue: [] } ];
    const dummyLogger: VirtualEventLogger = ReflectiveInjector.resolveAndCreate(config).get(VirtualEventLogger);

    await dummyLogger.emit(VirtualLogEntry, 5);
    await dummyLogger.emit(VirtualLogEntry, 3);

    const result = await dummyLogger.select().pipe(
      map(e => [ e.id, e.payload ] as const),
      take(2),
      toArray()
    ).toPromise();

    expect(result).to.deep.equal([ [ 0, 5 ], [ 1, 3 ] ]);

  });

  it('should replay all events', async function() {
    const pastEventsSource = [ 4, 7, 1 ];
    const pastEvents = pastEventsSource.map((e, i) => new VirtualLogEntry(i, '', e));
    const config = [ setupConfig, { provide: PastEvents, useValue: pastEvents } ];
    const dummyLogger: VirtualEventLogger = ReflectiveInjector.resolveAndCreate(config).get(VirtualEventLogger);

    const replayedEvents = await dummyLogger.select().pipe(
      map(e => e.payload),
      take(3),
      toArray()
    ).toPromise();

    expect(replayedEvents).to.deep.equal(pastEventsSource);

    await Promise.all([
      dummyLogger.emit(VirtualLogEntry, 5),
      dummyLogger.emit(VirtualLogEntry, 7),
    ]);

    const withNewEvents = await dummyLogger.select().pipe(
      map(e => e.payload),
      take(5),
      toArray()
    ).toPromise();

    expect(withNewEvents).to.deep.equal([ ...pastEventsSource, 5, 7 ]);
  });

  it('should select filtered events', async function() {
    const pastEventsSource = [ 4, 7, 1, 6, 1, 10, 40, 63 ];
    const pastEvents = pastEventsSource.map((e, i) => new VirtualLogEntry(i, '', e));
    const config = [ setupConfig, { provide: PastEvents, useValue: pastEvents } ];
    const dummyLogger: VirtualEventLogger = ReflectiveInjector.resolveAndCreate(config).get(VirtualEventLogger);

    // TODO: Should test invalid values once implemented
    const configs = {
      farEnd: { end: 1000 },
      endOnly: { end: 5 },
      startOnly: { start: 3 },
      farStart: { start: 1000 },
      startAndEnd: { start: 1, end: 4 },
      filter: { filter: (e: AnyLogEntry) => !!(e.payload % 2) },
      filteredSegment: { filter: (e: AnyLogEntry) => e.payload < 7, start: 1, end: 30 },
    } as const;

    const result: { [ option: string ]: Observable<number[]> } = {};
    for (const option in configs) {
      // @ts-ignore
      const selector = dummyLogger.select<VirtualLogEntry>(configs[option]);
      result[option] = selector.pipe(
        map(e => e.payload),
        timeout(1000),
        bufferTime(0),
        take(1),
      );
    }

    try { await result.farStart?.toPromise(); } catch(e) { expect(e).to.be.instanceOf(Error); }
    expect(await result.farEnd?.toPromise()).to.deep.equal([ 4, 7, 1, 6, 1, 10, 40, 63 ]);
    expect(await result.endOnly?.toPromise()).to.deep.equal([ 4, 7, 1, 6, 1, 10 ]);
    expect(await result.startOnly?.toPromise()).to.deep.equal([ 6, 1, 10, 40, 63 ]);
    expect(await result.startAndEnd?.toPromise()).to.deep.equal([ 7, 1, 6, 1 ]);
    expect(await result.filter?.toPromise()).to.deep.equal([ 7, 1, 1, 63 ]);
    expect(await result.filteredSegment?.toPromise()).to.deep.equal([ 1, 6, 1 ]);
  });
});