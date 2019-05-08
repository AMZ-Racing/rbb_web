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
import * as moment from "moment";

export default function SingleComment(props: { children: any, author: string, date: Date, onDelete?: () => void }) {

  let deleteButton: any = "";
  if (props.onDelete) {
    const onDelete = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      props.onDelete();
    };

    deleteButton = <React.Fragment> (<a href="#" onClick={onDelete}>delete</a>)</React.Fragment> ;
  }

  return (
      <div className="rbb-Comment">
        <div className="rbb-Comment__header">
          <div className="rbb-Comment__author">{props.author}</div>
          <div className="rbb-Comment__age">{moment(props.date).fromNow()}{deleteButton}</div>
        </div>
        <div className="rbb-Comment__text">
          {props.children}
        </div>
      </div>
  );
}
