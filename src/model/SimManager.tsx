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
import { SimulationDetailed, SimulationEnvironmentDetailed,
  SimulationEnvironmentSummary, SimulationSummary, TaskSummary } from "client/api";
import { TaskState } from "./QueueManager";

export enum SimulationState {
  Scheduled = 0,
  PreparationFailed = -1,
  Fail = -100,
  Pass = 100
}

export enum JoinedSimulationTaskState {
  Inactive,
  Queued,
  Running,
  Pass,
  Fail,
  SimulationError
}

export default class SimManager {

  public static deleteSimulationEnvironment(environment: SimulationEnvironmentSummary) {
    const api = ApiHelper.getBasicApi();
    return api.deleteSimulationEnvironment(environment.name);
  }

  public static saveSimulationEnvironment(environment: SimulationEnvironmentDetailed) {
    const api = ApiHelper.getBasicApi();
    return api.putSimulationEnvironment(environment.name, environment);
  }

  public static newSimulationEnvironment(environment: SimulationEnvironmentDetailed) {
    const api = ApiHelper.getBasicApi();
    return api.putSimulationEnvironment(environment.name, environment, true);
  }

  public static getSimulations(limit?: number, offset?: number) {
    const api = ApiHelper.getBasicApi();
    return api.listSimulations(limit, offset, "identifier:desc");
  }

  public static getDetailedSimulation(identifier: string) {
    const api = ApiHelper.getBasicApi();
    return api.getSimulation(parseInt(identifier), true);
  }

  public static getSimulationEnvironments() {
    const api = ApiHelper.getBasicApi();
    return api.listSimulationEnvironments();
  }

  public static getSimulationEnvironment(name: string) {
    const api = ApiHelper.getBasicApi();
    return api.getSimulationEnvironment(name);
  }

  public static submitSimulation(description: string, environmentName: string, configuration: any) {

    let valid_config: any = {};
    if (configuration != null && typeof configuration === "object") {
      valid_config = configuration;
    }

    const sim: SimulationDetailed =  {
      detail_type: "SimulationDetailed",
      identifier: 0,
      description: description,
      created: new Date(),
      result: 0,
      environment_name: environmentName,
      config: valid_config,
      queued_task_identifier: ""
    };
    const api = ApiHelper.getBasicApi();
    return api.newSimulation(sim);
  }

  public static determineJoinedState(sim: SimulationSummary, task?: TaskSummary): JoinedSimulationTaskState {
    switch (sim.result) {
      case SimulationState.Scheduled:
        if (sim.queued_task_identifier) {
          const taskState = task ? task.state : sim.queued_task_state;
          switch (taskState) {
            case TaskState.Running:
              return JoinedSimulationTaskState.Running;
            case TaskState.Queued:
              return JoinedSimulationTaskState.Queued;
            case TaskState.Cancelled:
              return JoinedSimulationTaskState.Inactive;
            case TaskState.Paused:
              return JoinedSimulationTaskState.Inactive;
            case TaskState.Finished:
              return JoinedSimulationTaskState.SimulationError;
            default:
              return JoinedSimulationTaskState.SimulationError;
          }
        } else {
          return JoinedSimulationTaskState.Inactive;
        }
      case SimulationState.PreparationFailed:
        return JoinedSimulationTaskState.SimulationError;
      case SimulationState.Fail:
        return JoinedSimulationTaskState.Fail;
      case SimulationState.Pass:
        return JoinedSimulationTaskState.Pass;
      default:
        return JoinedSimulationTaskState.SimulationError;
    }
  }

}
