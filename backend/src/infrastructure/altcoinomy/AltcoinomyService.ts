import Axios, { AxiosInstance } from "axios";
import { Injectable, Inject } from "injection-js";
import { ApiUrl, Username, Password, IcoIdMAID } from "./models/AltcoinomyConfig";
import { AltcoinomySubscription } from "./models/AltcoinomySubscription";

@Injectable()
export class AltcoinomyService {

  private readonly api: AxiosInstance;
  private auth_token = '';

  constructor(
    @Inject(ApiUrl) readonly apiUrl: string,
    @Inject(Username) readonly username: string,
    @Inject(Password) readonly password: string,
    @Inject(IcoIdMAID) readonly icoId: string,
  ) {
    this.api = Axios.create({
      baseURL: apiUrl,
      timeout: 120000,
    });

    this.api.interceptors.response.use(response => {
      return response;
    }, async error => {
      if (!error.response) {
        throw error;
      }

      if (error.response.status !== 401) {
        throw error;
      }

      // Can't log in
      if (error.config.url == '/v1/auth_token') {
        throw error;
      }

      const token = await this.authorize();

      const config = error.config;
      config.headers['Authorization'] = `Bearer ${token}`;

      return this.api.request(config);
    });
  }

  public async authorize() {
    const data = {
      username: this.username,
      password: this.password,
    }

    this.auth_token = (await this.api.post('/v1/auth_token', data)).data.token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${this.auth_token}`;
    return this.auth_token;
  }

  public async refreshToken() {
    this.auth_token = (await this.api.get('/v1/refresh-token')).data.token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${this.auth_token}`;
    return this.auth_token;
  }

  public async subscriptions(): Promise < {
    id: string
  } [] > {
    return (await this.api.get(`/v1/icos/${this.icoId}/subscriptions`)).data;
  }

  public async subscription(subscriptionId: string): Promise < AltcoinomySubscription > {
    return (await this.api.get(`/v1/subscriptions/${subscriptionId}/fill-status`)).data;
  }
}