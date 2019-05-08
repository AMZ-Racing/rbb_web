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
import { Link } from 'react-router-dom';
import { User } from "client/api";
import UserManager from "model/UserManager";
import { SideColumnUserList } from "pages/admin/SideColumnUserList";
import { UserPage } from "./User";
import GenericModelPage, { DetailPageType, GenericModelTable } from "./GenericModelTablePage";
import { SideColumnList } from "templates/SideColumnList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-toastify';


class UserTable extends GenericModelTable<User> {
  header(): JSX.Element {
    return <React.Fragment>
      <th scope="col">Full Name</th>
      <th scope="col">User Name</th>
      <th scope="col">Email</th>
      <th scope="col">Actions</th>
    </React.Fragment>;
  }

  id(item: User): any {
    return item.alias;
  }

  row(user: User): JSX.Element {
    return <React.Fragment>
      <td scope="row"><Link to={"/admin/users/" + user.alias}>{user.full_name}</Link></td>
      <td scope="row">{user.alias}</td>
      <td scope="row">{user.email}</td>
      <td scope="row">
        <button type="button" onClick={(x) => { this.requestItemDelete(user); } } className="btn btn-danger btn-sm">
        <FontAwesomeIcon icon={['fas','trash']} /> Delete</button>
      </td>
    </React.Fragment>;
  }

}

export default class UserAdminPage extends GenericModelPage<User> {
  table(): { new(...args: any[]): GenericModelTable<User> } {
    return UserTable;
  }

  detailPage(): { new(...args: any[]): DetailPageType<User> } {
    return UserPage;
  }

  pageTitle(): string {
    return "Users";
  }

  pageSubtitle(): string {
    return "Overview of all users";
  }

  loadModelFromServer(identifier: string): Promise<User> {
    return UserManager.getUser(identifier);
  }

  loadModelsFromServer(): Promise<User[]> {
    return UserManager.getUsers();
  }

  sideColumn(): new(...args: any[]) => SideColumnList<User> {
    return SideColumnUserList;
  }

  renderAboveTable() {
    return <div className="rbb-TopButtons">
      <button type="button" onClick={(x) => { this.props.history.push('/admin/users?new'); } } className="btn btn-sm btn-success">
        <FontAwesomeIcon icon={['fas','user-plus']} /> New User</button>
    </div>;
  }

  deleteModalTitle(): string {
    return "Delete User";
  }

  deleteModalContent(item: User): JSX.Element {
    return <React.Fragment>
      <h4>Are you sure?</h4>
      Do you really want to delete '{item.alias}'? Deletion is final and cannot be undone.
    </React.Fragment>;
  }

  deleteItem(item: User): void {
    UserManager.deleteUser(item).then((response) => {
      toast.success("User deleted!");
      this.reloadTableItems();
    }).catch((reason) => {
      toast.error("User deletion failed!");
    });
  }


}
