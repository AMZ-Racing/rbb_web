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
import { SimulationEnvironmentSummary } from "client/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SideColumnList, SideColumnListItem } from "templates/SideColumnList";
import GenericModelPage, { DetailPageType, GenericModelTable } from "./GenericModelTablePage";
import SimManager from "model/SimManager";
import { SimulationEnvironmentPage } from "./SimulationEnvironment";
import { toast } from 'react-toastify';

class SimEnvTable extends GenericModelTable<SimulationEnvironmentSummary> {
  header(): JSX.Element {
    return <React.Fragment>
      <th scope="col">Name</th>
      <th scope="col">Type</th>
      <th scope="col">Actions</th>
    </React.Fragment>;
  }

  id(item: SimulationEnvironmentSummary): any {
    return item.name;
  }

  row(item: SimulationEnvironmentSummary): JSX.Element {
    return <React.Fragment>
      <td scope="row"><Link to={"/admin/simulation-environments/" + item.name}>{item.name}</Link></td>
      <td scope="row">{item.module_name}</td>
      <td scope="row">
        <button type="button" onClick={(x) => { this.requestItemDelete(item); } } className="btn btn-danger btn-sm">
          <FontAwesomeIcon icon={['fas','trash']} /> Delete</button>
      </td>
    </React.Fragment>;
  }

}

class SideColumnSimEnvListItem extends SideColumnListItem<SimulationEnvironmentSummary> {
  getUrl() {
    return "/admin/simulation-environments/" + this.props.item.name;
  }

  getCaption() {
    return this.props.item.name;
  }

  getDescription() {
    return this.props.item.module_name;
  }

  getIconSpan() {
    return <FontAwesomeIcon icon="clipboard"/>;
  }
}

class SideColumnSimEnvList extends SideColumnList<SimulationEnvironmentSummary> {
  equals(a: SimulationEnvironmentSummary, b: SimulationEnvironmentSummary): boolean {
    return a.name === b.name;
  }

  id(a: SimulationEnvironmentSummary): any {
    return a.name;
  }

  getNoChildrenText(): string {
    return "No simulation environments";
  }

  itemComponent(): { new(...args: any[]): SideColumnListItem<SimulationEnvironmentSummary> } {
    return SideColumnSimEnvListItem;
  }
}

export class SimEnvAdminPage extends GenericModelPage<SimulationEnvironmentSummary> {
  table(): { new(...args: any[]): GenericModelTable<SimulationEnvironmentSummary> } {
    return SimEnvTable;
  }

  detailPage(): { new(...args: any[]): DetailPageType<SimulationEnvironmentSummary> } {
    return SimulationEnvironmentPage;
  }

  renderAboveTable() {
    return <div className="rbb-TopButtons">
      <button type="button" onClick={(x) => { this.props.history.push('/admin/simulation-environments?new'); } } className="btn btn-sm btn-success">
        <FontAwesomeIcon icon={['fas','plus']} /> New Simulation Environment</button>
    </div>;
  }

  pageTitle(): string {
    return "Simulation Environments";
  }

  pageSubtitle(): string {
    return "Overview of all simulation environments";
  }

  loadModelFromServer(identifier: string): Promise<SimulationEnvironmentSummary> {
    return SimManager.getSimulationEnvironment(identifier);
  }

  loadModelsFromServer(): Promise<SimulationEnvironmentSummary[]> {
    return SimManager.getSimulationEnvironments();
  }

  sideColumn(): new(...args: any[]) => SideColumnList<SimulationEnvironmentSummary> {
    return SideColumnSimEnvList;
  }

  deleteModalTitle(): string {
    return "Delete Simulation Environment";
  }

  deleteModalContent(item: SimulationEnvironmentSummary): JSX.Element {
    return <React.Fragment>
      <h4>Are you sure?</h4>
      Do you really want to delete '{item.name}'? Corresponding simulation runs will be deleted too. The recorded bags will
      still be available in the attached bag store.
    </React.Fragment>;
  }

  deleteItem(item: SimulationEnvironmentSummary): void {
    SimManager.deleteSimulationEnvironment(item).then((response) => {
      toast.success("Simulation environment deleted!");
      this.reloadTableItems();
    }).catch((reason) => {
      toast.error("Simulation environment deletion failed!");
    });
  }

}
