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

interface FileKeyValue {
  [key: string]: Models.FileSummary;
}

interface ScaleInformation {
  [scaleName: string]: {
    scale: number;
    timeline: string;
    timeline_url: string;
    topics: string;
    topics_url: string;
    topic_name_width: number;
  };
}

class DetailedTopicInfoComponent extends React.Component<{scales: ScaleInformation}, {currentScale: string}> {
  timelineContainer: HTMLElement;

  constructor(props: any, context?: any) {
    super(props, context);

    // By default we show the biggest scale
    let biggestScale: number = 0.000000001;
    for (const scale in props.scales) {
      if (props.scales[scale].scale > biggestScale) {
        biggestScale = props.scales[scale].scale;
        this.state = { currentScale: scale };
      }
    }
  }

  setScale(scaleKey:string) {
    console.log("Changing scale to " + scaleKey);
    this.setState({
      currentScale: scaleKey
    });
  }

  renderScaleMenu() {
    const scales = Object.keys(this.props.scales);

    return <div className="simple-option-menu">
      <div className="btn-group btn-group-toggle" data-toggle="buttons">
      {scales.map((scaleKey) => {
        const active = scaleKey === this.state.currentScale;
        return <label onClick={() => this.setScale(scaleKey) }
                      key={scaleKey}
                      className={active ? "btn btn-outline-info btn-sm active" : "btn btn-outline-info btn-sm"}>
          {this.props.scales[scaleKey].scale + " s/px"}
        </label>;
      })}
      </div>
    </div>;
  }

  render() {
    const currentScale = this.props.scales[this.state.currentScale];

    return (
        <React.Fragment>
          <div className="simple-option-menu">
            { this.renderScaleMenu() }
          </div>
          <div className="detailed-topic-info">
            <div className="topics-container">
              <img src={currentScale.topics_url} />
            </div>
            <div ref={(el) => this.timelineContainer = el}
                 className="timeline-container"
                 style={{ left: currentScale.topic_name_width + "px" }}>
              <img src={currentScale.timeline_url} />
            </div>
          </div>
        </React.Fragment>);
  }
}

export default class DetailedTopicInfo extends RenderPlugin {
  register(registry: PluginRegistry): void {
    registry['detailed-topic-info'] = this;
  }

  renderContent(product: Models.Product, bag: Models.BagDetailed, storeName: string): any {
    const files: FileKeyValue = {};
    product.files.forEach((f) => files[f.key] = f.file);
    const scales: ScaleInformation = product.product_data.scales;

    for (const scale in scales) {
      scales[scale].timeline_url = files[scales[scale].timeline].link;
      scales[scale].topics_url = files[scales[scale].topics].link;
    }

    const versionWarning = product.product_data.version === 1 ? "" : <Error>Unsupported data version</Error>;
    return <ProductCard product={product}>
      <div className={"card-body-inner"}>

        { versionWarning }

        <DetailedTopicInfoComponent scales={scales} />
      </div>
    </ProductCard>;
  }
}
