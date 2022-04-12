export abstract class PanicHandler {
  public abstract isPanicOn(): Promise<boolean>;
}