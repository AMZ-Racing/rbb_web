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
import UserManager from "model/UserManager";
import BlockUi from 'react-block-ui';
import { toast } from 'react-toastify';
import { RouteComponentProps } from "react-router";
import SideColumn from "templates/SideColumn";
import Content from "templates/Content";
import MainHeader from "templates/MainHeader";
import MainPage from "templates/MainPage";

interface MyAccountProps extends RouteComponentProps<{}> {
}

interface MyAccountState {
  saving: boolean;
  myAccount: User;
}

export class MyAccountPage extends React.Component<MyAccountProps, MyAccountState> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = ({ saving: false, myAccount: null });

    UserManager.getMyAccount().then((user) => {
      // Clear the permissions so that they don't add up in the form (because they cant be changed anyway)
      user.permissions = [];
      this.setState({ myAccount: user });
    });
  }

  onUpdateModel = (values: UserFormValues):void => {
    const updatedModel = this.state.myAccount;
    UserForm.formToModel(values, updatedModel);
    this.setState({ saving: true });
    UserManager.saveMyAccount(updatedModel).then((savedUser) => {
      toast.success("Your account details are saved succesfully!");
      this.setState({ saving: false });
    }).catch((reason) => {
      toast.error("An error occured while saving your account!");
      this.setState({ saving: false });
    });
  };

  renderContent() {
    if (this.state.myAccount) {
      return <React.Fragment>
        <BlockUi tag="div" blocking={this.state.saving} message="Saving account details, please wait">
          <h1 className="rbb-GenericTablePage__title">My Account</h1>
          <h2 className="rbb-GenericTablePage__subtitle">Edit my account details</h2>

          <UserForm new={false} initialValues={ UserForm.modelToForm(this.state.myAccount) } onSubmit={this.onUpdateModel} />
        </BlockUi>
      </React.Fragment>;
    } else {
      return <FoldingCubeSpinner />;
    }
  }

  render() {
    return <MainPage header={<MainHeader />}>
      <Content leftColumn={ <SideColumn> </SideColumn> }>
        <div>
          {this.renderContent()}
        </div>
      </Content>
    </MainPage>;
  }
}
