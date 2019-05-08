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
import { FileStore } from "client/api";
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import { GenericModelDetailPageProps } from "./GenericModelTablePage";
import BlockUi from 'react-block-ui';
import { toast } from 'react-toastify';
import { FileStoreForm, FileStoreFormValues } from "forms/FileStoreForm";
import FileStoreManager from "model/FileStoreManager";
import ApiHelper from "client/ApiHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ModelError } from "../../client/api";

interface FileStoreProps extends GenericModelDetailPageProps<FileStore> {}

interface FileStoreState {
  saving: boolean;
}

export class FileStorePage extends React.Component<FileStoreProps, FileStoreState> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({ saving: false });
  }

  onUpdateModel = (values: FileStoreFormValues):void => {
    const updatedModel = this.props.model;
    FileStoreForm.formToModel(values, updatedModel);
    this.setState({ saving: true });
    FileStoreManager.saveFileStore(updatedModel).then((savedModel) => {
      toast.success("File store updated succesfully!");
      this.props.modelChanged(savedModel);
      this.setState({ saving: false });
    }).catch((reason) => {
      toast.error("An error occured while saving the file store!");
      this.setState({ saving: false });
    });
  };

  onNewModel = (values: FileStoreFormValues):void => {
    const newModel: FileStore = {
      name: '',
      store_type: '',
      store_data: {},
      created: new Date()
    };
    FileStoreForm.formToModel(values, newModel);
    this.setState({ saving: true });
    FileStoreManager.newFileStore(newModel).then((savedModel) => {
      toast.success("File store created succesfully!");
      this.props.modelCreated(savedModel);
      this.props.parentProps.history.push(`/admin/file-stores/${savedModel.name}`);
    }).catch((reason) => {
      if (reason.status === 400) {
        reason.json().then((reason: ModelError) => {
          if (reason.code === 1000) {
            toast.error("File store already exists!");
          } else {
            toast.error(reason.message);
          }
        });

      } else {
        toast.error("An error occured while saving the file store!");
      }
      this.setState({ saving: false });
    });
  };

  render() {
    if (this.props.newModel) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Creating file store, please wait">
          <h1 className="rbb-Page__title">New File Store</h1>
          <h2 className="rbb-Page__subtitle">Create a new file store</h2>

          <FileStoreForm new={true} initialValues={ FileStoreForm.emptyForm() } onSubmit={this.onNewModel} />
        </BlockUi>
      </React.Fragment>;
    } else if (this.props.model) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Saving file store, please wait">
          <h1 className="rbb-Page__title">{this.props.model.name}</h1>
          <h2 className="rbb-Page__subtitle">Edit file store</h2>

          <div className="rbb-TopButtons">
            <a target={"blank"} href={ApiHelper.fileStoreAuthorizationLink(this.props.model.name)} className="btn btn-info btn-sm">
              <FontAwesomeIcon icon={['fas','external-link-alt']} /> Authorize</a>
          </div>

          <FileStoreForm new={false} initialValues={ FileStoreForm.modelToForm(this.props.model) } onSubmit={this.onUpdateModel} />
        </BlockUi>
      </React.Fragment>;
    } else {
      return <FoldingCubeSpinner />;
    }
  }
}
