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
import { IInstance, UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/yaml/yaml';
import * as codemirror from "codemirror";
import { FieldProps } from 'formik';
import Select, { Option, ReactSelectProps } from 'react-select';
import { UserFormValues } from "./UserForm";
import { FormikProps } from "formik/dist/types";

export function FieldError(props: { fieldName: string, props: any }) {
  if (props.props.errors[props.fieldName] && props.props.touched[props.fieldName]) {
    return <div className="invalid-feedback">{props.props.errors[props.fieldName]}</div>;
  }

  return null;
}

export function hasError(fieldName: string, props: any) {
  if (props.errors[fieldName] && props.touched[fieldName]) {
    return 'is-invalid';
  }

  return '';
}

export function EditorInput(props: { field: any, form: any }, mode: string) {
  return <div>
    <CodeMirror
        className=""
        value={props.field.value}
        options={{
          mode: mode,
          theme: 'material',
          lineNumbers: true,
          lineWrapping: true
        }}
        onChange={(editor: IInstance, data: codemirror.EditorChange, value: string) => {
          // props.form.setFieldValue(props.field.name, editor.getValue());
        }}
        onBlur={(editor: IInstance, event: Event) => {
          props.form.setFieldValue(props.field.name, editor.getValue());
          props.form.setFieldTouched(props.field.name, true);
        }}
    />
  </div>;
}

export function JsonEditorInput(props: { field: any, form: any }) {
  return EditorInput(props, "javascript");
}

export function YamlEditorInput(props: { field: any, form: any }) {
  return EditorInput(props, "yaml");
}

export function PermissionsInput(props: { field: any, form: any }) {
  return <div>
    {props.field.value.map((permission: any) => {
      return <div key={permission.identifier} className="form-check">
        <label className="form-check-label" htmlFor={`permission-${permission.identifier}`}>
        <input
            onChange={(event) => {
              permission.granted = event.target.checked;
              props.form.setFieldValue(props.field.name, props.field.value);
            }}
            onBlur={(event) => {
              props.form.setFieldTouched(props.field.name, true);
            }}
            className="form-check-input"
            type="checkbox"
            id={`permission-${permission.identifier}`}
            checked={permission.granted}
            key={permission.identifier} /> {permission.name}
          </label>
      </div>;
    })}
  </div>;
}

export function PermissionInput(props: { name: string, formik: FormikProps<UserFormValues> }) {
  return <input type="checkbox"
                name={`permissionGranted.${props.name}`}
                id={`permissionGranted.${props.name}`}
                onChange={(e) => {
                  props.formik.setFieldValue(`permissionGranted.${props.name}`, e.target.checked);
                }}
                onBlur={props.formik.handleBlur}
                checked={props.formik.values.permissionGranted[props.name] || false}
                className="form-check-input"/>;
}

export const SelectField: React.SFC<ReactSelectProps & FieldProps> = ({options, field, form, isLoading }) => (
    <Select
        options={options}
        isLoading={isLoading}
        name={field.name}
        value={options ? options.find(option => option.value === field.value) : ''}
        onChange={(option: Option) => form.setFieldValue(field.name, option.value)}
        onBlur={field.onBlur}
        clearable={false}
    />
);

export const MultiSelectField: React.SFC<ReactSelectProps & FieldProps> = ({options, field, form, isLoading }) => (
    <Select
        options={options}
        isLoading={isLoading}
        name={field.name}
        value={field.value.map((option: string) => { return { label: option, value: option }; })}
        onChange={(options: Option[]) => { form.setFieldValue(field.name, options.map((option) => { return option.value; })); }}
        onBlur={field.onBlur}
        clearable={true}
        multi={true}
    />
);
