import { Injectable } from 'injection-js';
import { EventLogger } from 'services/EventLogger';
import { CustomerStore } from './CustomerStore';

@Injectable()
export class MintStore extends CustomerStore {
  sourceSuffix = 'mint';
  eventType = 'TokenMintingRequested';

  constructor(eventLogger: EventLogger) {
    super(eventLogger);
  }
}