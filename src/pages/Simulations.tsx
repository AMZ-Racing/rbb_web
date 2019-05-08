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
import FoldingCubeSpinner from "components/FoldingCubeSpinner";
import MainPage from "templates/MainPage";
import MainHeader from "templates/MainHeader";
import SideColumn from "templates/SideColumn";
import Content from "templates/Content";
import { RouteComponentProps } from "react-router";
import { SimulationDetailed, SimulationSummary } from "client/api";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SimManager, { JoinedSimulationTaskState } from "model/SimManager";
import SideColumnSimulationList from "pages/SideColumnSimulationList";
import QueueManager from "model/QueueManager";
import SimulationComponent from "pages/Simulation";
import SimulationsHeaderBar from "components/SimulationsHeaderBar";
import CreateSimulationModal, { SimulationRequest } from "components/CreateSimulationModal";

function SimulationTable(props: {simulations: SimulationSummary[], onCancelRequested: (identifier: SimulationSummary) => void }) {
  const rows = props.simulations.map((simulation) => {

    function state(sim: SimulationSummary) {
      switch (SimManager.determineJoinedState(sim)) {
        case JoinedSimulationTaskState.Queued:
          return <span className="badge badge-primary">queued</span>;
        case JoinedSimulationTaskState.Running:
          return <span className="badge badge-info">running</span>;
        case JoinedSimulationTaskState.Pass:
          return <span className="badge badge-success">PASS</span>;
        case JoinedSimulationTaskState.Fail:
          return <span className="badge badge-danger">FAIL</span>;
        case JoinedSimulationTaskState.SimulationError:
          return <span className="badge badge-warning">error</span>;
        case JoinedSimulationTaskState.Inactive:
          return <span className="">inactive</span>;
      }
    }

    let actions = <div> </div>;
    if (SimManager.determineJoinedState(simulation) === JoinedSimulationTaskState.Queued) {
      actions = <div className="rbb-SimulationTable__buttons">
        <button type="button" onClick={(x) => {props.onCancelRequested(simulation);}} className="btn btn-warning btn-sm">
          <FontAwesomeIcon icon={['fas','ban']}/> Cancel</button>
      </div>;
    }

    return <tr key={simulation.identifier} className="rbb-SimulationTable__row">
      <td scope="row" className="rbb-SimulationTable__col"><Link to={"/simulations/" + simulation.identifier}>#{simulation.identifier}</Link></td>
      <td className="rbb-SimulationTable__col">{state(simulation)}</td>
      <td className="rbb-SimulationTable__col"><Link to={"/simulations/" + simulation.identifier}>{simulation.description}</Link></td>
      <td className="rbb-SimulationTable__col" scope="row">{actions}</td>
    </tr>;
  });

  return <table className="rbb-SimulationTable table">
    <thead>
    <tr className="rbb-SimulationTable__header">
      <th scope="col" className="rbb-SimulationTable__col">#</th>
      <th scope="col" className="rbb-SimulationTable__col">State</th>
      <th scope="col" className="rbb-SimulationTable__col">Description</th>
      <th scope="col" className="rbb-SimulationTable__col">Actions</th>
    </tr>
    </thead>
    <tbody>
    { rows }
    </tbody>
  </table>;
}

interface SimulationPageState {
  simulations: SimulationSummary[];
  simulationDetailed: SimulationDetailed;

  offset: number;
  loading_more: boolean;
  more_available: boolean;

  create_simulation_open?: boolean;
}

type SimulationPageProps = RouteComponentProps<{sim_identifier?:string}>;

export default class SimulationsPage extends React.Component<SimulationPageProps, SimulationPageState> {

  private loadLimit = 25;

  static initialState() : SimulationPageState {
    return {
      simulations: null,
      simulationDetailed: null,
      offset: 0,
      more_available: false,
      loading_more: false,
      create_simulation_open: false
    };
  }

  static resetState() : SimulationPageState {
    return {
      simulations: null,
      simulationDetailed: null,
      offset: 0,
      more_available: false,
      loading_more: false
    };
  }

  constructor(props: any, context?: any) {
    super(props, context);
    this.state = SimulationsPage.initialState();

    this.reloadSimulations();
    this.loadModels(this.props.match.params.sim_identifier, true);
  }

  componentWillReceiveProps(nextProps: SimulationPageProps) {
    this.loadModels(nextProps.match.params.sim_identifier);
  }

  loadModels(sim_identifier?: string, noClear?: boolean) {
    // Do we also load a specific bag?
    if (sim_identifier == null) {
      noClear || this.setState({ simulationDetailed: null });
    } else {
      SimManager.getDetailedSimulation(sim_identifier).then((simulation) => this.setState({ simulationDetailed: simulation }));
    }
  }

