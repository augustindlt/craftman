const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const config = require("./Config");
const generate = require("./Generator");
const { handleError } = require("./errors");
const execCondition = require("./condition");
const loadHelpers = require("./Generator/exposedHelpers");

(async () => {
  try {
    clear();
    console.log(
      chalk.yellow(figlet.textSync("craftsman", { horizontalLayout: "full" }))
    );

    config.fetchConfig();
    await config.askForType();
    await config.askForVariables();
    loadHelpers();

    console.log("\n");

    for (const file of config.currentTemplate.files) {
      if (
        !file.condition ||
        (file.condition &&
          execCondition(file.condition, config.currentVariables))
      ) {
        await generate(
          file.template,
          file.path,
          file.name,
          file.replaceExistingFile,
          config.currentVariables
        );
      }
    }

    console.log(chalk.yellow("\nDone 🏆! 🚀\n"));
  } catch (e) {
    handleError(e);
  }
})();
