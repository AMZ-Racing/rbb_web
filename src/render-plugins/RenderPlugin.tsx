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

export interface PluginRegistry {
  [key: string]: RenderPlugin;
}

export interface GroupPluginRegistry {
  [key: string]: GroupRenderPlugin;
}

/**
 * Renders every product once
 */
export abstract class RenderPlugin {
  public abstract renderContent(product: Models.Product, bag: Models.BagDetailed, storeName: string) : any;

  public render(product: Models.Product, bag: Models.BagDetailed, storeName: string) : any {
    return <div key={product.uid} className="render-plugin">{this.renderContent(product, bag, storeName)}</div>;
  }

  public abstract register(registry: PluginRegistry) : void;
}

/**
 * Renders all products of the same type once as a group
 */
export abstract class GroupRenderPlugin {
  public abstract renderContent(products: Models.Product[], bag: Models.BagDetailed, storeName: string) : any;

  public render(products: Models.Product[], bag: Models.BagDetailed, storeName: string) : any {
    return <div key={products[0].product_type} className="render-plugin">{this.renderContent(products, bag, storeName)}</div>;
  }

  public abstract register(registry: GroupPluginRegistry) : void;
}
