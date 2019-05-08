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
import { SimulationDetailed, SimulationSummary } from "client/api";
import * as moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SimManager, { JoinedSimulationTaskState } from "model/SimManager";

function SideColumnSimulationListItem(props: { simulation: SimulationSummary | SimulationDetailed, selected: boolean }) {
  let iconSpan:any = "";

  switch (SimManager.determineJoinedState(props.simulation)) {
    case JoinedSimulationTaskState.Fail:
      iconSpan = <FontAwesomeIcon className="--status-red" icon="times-circle" />;
      break;
    case JoinedSimulationTaskState.Pass:
      iconSpan = <FontAwesomeIcon className="--status-green" icon="check-circle" />;
      break;
    case JoinedSimulationTaskState.SimulationError:
      iconSpan = <FontAwesomeIcon className="--status-orange" icon="exclamation-circle" />;
      break;
    case JoinedSimulationTaskState.Queued:
      iconSpan = <FontAwesomeIcon className="--status-blue" icon="clock" />;
      break;
    case JoinedSimulationTaskState.Running:
      iconSpan = <FontAwesomeIcon className="--status-blue-lit" spin icon="circle-notch" />;
      break;

  }

  const active_item = props.selected ? "rbb-SideColumnSimulationList__item--active" : "";
  const active_link = props.selected ? "rbb-SideColumnSimulationList__link--active" : "";

  const url = "/simulations/" + props.simulation.identifier;
  return (
      <li className={"rbb-SideColumnSimulationList__item " + active_item}>
        <Link className={"rbb-SideColumnSimulationList__link "  + active_link} to={url}>
          <div className="rbb-SideColumnSimulationList__icon">{iconSpan}</div>
          <h3>#{props.simulation.identifier} {props.simulation.description}</h3>
          <h4>{props.simulation.environment_name}, {moment(props.simulation.created).fromNow()}</h4>
        </Link>
      </li>
  );
}

interface SideColumnSimulationListProps {
  children: SimulationSummary[];
  simulationDetailed: SimulationSummary | SimulationDetailed;
  moreAvailable: boolean;
  loadingMore: boolean;
  onRequestMore: () => void;
}

export default function SideColumnSimulationList(props: SideColumnSimulationListProps) {
  let simList:any = "";
  if (props.children == null || props.children.length === 0) {
    simList = <li className="rbb-SideColumnSimulationList--empty">No simulations</li>;
  } else {
    simList = props.children.map((sim) => {
      const selected = props.simulationDetailed && sim.identifier === props.simulationDetailed.identifier;
      return <SideColumnSimulationListItem key={sim.identifier} simulation={sim} selected={selected} />;
    });
  }

  let loadMore: any;
  if (props.moreAvailable) {
    if (props.loadingMore) {
      loadMore = <li className="rbb-SideColumnSimulationList__more rbb-SideColumnSimulationList__more--loading">Loading...</li>;
    } else {
      loadMore = <li className="rbb-SideColumnSimulationList__more">
        <button type="button" className="btn btn-outline-secondary" onClick={props.onRequestMore}>Load More</button></li>;
    }
  } else {
    loadMore = <li className="rbb-SideColumnSimulationList__more rbb-SideColumnSimulationList__more--complete">No further simulations to load</li>;
  }

  return <ul className="rbb-SideColumnSimulationList">{simList}{loadMore}</ul>;
}
