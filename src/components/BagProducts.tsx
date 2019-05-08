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
import { BagDetailed, Product } from "client/api";
import { GroupPluginRegistry, PluginRegistry, RenderPlugin } from "render-plugins/RenderPlugin";
import ProductJson from "render-plugins/ProductJson";
import DetailedTopicInfo from "render-plugins/DetailedTopicInfo";
import TimeSeries from "render-plugins/TimeSeries";
import SimpleVideoGroup from "render-plugins/SimpleVideoGroup";
import ExtractionErrors from "render-plugins/ExtractionErrors";
import ImageGallery from "render-plugins/ImageGallery";

export default class BagProducts extends React.Component<{storeName:string, bag: BagDetailed}, {}> {
  plugins: PluginRegistry;
  groupPlugins: GroupPluginRegistry;
  fallbackPlugin: RenderPlugin;
  renderedGroups: { [key: string]: boolean };

  constructor(props: any, context?: any) {
    super(props, context);
    this.plugins = {};
    this.groupPlugins = {};

    const simpleVideoPlugin = new SimpleVideoGroup();
    simpleVideoPlugin.register(this.groupPlugins);

    const detailedTopicInfo = new DetailedTopicInfo();
    detailedTopicInfo.register(this.plugins);

    const timeSeries = new TimeSeries();
    timeSeries.register(this.plugins);

    const extractionErrors = new ExtractionErrors();
    extractionErrors.register(this.plugins);

    const imageGallery = new ImageGallery();
    imageGallery.register(this.plugins);

    this.fallbackPlugin = new ProductJson();
  }

  private allProductsFromType(type: string) {
    return this.props.bag.products.filter((x) => x.product_type === type);
  }

  renderProduct(product: Product) {
    if (product.product_type in this.groupPlugins) {
      if (product.product_type in this.renderedGroups) {
        return "";
      }
      this.renderedGroups[product.product_type] = true;
      return this.groupPlugins[product.product_type].render(this.allProductsFromType(product.product_type), this.props.bag, this.props.storeName);
    }

    if (product.product_type in this.plugins) {
      return this.plugins[product.product_type].render(product, this.props.bag, this.props.storeName);
    }

    return this.fallbackPlugin.render(product, this.props.bag, this.props.storeName);
  }

  render() {
    this.renderedGroups = {};
    if (this.props.bag) {
      return (
          <div>
            {this.props.bag.products.map((p) => this.renderProduct(p))}
          </div>);
    } else {
      return "No bag available";
    }
  }
}
