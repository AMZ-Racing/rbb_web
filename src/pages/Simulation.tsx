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
import { Link } from 'react-router-dom';
import { SimulationDetailed, SimulationRunDetailed } from "client/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SimManager, { JoinedSimulationTaskState } from "model/SimManager";
import FormattedJSON from "components/FormattedJSON";
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

interface SimulationProps {
  simulation: SimulationDetailed;
}

interface SimulationState {
  expandedRun: number;
}

function SimRunTable(props: {runs: SimulationRunDetailed[], expandIdentifier: number, onExpand: (identifier: number) => void}) {

  let rows = [<tr key="noruns" className="rbb-SimRunTable__row rbb-SimRunTable__row--no-runs">
    <td colSpan={4}>No runs registered</td></tr>];

  if (props.runs.length > 0) {
    rows = props.runs.map((run) => {

      let details: JSX.Element = null;

      if (props.expandIdentifier === run.identifier) {
        details = <tr className={"rbb-SimRunTable__row rbb-SimRunTable__row-details"}>
          <td colSpan={1}> </td>
          <td colSpan={3}><FormattedJSON data={run.results} initialDepth={3}/></td>
        </tr>;
      }

      let actions = <div></div>;
      if (run.bag_name && run.bag_store_name) {
        const url = "/bags/" + run.bag_store_name + "/" + run.bag_name;
        actions = <div className="rbb-SimRunTable__buttons">
          <Link className="btn btn-sm btn-outline-white" to={url}>View Bag</Link>
        </div>;
      }

      function onClick(e:any) {
        e.stopPropagation();
        e.preventDefault();
        props.onExpand(run.identifier);
      }

      const successClass = run.success ? "rbb-SimRunTable__row--pass" : "rbb-SimRunTable__row--fail";

      return <React.Fragment key={run.identifier}><tr className={"rbb-SimRunTable__row " + successClass}>
        <td className="rbb-SimRunTable__col">{run.success ? "PASS" : "FAIL"}</td>
        <td className="rbb-SimRunTable__col rbb-SimRunTable__col-description"><a href="#" onClick={onClick}>{run.description}</a></td>
        <td className="rbb-SimRunTable__col rbb-SimRunTable__col-runtime">{run.duration.toFixed(1)}s</td>
        <td className="rbb-SimRunTable__col rbb-SimRunTable__col-actions" scope="row">{actions}</td>
      </tr>{details}</React.Fragment>;
    });
  }

  return <table className="rbb-SimRunTable table">
    <thead>
    <tr className="rbb-SimRunTable__header">
      <th scope="col" className="rbb-SimRunTable__col">Pass/Fail</th>
      <th scope="col" className="rbb-SimRunTable__col">Description</th>
      <th scope="col" className="rbb-SimRunTable__col">Runtime</th>
      <th scope="col" className="rbb-SimRunTable__col">Actions</th>
    </tr>
    </thead>
    <tbody>
    { rows }
    </tbody>
  </table>;
}

export default class Simulation extends React.Component<SimulationProps, SimulationState> {

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { expandedRun: null };
  }

  componentWillReceiveProps(nextProps: SimulationProps) {

  }

  onExpand = (id: number) => {
    if (id === this.state.expandedRun) {
      this.setState({ expandedRun: null });
    } else {
      this.setState({ expandedRun: id });
    }
  };

  render() {

    function titleBadge(sim: SimulationDetailed) {
      switch (SimManager.determineJoinedState(sim, sim.queued_task)) {
        case JoinedSimulationTaskState.Running:
          return <span className="badge badge-primary">Running <FontAwesomeIcon spin icon="circle-notch"/></span>;
        case JoinedSimulationTaskState.Pass:
          return <span className="badge badge-success">Passed <FontAwesomeIcon icon="check"/></span>;
        case JoinedSimulationTaskState.Fail:
          return <span className="badge badge-danger">Failed <FontAwesomeIcon icon="times"/></span>;
        case JoinedSimulationTaskState.SimulationError:
          return <span className="badge badge-warning">Error</span>;
        default:
          return "";
      }
    }

    let log = <div></div>;
    if (this.props.simulation.queued_task_identifier) {
      log =
          <div className="card">
              <h5 className="card-header">Console Log</h5>
              <div className="card-body">
                <CodeMirror
                  className="rbb-SimDetailPage__log"
                  value={this.props.simulation.queued_task.log}
                  options={{
                    mode: 'text',
                    theme: 'material',
                    lineNumbers: true,
                    readOnly: true,
                    scrollbarStyle: null
                  }}
                  onChange={(editor, data, value) => {
                  }}
              />
              </div>
          </div>;
    }

    return <div className="rbb-SimDetailPage">
      <h1 className="rbb-SimDetailPage__title">{titleBadge(this.props.simulation)} #{this.props.simulation.identifier} {this.props.simulation.description}</h1>
      <h2 className="rbb-SimDetailPage__subtitle">In environment '{this.props.simulation.environment_name}'</h2>

      <div className="card">
        <h5 className="card-header">Runs</h5>
        <div className="card-body">
          <SimRunTable expandIdentifier={this.state.expandedRun} onExpand={this.onExpand} runs={this.props.simulation.runs}/>
        </div>
      </div>

      <div className="rbb-SimDetailPage__config card">
        <h5 className="card-header">Configuration</h5>
        <div className="card-body">
          <h6>Simulation</h6>
          <p>
            <FormattedJSON data={this.props.simulation.config}/>
          </p>
          <h6>Environment ({this.props.simulation.environment.module_name})</h6>
          <p>
            <FormattedJSON initialDepth={0} data={this.props.simulation.environment.config}/>
          </p>
        </div>
      </div>

      {log}
    </div>;
  }
}
