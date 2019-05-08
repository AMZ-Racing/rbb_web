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
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import { UserForm, UserFormValues } from "forms/UserForm";
import { GenericModelDetailPageProps } from "./GenericModelTablePage";
import UserManager from "model/UserManager";
import BlockUi from 'react-block-ui';
import { toast } from 'react-toastify';
import { ModelError } from "../../client/api";

interface UserProps extends GenericModelDetailPageProps<User> {}

interface UserState {
  saving: boolean;
}

export class UserPage extends React.Component<UserProps, UserState> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({ saving: false });
  }

  onUpdateModel = (values: UserFormValues):void => {
    const updatedModel = this.props.model;
    UserForm.formToModel(values, updatedModel);
    this.setState({ saving: true });
    UserManager.saveUser(updatedModel).then((savedUser) => {
      toast.success("User updated succesfully!");
      this.props.modelChanged(savedUser);
      this.setState({ saving: false });
    }).catch((reason) => {
      toast.error("An error occured while saving the user!");
      this.setState({ saving: false });
    });
  };

  onNewModel = (values: UserFormValues):void => {
    const newModel: User = {};
    UserForm.formToModel(values, newModel);
    this.setState({ saving: true });
    UserManager.newUser(newModel).then((savedUser) => {
      toast.success("User created succesfully!");
      this.props.modelCreated(savedUser);
      this.props.parentProps.history.push(`/admin/users/${savedUser.alias}`);
    }).catch((reason) => {
      if (reason.status === 400) {
        reason.json().then((reason: ModelError) => {
          if (reason.code === 1000) {
            toast.error("User already exists!");
          } else {
            toast.error(reason.message);
          }
        });

      } else {
        toast.error("An error occured while saving the user!");
      }
      this.setState({ saving: false });
    });

  };

  render() {
    if (this.props.newModel) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Creating user, please wait">
          <h1 className="rbb-UsersPage__title">New User</h1>
          <h2 className="rbb-UsersPage__subtitle">Create a new user</h2>

          <UserForm new={true} initialValues={ UserForm.emptyForm() } onSubmit={this.onNewModel} />
        </BlockUi>
      </React.Fragment>;
    } else if (this.props.model) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Saving user, please wait">
          <h1 className="rbb-UsersPage__title">{this.props.model.alias} ({this.props.model.full_name})</h1>
          <h2 className="rbb-UsersPage__subtitle">Edit user</h2>

          <UserForm new={false} initialValues={ UserForm.modelToForm(this.props.model) } onSubmit={this.onUpdateModel} />
        </BlockUi>
      </React.Fragment>;
    } else {
      return <FoldingCubeSpinner />;
    }
  }
}
