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
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import { RouteComponentProps } from "react-router";
import AdminSubmenu from "./AdminSubmenu";
import MainPage from "templates/MainPage";
import MainHeader from "templates/MainHeader";
import Content from "templates/Content";
import SideColumn from "templates/SideColumn";
import { SideColumnList } from "../../templates/SideColumnList";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

interface GenericModelTableProps<T> {
  items: T[];
  requestDelete?: (itemToDelete: T) => void;
}

export abstract class GenericModelTable<T> extends React.Component<GenericModelTableProps<T>, {}> {

  abstract header(): JSX.Element;
  abstract id(item: T): any;
  abstract row(item: T): JSX.Element;

  constructor(props: any, context?: any) {
    super(props, context);
  }

  requestItemDelete(itemToDelete: T) {
    if ('requestDelete' in this.props) {
      this.props.requestDelete(itemToDelete);
    }
  }

  render() {
    const rows = this.props.items.map((item) => {
      return <tr key={this.id(item)} className="rbb-Table__row rbb-GenericModelTable__row">
        {this.row(item)}
      </tr>;
    });

    return <table className="rbb-Table rbb-GenericModelTable">
      <thead>
      <tr className="rbb-Table__header rbb-GenericModelTable__header">
        {this.header()}
      </tr>
      </thead>
      <tbody>
      {rows}
      </tbody>
    </table>;
  }
}

interface GenericModelTablePageState<T> {
  items: T[];
  detailedItem: T;
  aboutToDeleteItem: T;
}

export interface GenericModelTablePageProps<T> extends RouteComponentProps<{ identifier?: string }> {

}

export interface GenericModelDetailPageProps<T> {
  model: T;
  newModel: boolean;
  parentProps: GenericModelTablePageProps<T>;
  modelCreated: (model: T) => void;
  modelChanged: (model: T) => void;
}

export type DetailPageType<T> = React.Component<GenericModelDetailPageProps<T>, any>;

export default abstract class GenericModelPage<T> extends React.Component<GenericModelTablePageProps<T>, GenericModelTablePageState<T>> {

  abstract loadModelFromServer(identifier: string): Promise<T>;

  abstract loadModelsFromServer(): Promise<T[]>;

  abstract sideColumn(): new(...args: any[]) => SideColumnList<T>;

  abstract table(): new(...args: any[]) => GenericModelTable<T>;

  abstract pageTitle(): string;

  abstract pageSubtitle(): string;

  deleteModalTitle(): string { return ""; }

  deleteModalContent(item: T): JSX.Element { return null; }

  deleteItem(item: T): void { }

  detailPage(): new(...args: any[]) => DetailPageType<T> { return null; }

  static initialState<T>(): GenericModelTablePageState<T> {
    return {
      items: null,
      detailedItem: null,
      aboutToDeleteItem: null
    };
  }

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = GenericModelPage.initialState<T>();

    this.reloadTableItems(false);
    this.loadDetailedModel(this.props.match.params.identifier, true);
  }

  componentWillReceiveProps(nextProps: GenericModelTablePageProps<T>) {
    this.loadDetailedModel(nextProps.match.params.identifier);
  }

  loadDetailedModel(identifier?: string, noClear?: boolean) {
    // Do we also load a specific user?
    if (identifier == null) {
      noClear || this.setState({ detailedItem: null });
    } else {
      this.loadModelFromServer(identifier).then((user) => this.setState({ detailedItem: user }));
    }
  }

  reloadTableItems(clear: boolean = true) {
    if (clear) {
      this.setState({ items: null });
    }
    this.loadModelsFromServer().then((items) => this.setState({ items }));
  }

  isLoading(): boolean {
    if (this.props.match.params.identifier != null) {
      return this.state.detailedItem == null;
    } else {
      return this.state.items == null;
    }
  }

  creatingNewItem(): boolean {
    return window.location.search === "?new";
  }

  renderDetailedItem(item: T): JSX.Element {
    const DetailPage = this.detailPage();
    if (DetailPage) {
      return <DetailPage newModel={false}
                         model={item}
                         parentProps={this.props}
                         modelCreated={this.onModelCreated}
                         modelChanged={this.onModelChanged} />;
    }
    return null;
  }

  renderCreateNewItem(): JSX.Element {
    const DetailPage = this.detailPage();
    if (DetailPage) {
      return <DetailPage newModel={true}
                         model={null}
                         parentProps={this.props}
                         modelCreated={this.onModelCreated}
                         modelChanged={this.onModelChanged} />;
    }
    return null;
  }

  renderTable() {
    const Table = this.table();
    return <React.Fragment>
      <h1 className="rbb-GenericTablePage__title">{this.pageTitle()}</h1>
      <h2 className="rbb-GenericTablePage__subtitle">{this.pageSubtitle()}</h2>
      {this.renderAboveTable()}
      <Table items={this.state.items} requestDelete={this.onTableRowDeleteClick} />
    </React.Fragment>;
  }

  renderAboveTable() : JSX.Element {
    return null;
  }

  renderContent() {
    if (!this.isLoading()) {
      if (this.state.detailedItem != null) {
        return this.renderDetailedItem(this.state.detailedItem);
      } else if (this.creatingNewItem()) {
        return this.renderCreateNewItem();
      } else {
        return this.renderTable();
      }
    }

    return <FoldingCubeSpinner/>;
  }

  renderColumn() {
    if (this.state.items) {
      const Column = this.sideColumn();
      return <Column selectedItem={this.state.detailedItem} moreAvailable={false} loadingMore={false}>{this.state.items}</Column>;
    } else {
      return <FoldingCubeSpinner/>;
    }
  }

  renderHeaderBar() {
    return <AdminSubmenu/>;
  }

  onSideColumnScrollEnd = (): void => {
    // We are not loading users on demand
  };

  onTableRowDeleteClick = (itemToDelete: T): void => {
    this.setState({ aboutToDeleteItem: itemToDelete });
  };

  onConfirmDeleteClick = (): void => {
    this.deleteItem(this.state.aboutToDeleteItem);
    this.setState({ aboutToDeleteItem: null });
  };

  onCancelDeleteClick = (): void => {
    this.setState({ aboutToDeleteItem: null });
  };

  onModelCreated = (model: T): void => {
    this.reloadTableItems();
  };

  onModelChanged = (model: T): void => {
    this.reloadTableItems();
  };

  render() {
    return <React.Fragment>
      <MainPage header={<MainHeader subMenu={this.renderHeaderBar()}/>}>
        <Content leftColumn={<SideColumn onYReachEnd={this.onSideColumnScrollEnd}> {this.renderColumn()}</SideColumn>}>
          <div className="rbb-GenericTablePage">
            {this.renderContent()}
          </div>
        </Content>
      </MainPage>
      <ConfirmDeleteModal
          open={this.state.aboutToDeleteItem != null}
          title={ this.deleteModalTitle() }
          onDelete={ this.onConfirmDeleteClick }
          onCancel={ this.onCancelDeleteClick } >
        { this.state.aboutToDeleteItem ? this.deleteModalContent(this.state.aboutToDeleteItem) : null }
      </ConfirmDeleteModal>
    </React.Fragment>;
  }
}
