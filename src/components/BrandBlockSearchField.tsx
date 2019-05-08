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
import { FormEvent } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function BrandBlockSearchField(props: {value: string, onChange?: (newValue: string) => void}) {

  const onClearClick = () : void => {
    props.onChange("");
  };

  const onChange = (event: FormEvent<HTMLInputElement>) : void => {
    props.onChange(event.currentTarget.value);
  };

  const clearButton = <div className="rbb-BrandBlockSearchField__clear" onClick={onClearClick}>
    <FontAwesomeIcon icon={['far', 'times-circle']} className=""/>
      </div>;

  return (<div className="rbb-BrandBlockSearchField">
            <FontAwesomeIcon icon={['fas', 'search']} className="rbb-BrandBlockSearchField__icon" />
            <input className="rbb-BrandBlockSearchField__field" type="text" onChange={onChange} value={props.value} />
            {props.value ? clearButton : ""}
          </div>);
}
