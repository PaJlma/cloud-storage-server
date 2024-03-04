export interface IConfig {
  port: number;
  mongoUri: string;
  accessSecret: string;
  refreshSecret: string;
}

export interface GetConfigReturns {
  app: IConfig;
}

export type GetConfig = () => GetConfigReturns;
