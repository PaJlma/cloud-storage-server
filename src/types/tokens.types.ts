export interface ITokens {
  access: string;
  refresh: string;
}

export interface IAccessToken {
  access: string;
}

export interface ITokenPayload {
  sub: string;
}
