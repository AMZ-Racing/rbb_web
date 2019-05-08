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
import ReactImageGallery from 'react-image-gallery';

interface FileKeyValue {
  [key: string]: Models.FileSummary;
}

export default class ImageGallery extends RenderPlugin {
  register(registry: PluginRegistry): void {
    registry['images'] = this;
  }

  renderContent(product: Models.Product, bag: Models.BagDetailed, storeName: string): any {
    const files: FileKeyValue = {};
    product.files.forEach((f) => files[f.key] = f.file);

    const images = product.files.map((x) => {
      return {
        original: x.file.link,
        thumbnail: x.file.link
      };
    });

    return <ProductCard product={product}>
      <div className="rbb-ImageGallery">
        <ReactImageGallery items={images} />
      </div>
    </ProductCard>;
  }
}
