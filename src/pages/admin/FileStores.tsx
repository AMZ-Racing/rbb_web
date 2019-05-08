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
import { FileStore } from "client/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SideColumnList, SideColumnListItem } from "templates/SideColumnList";
import GenericModelPage, { DetailPageType, GenericModelTable } from "./GenericModelTablePage";
import FileStoreManager from "model/FileStoreManager";
import { FileStorePage } from "./FileStore";
import { toast } from 'react-toastify';

class FileStoreTable extends GenericModelTable<FileStore> {
  header(): JSX.Element {
    return <React.Fragment>
      <th scope="col">Name</th>
      <th scope="col">Actions</th>
    </React.Fragment>;
  }

  id(item: FileStore): any {
    return item.name;
  }

  row(item: FileStore): JSX.Element {
    return <React.Fragment>
      <td scope="row"><Link to={"/admin/file-stores/" + item.name}>{item.name}</Link></td>
      <td scope="row">
        <button type="button" onClick={(x) => { this.requestItemDelete(item); } } className="btn btn-danger btn-sm">
          <FontAwesomeIcon icon={['fas','trash']} /> Delete</button>
      </td>
    </React.Fragment>;
  }

}

class SideColumnFileStoreListItem extends SideColumnListItem<FileStore> {
  getUrl() {
    return "/admin/file-stores/" + this.props.item.name;
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

class SideColumnFileStoreList extends SideColumnList<FileStore> {
  equals(a: FileStore, b: FileStore): boolean {
    return a.name === b.name;
  }

  id(a: FileStore): any {
    return a.name;
  }

  getNoChildrenText(): string {
    return "No file stores";
  }

  itemComponent(): { new(...args: any[]): SideColumnListItem<FileStore> } {
    return SideColumnFileStoreListItem;
  }
}

export class FileStoreAdminPage extends GenericModelPage<FileStore> {
  table(): { new(...args: any[]): GenericModelTable<FileStore> } {
    return FileStoreTable;
  }

  detailPage(): { new(...args: any[]): DetailPageType<FileStore> } {
    return FileStorePage;
  }

  pageTitle(): string {
    return "File Stores";
  }

  pageSubtitle(): string {
    return "Overview of all file stores";
  }

  renderAboveTable() {
    return <div className="rbb-TopButtons">
      <button type="button" onClick={(x) => { this.props.history.push('/admin/file-stores?new'); } } className="btn btn-sm btn-success">
        <FontAwesomeIcon icon={['fas','plus']} /> New File Store</button>
    </div>;
  }

  loadModelFromServer(identifier: string): Promise<FileStore> {
    return FileStoreManager.getFileStore(identifier);
  }

  loadModelsFromServer(): Promise<FileStore[]> {
    return FileStoreManager.getFileStores();
  }

  sideColumn(): new(...args: any[]) => SideColumnList<FileStore> {
    return SideColumnFileStoreList;
  }

  deleteModalTitle(): string {
    return "Delete File Store";
  }

  deleteModalContent(item: FileStore): JSX.Element {
    return <React.Fragment>
      <h4>Are you sure?</h4>
      Deletion is final and cannot be undone. The files will not be removed from the file store,
      only the linking is lost. Do you really want to delete '{item.name}'?
    </React.Fragment>;
  }

  deleteItem(item: FileStore): void {
    FileStoreManager.deleteFileStore(item).then((response) => {
      toast.success("File store deleted!");
      this.reloadTableItems();
    }).catch((reason) => {
      toast.error("File store deletion failed!");
    });
  }

}
