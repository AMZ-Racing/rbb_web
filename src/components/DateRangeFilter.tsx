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
import Dropdown from './Dropdown';
import { DateRangeFilter } from "model/BagManager";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Moment from 'moment';

export default function DateRangeFilterDropdown(props: { range: DateRangeFilter, id: string, children: string, onChange: (r: DateRangeFilter) => void }) {

  function onChangeBefore(date: Moment.Moment | null) {
    props.onChange({
      lowerThanEqual: date ? date.toDate() : undefined,
      greaterThanEqual: props.range.greaterThanEqual,
    });
  }

  function onChangeAfter(date: Moment.Moment | null) {
    props.onChange({
      lowerThanEqual: props.range.lowerThanEqual,
      greaterThanEqual: date ? date.toDate() : undefined,
    });
  }

  function onLast3DaysClick(e: any) {
    onChangeAfter(Moment().subtract(3, "days"));
  }

  function onLast7DaysClick(e: any) {
    onChangeAfter(Moment().subtract(7, "days"));
  }

  function onBeforeClearClick(e: any) {
    e.stopPropagation();
    e.preventDefault();
    onChangeBefore(undefined);
  }

  function onAfterClearClick(e: any) {
    e.stopPropagation();
    e.preventDefault();
    onChangeAfter(undefined);
  }

  return (<Dropdown caption={props.children}>
    <form className="rbb-DateRangeFilterDropdown px-2 py-2">
      <div className="form-group">
        Last: <a href="#" onClick={onLast3DaysClick}>3 days</a>, <a href="#" onClick={onLast7DaysClick}>7 days</a>
      </div>
      <div className="form-group">
        <label htmlFor={props.id + "_after"}>After <a href="#" onClick={onAfterClearClick}>clear</a></label>
        <DatePicker id={props.id + "_after"} selected={props.range.greaterThanEqual ? Moment(props.range.greaterThanEqual) : null}
                    onChange={onChangeAfter}/>
      </div>
      <div className="form-group">
        <label htmlFor={props.id + "_before"}>Before <a href="#" onClick={onBeforeClearClick}>clear</a></label>
        <DatePicker id={props.id + "_before"} selected={props.range.lowerThanEqual ? Moment(props.range.lowerThanEqual) : null}
                    onChange={onChangeBefore}/>
      </div>
    </form>
  </Dropdown>);
}