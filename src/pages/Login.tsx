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

import * as React from 'react';
import ApiHelper from "client/ApiHelper";
import Config from "Config";

export default class Login extends React.Component<{ match: any, location: any, history: any }, { error: string, waiting: boolean }> {

  usernameInput: HTMLInputElement;
  passwordInput: HTMLInputElement;
  rememberMeInput: HTMLInputElement;

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { error: "", waiting: false };
    this.usernameInput = null;
    this.passwordInput = null;
  }

  private handleLogin(e: any): any {
    const username = this.usernameInput.value;
    const password = this.passwordInput.value;
    const rememberMe = this.rememberMeInput.checked;

    e.preventDefault();

    if (!username || !password) {
      this.setState({ error: "Please provide username and password!" });
      return false;
    }

    this.setState({ waiting: true });

    ApiHelper.authenticate(username, password, rememberMe).then((success) => {
      if (success) {
        this.props.history.push("/");
      } else {
        this.setState({ error: "Authentication failed!", waiting: false });
      }
    }).catch((response) => {
      this.setState({ error: "API Failure, please contact administrator!", waiting: false });
    });

    return false;
  }

  private getTopMessage() {
    if (this.state.error) {
      return <h2 className="error-message">{this.state.error}</h2>;
    } else {
      return <h2>Please login to continue.</h2>;
    }
  }

  render() {

    const buttonText = this.state.waiting ? "Authenticating..." : "Login";

    return (
        <div>
          <div className="login-background"></div>
          <div className="login-box">
            <div className="login-header">
              <h1>RBB Web</h1>
              {this.getTopMessage()}
            </div>
            <form onSubmit={this.handleLogin.bind(this)}>
              <input className="textbox" autoFocus type="text" placeholder="Username" ref={(input) => this.usernameInput = input}></input>
              <input className="textbox" type="password" placeholder="Password" ref={(input) => this.passwordInput = input}></input>
              <input type="checkbox" id="remember-me" ref={(input) => this.rememberMeInput = input}></input><label htmlFor="remember-me">Remember me
              on this computer</label>
              <button type="submit">{buttonText}</button>
            </form>

            <div className="version-string">{Config.VERSION_STRING}</div>

          </div>
        </div>
    );
  }
}
