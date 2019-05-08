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
import * as Models from 'client/api';
import ProductCard from "components/ProductCard";
import { PluginRegistry, RenderPlugin } from "render-plugins/RenderPlugin";
import Error from "components/Error";
import { Player } from 'video-react';

interface FileKeyValue {
  [key: string]: Models.FileSummary;
}

export default class SimpleVideo extends RenderPlugin {
  register(registry: PluginRegistry): void {
    registry['video'] = this;
  }

  renderContent(product: Models.Product, bag: Models.BagDetailed, storeName: string): any {
    const files: FileKeyValue = {};
    product.files.forEach((f) => files[f.key] = f.file);

    if (!('video.mp4' in files)) {
      return <ProductCard product={product}>
        <div className={"card-body-inner"}>
            <Error> Video.mp4 not found in product file list. </Error>
        </div>
      </ProductCard>;
    }

    const videoUrl = files['video.mp4'].link;

    return <ProductCard product={product}>
      <div className={"rbb-SimpleVideo card-body-inner"}>
        <div className={"rbb-SimpleVideo__video video-container"}>
          <Player src={videoUrl}/>
          <a className="rbb-SimpleVideo__link" href={videoUrl}>Video link (login required)</a>
        </div>
      </div>
    </ProductCard>;
  }
}
