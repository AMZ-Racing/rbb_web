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
import * as Rbbc from 'client/api';
import { Tag } from 'client/api';
import ApiHelper from 'client/ApiHelper';
import BagProducts from "components/BagProducts";
import * as moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tags } from "components/Tag";
import * as Select from 'react-select';
import 'react-select/dist/react-select.css';

interface BagProps {
  storeName: string;
  bag: Rbbc.BagDetailed;
  onTagsChange: (tags: string[]) => void;
  onDescriptionChange: (description: string) => void;
  savingTags: boolean;
  savingDescription: boolean;
  onExtractClick?: () => void;
  onTagClick?: (tag: Tag) => void;
  onToggleTrashClick?: () => void;
}

interface BagState {
  topicsVisible: boolean;
  editingTags: boolean;
  editingDescription: boolean;
  description: string;
  tags: string[];
  existingTags?: string[];
}

export default class Bag extends React.Component<BagProps, BagState> {
  topicsContainer: HTMLDivElement;

  constructor(props: any, context?: any) {
    super(props, context);
    this.topicsContainer = null;
    this.state = ({
      topicsVisible: false,
      editingDescription: false,
      editingTags: false,
      tags: this.props.bag.tags.map((x) => x.tag),
      description: this.props.bag.comment
    });
    ApiHelper.getBasicApi().listTags().then((tags) => {
      this.setState({ existingTags: tags.map((x) => x.tag) });
    });
  }

  componentWillReceiveProps(nextProps: BagProps) {
    this.setState({
      editingTags: false,
      tags: nextProps.bag.tags.map((x) => x.tag),
      description: this.props.bag.comment,
      editingDescription: false
    });
  }

  handleTopicsClick(e: any) {
    this.setState({ topicsVisible: !this.state.topicsVisible });
    e.preventDefault();
  }

  onDescriptionChange = (e: any): void => {
    this.setState({ description: e.target.value });
  };

  onDescriptionKeyDown = (e: any): void => {
    if (e.key === "Enter") {
      this.handleDescriptionEditSave();
    } else if (e.key === "Escape") {
      this.handleDescriptionEditCancel();
    }
  };

  handleEditDescriptionClick = (e: any): void => {
    this.setState({ editingDescription: true, description: this.props.bag.comment });
    e.preventDefault();
  };

  handleDescriptionEditCancel = (): void => {
    this.setState({ editingDescription: false, description: this.props.bag.comment });
  };

  handleDescriptionEditSave = (): void => {
    this.setState({ editingDescription: false });
    this.props.onDescriptionChange(this.state.description);
  };

  handleEditTagsClick = (e: any): void => {
    this.setState({ editingTags: true });
    e.preventDefault();
  };

  handleTagChange = (newTags: any): void => {
    this.setState({ tags: newTags.map((x:any) => x.value) });
  };

  handleTagEditCancel = (): void => {
    this.setState({ editingTags: false, tags: this.props.bag.tags.map((x) => x.tag) });
  };

  handleTagEditSave = (): void => {
    this.setState({ editingTags: false });
    this.props.onTagsChange(this.state.tags);
  };

