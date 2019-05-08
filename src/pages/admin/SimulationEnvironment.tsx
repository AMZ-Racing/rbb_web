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
import { SimulationEnvironmentDetailed } from "client/api";
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import { GenericModelDetailPageProps } from "./GenericModelTablePage";
import BlockUi from 'react-block-ui';
import { toast } from 'react-toastify';
import { SimulationEnvironmentForm, SimulationEnvironmentFormValues } from "forms/SimulationEnvironmentForm";
import SimManager from "model/SimManager";
import { ModelError } from "../../client/api";

interface SimulationEnvironmentProps extends GenericModelDetailPageProps<SimulationEnvironmentDetailed> {}

interface SimulationEnvironmentState {
  saving: boolean;
}

export class SimulationEnvironmentPage extends React.Component<SimulationEnvironmentProps, SimulationEnvironmentState> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({ saving: false });
  }

  onUpdateModel = (values: SimulationEnvironmentFormValues):void => {
    const updatedModel = this.props.model;
    SimulationEnvironmentForm.formToModel(values, updatedModel);
    this.setState({ saving: true });
    SimManager.saveSimulationEnvironment(updatedModel).then((savedModel) => {
      toast.success("Simulation environment updated succesfully!");
      this.props.modelChanged(savedModel);
      this.setState({ saving: false });
    }).catch((reason) => {
      toast.error("An error occured while saving the simulation environment!");
      this.setState({ saving: false });
    });
  };

  onNewModel = (values: SimulationEnvironmentFormValues):void => {
    const newModel: SimulationEnvironmentDetailed = {
      detail_type: 'SimulationEnvironmentDetailed',
      name: '',
      module_name: '',
      config: {},
      example_config: ''
    };
    SimulationEnvironmentForm.formToModel(values, newModel);
    this.setState({ saving: true });
    SimManager.newSimulationEnvironment(newModel).then((savedModel) => {
      toast.success("Simulation environment created succesfully!");
      this.props.modelCreated(savedModel);
      this.props.parentProps.history.push(`/admin/simulation-environments/${savedModel.name}`);
    }).catch((reason) => {
      if (reason.status === 400) {
        reason.json().then((reason: ModelError) => {
          if (reason.code === 1000) {
            toast.error("Simulation environment already exists!");
          } else {
            toast.error(reason.message);
          }
        });

      } else {
        toast.error("An error occured while saving the simulation environment!");
      }
      this.setState({ saving: false });
    });
  };

  render() {
    if (this.props.newModel) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Creating simulation environment, please wait">
          <h1 className="rbb-Page__title">New Simulation Environment</h1>
          <h2 className="rbb-Page__subtitle">Create a new simulation environment</h2>

          <SimulationEnvironmentForm new={true} initialValues={ SimulationEnvironmentForm.emptyForm() } onSubmit={this.onNewModel} />
        </BlockUi>
      </React.Fragment>;
    } else if (this.props.model) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Saving simulation environment, please wait">
          <h1 className="rbb-Page__title">{this.props.model.name}</h1>
          <h2 className="rbb-Page__subtitle">Edit simulation environment</h2>

          <SimulationEnvironmentForm
              new={false}
              initialValues={ SimulationEnvironmentForm.modelToForm(this.props.model) }
              onSubmit={this.onUpdateModel} />
        </BlockUi>
      </React.Fragment>;
    } else {
      return <FoldingCubeSpinner />;
    }
  }
}
