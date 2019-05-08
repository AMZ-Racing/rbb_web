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
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { FormikProps } from "formik/dist/types";
import { FieldError, hasError, JsonEditorInput, MultiSelectField, SelectField } from "forms/FormHelpers";
import * as moment from 'moment';
import FileStoreManager from "model/FileStoreManager";
import BagManager, { BagStoreWithExtractionConfig } from "model/BagManager";

export class BagStoreFormValues {
  name: string;
  description: string;
  storeType: string;
  storeData: string;
  created: Date;
  defaultFileStore: string;
  defaultExtractionConfigs: string[];
}

const BagStoreFormValuesValidationSchemaFields = {
  name: Yup.string().required("Name is required!").max(100).matches(/^[a-z0-9.-]+$/),
  description: Yup.string().required("Description is required!").max(100),
  storeType: Yup.string().required("Store type is required!").max(100),
  defaultFileStore: Yup.string(),
  defaultExtractionConfigs: Yup.array(Yup.string()),
  storeData: Yup.string().test('json',
      'Data needs to be valid JSON!',
      function (text) {
        try {
          JSON.parse(text);
        } catch (e) {
          return false;
        }
        return true;
      })
};

export const BagStoreValuesValidationSchema = Yup.object().shape(BagStoreFormValuesValidationSchemaFields);

interface BagStoreFormProps {
  initialValues: BagStoreFormValues;
  onSubmit?: (values: BagStoreFormValues) => void;
  new: boolean;
}

interface BagStoreFormState {
  fileStores: { value: string, label: string }[];
  fileStoresLoaded: boolean;
  extractionConfigs: { value: string, label: string }[];
  extractionConfigsLoaded: boolean;
}

export class BagStoreForm extends React.Component<BagStoreFormProps, BagStoreFormState> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({
      fileStores: null,
      fileStoresLoaded: false,
      extractionConfigs: null,
      extractionConfigsLoaded: false
    });

    FileStoreManager.getFileStores().then((stores) => {
      this.setState({
        fileStores: stores.map((store) => {
          return { value: store.name, label: store.name };
        }),
        fileStoresLoaded: true
      });
    });

    BagManager.getExtractionConfigurations().then((configs) => {
      this.setState({
        extractionConfigs: configs.map((config) => {
          return { value: config.name, label: config.name };
        }),
        extractionConfigsLoaded: true
      });
    });
  }

  onSubmit = (values: BagStoreFormValues): void => {
    if ('onSubmit' in this.props) {
      this.props.onSubmit(values);
    }
  };

  static emptyForm(): BagStoreFormValues {
    return {
      name: "",
      description: "",
      storeType: "",
      storeData: "",
      defaultFileStore: "",
      created: new Date(),
      defaultExtractionConfigs: []
    };
  }

  static modelToForm(store: BagStoreWithExtractionConfig): BagStoreFormValues {
    return {
      name: store.name,
      storeType: store.store_type,
      storeData: JSON.stringify(store.store_data, null, 2),
      created: store.created,
      defaultFileStore: store.default_file_store,
      description: store.description,
      defaultExtractionConfigs: store.extractionConfigs
    };
  }

  static formToModel(values: BagStoreFormValues, store: BagStoreWithExtractionConfig) {
    store.name = values.name;
    store.store_data = JSON.parse(values.storeData);
    store.store_type = values.storeType;
    store.default_file_store = values.defaultFileStore;
    store.description = values.description;
    store.extractionConfigs = values.defaultExtractionConfigs;
  }

  renderForm = (props: FormikProps<BagStoreFormValues>) => {
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
          <Field name="description"
                 className={`form-control ${hasError('description', props)}`} placeholder="Description" type="text"/>
          <FieldError fieldName="description" props={props}/>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('created', props)}`}>
          <label htmlFor="created">Created</label>
          <div className={"form-value"}>{moment(props.values.created).format('MMMM Do YYYY, h:mm:ss a')}</div>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('defaultExtractionConfigs', props)}`}>
          <label htmlFor="defaultExtractionConfigs">Default Extraction Configurations</label>
          <Field name="defaultExtractionConfigs" options={this.state.extractionConfigs} isLoading={!this.state.extractionConfigsLoaded}
                 className="form-control"
                 component={MultiSelectField}/>
          <FieldError fieldName="defaultExtractionConfigs" props={props}/>
          <small className="form-text text-muted">
            These configurations will run automatically on bag discovery.
          </small>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('defaultFileStore', props)}`}>
          <label htmlFor="defaultFileStore">Default File Store</label>
          <Field name="defaultFileStore" options={this.state.fileStores} isLoading={!this.state.fileStoresLoaded}
                 className={`form-control ${hasError('defaultFileStore', props)}`}
                 component={SelectField}/>
          <FieldError fieldName="defaultFileStore" props={props}/>
          <small className="form-text text-muted">
            Generated products will be uploaded here by default.
          </small>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('storeType', props)}`}>
          <label htmlFor="storeType">Store Type</label>
          <Field name="storeType" className={`form-control ${hasError('storeType', props)}`} placeholder="Store type" type="text"/>
          <FieldError fieldName="storeType" props={props}/>
          <small className="form-text text-muted">
            A list of standard store types and their configuration options can be found <a href="#">here</a>.
          </small>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-8 ${hasError('storeData', props)}`}>
          <label htmlFor="storeData">Store Data</label>
          <Field name="storeData">{JsonEditorInput}</Field>
          <FieldError fieldName="storeData" props={props}/>
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
        validationSchema={BagStoreValuesValidationSchema}
        onSubmit={this.onSubmit}
        render={this.renderForm}
        enableReinitialize={true}
    />;
  }
}
