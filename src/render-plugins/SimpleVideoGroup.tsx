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
import { GroupPluginRegistry, GroupRenderPlugin } from "render-plugins/RenderPlugin";
import Error from "components/Error";
import { Player } from 'video-react';
import CardWithTabs, { Tab } from "components/ui/CardWithTabs";

interface FileKeyValue {
  [key: string]: Models.FileSummary;
}

interface Video {
  title: string;
  url: string;
  pid: string;
}

interface VideoGroupComponentProps {
  videos: Video[];
}

class VideoGroupComponent extends React.Component<VideoGroupComponentProps, { selectedTab: string }> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = {
      selectedTab: "0"
    };
  }

  componentWillReceiveProps(nextProps: VideoGroupComponentProps) {
    this.setState({ selectedTab: "0" });
  }

  tabs(): Tab[] {
    return this.props.videos.map((video, index) => {
      return {
        title: video.title,
        id: "p" + video.pid,
        key: index.toString()
      };
    });
  }

  onTabChange = (tab: string) => {
    this.setState({ selectedTab: tab });
  };

  render() {
    return <CardWithTabs className={"rbb-SimpleVideoGroup"}
                         title="Videos"
                         onTabClick={this.onTabChange}
                         tabs={this.tabs()}
                         selectedTab={this.state.selectedTab}>
      <div className="rbb-SimpleVideoGroup__video">
        <Player fluid={true} ref="player" src={this.props.videos[parseInt(this.state.selectedTab)].url}>

        </Player>
        <a className="rbb-SimpleVideo__link" href={this.props.videos[parseInt(this.state.selectedTab)].url}>Video link (login required)</a>
      </div>
    </CardWithTabs>;
  }
}

export default class SimpleVideoGroup extends GroupRenderPlugin {
  register(registry: GroupPluginRegistry): void {
    registry['video'] = this;
  }

  renderContent(products: Models.Product[], bag: Models.BagDetailed, storeName: string): any {

    const videos: Video[] = [];
    const errors: JSX.Element[] = [];

    for (const product of products) {
      const files: FileKeyValue = {};
      product.files.forEach((f) => files[f.key] = f.file);

      if (!('video.mp4' in files)) {
        errors.push(<Error> Video.mp4 not found in product file list. </Error>);
        continue;
      }

      videos.push({
        title: product.title,
        url: files['video.mp4'].link,
        pid: product.uid
      });
    }

    return <React.Fragment>
      {errors}
      <VideoGroupComponent videos={videos}/>
    </React.Fragment>;
  }
}
