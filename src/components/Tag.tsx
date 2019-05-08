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
import * as Api from 'client/api';

export default function Tag(props: {tag: Api.Tag, onClick?: (tag: Api.Tag) => void }) {

  const click = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (props.onClick) {
      props.onClick(props.tag);
    }
  };

  if (props.tag.color) {
    return (<span onClick={click} className="rbb-Tag badge badge-primary" style={{ backgroundColor:props.tag.color }}>{props.tag.tag}</span>);
  } else {
    return (<span onClick={click} className="rbb-Tag badge badge-primary">{props.tag.tag}</span>);
  }
}

export function Tags(props: {tags: Api.Tag[], onClick?: (tag: Api.Tag) => void}) {
  if (props.tags.length) {
    return <React.Fragment>{props.tags.map((tag) => <Tag onClick={props.onClick} key={tag.tag} tag={tag}/>)}</React.Fragment>;
  } else {
    return <span>no tags</span>;
  }
}
