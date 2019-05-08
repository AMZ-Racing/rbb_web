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
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { FormikProps } from "formik/dist/types";
import { FieldError, hasError, JsonEditorInput } from "forms/FormHelpers";
import * as moment from 'moment';

export class FileStoreFormValues {
  name: string;
  storeType: string;
  storeData: string;
  created: Date;
}

const FileStoreFormValuesValidationSchemaFields = {
  name: Yup.string().required("Name is required!").max(100).matches(/^[a-z0-9.-]+$/),
  storeType: Yup.string().required("Store type is required!").max(100),
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

export const FileStoreValuesValidationSchema = Yup.object().shape(FileStoreFormValuesValidationSchemaFields);

interface FileStoreFormProps {
  initialValues: FileStoreFormValues;
  onSubmit?: (values: FileStoreFormValues) => void;
  new: boolean;
}

export class FileStoreForm extends React.Component<FileStoreFormProps, {}> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({});
  }

  onSubmit = (values: FileStoreFormValues): void => {
    if ('onSubmit' in this.props) {
      this.props.onSubmit(values);
    }
  };

  static emptyForm(): FileStoreFormValues {
    return {
      name: "",
      storeType: "",
      storeData: "",
      created: new Date()
    };
  }

  static modelToForm(store: FileStore): FileStoreFormValues {
    return {
      name: store.name,
      storeType: store.store_type,
      storeData: JSON.stringify(store.store_data, null, 2),
      created: store.created
    };
  }

  static formToModel(values: FileStoreFormValues, store: FileStore) {
    store.name = values.name;
    store.store_data = JSON.parse(values.storeData);
    store.store_type = values.storeType;
  }

  renderForm = (props: FormikProps<FileStoreFormValues>) => {
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
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('created', props)}`}>
          <label htmlFor="created">Created</label>
          <div className={"form-value"}>{moment(props.values.created).format('MMMM Do YYYY, h:mm:ss a')}</div>
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
        validationSchema={FileStoreValuesValidationSchema}
        onSubmit={this.onSubmit}
        render={this.renderForm}
        enableReinitialize={true}
    />;
  }
}
