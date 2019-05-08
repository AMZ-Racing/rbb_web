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
import { TaskDetailed, TaskSummary } from "client/api";

export enum TaskState {
  Queued = 0,
  Running = 1,
  Paused = 2,
  // Above 100 means completed
  Finished = 100,
  Cancelled = 101,
  CancellationRequested = 102
}

export default class QueueManager {
  public static getTasksSplit() {
    const api = ApiHelper.getBasicApi();

    return Promise.all([
      api.listQueue(1000, 0, "", "true"),
      api.listQueue(1000, 0, "priority:desc,identifier:asc", "", "", "true"),
      api.listQueue(200, 0, "last_updated:desc", "", "true"),
    ]);
  }

  public static getTaskDetails(taskIdentifier: string) {
    const api = ApiHelper.getBasicApi();
    return api.getTask(taskIdentifier);
  }

  public static dummyTaskFactory() : TaskDetailed {
    return {
      identifier: '',
      detail_type: '',
      task: '',
      assigned_to: "",
      priority: 0,
      state: 0,
      config: {},
      description: '',
      success: false,
      runtime: 0,
      log: "",
      worker_labels: '',
      created: new Date(),
      result: {},
      last_updated: new Date()
    };
  }

  public static cancelTask(taskIdentifier: string) {
    const api = ApiHelper.getBasicApi();
    return api.doTaskAction(taskIdentifier, "cancel", this.dummyTaskFactory());
  }

  public static cancelRunningTask(taskIdentifier: string) {
    const api = ApiHelper.getBasicApi();
    return api.doTaskAction(taskIdentifier, "cancel_running", this.dummyTaskFactory());
  }

  public static moveTaskToTopOfQueue(taskIdentifier: string) {
    const api = ApiHelper.getBasicApi();
    return api.doTaskAction(taskIdentifier, "prio_up", this.dummyTaskFactory());
  }

  public static queueStoreIndexTask(store: string) {
    const task: TaskDetailed = {
      identifier: "",
      detail_type: 'TaskDetailed',
      task: 'rbb_tools.tasks.bags.index',
      assigned_to: "",
      priority: 1000,
      state: TaskState.Queued,
      config: {
        store: store,
        configuration: 'auto'
      },
      description: "Index bag store '" + store + "'",
      success: false,
      runtime: 0,
      worker_labels: '',
      created: new Date(),
      result: {},
      log: "",
      last_updated: new Date()
    };
    const api = ApiHelper.getBasicApi();
    return api.newTask(task);
  }

  public static queuePingTask(assignedToWorker: string) {
    const task: TaskDetailed = {
      identifier: "",
      detail_type: 'TaskDetailed',
      task: 'rbb_tools.tasks.test.ping',
      assigned_to: assignedToWorker,
      priority: 1000,
      state: TaskState.Queued,
      config: {
        worker: assignedToWorker
      },
      description: "Ping worker",
      success: false,
      runtime: 0,
      worker_labels: '',
      created: new Date(),
      result: {},
      log: "",
      last_updated: new Date()
    };
    const api = ApiHelper.getBasicApi();
    return api.newTask(task);
  }

  public static queueBagExtractionTask(storeName: string, bagName: string, configName: string) {
    const task: TaskDetailed = {
      identifier: "",
      detail_type: 'TaskDetailed',
      task: 'rbb_tools.tasks.bags.extract',
      assigned_to: "",
      priority: 1000,
      state: TaskState.Queued,
      config: {
        store: storeName,
        bag: bagName,
        configuration: configName
      },
      description: "Extract '" + bagName + "' with '" + configName + "'",
      success: false,
      runtime: 0,
      worker_labels: '',
      created: new Date(),
      result: {},
      log: "",
      last_updated: new Date()
    };
    const api = ApiHelper.getBasicApi();
    return api.newTask(task);
  }
}
