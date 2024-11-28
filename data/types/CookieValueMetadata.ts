// CookieValueMetadata.ts

import { SameSite } from "../../types/SameSite";

export class CookieValueMetadata {
  private readonly _cookieName: string;
  private readonly _parameterIndex: number;
  private readonly _domain: string | undefined;
  private readonly _httpOnly: boolean | undefined;
  private readonly _maxAge: number | undefined;
  private readonly _path: string | undefined;
  private readonly _sameSite: SameSite | undefined;
  private readonly _secure: boolean | undefined;
  private readonly _expires: string | undefined;

  constructor(
    cookieName: string,
    parameterIndex: number,
    domain: string | undefined,
    httpOnly: boolean | undefined,
    maxAge: number | undefined,
    path: string | undefined,
    sameSite: SameSite | undefined,
    secure: boolean | undefined,
    expires: string | undefined
  ) {
    this._cookieName = cookieName;
    this._parameterIndex = parameterIndex;
    this._domain = domain;
    this._httpOnly = httpOnly;
    this._maxAge = maxAge;
    this._path = path;
    this._sameSite = sameSite;
    this._secure = secure;
    this._expires = expires;
  }

  get cookieName(): string {
    return this._cookieName;
  }

  get parameterIndex(): number {
    return this._parameterIndex;
  }

  get domain(): string | undefined {
    return this._domain;
  }

  get httpOnly(): boolean | undefined {
    return this._httpOnly;
  }

  get maxAge(): number | undefined {
    return this._maxAge;
  }

  get path(): string | undefined {
    return this._path;
  }

  get sameSite(): SameSite | undefined {
    return this._sameSite;
  }

  get secure(): boolean | undefined {
    return this._secure;
  }

  get expires(): string | undefined {
    return this._expires;
  }
}
