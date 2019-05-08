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
import 'react-datepicker/dist/react-datepicker.css';
import { Tag } from "../client/api";
import TagComponent from "./Tag";
import ReactSelect, * as Select from 'react-select';

export default function TagFilter(props: { tags: Tag[], selectedTags: string[], selectedTagsChanged: (newTags: string[]) => void }) {

  const tags = () => {
    if (props.tags) {
      return props.tags.map((tag) => {
        return <li key={tag.tag}><input type="checkbox" />&nbsp;<TagComponent tag={tag} /></li>;
      });
    }

    return <li>Loading...</li>;
  };

  const handleChange = (selection: {value: Tag, label: string}[]) : void => {
    const newTags: string[] = [];
    for (const tag of selection) {
      newTags.push(tag.value.tag);
    }

    props.selectedTagsChanged(newTags);
  };

  const tagMap: {[key: string]: Tag} = {};
  const selectedTagObjects: Tag[] = [];
  if (props.tags && props.selectedTags) {
    for (const tag of props.tags) {
      tagMap[tag.tag] = tag;
    }
    for (const selectedTag of props.selectedTags) {
      selectedTagObjects.push(tagMap[selectedTag]);
    }
  }

  const caption = <span>Tags&nbsp;{ selectedTagObjects.map((t) => <TagComponent tag={t} />) }
  </span>;

  return (<Dropdown caption={caption}>
    <form className="rbb-TagFilterDropdown px-1 py-0">
      <div className="form-group">
        <ReactSelect
          autofocus
          multi={true}
          name="bag-tag-filter-dropdown"
          value={selectedTagObjects.map((x: Tag) => {
            return { value: x, label: x.tag };
          })}
          onChange={handleChange}
          isLoading={props.tags === undefined}
          options={props.tags ? props.tags.map((x: Tag) => {
            return { value: x, label: x.tag };
          }) : []}
      />
      </div>
    </form>
  </Dropdown>);
}
