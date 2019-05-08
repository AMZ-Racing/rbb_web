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
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/shell/shell';

interface ScriptEditorModalProps {
  caption: string;
  script: string;
  open: boolean;
  onCloseModal: () => void;
  onSubmit: (script: string) => void;
}

export default class ScriptEditorModal extends React.Component<ScriptEditorModalProps, {}> {

  currentScript: string;

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = {} ;

    this.currentScript = this.props.script;
  }

  componentWillReceiveProps(nextProps: ScriptEditorModalProps, nextContext: any) {
    this.currentScript = nextProps.script;
  }

  cancelClick = (e:any): void => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onCloseModal();
  };

  submitClick = (e:any): void => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onSubmit(this.currentScript);
  };

  render() {
    return <Modal classNames={{ modal: "rbb-GenericModel col-xl-8 col-lg-10 col-md-12 col-sm-12" }}
                  open={this.props.open} onClose={this.props.onCloseModal}>
      <ModalHeader title={"Script Editor"}/>
      <h4>{this.props.caption}</h4>
      <form className="rbb-Form">
        <div className="form-group">
          <CodeMirror
            className=""
            value={this.props.script}
            onChange={(editor, data, value) => {
              this.currentScript = value;
            }}
            options={{
              mode: 'shell',
              theme: 'material',
              lineNumbers: true,
              autofocus: true
            }}
        />
        </div>
        <div className="form-buttons">
          <button className="btn btn-success" onClick={this.submitClick} type="submit">Keep</button>
          <button className="btn btn-secondary" onClick={this.cancelClick} type="submit">Discard</button>
        </div>
      </form>
    </Modal>;
  }
}
