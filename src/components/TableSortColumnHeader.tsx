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
import { SortOrder } from 'model/BagManager';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function TableSortColumnHeader<T>(props: {children: any, tag: T, order?: SortOrder, onChange?: (order: SortOrder, tag: T) => void}) {

  let icon: any = "";

  if (props.order) {
    switch (props.order) {
      case SortOrder.Ascending:
        icon = <FontAwesomeIcon icon="sort-up" />;
        break;
      case SortOrder.Descending:
        icon = <FontAwesomeIcon icon="sort-down" />;
        break;
      default:
        icon = <FontAwesomeIcon icon="sort" />;
    }
  } else {
    icon = <FontAwesomeIcon icon="sort" />;
  }

  function onClick(e:any) {
    e.preventDefault();
    e.stopPropagation();

    if (props.onChange) {
      switch (props.order) {
        case SortOrder.Ascending:
          props.onChange(SortOrder.Descending, props.tag);
          break;
        case SortOrder.Descending:
          props.onChange(SortOrder.None, props.tag);
          break;
        default:
          props.onChange(SortOrder.Ascending, props.tag);
      }
    }

    return false;
  }

  return (<th scope="col" className="rbb-TableSortColumnHeader" onClick={onClick}>{props.children} {icon}</th>);
}
