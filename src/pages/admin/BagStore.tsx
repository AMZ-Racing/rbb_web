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
import { BagStoreDetailed } from "client/api";
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import { GenericModelDetailPageProps } from "pages/admin/GenericModelTablePage";
import BlockUi from 'react-block-ui';
import { toast } from 'react-toastify';
import { BagStoreForm, BagStoreFormValues } from "forms/BagStoreForm";
import BagManager, { BagStoreWithExtractionConfig } from "model/BagManager";
import ApiHelper from "client/ApiHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ModelError } from "../../client/api";

interface BagStoreProps extends GenericModelDetailPageProps<BagStoreWithExtractionConfig> {}

interface BagStoreState {
  saving: boolean;
}

export class BagStorePage extends React.Component<BagStoreProps, BagStoreState> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({ saving: false });
  }

  onUpdateModel = (values: BagStoreFormValues):void => {
    const updatedModel = this.props.model;
    BagStoreForm.formToModel(values, updatedModel);
    this.setState({ saving: true });
    BagManager.saveBagStoreWithExtractionConfig(updatedModel).then((savedModel) => {
      toast.success("Bag store updated succesfully!");
      this.props.modelChanged(savedModel);
      this.setState({ saving: false });
    }).catch((reason) => {
      toast.error("An error occured while saving the bag store!");
      this.setState({ saving: false });
    });
  };

  onNewModel = (values: BagStoreFormValues):void => {
    const newModel: BagStoreWithExtractionConfig = {
      detail_type: 'BagStoreDetailed',
      name: '',
      store_type: '',
      store_data: {},
      created: new Date(),
      description: '',
      default_file_store: '',
      extractionConfigs: []
    };
    BagStoreForm.formToModel(values, newModel);
    this.setState({ saving: true });
    BagManager.saveBagStoreWithExtractionConfig(newModel, true).then((savedModel) => {
      toast.success("Bag store created succesfully!");
      this.props.modelCreated(savedModel);
      this.props.parentProps.history.push(`/admin/bag-stores/${savedModel.name}`);
    }).catch((reason) => {
      if (reason.status === 400) {
        reason.json().then((reason: ModelError) => {
          if (reason.code === 1000) {
            toast.error("Bag store already exists!");
          } else {
            toast.error(reason.message);
          }
        });

      } else {
        toast.error("An error occured while saving the bag store!");
      }
      this.setState({ saving: false });
    });
  };

  render() {
    if (this.props.newModel) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Creating bag store, please wait">
          <h1 className="rbb-Page__title">New Bag Store</h1>
          <h2 className="rbb-Page__subtitle">Create a new bag store</h2>

          <BagStoreForm new={true} initialValues={ BagStoreForm.emptyForm() } onSubmit={this.onNewModel} />
        </BlockUi>
      </React.Fragment>;
    } else if (this.props.model) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Saving bag store, please wait">
          <h1 className="rbb-Page__title">{this.props.model.name}</h1>
          <h2 className="rbb-Page__subtitle">Edit bag store</h2>

          <div className="rbb-TopButtons">
            <a target={"blank"} href={ApiHelper.bagStoreAuthorizationLink(this.props.model.name)} className="btn btn-info btn-sm">
              <FontAwesomeIcon icon={['fas','external-link-alt']} /> Authorize</a>
          </div>

          <BagStoreForm new={false} initialValues={ BagStoreForm.modelToForm(this.props.model) } onSubmit={this.onUpdateModel} />
        </BlockUi>
      </React.Fragment>;
    } else {
      return <FoldingCubeSpinner />;
    }
  }
}
