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
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Index from "pages/Index";
import NotFound from "pages/NotFound";
import Queue from "pages/Queue";
import Simulation from "pages/Simulations";
import Login from "pages/Login";
import Logout from "pages/Logout";
import BagStores from "pages/BagStores";
import BagStoreContent from "pages/BagStoreContent";
import Always from "templates/Always";
import 'bootstrap';
import 'style.scss';
import Admin from "pages/admin/Admin";
import UsersPage from "pages/admin/Users";
import { BagStoreAdminPage } from "pages/admin/BagStores";
import { FileStoreAdminPage } from "pages/admin/FileStores";
import { ExtractionConfigurationAdminPage } from "pages/admin/ExtractionConfigs";
import { SimEnvAdminPage } from "pages/admin/SimulationEnvironments";
import { MyAccountPage } from "pages/MyAccount";

ReactDOM.render(
    <React.Fragment>
      <Always/>
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <Route>
              <Switch>
                <Route exact path="/" component={Index} />
                <Route exact path="/bags" component={BagStores} />
                <Route path="/bags/:store/:bag?" component={BagStoreContent} />
                <Route path="/simulations/:sim_identifier?" component={Simulation} />
                <Route path="/queue" component={Queue} />
                <Route path="/my-account" component={MyAccountPage} />
                <Route path="/admin/users/:identifier?" component={UsersPage} />
                <Route path="/admin/bag-stores/:identifier?" component={BagStoreAdminPage} />
                <Route path="/admin/file-stores/:identifier?" component={FileStoreAdminPage} />
                <Route path="/admin/extraction-configurations/:identifier?" component={ExtractionConfigurationAdminPage} />
                <Route path="/admin/simulation-environments/:identifier?" component={SimEnvAdminPage} />
                <Route path="/admin" component={Admin} />
                <Route component={NotFound} />
              </Switch>
          </Route>
        </Switch>
      </Router>
    </React.Fragment>, document.getElementById('app'));
