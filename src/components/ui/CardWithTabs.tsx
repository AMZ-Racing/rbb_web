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

export interface Tab {
  title: string;
  key: string;
  id?: string;
}

export default function CardWithTabs(props: {
  children: any,
  title: string,
  tabs: Tab[],
  selectedTab?: string,
  className?: string,
  onTabClick?: (tab: string) => void,
  id?: string
}) {

  const onTabLinkClick = (tab: string, e: any) => {
    e.stopPropagation();
    e.preventDefault();
    props.onTabClick(tab);
  };

  return (
      <div className={"card " + (props.className ? props.className : "")} id={props.id}>
        <div className="card-header">
          <h5>{props.title}</h5>
          <ul className="nav nav-tabs card-header-tabs">
            {props.tabs.map((tab) => {
              return <li key={tab.key} className="nav-item">
                <a className={props.selectedTab === tab.key ? "nav-link active" : "nav-link"}
                   href="#"
                   id={tab.id}
                  onClick={onTabLinkClick.bind(null, tab.key)}>{tab.title}</a>
              </li>;
            })}
          </ul>
        </div>
        <div className="card-body">
          { props.children }
        </div>
      </div>
  );
}
