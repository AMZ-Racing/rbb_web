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
import { User } from "client/api";
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { FormikProps } from "formik/dist/types";
import { FieldError, hasError, PermissionInput, PermissionsInput } from "forms/FormHelpers";

export class UserFormValues {
  username: string;
  fullName: string;
  emailAddress: string;
  password: string;
  passwordConfirmation: string;
  permissionGranted: { [pid: string]: boolean };
  permissionNames: { [pid: string]: string };
}

const UserFormValuesValidationSchemaFields = {
  username: Yup.string().required("Username is required!").max(100).matches(/^[a-z0-9.-]+$/),
  fullName: Yup.string().required("Full name is required!").max(100),
  emailAddress: Yup.string().email("Invalid email address!").required("Email address is required!"),
  password: Yup.string().min(8, "Password needs to be at least 8 characters!"),
  passwordConfirmation: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match!')
};

const UserFormValuesValidationSchemaFieldsNew = {
  ...UserFormValuesValidationSchemaFields
};
UserFormValuesValidationSchemaFieldsNew.password =
    UserFormValuesValidationSchemaFieldsNew.password.required("You have to set a password for this user!");

export const UserFormValuesValidationSchema = Yup.object().shape(UserFormValuesValidationSchemaFields);
export const UserFormValuesValidationSchemaNew = Yup.object().shape(UserFormValuesValidationSchemaFieldsNew);

interface UserFormProps {
  initialValues: UserFormValues;
  onSubmit?: (values: UserFormValues) => void;
  new: boolean;
}

export class UserForm extends React.Component<UserFormProps, {}> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({});
  }

  onSubmit = (values: UserFormValues): void => {
    if ('onSubmit' in this.props) {
      this.props.onSubmit(values);
    }
  };

  static emptyForm(): UserFormValues {
    return {
      username: "",
      fullName: "",
      emailAddress: "",
      password: "",
      passwordConfirmation: "",
      permissionGranted: {},
      permissionNames: {}
    };
  }

  static modelToForm(user: User): UserFormValues {
    return {
      username: user.alias,
      fullName: user.full_name,
      emailAddress: user.email,
      password: "",
      passwordConfirmation: "",

      permissionGranted: user.permissions.reduce((obj: UserFormValues['permissionGranted'], perm) => {
        obj[perm.identifier] = perm.granted;
        return obj;
      }, {}),
      permissionNames: user.permissions.reduce((obj: UserFormValues['permissionNames'], perm) => {
        obj[perm.identifier] = perm.name;
        return obj;
      }, {})

    };
  }

  static formToModel(values: UserFormValues, user: User) {
    user.alias = values.username;
    user.full_name = values.fullName;
    user.email = values.emailAddress;

    if (values.password && values.password === values.passwordConfirmation) {
      user.password = values.password;
    }

    user.permissions = [];
    for (const p in values.permissionGranted) {
      user.permissions.push({
        granted: values.permissionGranted[p],
        identifier: p,
        name: values.permissionNames[p]
      });
    }
  }

  renderForm = (props: FormikProps<UserFormValues>) => {
    const errors = props.errors;
    const touched = props.touched;

    return (<Form className="rbb-Form">
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('username', props)}`}>
          <label htmlFor="username">Username</label>
          <Field disabled={!this.props.new} name="username" className={`form-control ${hasError('username', props)}`} placeholder="Username"
                 type="text"/>
          <FieldError fieldName="username" props={props}/>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('fullName', props)}`}>
          <label htmlFor="username">Full Name</label>
          <Field name="fullName" className={`form-control ${hasError('fullName', props)}`} placeholder="Full Name" type="text"/>
          <FieldError fieldName="fullName" props={props}/>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('emailAddress', props)}`}>
          <label htmlFor="emailAddress">Email Address</label>
          <Field name="emailAddress" className={`form-control ${hasError('emailAddress', props)}`} placeholder="something@something.com"
                 type="email"/>
          <FieldError fieldName="emailAddress" props={props}/>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('password', props)}`}>
          <label htmlFor="password">Password</label>
          {!this.props.new && <small> Leave empty to not change the password</small>}
          <Field name="password" className={`form-control ${hasError('password', props)}`} type="password"/>
          <FieldError fieldName="password" props={props}/>
        </div>
      </div>
      <div className="form-row">
        <div className={`form-group col-xl-5 col-lg-8 ${hasError('passwordConfirmation', props)}`}>
          <label htmlFor="passwordConfirmation">Password Confirmation</label>
          <Field name="passwordConfirmation" className={`form-control ${hasError('passwordConfirmation', props)}`} type="password"/>
          <FieldError fieldName="passwordConfirmation" props={props}/>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group col-xl-12">
          {Object.keys(props.values.permissionGranted).length > 0 && <label>Permissions</label>}
          {Object.keys(props.values.permissionGranted).length > 0 &&
          Object.keys(props.values.permissionGranted).map((pid) => {
            return <div key={pid} className={`form-check`}>
              <label htmlFor={`permissionGranted.${pid}`}>
                <PermissionInput name={pid} formik={props} /> {props.values.permissionNames[pid]}
              </label>
              <FieldError fieldName={`permissionGranted.${pid}`} props={props}/>
            </div>;
          })}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group col-xl-5 col-lg-8 form-buttons">
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="reset" onClick={(e) => {
            props.resetForm();
            e.preventDefault();
            return false;
          }} className="btn btn-secondary">Reset</button>
        </div>
      </div>
    </Form>);
  };

  render() {
    return <Formik
        initialValues={this.props.initialValues}
        validationSchema={this.props.new ? UserFormValuesValidationSchemaNew : UserFormValuesValidationSchema}
        onSubmit={this.onSubmit}
        render={this.renderForm}
        enableReinitialize={true}
    />;
  }
}
