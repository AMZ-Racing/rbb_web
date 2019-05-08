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

import ApiHelper from "client/ApiHelper";
import { User } from "client/api";

export default class UserManager {
  public static getUsers() {
    const api = ApiHelper.getBasicApi();
    return api.listUserAccounts();
  }

  public static getUser(user_alias: string) {
    const api = ApiHelper.getBasicApi();
    return api.getUserAccount(user_alias);
  }

  public static saveUser(user: User) {
    const api = ApiHelper.getBasicApi();
    return api.putUserAccount(user.alias, user);
  }

  public static newUser(user: User) {
    const api = ApiHelper.getBasicApi();
    return api.putUserAccount(user.alias, user, true);
  }

  public static deleteUser(user: User) {
    const api = ApiHelper.getBasicApi();
    return api.deleteUserAccount(user.alias);
  }

  public static getMyAccount() {
    const api = ApiHelper.getBasicApi();
    return api.getCurrentUser();
  }

  public static saveMyAccount(user: User) {
    const api = ApiHelper.getBasicApi();
    return api.putCurrentUser(user);
  }
}
