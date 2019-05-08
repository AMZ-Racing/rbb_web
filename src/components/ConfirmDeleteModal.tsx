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

export default class ConfirmDeleteModal extends React.Component<
    {open: boolean, title: string, children?: any, onCancel: () => void, onDelete: () => void},
    {}> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = {} ;
  }

  cancelClick = (e:any): void => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onCancel();
  };

  deleteClick = (e:any): void => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onDelete();
  };

  render() {
    return <Modal classNames={{ modal: "rbb-ConfirmDeleteModal" }} open={this.props.open} onClose={this.props.onCancel}>
      <ModalHeader title={this.props.title}/>
      {this.props.children}

      <div className="rbb-ConfirmDeleteModal__buttons">
        <button className="btn btn-danger" onClick={this.deleteClick} type="submit">Delete</button>
        <button className="btn btn-secondary" onClick={this.cancelClick} type="submit">Cancel</button>
      </div>
    </Modal>;
  }
}
