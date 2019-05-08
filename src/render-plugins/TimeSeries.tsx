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
import Dygraph from 'dygraphs';
import WaveSpinner from "components/WaveSpinner";
import ApiHelper from "client/ApiHelper";

interface FileKeyValue {
  [key: string]: Models.FileSummary;
}

class TimeSeriesComponent extends React.Component<{ name: string, fields: any, file: string }, { data: string, loading: boolean }> {
  graphContainer: HTMLElement;

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = {
      data: "",
      loading: false
    };
  }

  renderGraph(el: HTMLElement) {
    this.graphContainer = el;

    if (el === null) {
      return;
    }

    const colors: string[] = [];

    for (const field in this.props.fields) {
      colors.push(this.props.fields[field].default_color);
    }

    new Dygraph(
        el,
        this.state.data, { colors, legend: "always", xlabel: "Time [s]" }
    );
  }

  load = () => {
    this.setState({ loading: true });

    ApiHelper.fetchFileContents(this.props.file).then((response) => {
      response.text().then((text: any) => {
        this.setState({ data: text });
      });
    });
  }

  render() {

    let content: any;

    if (this.state.data) {
      content = <div ref={(el) => this.renderGraph(el)} style={{ height: '400px', width: '90%', margin: 'auto' }}/>;
    } else {
      if (this.state.loading) {
        content = <div><WaveSpinner/></div>;
      } else {
        content = <div className="rbb-TimeSeriesComponent__control">
          <button type="button" className="btn btn-outline-primary" onClick={this.load}>Load</button>
        </div>;
      }
    }

    return <div className="rbb-TimeSeriesComponent">
      <h5 className="rbb-TimeSeriesComponent__title">{this.props.name}</h5>
      {content}
    </div>;
  }
}

export default class TimeSeries extends RenderPlugin {
  register(registry: PluginRegistry): void {
    registry['time-series'] = this;
  }

  renderContent(product: Models.Product, bag: Models.BagDetailed, storeName: string): any {
    const files: FileKeyValue = {};
    product.files.forEach((f) => files[f.key] = f.file);
    const series: any = product.product_data.series;

    const versionWarning = product.product_data.version === 1 ? "" : <Error>Unsupported data version</Error>;
    return <ProductCard product={product}>
      <div className={"rbb-TimeSeries card-body-inner"}>

        {versionWarning}

        {series.map((serie: any) => {
          return <TimeSeriesComponent key={serie.name} name={serie.name} fields={serie.fields} file={files[serie.file].link}/>;
        })}

      </div>
    </ProductCard>;
  }
}
