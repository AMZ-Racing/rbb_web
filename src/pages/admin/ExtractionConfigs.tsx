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
import { BagExtractionConfiguration } from "client/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SideColumnList, SideColumnListItem } from "../../templates/SideColumnList";
import GenericModelPage, { DetailPageType, GenericModelTable } from "./GenericModelTablePage";
import ExtractionManager from "../../model/ExtractionManager";
import { ExtractionConfigurationPage } from "./ExtractionConfig";
import { toast } from 'react-toastify';
import BagManager from "../../model/BagManager";

class ExtractionConfigurationTable extends GenericModelTable<BagExtractionConfiguration> {
  header(): JSX.Element {
    return <React.Fragment>
      <th scope="col">Name</th>
      <th scope="col">Description</th>
      <th scope="col">Actions</th>
    </React.Fragment>;
  }

  id(item: BagExtractionConfiguration): any {
    return item.name;
  }

  row(item: BagExtractionConfiguration): JSX.Element {
    return <React.Fragment>
      <td scope="row"><Link to={"/admin/extraction-configurations/" + item.name}>{item.name}</Link></td>
      <td scope="row">{item.description}</td>
      <td scope="row">
        <button type="button" onClick={(x) => { this.requestItemDelete(item); } } className="btn btn-danger btn-sm">
          <FontAwesomeIcon icon={['fas','trash']} /> Delete</button>
      </td>
    </React.Fragment>;
  }

}

class SideColumnExtractionConfigurationListItem extends SideColumnListItem<BagExtractionConfiguration> {
  getUrl() {
    return "/admin/extraction-configurations/" + this.props.item.name;
  }

  getCaption() {
    return this.props.item.name;
  }

  getDescription() {
    return this.props.item.description;
  }

  getIconSpan() {
    return <FontAwesomeIcon icon="cog"/>;
  }
}

class SideColumnExtractionConfigurationList extends SideColumnList<BagExtractionConfiguration> {
  equals(a: BagExtractionConfiguration, b: BagExtractionConfiguration): boolean {
    return a.name === b.name;
  }

  id(a: BagExtractionConfiguration): any {
    return a.name;
  }

  getNoChildrenText(): string {
    return "No extraction configuratinos";
  }

  itemComponent(): { new(...args: any[]): SideColumnListItem<BagExtractionConfiguration> } {
    return SideColumnExtractionConfigurationListItem;
  }
}

export class ExtractionConfigurationAdminPage extends GenericModelPage<BagExtractionConfiguration> {
  table(): { new(...args: any[]): GenericModelTable<BagExtractionConfiguration> } {
    return ExtractionConfigurationTable;
  }

  detailPage(): { new(...args: any[]): DetailPageType<BagExtractionConfiguration> } {
    return ExtractionConfigurationPage;
  }

  renderAboveTable() {
    return <div className="rbb-TopButtons">
      <button type="button" onClick={(x) => { this.props.history.push('/admin/extraction-configurations?new'); } } className="btn btn-sm btn-success">
        <FontAwesomeIcon icon={['fas','plus']} /> New Extraction Configuration</button>
    </div>;
  }

  pageTitle(): string {
    return "Extraction Configurations";
  }

  pageSubtitle(): string {
    return "Overview of all extraction configurations";
  }

  loadModelFromServer(identifier: string): Promise<BagExtractionConfiguration> {
    return ExtractionManager.getExtractionConfiguration(identifier);
  }

  loadModelsFromServer(): Promise<BagExtractionConfiguration[]> {
    return ExtractionManager.getExtractionConfigurations();
  }

  sideColumn(): new(...args: any[]) => SideColumnList<BagExtractionConfiguration> {
    return SideColumnExtractionConfigurationList;
  }

  deleteModalTitle(): string {
    return "Delete Extraction Configuration";
  }

  deleteModalContent(item: BagExtractionConfiguration): JSX.Element {
    return <React.Fragment>
      <h4>Are you sure?</h4>
      Do you really want to delete '{item.name}'?
    </React.Fragment>;
  }

  deleteItem(item: BagExtractionConfiguration): void {
    BagManager.deleteBagExtractionConfiguration(item).then((response) => {
      toast.success("Configuration deleted!");
      this.reloadTableItems();
    }).catch((reason) => {
      toast.error("Configuration deletion failed!");
    });
  }

}
