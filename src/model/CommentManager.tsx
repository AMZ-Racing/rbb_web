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

import ApiHelper from "client/ApiHelper";
import { Comment } from "client/api";

export interface CommentTopic {
  listComments(): Promise<Comment[]>;
  postComment(comment: Comment): Promise<Comment>;
  deleteComment(comment: Comment): Promise<boolean>;
  equals(other: CommentTopic): boolean;
}

class BagCommentTopic implements CommentTopic {
  private bagName: string;
  private storeName: string;

  constructor(storeName: string, bagName: string) {
    this.bagName = bagName;
    this.storeName = storeName;
  }

  listComments(): Promise<Comment[]> {
    const api = ApiHelper.getBasicApi();
    return api.getBagComments(this.storeName, this.bagName);
  }

  postComment(comment: Comment): Promise<Comment> {
    const api = ApiHelper.getBasicApi();
    return api.newBagComment(this.storeName, this.bagName, comment);
  }

  deleteComment(comment: Comment): Promise<boolean> {
    const api = ApiHelper.getBasicApi();
    return api.deleteBagComment(this.storeName, this.bagName, comment.identifier).then((x) => {return true;} );
  }

  equals(other: CommentTopic): boolean {
    if (other instanceof BagCommentTopic) {
      return other.bagName === this.bagName && other.storeName === this.storeName;
    }

    return false;
  }
}

export default class CommentManager {

  public static getBagCommentTopic(storeName: string, bagName: string): CommentTopic {
    return new BagCommentTopic(storeName, bagName);
  }

}
