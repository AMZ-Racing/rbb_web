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
import { BagExtractionConfiguration, ModelError } from "client/api";
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import { GenericModelDetailPageProps } from "./GenericModelTablePage";
import BlockUi from 'react-block-ui';
import { toast } from 'react-toastify';
import BagManager from "model/BagManager";
import { ExtractionConfigForm, ExtractionConfigFormValues } from "forms/ExtractionConfigForm";

interface ExtractionConfigProps extends GenericModelDetailPageProps<BagExtractionConfiguration> {}

interface ExtractionConfigState {
  saving: boolean;
}

export class ExtractionConfigurationPage extends React.Component<ExtractionConfigProps, ExtractionConfigState> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({ saving: false });
  }

  onUpdateModel = (values: ExtractionConfigFormValues):void => {
    const updatedModel = this.props.model;
    ExtractionConfigForm.formToModel(values, updatedModel);
    this.setState({ saving: true });
    BagManager.saveBagExtractionConfiguration(updatedModel).then((savedModel) => {
      toast.success("Configuration updated succesfully!");
      this.props.modelChanged(savedModel);
      this.setState({ saving: false });
    }).catch((reason) => {
      toast.error("An error occured while saving the Configuration!");
      this.setState({ saving: false });
    });
  };

  onNewModel = (values: ExtractionConfigFormValues):void => {
    const newModel: BagExtractionConfiguration = {
      name: '',
      type: '',
      config: {},
      description: ''
    };
    ExtractionConfigForm.formToModel(values, newModel);
    this.setState({ saving: true });
    BagManager.newBagExtractionConfiguration(newModel).then((savedModel) => {
      toast.success("Configuration created succesfully!");
      this.props.modelCreated(savedModel);
      this.props.parentProps.history.push(`/admin/extraction-configurations/${savedModel.name}`);
    }).catch((reason) => {
      if (reason.status === 400) {
        reason.json().then((reason: ModelError) => {
          if (reason.code === 1000) {
            toast.error("Extraction configuration already exists!");
          } else {
            toast.error(reason.message);
          }
        });

      } else {
        toast.error("An error occured while saving the configuration!");
      }
      this.setState({ saving: false });
    });
  };

  render() {
    if (this.props.newModel) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Creating configuration, please wait">
          <h1 className="rbb-Page__title">New Bag Extraction Configuration</h1>
          <h2 className="rbb-Page__subtitle">Create a new bag extraction configuration</h2>

          <ExtractionConfigForm new={true} initialValues={ ExtractionConfigForm.emptyForm() } onSubmit={this.onNewModel} />
        </BlockUi>
      </React.Fragment>;
    } else if (this.props.model) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Saving configuration, please wait">
          <h1 className="rbb-Page__title">{this.props.model.name}</h1>
          <h2 className="rbb-Page__subtitle">Edit bag extraction configuration</h2>

          <ExtractionConfigForm new={false} initialValues={ ExtractionConfigForm.modelToForm(this.props.model) } onSubmit={this.onUpdateModel} />
        </BlockUi>
      </React.Fragment>;
    } else {
      return <FoldingCubeSpinner />;
    }
  }
}
