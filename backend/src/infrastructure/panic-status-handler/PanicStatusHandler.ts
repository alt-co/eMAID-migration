import { PanicHandler } from "services/PanicHandler";
import Axios, { AxiosInstance } from "axios";
import { Inject, Injectable } from "injection-js";
import { ApiUrl, ApiToken } from "./models/PanicStatusConifig";
import { PanicStatus } from "models/PanicStatus";

@Injectable()
export class PanicStatusHandler extends PanicHandler {
  private api: AxiosInstance;

  constructor(
    @Inject(ApiUrl) protected readonly apiUrl: string,
    @Inject(ApiToken) protected readonly apiToken: string,
  ) {
    super();

    this.api = Axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      timeout: 120000,
    });

  }

  public async isPanicOn(): Promise<boolean> {
    try {
      const panicStatus: PanicStatus = (await this.api.post('/')).data;

      if (!panicStatus) {
        return false;
      }
  
      if (!panicStatus.statusSet) {
        return false;
      }
  
      return panicStatus.status;
    } catch {
      return false;
    }
  }
}
