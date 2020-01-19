#!/usr/bin/env node

const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const config = require("./Config");
const generate = require("./Generator");
const { handleError } = require("./errors");

(async () => {
  try {
    clear();
    console.log(
      chalk.yellow(figlet.textSync("craftsman", { horizontalLayout: "full" }))
    );

    config.fetchConfig();
    await config.askForType();
    await config.askForVariables();

    console.log("\n");

    config.currentTemplate.files.forEach(file => {
      generate(file.template, file.path, file.name, config.currentVariables);
    });

    console.log(chalk.yellow("\nDone 🏆! 🚀\n"));
  } catch (e) {
    handleError(e);
  }
})();
