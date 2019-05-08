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
import { BagDetailed, BagSummary, Tag } from "client/api";
import * as moment from 'moment';
import BagProductListMenu from "components/BagProductListMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tags } from "components/Tag";

function SideColumnBagListItem(props: {
  children: any,
  bag: BagSummary | BagDetailed,
  storeName: string,
  onTagClick?: (tag: Tag) => void
}) {
  let productMenu: JSX.Element = null;

  const detailed = props.bag as BagDetailed;
  if (detailed.products) {
    productMenu = <BagProductListMenu bag={detailed} storeName={props.storeName}/>;
  }

  let iconSpan:any = "";
  if (detailed.extraction_failure) {
    iconSpan = <FontAwesomeIcon className="--status-red" icon="circle" />;
  } else if (detailed.meta_available) {
    iconSpan = <FontAwesomeIcon className="--status-green" icon="circle" />;
  } else {
    iconSpan = <FontAwesomeIcon className="--status-orange" icon="dot-circle" />;
  }

  const url = "/bags/" + props.storeName + "/" + props.bag.name;
  const listItemClasses = (productMenu ? "rbb-SideColumnBagList__item rbb-SideColumnBagList__item--active" : "rbb-SideColumnBagList__item") + (
      props.bag.in_trash ? " rbb-SideColumnBagList__item--trash" : ""
  );
  return (
      <li className={listItemClasses}>
        <Link className={productMenu ? "rbb-SideColumnBagList__link rbb-SideColumnBagList__link--active" : "rbb-SideColumnBagList__link"} to={url}>
          <div className="rbb-SideColumnBagList__icon">{iconSpan}</div>
          <h3>{props.bag.name}</h3>
          <h4>Discovered {moment(props.bag.discovered).fromNow()}, <Tags onClick={props.onTagClick} tags={props.bag.tags} /></h4>
        </Link>
        {productMenu}
      </li>
  );
}

interface SideColumnBagListProps {
  children: BagSummary[];
  bag: BagSummary | BagDetailed;
  storeName: string;
  moreAvailable: boolean;
  loadingMore: boolean;
  onRequestMore: () => void;
  onTagClick?: (tag: Tag) => void;
}

export default function SideColumnBagList(props: SideColumnBagListProps) {
  let bagList:any = "";
  if (props.children == null || props.children.length === 0) {
    bagList = <li className="rbb-SideColumnBagList--empty">No bags found</li>;
  } else {
    bagList = props.children.map((b) => {
      if (props.bag && b.name === props.bag.name) {
        return <SideColumnBagListItem onTagClick={props.onTagClick} key={props.bag.name} bag={props.bag} storeName={props.storeName} children=""/>;
      } else {
        return <SideColumnBagListItem onTagClick={props.onTagClick} key={b.name} bag={b} storeName={props.storeName} children=""/>;
      }
    });
  }

  let loadMore: any;
  if (props.moreAvailable) {
    if (props.loadingMore) {
      loadMore = <li className="rbb-SideColumnBagList__more rbb-SideColumnBagList__more--loading">Loading...</li>;
    } else {
      loadMore = <li className="rbb-SideColumnBagList__more">
        <button type="button" className="btn btn-outline-secondary" onClick={props.onRequestMore}>Load More</button></li>;
    }
  } else {
    loadMore = <li className="rbb-SideColumnBagList__more rbb-SideColumnBagList__more--complete">No more bags to load</li>;
  }

  return <ul className="rbb-SideColumnBagList">{bagList}{loadMore}</ul>;
}
