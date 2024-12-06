import express, { json } from "express";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

// Convert exec to a promise-based function
const execAsync = promisify(exec);

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  return res.send("Good");
});

app.get("/init", async (req, res) => {
  try {
    let ghLink = req.query.githubLink as string;
    try {
      ghLink = new URL(ghLink).toString();
    } catch (e) {
      ghLink = "";
    }
    if (!ghLink) {
      return res
        .status(400)
        .send("Error: please provide a vlaid github repo link");
    }
    let projectName = ghLink.split("/").at(-1);
    let folderPath = path.join(__dirname, "../repos/" + projectName);
    await cloneProject(ghLink, projectName || "", folderPath);
    runCommands(true, folderPath);

    return res.send("Good");
  } catch (er: any) {
    console.log(er);
    return res.status(500).send({ error: er.message });
  }
});
app.get("/update", async (req, res) => {
  try {
    let ghLink = req.query.githubLink as string;
    try {
      ghLink = new URL(ghLink).toString();
    } catch (e) {
      ghLink = "";
    }
    if (!ghLink) {
      return res
        .status(400)
        .send("Error: please provide a vlaid github repo link");
    }
    let projectName = ghLink.split("/").at(-1);
    let folderPath = path.join(__dirname, "../repos/" + projectName);
    runCommands(false, folderPath);

    return res.send("Good");
  } catch (er: any) {
    console.log(er);
    return res.status(500).send({ error: er.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const cloneProject = async (
  ghLink: string,
  projectName: string,
  folderPath: string
) => {
  if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
    throw new Error("Project aleardy exist");
  }

  const command = `git clone ${ghLink} repos/${projectName}`;
  const { stdout, stderr } = await execAsync(command);
  if (stderr) {
    throw new Error("Cant load this project: " + stderr);
  }
};

const runCommands = async (isStart: boolean, folderPath: string) => {
  let jsonPath = path.join(folderPath + "/room.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error("There's no config file in thi project ('room.json'");
  }
  const jsonData = fs.readFileSync(jsonPath, "utf-8");
  let config = JSON.parse(jsonData);
  if (isStart && config.commands?.start) {
    for (let c of config.commands?.start) {
      try {
        const res = await execAsync("cd " + folderPath + "&&" + c);
        console.log(res);
      } catch (er) {
        console.log(er);
      }
    }
  }
  if (!isStart) {
    await execAsync("cd " + folderPath + "&& git pull");

    if (config.commands?.every)
      for (let c of config.commands?.every) {
        try {
          const res = await execAsync("cd " + folderPath + "&&" + c);
          console.log(res);
        } catch (er) {
          console.log(er);
        }
      }
  }
};
