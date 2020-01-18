#!/usr/bin/env node

const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const config = require("./Config");
const generate = require("./Generator");

(async () => {
  clear();
  console.log(
    chalk.yellow(figlet.textSync("craftsman", { horizontalLayout: "full" }))
  );

  await config.askForType();
  await config.askForVariables();

  console.log("\n");

  config.currentTemplate.files.forEach(file => {
    generate(file.template, file.path, file.name, config.currentVariables);
  });

  console.log(chalk.yellow("\nDone 🏆! 🚀\n"));
})();
