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
import BagManager from "model/BagManager";
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import MainPage from "templates/MainPage";
import MainHeader from "templates/MainHeader";
import SideColumn from "templates/SideColumn";
import Content from "templates/Content";
import { BagStoreDetailed } from "client/api";
import BagStoreList from "components/BagStoreList";

export default class BagStores extends React.Component<any, { stores: BagStoreDetailed[], loaded: boolean } > {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { loaded: false, stores: [] };
    BagManager.getBagStores().then((stores) => this.setState({ stores, loaded: true }));
  }

  renderContent() {
    if (this.state.loaded) {
      return <div className="rbb-BagStores">
        <h1>Bag Stores</h1>
        <BagStoreList stores={this.state.stores} />
      </div>;
    }

    return <FoldingCubeSpinner />;
  }

  render() {
    return <MainPage header={<MainHeader subMenu="" />}>
      <Content leftColumn={<SideColumn/>}>
        {this.renderContent()}
      </Content>
    </MainPage>;
  }
}
