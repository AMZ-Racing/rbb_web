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
import { Comment } from "client/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CommentTopic } from "model/CommentManager";
import SingleComment from "./SingleComment";
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import { toast } from 'react-toastify';
import api from "client/ApiHelper";

interface CommentPanelProps {
  onClose?: () => void;
  topic: CommentTopic;
}

export default class CommentPanel extends React.Component<
    CommentPanelProps,
    {comments: Comment[], loading: boolean, comment: string, posting: boolean, author: string}> {

  private refreshTimeout: any;
  private textAreaRef: any;

  constructor(props: any, context?: any) {
    super(props, context);

    this.state = {
      loading: true,
      comments: [],
      comment: "",
      posting: false,
      author: "..."
    };

    api.getUser().then((user) => {
      this.setState({ author: user.full_name });
    });

    this.refreshComments(this.props.topic);
  }

  refreshComments(topic: CommentTopic) {
    topic.listComments().then((comments) => {
      this.setState({
        comments,
        loading: false
      });
    });
  }

  componentWillReceiveProps(nextProps: CommentPanelProps) {
    if (nextProps.topic.equals(this.props.topic)) {
      return;
    }

    this.stopAutoRefresh();

    this.setState({
      loading: true,
      comments: []
    });

    this.refreshComments(nextProps.topic);
    this.startAutoRefresh();
  }

  stopAutoRefresh() {
    clearTimeout(this.refreshTimeout);
  }

  startAutoRefresh() {
    this.refreshTimeout = setTimeout(this.refreshHandler, 10000);
  }

  componentDidMount() {
    this.startAutoRefresh();
  }

  componentWillUnmount() {
    this.stopAutoRefresh();
  }

  refreshHandler = () => {
    this.props.topic.listComments().then((comments) => {
      this.refreshTimeout = setTimeout(this.refreshHandler, 10000);
      this.setState({
        comments
      });
    });
  };

  onCloseClick = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  onTextChange = (e: any) => {
    this.setState({
      comment: e.target.value
    });
  };

  onPostClick = () => {
    if (this.state.comment.trim() === "") {
      return;
    }

    if (!this.state.posting) {
      this.setState({ posting: true });

      const comment: Comment = {
        identifier: 0,
        comment_text: this.state.comment,
        created: new Date()
      };

      this.props.topic.postComment(comment).then((newComment) => {
        this.state.comments.push(newComment);
        if (this.textAreaRef) {
          this.textAreaRef.value = "";
        }
        this.setState({ posting: false, comment: "", comments: this.state.comments });
      }).catch((x) => {
        toast.error("An error occurred while posting the comment!");
        this.setState({ posting: false });
      });
    }
  };

  deleteComment(comment: Comment) {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    this.props.topic.deleteComment(comment).then((succeeded) => {
      if (succeeded) {
        for (let i = 0; i < this.state.comments.length; i += 1) {
          if (this.state.comments[i] === comment) {
            this.state.comments.splice(i, 1);
            this.setState({ comments: this.state.comments });
          }
        }
      }
    });
  };

  renderComments() {
    if (this.state.loading) {
      return <div className={"rbb-CommentPanel__comments"}><FoldingCubeSpinner /></div>;
    } else {
      let comments:any = "";

      if (this.state.comments.length > 0) {
        comments = this.state.comments.map((comment: Comment) =>
            <SingleComment
                onDelete={this.deleteComment.bind(this, comment)}
                key={comment.identifier}
                author={comment.posted_by.full_name}
                date={comment.created}>
              {comment.comment_text}
            </SingleComment>);
      } else {
        comments = "No comments";
      }

      return <div className={"rbb-CommentPanel__comments"}>
        {comments}
        <div className="rbb-Comment">
          <div className="rbb-Comment__header">
            <div className="rbb-Comment__author">{this.state.author}</div>
            <div className="rbb-Comment__age">Now</div>
          </div>
          <div className="rbb-Comment__text rbb-Comment__form">
            <textarea value={this.state.comment} ref={(x) => this.textAreaRef = x } onChange={this.onTextChange} disabled={this.state.posting} />
            <button onClick={this.onPostClick} type="button" className="btn btn-success btn-sm" disabled={this.state.posting}>Send</button>
          </div>
        </div>
      </div>;
    }
  }

  render() {
    return <div className={"rbb-CommentPanel"}>
      <div className={"rbb-CommentPanel__top"}>
        <h3>Comments
          <a href="#" onClick={this.onCloseClick}><FontAwesomeIcon icon={"times"}/></a>
        </h3>
      </div>
      {this.renderComments()}
    </div>;
  }
}
