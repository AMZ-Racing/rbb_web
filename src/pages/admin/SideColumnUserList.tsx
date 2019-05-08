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
import { SideColumnList } from "templates/SideColumnList";
import { User } from "client/api";
import { SideColumnListItem } from "templates/SideColumnList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class SideColumnUserListItem extends SideColumnListItem<User> {
  getUrl() {
    return "/admin/users/" + this.props.item.alias;
  }

  getCaption() {
    return this.props.item.alias;
  }

  getDescription() {
    return this.props.item.full_name;
  }

  getIconSpan() {
    return <FontAwesomeIcon icon="user" />;
  }
}

export class SideColumnUserList extends SideColumnList<User> {
  equals(a: User, b: User): boolean {
    return a.alias === b.alias;
  }

  id(a: User): any {
    return a.alias;
  }

  getNoChildrenText(): string {
    return "No users";
  }

  itemComponent(): { new(...args: any[]): SideColumnListItem<User> } {
    return SideColumnUserListItem;
  }

}
