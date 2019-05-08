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
import { Link } from "react-router-dom";
import { BagStoreDetailed, Tag } from "client/api";
import ApiHelper from "client/ApiHelper";
import { BagFilter, DateRangeFilter } from "model/BagManager";
import Dropdown from './Dropdown';
import DateRangeFilterDropdown from "./DateRangeFilter";
import Moment from "moment";
import MiscellaneousFilter from "./MiscellaneousFilter";
import TagFilter from "./TagFilter";

function StoreDropdown(props: {stores: string[], selectedStore: string}) {
  return (<Dropdown caption={"Store: " + props.selectedStore}>
      {props.stores.map((name) => <Link key={name} className="dropdown-item" to={"/bags/" + name}>{name}</Link>)}</Dropdown>

  );
}

export default class BagHeaderBar extends React.Component<
    { stores: string[], selectedStore: BagStoreDetailed, filter: BagFilter, onFilterChange: (f: BagFilter) => void } ,
    { tags: Tag[] }> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { tags: null };
    ApiHelper.getBasicApi().listTags().then((tags) => this.setState({ tags }));
  }

  discoveredChanged = (range: DateRangeFilter): void => {
    this.props.filter.discovered = range;
    this.props.onFilterChange(this.props.filter);
  };

  startTimeChanged = (range: DateRangeFilter): void => {
    this.props.filter.startTime = range;
    this.props.onFilterChange(this.props.filter);
  };

  otherChanged = (trash: boolean): void => {
    this.props.filter.trash = trash;
    this.props.onFilterChange(this.props.filter);
  };

  tagsChanged = (tags: string[]): void => {
    this.props.filter.tags = tags;
    this.props.onFilterChange(this.props.filter);
  };

  dateFilterText(filter: DateRangeFilter, name: string, optDateFormat?: string) : string {
    const dateFormat = optDateFormat ? optDateFormat : "DD-MM-YYYY";

    const texts: string[] = [];
    if (filter.greaterThanEqual) {
      texts.push("after " + Moment(filter.greaterThanEqual).format(dateFormat));
    }
    if (filter.lowerThanEqual) {
      texts.push("before " + Moment(filter.lowerThanEqual).format(dateFormat));
    }

    return name + " " + (texts.length > 0 ? texts.join(" and ") : "filter");
  };

  render() {
    const discoveredText = this.dateFilterText(this.props.filter.discovered, "Discovered");
    const startTimeText = this.dateFilterText(this.props.filter.startTime, "Start time");

    const otherText = this.props.filter.trash ? <span className={"rbb-ImportantFilter"}>Other: Viewing trash</span> : "Other";

    return <React.Fragment>
      <StoreDropdown stores={this.props.stores} selectedStore={this.props.selectedStore ? this.props.selectedStore.name : "-"}/>
      <DateRangeFilterDropdown
          range={this.props.filter.discovered}
          id="discovered_range"
          onChange={this.discoveredChanged}>{discoveredText}</DateRangeFilterDropdown>
      <DateRangeFilterDropdown
          range={this.props.filter.startTime}
          id="start_time_range"
          onChange={this.startTimeChanged}>{startTimeText}</DateRangeFilterDropdown>
      <MiscellaneousFilter onChange={this.otherChanged} trash={this.props.filter.trash}>{otherText}</MiscellaneousFilter>
      <TagFilter tags={this.state.tags} selectedTags={this.props.filter.tags} selectedTagsChanged={this.tagsChanged} />
    </React.Fragment>;
  }
}
