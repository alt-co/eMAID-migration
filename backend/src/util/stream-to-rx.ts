import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export function streamToObservable(
  stream: NodeJS.ReadableStream,
  pauser?: Observable<boolean>
): Observable<any> {
  return new Observable<any>(subscriber => {
    const endHandler = () => subscriber.complete();
    const errorHandler = (e: Error) => subscriber.error(e);
    const dataHandler = (data: any) => subscriber.next(data);

    stream.addListener('end', endHandler);
    stream.addListener('close', endHandler);
    stream.addListener('error', errorHandler);
    stream.addListener('data', dataHandler);

    let pauseSubscription: Subscription;
    if (pauser) {
      pauseSubscription = pauser.pipe(distinctUntilChanged())
        .subscribe(pause => pause ? stream.pause() : stream.resume());
    }

    return () => {
      stream.removeListener('end', endHandler);
      stream.removeListener('close', endHandler);
      stream.removeListener('error', errorHandler);
      stream.removeListener('data', dataHandler);

      if (pauser) {
        pauseSubscription.unsubscribe();
      }
    };
  });
}