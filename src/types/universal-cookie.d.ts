// From https://github.com/S64/types-universal-cookie/blob/master/Cookies.d.ts

declare module 'universal-cookie' {
  export interface CookiesHook {
    onSet<T>(name: string, value: T | null | undefined, options?: CookieOptions): void;
    onRemove(name: string, options?: CookieOptions): void;
  }

  export interface CookieOptions {
    path?: string,
    expires?: Date,
    maxAge?: number,
    domain?: string,
    secure?: boolean,
    httpOnly?: boolean,
  }

  export interface CookieParseOptions {
    doNotParse?: boolean
  }

  export default class Cookies {
    constructor(cookieHeader?: string | object | null, hooks?: CookiesHook[]);
    get<T>(name: string, options?: CookieOptions): T | null | undefined;
    set<T>(name: string, value: T | null | undefined, options?: CookieOptions): void;
    remove(name: string, options?: CookieOptions): void;
    parseCookies(cookies?: string | object | null): Map<any, any>;
    isParsingCookie(value: string | null | undefined, doNotParse: boolean | null | undefined): boolean;
    readCookie<T>(value: string | null | undefined, options?: CookieParseOptions): T | null | undefined;
  }
}
