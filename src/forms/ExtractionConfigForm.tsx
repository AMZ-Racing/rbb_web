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
import { BagExtractionConfiguration } from "client/api";
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { FormikProps } from "formik/dist/types";
import { FieldError, hasError, JsonEditorInput } from "forms/FormHelpers";

export class ExtractionConfigFormValues {
  name: string;
  description: string;
  type: string;
  config: string;
}

const ExtractionConfigFormValuesValidationSchemaFields = {
  name: Yup.string().required("Name is required!").max(100).matches(/^[a-z0-9.-]+$/),
  description: Yup.string().required("Description is required!").max(100),
  type: Yup.string().required("Type is required!").max(100),
  config: Yup.string().test('json',
      'Configuration needs to be valid JSON!',
      function (text) {
        try {
          JSON.parse(text);
        } catch (e) {
          return false;
        }
        return true;
      })
};

export const ExtractionConfigFormValuesValidationSchema = Yup.object().shape(ExtractionConfigFormValuesValidationSchemaFields);

interface ExtractionConfigFormProps {
  initialValues: ExtractionConfigFormValues;
  onSubmit?: (values: ExtractionConfigFormValues) => void;
  new: boolean;
}

export class ExtractionConfigForm extends React.Component<ExtractionConfigFormProps, {}> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({});
  }

  onSubmit = (values: ExtractionConfigFormValues): void => {
    if ('onSubmit' in this.props) {
      this.props.onSubmit(values);
    }
  };

  static emptyForm(): ExtractionConfigFormValues {
    return {
      name: "",
      description: "",
      type: "",
      config: ""
    };
  }

  static modelToForm(config: BagExtractionConfiguration): ExtractionConfigFormValues {
    return {
      name: config.name,
      description: config.description,
      config: JSON.stringify(config.config, null, 2),
      type: config.type
    };
  }

  static formToModel(values: ExtractionConfigFormValues, config: BagExtractionConfiguration) {
    config.name = values.name;
    config.config = JSON.parse(values.config);
    config.description = values.description;
    config.type = values.type;
  }

  renderForm = (props: FormikProps<ExtractionConfigFormValues>) => {
    const errors = props.errors;
    const touched = props.touched;

    return (<Form className="rbb-Form">
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('name', props)}`}>
          <label htmlFor="name">Name</label>
          <Field disabled={!this.props.new} name="name" className={`form-control ${hasError('name', props)}`} placeholder="Name" type="text"/>
          <FieldError fieldName="name" props={props}/>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('description', props)}`}>
          <label htmlFor="description">Description</label>
          <Field name="description" className={`form-control ${hasError('description', props)}`} placeholder="Description" type="text"/>
          <FieldError fieldName="description" props={props}/>
        </div>
      </div>

      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('type', props)}`}>
          <label htmlFor="type">Configuration Type</label>
          <Field name="type" className={`form-control ${hasError('type', props)}`} placeholder="Configuration Type" type="text"/>
          <FieldError fieldName="type" props={props}/>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-8 ${hasError('config', props)}`}>
          <label htmlFor="config">Configuration</label>
          <Field name="config">{JsonEditorInput}</Field>
          <FieldError fieldName="config" props={props}/>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group col-xl-8 form-buttons">
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="reset" className="btn btn-secondary">Reset</button>
        </div>
      </div>
    </Form>);
  };

  render() {
    return <Formik
        initialValues={this.props.initialValues}
        validationSchema={ExtractionConfigFormValuesValidationSchema}
        onSubmit={this.onSubmit}
        render={this.renderForm}
        enableReinitialize={true}
    />;
  }
}
