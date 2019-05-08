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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export class SideColumnListItem<T> extends React.Component<{ item: T, selected: boolean }, any> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = {};
  }

  getUrl() {
    return "";
  }

  getCaption() {
    return "Caption";
  }

  getDescription() {
    return "Description";
  }

  getIconSpan() {
    return <FontAwesomeIcon icon="star" />;
  }

  renderLink() {
    const active_link = this.props.selected ? "rbb-SideColumnList__link--active" : "";

    return <Link className={"rbb-SideColumnList__link "  + active_link} to={this.getUrl()}>
      <div className="rbb-SideColumnList__icon">{this.getIconSpan()}</div>
      <h3>{this.getCaption()}</h3>
      <h4>{this.getDescription()}</h4>
    </Link>;
  }

  render() {
    const active_item = this.props.selected ? "rbb-SideColumnList__item--active" : "";

    return (
        <li className={"rbb-SideColumnList__item " + active_item}>{this.renderLink()}</li>
    );
  }
}

export interface SideColumnListProps<T> {
  children: T[];
  selectedItem: T;
  moreAvailable: boolean;
  loadingMore: boolean;
  onRequestMore?: () => void;
}

export abstract class SideColumnList<T> extends React.Component<SideColumnListProps<T>, any > {

  abstract equals(a: T, b: T): boolean;
  abstract id(a: T): any;
  abstract getNoChildrenText(): string;
  abstract itemComponent(): new(...args : any[]) => SideColumnListItem<T>;

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = {};
  }

  render() {
    let listItems: any = "";

    if (this.props.children == null || this.props.children.length === 0) {
      listItems = <li className="rbb-SideColumnList--empty">{this.getNoChildrenText()}</li>;
    } else {
      listItems = this.props.children.map((item) => {
        const selected = this.props.selectedItem && this.equals(item, this.props.selectedItem);
        const Component = this.itemComponent();
        return <Component key={this.id(item)} item={item} selected={selected}/>;
      });
    }

    let loadMore: any;
    if (this.props.moreAvailable) {
      if (this.props.loadingMore) {
        loadMore = <li className="rbb-SideColumnList__more rbb-SideColumnList__more--loading">Loading...</li>;
      } else {
        loadMore = <li className="rbb-SideColumnList__more">
          <button type="button" className="btn btn-outline-secondary" onClick={this.props.onRequestMore}>Load More</button>
        </li>;
      }
    } else {
      loadMore = <li className="rbb-SideColumnList__more rbb-SideColumnList__more--complete">Nothing more to load</li>;
    }

    return <ul className="rbb-SideColumnList">{listItems}{loadMore}</ul>;
  }
}
