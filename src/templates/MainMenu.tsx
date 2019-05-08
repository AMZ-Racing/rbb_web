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
import { Link, Route, Switch } from "react-router-dom";
import { RouteProps } from "react-router";
import { User } from "../client/api";
import ApiHelper, { Permissions } from "../client/ApiHelper";

export interface MenuButtonProps {
  caption: string;
  path: string;
}

function ActiveMenuButton(props: MenuButtonProps) {
  return (
      <li className="nav-item active">
        <Link to={props.path} className="nav-link">{props.caption}</Link>
      </li>
  );
}

function InactiveMenuButton(props: MenuButtonProps) {
  return (
      <li className="nav-item">
        <Link to={props.path} className="nav-link">{props.caption}</Link>
      </li>
  );
}

export function MenuButton(props: MenuButtonProps) {
  return (
      <Switch>
        <Route path={props.path} component={(routeProps: RouteProps) => {
          return ActiveMenuButton(props);
        }}/>
        <Route component={(routeProps: RouteProps) => {
          return InactiveMenuButton(props);
        }}/>
      </Switch>);
}

export default class MainMenu extends React.Component<any, { user: User }> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { user: null };
    ApiHelper.getUser().then((user) => this.setState({ user }));
  }

  renderAdmin() {
    if (this.state.user && ApiHelper.userHasPermission(this.state.user, Permissions.Admin)) {
      return <MenuButton caption="Admin" path="/admin"/>;
    } else {
      return "";
    }
  }

  render() {
    return (
        <nav className="rbb-MainMenu navbar navbar-expand-md">
          <button className="navbar-toggler navbar-light" type="button" data-toggle="collapse" data-target="#navbarToggler"
                  aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle main menu">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarToggler">
            <ul className="nav navbar-nav">
              <MenuButton caption="Bags" path="/bags"/>
              <MenuButton caption="Simulation" path="/simulations"/>
              <MenuButton caption="Queue" path="/queue"/>
              {this.renderAdmin()}
            </ul>
          </div>
        </nav>
    );
  }
}
