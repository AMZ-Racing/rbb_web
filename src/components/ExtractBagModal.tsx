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
import Modal from 'react-responsive-modal';
import ModalHeader from 'templates/ModalHeader';
import { BagExtractionConfiguration } from "client/api";
import BagManager from "model/BagManager";
import FoldingCubeSpinner from "./FoldingCubeSpinner";


export default class ExtractBagModal extends React.Component<
    {open: boolean, onCloseModal: () => void, onSubmit: (configuration: BagExtractionConfiguration) => void},
    {configurations: BagExtractionConfiguration[]}> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { configurations: null } ;
    BagManager.getExtractionConfigurations().then((configurations) => {
      this.setState({ configurations });
    });
  }

  cancelClick = (e:any): void => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onCloseModal();
  };

  configClick(config: BagExtractionConfiguration, e: any) {
    e.stopPropagation();
    e.preventDefault();
    this.props.onSubmit(config);
  }

  renderList() {
    if (this.state.configurations) {
      return <div className="rbb-BagStoreList list-group">
        { this.state.configurations.map((config) => {
          return <a key={config.name}
                    onClick={this.configClick.bind(this, config)}
                    className="list-group-item list-group-item-action flex-column align-items-start">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">{config.name}</h5>
            </div>
            <p className="mb-1">{config.description}</p>
          </a>;
        })}
      </div>;
    } else {
      return <FoldingCubeSpinner/>;
    }
  }

  render() {
    return <Modal classNames={{ modal: "rbb-ExtractBag" }} open={this.props.open} onClose={this.props.onCloseModal}>
      <ModalHeader title={"Queue Bag Extraction"}/>
      <h4>Select a configuration from the list</h4>
      {this.renderList()}

      <div className="rbb-ExtractBag__buttons">
        <button className="btn btn-secondary" onClick={this.cancelClick} type="submit">Cancel</button>
      </div>
    </Modal>;
  }
}
