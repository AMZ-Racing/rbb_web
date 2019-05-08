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
import { BagStoreSummary } from "client/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SideColumnList, SideColumnListItem } from "templates/SideColumnList";
import GenericModelPage, { DetailPageType, GenericModelTable } from "pages/admin/GenericModelTablePage";
import BagManager, { BagStoreWithExtractionConfig } from "model/BagManager";
import { BagStorePage } from "./BagStore";
import { toast } from 'react-toastify';

class BagStoreTable extends GenericModelTable<BagStoreSummary> {
  header(): JSX.Element {
    return <React.Fragment>
      <th scope="col">Name</th>
      <th scope="col">Actions</th>
    </React.Fragment>;
  }

  id(item: BagStoreSummary): any {
    return item.name;
  }

  row(item: BagStoreSummary): JSX.Element {
    return <React.Fragment>
      <td scope="row"><Link to={"/admin/bag-stores/" + item.name}>{item.name}</Link></td>
      <td scope="row">
        <button type="button" onClick={(x) => { this.requestItemDelete(item); } } className="btn btn-danger btn-sm">
          <FontAwesomeIcon icon={['fas','trash']} /> Delete</button>
      </td>
    </React.Fragment>;
  }

}

class SideColumnBagStoreListItem extends SideColumnListItem<BagStoreSummary> {
  getUrl() {
    return "/admin/bag-stores/" + this.props.item.name;
  }

  getCaption() {
    return this.props.item.name;
  }

  getDescription() {
    return "";
  }

  getIconSpan() {
    return <FontAwesomeIcon icon="hdd"/>;
  }
}

class SideColumnBagStoreList extends SideColumnList<BagStoreSummary> {
  equals(a: BagStoreSummary, b: BagStoreSummary): boolean {
    return a.name === b.name;
  }

  id(a: BagStoreSummary): any {
    return a.name;
  }

  getNoChildrenText(): string {
    return "No bag stores";
  }

  itemComponent(): { new(...args: any[]): SideColumnListItem<BagStoreSummary> } {
    return SideColumnBagStoreListItem;
  }
}

export class BagStoreAdminPage extends GenericModelPage<BagStoreSummary> {
  table(): { new(...args: any[]): GenericModelTable<BagStoreSummary> } {
    return BagStoreTable;
  }

  detailPage(): { new(...args: any[]): DetailPageType<BagStoreWithExtractionConfig> } {
    return BagStorePage;
  }

  renderAboveTable() {
    return <div className="rbb-TopButtons">
      <button type="button" onClick={(x) => { this.props.history.push('/admin/bag-stores?new'); } } className="btn btn-sm btn-success">
        <FontAwesomeIcon icon={['fas','plus']} /> New Bag Store</button>
    </div>;
  }

  pageTitle(): string {
    return "Bag Stores";
  }

  pageSubtitle(): string {
    return "Overview of all bag stores";
  }

  loadModelFromServer(identifier: string): Promise<BagStoreWithExtractionConfig> {
    return BagManager.getBagStoreWithExtractionConfig(identifier);
  }

  loadModelsFromServer(): Promise<BagStoreSummary[]> {
    return BagManager.getBagStores();
  }

  sideColumn(): new(...args: any[]) => SideColumnList<BagStoreSummary> {
    return SideColumnBagStoreList;
  }

  deleteModalTitle(): string {
    return "Delete Bag Store";
  }

  deleteModalContent(item: BagStoreSummary): JSX.Element {
    return <React.Fragment>
      <h4>Are you sure?</h4>
      Deletion is final and cannot be undone. The bags will not be removed from the underlying storage,
      only the meta-data is lost. Do you really want to delete '{item.name}'?
    </React.Fragment>;
  }

  deleteItem(item: BagStoreSummary): void {
    BagManager.deleteBagStore(item).then((response) => {
      toast.success("Bag store deleted!");
      this.reloadTableItems();
    }).catch((reason) => {
      toast.error("Bag store deletion failed!");
    });
  }

}
