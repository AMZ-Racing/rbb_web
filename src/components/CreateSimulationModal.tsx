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
import Select from 'react-select';
import Modal from 'react-responsive-modal';
import ModalHeader from 'templates/ModalHeader';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/yaml/yaml';
import { SimulationEnvironmentDetailed, SimulationEnvironmentSummary } from "client/api";
import SimManager from "../model/SimManager";
import yaml from "js-yaml";
import { toast } from 'react-toastify';

export interface SimulationRequest {
  description: string;
  environmentName: string;
  configuration: any;
  onTop: boolean;
}

export default class CreateSimulationModal extends React.Component<
    {open: boolean, onCloseModal: () => void, onSubmit: (request: SimulationRequest) => void},
    {environments: SimulationEnvironmentSummary[],
      environment: SimulationEnvironmentDetailed,
      selectedEnvironment: string,
      configuration: string,
      description: string}> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { environments: null, environment: null, selectedEnvironment: null, configuration: "", description: "" } ;
    SimManager.getSimulationEnvironments().then((environments) => {
      this.setState({ environments });
    });
  }

  componentDidMount() {

  }

  cancelClick = (e:any): void => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onCloseModal();
  };

  submitClick = (e:any): void => {
    e.preventDefault();
    e.stopPropagation();

    let config = {};
    try {
      config = yaml.safeLoad(this.state.configuration);
    } catch (e) {
      toast.error("Invalid YAML in simulation configuration.");
      console.log(e);
      return;
    }

    this.props.onSubmit({
      description: this.state.description ? this.state.description : "Web submission",
      environmentName: this.state.selectedEnvironment,
      configuration: config,
      onTop: false
    });
  };

  exampleClick = (e:any): void => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.environment) {
      this.setState({
        configuration: this.state.environment.example_config
      });
    }
  };

  descriptionChange = (e:any): void => {
    this.setState({ description: e.target.value });
  };

  environmentChange = (newValue:any): void => {
    this.setState({ selectedEnvironment: newValue.value });
    SimManager.getSimulationEnvironment(newValue.value).then((env) => {
      if (!this.state.environment || this.state.configuration === this.state.environment.example_config) {
        this.setState({
          configuration: env.example_config,
          environment: env
        });
      } else {
        this.setState({
          environment: env
        });
      }
    });
  };

  render() {
    return <Modal classNames={{ modal: "rbb-CreateSimulation" }} open={this.props.open} onClose={this.props.onCloseModal}>
      <ModalHeader title={"Create Simulation"}/>
      {/*<h4>Fill out the form below</h4>*/}
      <form className="rbb-Form">
        <div className="form-group">
          <label htmlFor="simulationDescription">Description</label>
          <input
              autoFocus
              className="form-control"
              placeholder={"Web submission"}
              id={"simulationDescription"}
              value={this.state.description}
              onChange={this.descriptionChange} />
        </div>
        <div className="form-group">
          <label htmlFor="simulationEnvironment">Simulation environment</label>
          <Select
              clearable={false}
              id="simulationEnvironment"
              value={{ value: this.state.selectedEnvironment, label: this.state.selectedEnvironment }}
              onChange={this.environmentChange}
              isLoading={!this.state.environments}
              options={this.state.environments ? this.state.environments.map((e) => { return { value: e.name, label: e.name };}) : []}
          />
          <small className="form-text text-muted">Simulations environments can be added with <em>rbb_tools</em>.</small>
        </div>
        <div className="form-group">
          <label htmlFor="simulationConfig">Configuration parameters</label>
          <CodeMirror
            className=""
            value={this.state.configuration}
            options={{
              mode: 'yaml',
              theme: 'material',
              lineNumbers: true,
              lineWrapping: true,
              readOnly: !this.state.selectedEnvironment
            }}
            onBeforeChange={(editor, data, value) => {
            this.setState({ configuration: value });
            }}
            onChange={(editor, data, value) => {}}
        />
          <small className="form-text text-muted">Click <a href="#" onClick={this.exampleClick}>here</a> for the example configuration.</small>
        </div>
        <div className="form-group">
          <div className="form-check">
              <label className="rbb-Form__cb-label" htmlFor="queueAtTop">
                <input className="rbb-Form__cb" type="checkbox" id="queueAtTop" /> High priority (put at top of queue)</label>
          </div>
        </div>
        <div className="form-buttons">
          <button className="btn btn-success" onClick={this.submitClick} type="submit">Submit</button>
          <button className="btn btn-secondary" onClick={this.cancelClick} type="submit">Cancel</button>
        </div>
      </form>
    </Modal>;
  }
}
