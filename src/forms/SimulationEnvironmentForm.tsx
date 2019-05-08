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
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { FormikProps } from "formik/dist/types";
import { FieldError, hasError, JsonEditorInput, SelectField, YamlEditorInput } from "forms/FormHelpers";
import * as yaml from 'js-yaml';
import BagManager from "../model/BagManager";
import BashScriptEditModal from "../components/ScriptEditorModal";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export class SimulationEnvironmentFormValues {
  name: string;
  moduleName: string;
  rosbagStore: string;
  config: string;
  exampleConfig: string;
}

const SimulationEnvironmentFormValuesValidationSchemaFields = {
  name: Yup.string().required("Name is required!").max(100).matches(/^[a-z0-9.-]+$/),
  moduleName: Yup.string().required("Module name is required!").max(200),
  rosbagStore: Yup.string().required("Rosbag store is required!").max(200),
  config: Yup.string().test('json',
      'Configuration needs to be valid JSON!',
      function (text) {
        try {
          JSON.parse(text);
        } catch (e) {
          console.warn("Invalid JSON in Simulation Environment form", e);
          return false;
        }
        return true;
      }),
  exampleConfig: Yup.string().test('yaml',
      'Configuration needs to be valid YAML!',
      function (text) {
        try {
          yaml.safeLoad(text);
        } catch (e) {
          console.warn("Invalid YAML in Simulation Environment form", e);
          return false;
        }
        return true;
      })
};

export const SimulationEnvironmentFormValuesValidationSchema = Yup.object().shape(
    SimulationEnvironmentFormValuesValidationSchemaFields);

interface SimulationEnvironmentFormProps {
  initialValues: SimulationEnvironmentFormValues;
  onSubmit?: (values: SimulationEnvironmentFormValues) => void;
  new: boolean;
}

interface SimulationEnvironmentState {
  bagStores: { value: string, label: string }[];
  bagStoresLoaded: boolean;

  scriptEditorScriptName: string;
  scriptEditorCaption: string;
  scriptEditorScript: string;
}

export class SimulationEnvironmentForm extends React.Component<SimulationEnvironmentFormProps, SimulationEnvironmentState> {

  parsedJson: any;
  showSetupScriptEditor: boolean;
  showSimulaterScriptEditor: boolean;

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({
      bagStores: null,
      bagStoresLoaded: false,
      scriptEditorScriptName: "",
      scriptEditorScript: "",
      scriptEditorCaption: ""
    });

    this.parsedJson = {};
    this.showSetupScriptEditor = false;
    this.showSimulaterScriptEditor = false;

    BagManager.getBagStores().then((stores) => {
      this.setState({
        bagStores: stores.map((store) => {
          return { value: store.name, label: store.name };
        }),
        bagStoresLoaded: true
      });
    });