  addLoadedSimulationsToState(simulations: SimulationSummary[], numberRequested: number, reset: boolean) {
    const moreAvailable = simulations.length === numberRequested;

    if (reset) {
      this.setState({ simulations, offset: simulations.length, more_available: moreAvailable, loading_more: false });
    } else {
      this.setState((prevState, props) => {
        return {
          simulations: prevState.simulations.concat(simulations),
          offset: prevState.offset + simulations.length,
          more_available: moreAvailable,
          loading_more: false
        };
      });
    }
  }

  reloadSimulations(keepLimit?:boolean) {
    this.setState({ loading_more: true });
    SimManager.getSimulations(keepLimit ? this.state.offset : this.loadLimit, 0)
        .then((simulations) => this.addLoadedSimulationsToState(simulations, this.loadLimit, true));
  }

  isLoading() : boolean {
    if (this.props.match.params.sim_identifier != null) {
      return this.state.simulationDetailed == null || this.state.simulations == null;
    } else {
      return this.state.simulations == null;
    }
  }

  onCancelRequested = (sim: SimulationSummary):void => {
    QueueManager.cancelTask(sim.queued_task_identifier).then((task) => {
      this.reloadSimulations();
      toast.success("Associated task cancelled!");
    }).catch((response) => {
      toast.error("Could not cancel the task associated to the simulation!");
    });
  };

  onSimulateClick = ():void => {
    this.setState({ create_simulation_open: true });
  };

  onCloseSimulationModal = ():void => {
    this.setState({ create_simulation_open: false });
  };

  onSubmitSimulation = (r: SimulationRequest): void => {
    SimManager.submitSimulation(r.description, r.environmentName, r.configuration)
        .then((sim) => {
          toast.success("Simulation submitted!");
          const newSim: SimulationSummary[] = [sim];
          this.setState({ simulations: newSim.concat(this.state.simulations) });
        })
        .catch((response) => {
          toast.error("Simulation submission failed!");
          console.log("Submission failure: ", response);
        });

    this.setState({ create_simulation_open: false });
  };

  /**
   * Load the next x bags
   * @returns {boolean}
   */
  loadNextSimulations() {
    this.setState({ loading_more: true });
    SimManager.getSimulations(
        this.loadLimit,
        this.state.offset)
        .then((simulations) => this.addLoadedSimulationsToState(simulations, this.loadLimit, false));
  }

  /**
   * This is the render call when we are looking at a detailed simulation
   * @returns {any}
   */
  renderDetailedSimulation() {
    return <SimulationComponent simulation={this.state.simulationDetailed} />;
  }

  /**
   * This is the render call for looking at the list of simulations
   * @returns {any}
   */
  renderSimulationList() {
    let loadMore: any = "No further simulations";

    if (this.state.more_available) {
      if (this.state.loading_more) {
        loadMore = <FoldingCubeSpinner/>;
      } else {
        loadMore = <button type="button" className="btn btn-secondary btn-lg" onClick={this.loadNextSimulations.bind(this)}>Load More</button>;
      }
    }

    return <React.Fragment>
      <h1 className="rbb-SimulationPage__title">Simulations</h1>
      <h2 className="rbb-SimulationPage__subtitle">Overview of all simulations in the system</h2>
      <SimulationTable simulations={this.state.simulations} onCancelRequested={this.onCancelRequested} />
      <div className="rbb-SimulationPage__more">
        {loadMore}
      </div>
    </React.Fragment>;
  }

  renderContent() {
    if (!this.isLoading()) {
      if (this.state.simulationDetailed != null) {
        return this.renderDetailedSimulation();
      } else {
        return this.renderSimulationList();
      }
    }

    return <FoldingCubeSpinner />;
  }

  renderColumn() {
    if (this.state.simulations) {
      return <SideColumnSimulationList children={this.state.simulations}
                                       simulationDetailed={this.state.simulationDetailed}
                                       moreAvailable={this.state.more_available}
                                       loadingMore={this.state.loading_more}
                                       onRequestMore={this.loadNextSimulations.bind(this)} />;
    } else {
      return <FoldingCubeSpinner/>;
    }
  }

  renderHeaderBar() {
    return <SimulationsHeaderBar onSimulateClick={this.onSimulateClick} />;
  }

  onSideColumnScrollEnd = (): void => {
    if (!this.state.loading_more && this.state.more_available && !this.isLoading()) {
      this.loadNextSimulations();
    }
  };

  render() {
    return <React.Fragment>
      <MainPage header={<MainHeader subMenu={this.renderHeaderBar()} />}>
        <Content leftColumn={ <SideColumn onYReachEnd={this.onSideColumnScrollEnd}> {this.renderColumn()}</SideColumn> }>
          <div className="rbb-SimulationPage">
            {this.renderContent()}
          </div>
        </Content>
      </MainPage>
      <CreateSimulationModal onCloseModal={this.onCloseSimulationModal} onSubmit={this.onSubmitSimulation} open={this.state.create_simulation_open} />
    </React.Fragment>;
  }
}
