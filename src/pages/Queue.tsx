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
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import MainPage from "templates/MainPage";
import MainHeader from "templates/MainHeader";
import SideColumn from "templates/SideColumn";
import Content from "templates/Content";
import { RouteComponentProps } from "react-router";
import QueueHeaderBar from "components/QueueHeaderBar";
import { TaskDetailed, TaskSummary } from "client/api";
import QueueManager, { TaskState } from "model/QueueManager";
import FormattedJSON from "components/FormattedJSON";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-toastify';
import WaveSpinner from "components/WaveSpinner";
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import ArrayMove from 'array-move';

function QueueTable(props: {
  items: TaskSummary[],
  taskDetails: TaskDetailed,
  expand: string,
  onDetailsRequested: (identifier: string) => void,
  onMoveToTopRequested: (identifier: string) => void,
  onCancelRequested: (task: TaskSummary) => void
}) {

  const rows = props.items.map((task) => {
    let details: any = "";
    let state: any = "";
    let actions: any = "";

    if (props.expand === task.identifier) {
      if (props.taskDetails) {
        details = <tr className="rbb-QueueTable__details">
          <td colSpan={5}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Result</h5>
                <h6 className="card-subtitle mb-2 text-muted">Task output ({props.taskDetails.task})</h6>
                <FormattedJSON className="rbb-QueueTable__object" data={props.taskDetails.result} initialDepth={2}/>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Configuration</h5>
                <h6 className="card-subtitle mb-2 text-muted">Task input ({props.taskDetails.task})</h6>
                <FormattedJSON className="rbb-QueueTable__object" data={props.taskDetails.config}/>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Log</h5>
                <h6 className="card-subtitle mb-2 text-muted">stdout and stderr of the task ({props.taskDetails.task})</h6>
                <CodeMirror
                    className="rbb-QueueTable__log"
                    value={props.taskDetails.log}
                    options={{
                      mode: 'text',
                      theme: 'material',
                      lineNumbers: true,
                      readOnly: true,
                      scrollbarStyle: null,
                      lineWrapping: true
                    }}
                    onChange={(editor, data, value) => {
                    }}
                />
              </div>
            </div>
          </td>
        </tr>;
      } else {
        details = <tr>
          <td colSpan={5}>
            <WaveSpinner/>
          </td>
        </tr>;
      }
    }

    if (task.state === TaskState.Queued || task.state === TaskState.Running) {
      actions = <div className="rbb-QueueTable__buttons">
        <button type="button" onClick={(x) => {
          props.onCancelRequested(task);
        }} className="btn btn-warning btn-sm">
          <FontAwesomeIcon icon={['fas', 'ban']}/> Cancel
        </button>
        {task.state !== TaskState.Running &&
        <button type="button" onClick={(x) => {
          props.onMoveToTopRequested(task.identifier);
        }} className="btn btn-success btn-sm">
          <FontAwesomeIcon icon={['fas', 'angle-double-up']}/> Move to Top
        </button>
        }
      </div>;
    }

    switch (task.state) {
      case TaskState.Queued:
        state = <span className="badge badge-primary">queued</span>;
        break;
      case TaskState.Cancelled:
        state = <span className="badge badge-warning">cancelled</span>;
        break;
      case TaskState.CancellationRequested:
        state = <span className="badge badge-warning">stopping</span>;
        break;
      case TaskState.Running:
        state = <span className="badge badge-info">running</span>;
        break;
      case TaskState.Finished:
        if (task.success) {
          state = <span><span className="badge badge-success">succeeded</span> after {task.runtime.toFixed(1)} seconds</span>;
        } else {
          state = <span><span className="badge badge-danger">failed</span> after {task.runtime.toFixed(1)} seconds</span>;
        }
        break;
    }

    const taskTooltip = "Task: " + task.task + " | Priority: " + task.priority.toFixed(0);
    return <React.Fragment key={task.identifier}>
      <tr className="rbb-QueueTable__row">
        <td className="rbb-QueueTable__col" scope="row">
          <a href="#" onClick={(x) => {
            props.onDetailsRequested(task.identifier);
          }}>{task.identifier}</a>
        </td>
        <td className="rbb-QueueTable__col" scope="row">
          <a title={taskTooltip} href="#" onClick={(x) => {
            props.onDetailsRequested(task.identifier);
          }}>{task.description}</a>
        </td>
        <td className="rbb-QueueTable__col" scope="row">{state}</td>
        <td className="rbb-QueueTable__col" scope="row">{task.assigned_to}</td>
        <td className="rbb-QueueTable__col" scope="row">{actions}</td>
      </tr>
      {details}
    </React.Fragment>;
  });

  return <table className="rbb-QueueTable table">
    <thead>
    <tr className="rbb-QueueTable__header">
      <th scope="col" className="rbb-QueueTable__col">#</th>
      <th scope="col" className="rbb-QueueTable__col">Description</th>
      <th scope="col" className="rbb-QueueTable__col">State</th>
      <th scope="col" className="rbb-QueueTable__col">Assigned to</th>
      <th scope="col" className="rbb-QueueTable__col">Actions</th>
    </tr>
    </thead>
    <tbody>
    {rows}
    </tbody>
  </table>;
}

type QueueProps = RouteComponentProps<{}>;

interface QueueState {
  runningTasks: TaskSummary[];
  queuedTasks: TaskSummary[];
  finishedTasks: TaskSummary[];
  expandTask: string;
  taskDetails: TaskDetailed;
}