  onExtractClick = (e: any): void => {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.onExtractClick) {
      this.props.onExtractClick();
    }
  };

  onToggleTrashClick = (e: any): void => {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.onToggleTrashClick) {
      this.props.onToggleTrashClick();
    }
  };

  render() {

    let topics: any = "";
    let metaInformation: any = "";

    if (this.state.topicsVisible) {
      topics = <div className="bag-topics-container">
        <div className="bag-topics">
          <ul>
            {this.props.bag.topics.sort((a, b) => {
              return a.name.localeCompare(b.name);
            }).map((t) => <li key={t.name}>{t.name} ({t.avg_frequency.toFixed(2)} Hz)</li>)}
          </ul>
        </div>
      </div>;
    }

    let tags: any = "";

    if (this.props.savingTags) {
      tags = <div className="rbb-Bag__tags">Saving tags...</div>;
    } else {
      if (this.state.editingTags) {
        tags = <div className="rbb-Bag__tags">
          <Select.Creatable
              autofocus
              multi={true}
              name="bag-tags"
              value={this.state.tags.map((x) => {
                return { value: x, label: x };
              })}
              onChange={this.handleTagChange}
              isLoading={this.state.existingTags === undefined}
              options={this.state.existingTags ? this.state.existingTags.map((x) => {
                return { value: x, label: x };
              }) : []}
          />
          <div className="rbb-Bag__tag-buttons">
          <button type="button" className="btn btn-sm btn-primary" onClick={this.handleTagEditSave}>Save</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={this.handleTagEditCancel}>Cancel</button>
          </div>
        </div>;
      } else {
        tags = <div className="rbb-Bag__tags">
          <Tags onClick={this.props.onTagClick} tags={this.props.bag.tags}/> (<a href="#" onClick={this.handleEditTagsClick}>edit</a>)
        </div>;
      }
    }

    let description: any = "";
    if (this.props.savingDescription) {
      description = <div className="rbb-Bag__description">Saving description...</div>;
    } else {
      if (this.state.editingDescription) {
        description = <div className="rbb-Bag__description"><span className={"bag-detail"}>
                <input type="text" autoFocus onKeyDown={this.onDescriptionKeyDown} onChange={this.onDescriptionChange} value={this.state.description} />
          <div className="rbb-Bag__description-buttons">
          <button type="button" className="btn btn-sm btn-primary" onClick={this.handleDescriptionEditSave}>Save</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={this.handleDescriptionEditCancel}>Cancel</button>
          </div>
        </span></div>;
      } else {
        description = <div className="rbb-Bag__description"><span className={"bag-detail"}>
                  <FontAwesomeIcon icon={['fas', 'quote-right']}/> {this.props.bag.comment ? this.props.bag.comment : "No description"}
          &nbsp;(<a href="#" onClick={this.handleEditDescriptionClick}>edit</a>)
        </span></div>;
      }
    }



    if (this.props.bag) {
      if (this.props.bag.meta_available) {
        metaInformation = <div className="meta">
        <span className={"bag-detail"}>
          <FontAwesomeIcon icon={['fas', 'list']} /> {this.props.bag.topics.length} topics
          (<a href="#" onClick={this.handleTopicsClick.bind(this)}>{this.state.topicsVisible ? "hide" : "show"}</a>)
        </span>
          <span className={"bag-detail"}>
          <FontAwesomeIcon icon={['far', 'file']} /> {Math.round(this.props.bag.size / 1024 / 1024)} Mb
        </span>
          <span className={"bag-detail"}>
          <FontAwesomeIcon icon={['far', 'clock']} /> {Math.round(this.props.bag.duration)} seconds
        </span>
          <span className={"bag-detail"}>
          <FontAwesomeIcon icon={['far', 'calendar-alt']} /> {moment(this.props.bag.start_time).format("DD-MM-YYYY HH:mm")}
        </span>
        </div>;
      } else {
        metaInformation = <div className="meta">
          <span className={"bag-detail"}>
          <FontAwesomeIcon icon={['far', 'clock']} /> Meta information not yet available
        </span>
        </div>;
      }

      return (
          <div>
            <div className="bag-header" id="bag-top">
              <h1 className={this.props.bag.in_trash && "in-trash"}>{this.props.bag.name}</h1>
              <h2>
                {description}
                {metaInformation}
                <span className={"bag-detail"}>
                  <a title="Download" href={ApiHelper.bagDownloadLink(this.props.bag.name, this.props.storeName)}>
                    <FontAwesomeIcon icon={['fas', 'download']} /></a>
                </span>
                <span className={"bag-detail"}>
                  <a title="Process" href="#" onClick={this.onExtractClick}>
                    <FontAwesomeIcon icon={['fas', 'video']} /></a>
                </span>
                <span className={"bag-detail"}>
                  {!this.props.bag.in_trash && <a title="Move to Trash" href="#" onClick={this.onToggleTrashClick}>
                    <FontAwesomeIcon icon={['fas', 'trash']} /></a>}
                  {this.props.bag.in_trash && <a title="Move out of Trash" href="#" onClick={this.onToggleTrashClick}>
                    <FontAwesomeIcon icon={['fas', 'trash']} /></a>}
                </span>
              </h2>
              {tags}
              {topics}
            </div>
            <BagProducts storeName={this.props.storeName} bag={this.props.bag}/>
            <div className="filler-block"></div>
          </div>
      );
    } else {
      return (
          <h1>Loading...</h1>
      );
    }
  }
}
