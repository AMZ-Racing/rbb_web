/*
 * AMZ-Driverless
 * Copyright (c) 2019 Authors:
 *   - Huub Hendrikx <hhendrik@ethz.ch>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { BasicApi, User } from "./api";
import Cookies, { CookieOptions } from 'universal-cookie';
import * as BazaarClient from 'client/api';
import * as assign from "core-js/library/fn/object/assign";
import * as isomorphicFetch from "isomorphic-fetch";
import Config from "Config";

const cookies = new Cookies();

export enum Permissions {
  Admin = "admin"
}

export default class ApiHelper {

  private static cachedUser : User = null;

  private static getCookieOptions(remember: boolean = false) : CookieOptions {
    return {
      httpOnly: false,
      secure: Config.API_SECURE,
      path: "/",
      domain: Config.API_TOKEN_COOKIE_DOMAIN,
      ...(remember && { maxAge: 30 * 24 * 3600 })
    };
  }

  public static clearCachedUser() {
    this.cachedUser = null;
  }

  public static getUser() : Promise<User> {
    if (!this.isAutenticated()) {
      return Promise.resolve(null);
    }

    if (this.cachedUser) {
      return Promise.resolve(this.cachedUser);
    } else {
      return this.getBasicApi().getCurrentUser().then((user) => {
        ApiHelper.cachedUser = user;
        return user;
      });
    }
  }

  public static userHasPermission(user: User, permission: Permissions) {
    for (const perm of user.permissions) {
      if (perm.identifier === permission && perm.granted) {
        return true;
      }
    }

    return false;
  }

  public static fetchFileContents(url: string) : Promise<Response>  {
    const authFetch = this.authenticatedFetch();
    return authFetch(url + "?no_redirect=true", {}).then((response) => {
      if (response.status === 213) {
        return response.text().then((redirectUrl) => {
          return fetch(redirectUrl, {});
        });
      } else {
        return response;
      }
    });
  }

  private static getToken(): string {
    const cookie = cookies.get<string>(Config.API_TOKEN_COOKIE, this.getCookieOptions());
    if (cookie) {
      return cookie.valueOf();
    } else {
      return "";
    }
  }

  private static setToken(token: string, remember: boolean = false) {
    const current = new Date();
    cookies.set(Config.API_TOKEN_COOKIE, token, this.getCookieOptions(remember));
  }

  private static getFetchWithUsernamePassword(username: string, password: string): BazaarClient.FetchAPI {
    const auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
    return function (url: string, init?: any): Promise<any> {
      init.headers = assign({}, { Authorization: auth }, init.headers);
      return isomorphicFetch(url, init);
    };
  }

  private static getFetchWithToken() {
    const auth = 'Bearer ' + this.getToken();
    return function (url: string, init?: any): Promise<Response> {
      init.headers = assign({}, { Authorization: auth }, init.headers);
      return isomorphicFetch(url, init);
    };
  }

  public static authenticatedFetch() {
    return this.getFetchWithToken();
  }

  public static destroySession(): void {
    this.clearCachedUser();
    cookies.set(Config.API_TOKEN_COOKIE, "", this.getCookieOptions());
  }

  public static isAutenticated(): boolean {
    return this.getToken() !== "";
  }

  public static authenticate(username: string, password: string, remember: boolean = false) {
    const api = new BazaarClient.BasicApi({}, Config.API_PATH, this.getFetchWithUsernamePassword(username, password));

    const validFor = remember ? 30 * 24 * 3600 : 24 * 3600;

    return api.newSession(validFor).then((session) => {
      this.setToken(session.token, remember);
      return true;
    }).catch((response) => {
      if (response.status === 401) {
        return false;
      }
      throw response;
    });
  }

  public static getBasicApi(): BasicApi {
    return new BazaarClient.BasicApi({}, Config.API_PATH, this.getFetchWithToken());
  }

  public static bagDownloadLink(bagName: string, storeName: string): string {
    const link = "/stores/" + encodeURIComponent(storeName) + "/bags/" + encodeURIComponent(bagName);
    return Config.API_PATH + link;
  }

  public static fileStoreAuthorizationLink(storeName: string): string {
    const link = "/file-storage/" + encodeURIComponent(storeName) + "/authorize/0";
    return Config.API_PATH + link;
  }

  public static bagStoreAuthorizationLink(storeName: string): string {
    const link = "/stores/" + encodeURIComponent(storeName) + "/authorize/0";
    return Config.API_PATH + link;
  }
}
