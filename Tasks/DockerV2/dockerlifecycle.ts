"use strict";

import * as tl from "azure-pipelines-task-lib/task";
import ContainerConnection from "azure-pipelines-tasks-docker-common-v2/containerconnection";
import * as dockerCommandUtils from "azure-pipelines-tasks-docker-common-v2/dockercommandutils";
import * as utils from "./utils";

export function run(connection: ContainerConnection, outputUpdate: (data: string) => any): any {
    let output = "";
    let command = tl.getInput("command", true);
    let containerName = tl.getInput("container", true);
    let commandArguments = dockerCommandUtils.getCommandArguments(tl.getInput("arguments", false));

    // Map between specified container names and their actual ID
    // Allow custom containers names through
    let container = containerName;
    let containerMap = tl.getVariable("agent.containermapping");
    if (containerMap) {
        try {
            let map = JSON.parse(containerMap);
            if (map[containerName] && map[containerName].id) {
                container = map[containerName].id;
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    if (command == "start")  {
        return dockerCommandUtils.start(connection, container, commandArguments, (data) => output += data).then(() => {
            let taskOutputPath = utils.writeTaskOutput("start", output);
            outputUpdate(taskOutputPath);
        });
    } else if (command == "stop") {
        return dockerCommandUtils.stop(connection, container, commandArguments, (data) => output += data).then(() => {
            let taskOutputPath = utils.writeTaskOutput("stop", output);
            outputUpdate(taskOutputPath);
        });
    } else {
        throw new Error(tl.loc('CommandNotRecognized', command));
    }
}