export default class Queue extends React.Component<QueueProps, QueueState> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { runningTasks: null, queuedTasks: null, finishedTasks: null, expandTask: "", taskDetails: null };
    QueueManager.getTasksSplit().then((tasks) => {
      this.setState({ runningTasks: tasks[0], queuedTasks: tasks[1], finishedTasks: tasks[2] });
    });
  }

  componentWillReceiveProps(nextProps: QueueProps) {

  }

  onPingClick = (): void => {
    QueueManager.queuePingTask(prompt("Assign ping task to")).then((x) => {
      toast.success("Ping queued!");
    }).catch((response) => {
      if (response.status === 409) {
        toast.warn("Ping already queued!");
      } else {
        toast.error("Ping queue failed!");
      }
    });
  };

  renderHeaderBar() {
    return <QueueHeaderBar onPingClick={this.onPingClick}/>;
  }

  findAndReplaceTask(task: TaskDetailed, collection: TaskSummary[]) {
    if (collection) {
      for (const oldTaskIdx in collection) {
        const oldTask = collection[oldTaskIdx];
        if (oldTask.identifier === task.identifier) {
          collection[oldTaskIdx] = task;
          return true;
        }
      }
    }

    return false;
  }

  updateTaskInTable(task: TaskDetailed) {
    let stateChange = {};

    if (this.state.taskDetails && this.state.taskDetails.identifier === task.identifier) {
      stateChange = Object.assign(stateChange, { taskDetails: task });
    }

    if (this.findAndReplaceTask(task, this.state.runningTasks)) {
      stateChange = Object.assign(stateChange, { runningTasks: this.state.runningTasks });
    }

    if (this.findAndReplaceTask(task, this.state.queuedTasks)) {
      stateChange = Object.assign(stateChange, { queuedTasks: this.state.queuedTasks });
    }

    if (this.findAndReplaceTask(task, this.state.finishedTasks)) {
      stateChange = Object.assign(stateChange, { finishedTasks: this.state.finishedTasks });
    }

    this.setState(stateChange);
  }

  moveTaskToTop(task: TaskDetailed) {
    if (this.state.queuedTasks) {
      for (let i = 0; i < this.state.queuedTasks.length; i += 1) {
        const oldTask = this.state.queuedTasks[i];
        if (oldTask.identifier === task.identifier) {
          this.setState({ queuedTasks: ArrayMove(this.state.queuedTasks, i, 0) });
          return;
        }
      }
    }
  }

  onDetailsRequested = (identifier: string): void => {
    if (identifier === this.state.expandTask) {
      this.setState({ expandTask: "" });
    } else {
      this.setState({ expandTask: identifier, taskDetails: null });
      QueueManager.getTaskDetails(identifier).then((task) => {
        this.setState({ expandTask: task.identifier, taskDetails: task });
      });
    }
  };

  onMoveToTopRequested = (identifier: string): void => {
    QueueManager.moveTaskToTopOfQueue(identifier).then((task) => {
      toast.success("Task moved to top of queue!");
      this.updateTaskInTable(task);
      this.moveTaskToTop(task);
    }).catch((response) => {
      console.log(response);
      toast.error("Moving of task failed!");
    });
  };

  onCancelRequested = (task: TaskSummary): void => {
    if (task.state === TaskState.Queued) {
      QueueManager.cancelTask(task.identifier).then((task) => {
        toast.success("Task cancelled!");
        this.updateTaskInTable(task);
      }).catch((response) => {
        toast.error("Task cancellation failed!");
      });
    } else {
      QueueManager.cancelRunningTask(task.identifier).then((task) => {
        toast.success("Task cancellation requested!");
        this.updateTaskInTable(task);
      }).catch((response) => {
        toast.error("Task cancellation request failed!");
      });
    }
  };

  renderContent() {
    let runningTable: any = "";
    let queuedTable: any = "";
    let finishedTable: any = "";

    if (this.state.runningTasks !== null) {
      if (this.state.runningTasks.length === 0) {
        runningTable = <p>There are no running tasks.</p>;
      } else {
        runningTable = <QueueTable
            items={this.state.runningTasks}
            taskDetails={this.state.taskDetails}
            expand={this.state.expandTask}
            onDetailsRequested={this.onDetailsRequested}
            onMoveToTopRequested={this.onMoveToTopRequested}
            onCancelRequested={this.onCancelRequested}/>;
      }
    } else {
      runningTable = <FoldingCubeSpinner/>;
    }

    if (this.state.queuedTasks !== null) {
      if (this.state.queuedTasks.length === 0) {
        queuedTable = <p>The queue is empty.</p>;
      } else {
        queuedTable = <QueueTable items={this.state.queuedTasks}
                                  taskDetails={this.state.taskDetails}
                                  expand={this.state.expandTask}
                                  onDetailsRequested={this.onDetailsRequested}
                                  onMoveToTopRequested={this.onMoveToTopRequested}
                                  onCancelRequested={this.onCancelRequested}/>;
      }
    } else {
      queuedTable = <FoldingCubeSpinner/>;
    }

    if (this.state.finishedTasks !== null) {
      finishedTable = <QueueTable items={this.state.finishedTasks}
                                  taskDetails={this.state.taskDetails}
                                  expand={this.state.expandTask}
                                  onDetailsRequested={this.onDetailsRequested}
                                  onMoveToTopRequested={this.onMoveToTopRequested}
                                  onCancelRequested={this.onCancelRequested}/>;
    } else {
      finishedTable = <FoldingCubeSpinner/>;
    }

    return <React.Fragment>
      <h2>Running</h2>
      {runningTable}
      <h2>Queued</h2>
      {queuedTable}
      <h2>Finished</h2>
      {finishedTable}
    </React.Fragment>;
  }

  render() {
    return <MainPage header={<MainHeader subMenu={this.renderHeaderBar()}/>}>
      <Content leftColumn={<SideColumn> </SideColumn>}>
        <div className="rbb-QueueContent">
          {this.renderContent()}
        </div>
      </Content>
    </MainPage>;
  }
}