    this.tryParseConfigJson(this.props.initialValues.config);
  }

  componentWillReceiveProps(nextProps: SimulationEnvironmentFormProps, nextContext: any) {
    this.tryParseConfigJson(nextProps.initialValues.config);
  }

  tryParseConfigJson(config: string) {
    try {
      this.parsedJson = JSON.parse(config);
      this.showSetupScriptEditor = 'setup_script' in this.parsedJson;
      this.showSimulaterScriptEditor = 'simulator_script' in this.parsedJson;

      return true;
    } catch (e) {
      return false;
    }
  }

  onSubmit = (values: SimulationEnvironmentFormValues): void => {
    if ('onSubmit' in this.props) {
      this.props.onSubmit(values);
    }
  };

  static emptyForm(): SimulationEnvironmentFormValues {
    return {
      name: "",
      moduleName: "",
      rosbagStore: "",
      config: "",
      exampleConfig: ""
    };
  }

  static modelToForm(environment: SimulationEnvironmentDetailed): SimulationEnvironmentFormValues {
    return {
      name: environment.name,
      moduleName: environment.module_name,
      rosbagStore: environment.rosbag_store,
      config: JSON.stringify(environment.config, null, 2),
      exampleConfig: environment.example_config
    };
  }

  static formToModel(values: SimulationEnvironmentFormValues, environment: SimulationEnvironmentDetailed) {
    environment.name = values.name;
    environment.config = JSON.parse(values.config);
    environment.module_name = values.moduleName;
    environment.rosbag_store = values.rosbagStore;
    environment.example_config = values.exampleConfig;
  }

  onScriptEditorSubmit = (script: string, form: FormikProps<SimulationEnvironmentFormValues>): void => {
    switch (this.state.scriptEditorScriptName) {
      case "simulator_script":
        this.parsedJson.simulator_script = script;
        form.setFieldValue("config", JSON.stringify(this.parsedJson, null, 2));
        break;
      case "setup_script":
        this.parsedJson.setup_script = script;
        form.setFieldValue("config", JSON.stringify(this.parsedJson, null, 2));
        break;
    }

    this.setState({
      scriptEditorScriptName: ""
    });
  };

  onScriptEditorDiscard = (): void => {
    this.setState({
      scriptEditorScriptName: ""
    });
  };

  onEditSimulatorScriptClick = (currentConfig: string): void => {
    if (this.tryParseConfigJson(currentConfig)) {
      this.setState({
        scriptEditorScriptName: "simulator_script",
        scriptEditorCaption: "Environment Simulator Run Script",
        scriptEditorScript: this.parsedJson.simulator_script
      });
    } else {
      toast.error("Your current JSON is invalid, please fix this first before opening the editor.");
    }
  };

  onEditSetupScriptClick = (currentConfig: string): void => {
    if (this.tryParseConfigJson(currentConfig)) {
      this.setState({
        scriptEditorScriptName: "setup_script",
        scriptEditorCaption: "Environment Setup Script",
        scriptEditorScript: this.parsedJson.setup_script
      });
    } else {
      toast.error("Your current JSON is invalid, please fix this first before opening the editor.");
    }
  };

  renderForm = (props: FormikProps<SimulationEnvironmentFormValues>) => {
    const errors = props.errors;
    const touched = props.touched;

    return (
        <React.Fragment>
          <BashScriptEditModal
              script={this.state.scriptEditorScript}
              caption={this.state.scriptEditorCaption}
              open={this.state.scriptEditorScriptName !== ""}
              onSubmit={(script) => {
                this.onScriptEditorSubmit(script, props);
              }}
              onCloseModal={this.onScriptEditorDiscard}/>
          <Form className="rbb-Form">
            <div className="form-row">
              <div className={`form-group col-xl-5 col-lg-8 ${hasError('name', props)}`}>
                <label htmlFor="name">Name</label>
                <Field disabled={!this.props.new}
                       name="name"
                       className={`form-control ${hasError('name', props)}`}
                       placeholder="Name"
                       type="text"/>
                <FieldError fieldName="name" props={props}/>
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group col-xl-5 col-lg-8 ${hasError('moduleName', props)}`}>
                <label htmlFor="moduleName">Module Name</label>
                <Field name="moduleName"
                       className={`form-control ${hasError('moduleName', props)}`}
                       placeholder="rbb_tools.simenv.scse"
                       type="text"/>
                <FieldError fieldName="moduleName" props={props}/>
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group col-xl-5 col-lg-8 ${hasError('rosbagStore', props)}`}>
                <label htmlFor="rosbagStore">Rosbag Store</label>
                <small> Rosbag recordings of the simulation runs will be uploaded here by default</small>
                <Field name="rosbagStore" options={this.state.bagStores} isLoading={!this.state.bagStoresLoaded} className="form-control"
                       component={SelectField}/>
                <FieldError fieldName="rosbagStore" props={props}/>
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group col-xl-8 ${hasError('config', props)}`}>
                <label htmlFor="config">Simulation Environment Configuration</label>
                <Field name="config">{JsonEditorInput}</Field>
                <div>
                  <div className={"btn-group"}>
                    {this.showSetupScriptEditor &&
                    <button type="button"
                            className="btn btn-sm btn-info"
                            onClick={() => {
                              this.onEditSetupScriptClick(props.values.config);
                            }}>
                      <FontAwesomeIcon icon={['fas', 'terminal']}/> Edit setup script</button>}
                    {this.showSimulaterScriptEditor &&
                    <button type="button"
                            className="btn btn-sm btn-info"
                            onClick={() => {
                              this.onEditSimulatorScriptClick(props.values.config);
                            }}>
                      <FontAwesomeIcon icon={['fas', 'terminal']}/> Edit simulator Script</button>}
                  </div>
                </div>
                <FieldError fieldName="config" props={props}/>
              </div>
            </div>

            <div className="form-row">
              <div className={`form-group col-xl-8 ${hasError('exampleConfig', props)}`}>
                <label htmlFor="exampleConfig">Example Simulation Run Configuration</label>
                <Field name="exampleConfig">{YamlEditorInput}</Field>
                <FieldError fieldName="exampleConfig" props={props}/>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-xl-8 form-buttons">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="reset" className="btn btn-secondary">Reset</button>
              </div>
            </div>
          </Form>
        </React.Fragment>);
  };

  render() {
    return <Formik
        initialValues={this.props.initialValues}
        validationSchema={SimulationEnvironmentFormValuesValidationSchema}
        onSubmit={this.onSubmit}
        render={this.renderForm}
        enableReinitialize={true}
    />;
  }
}
