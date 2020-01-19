const fs = require("fs");
const inquirer = require("inquirer");
const { CONFIG_PATH } = require("./constants");

class Config {
  templates = [];
  currentTemplate;
  currentVariables;

  constructor() {
    let configContent = fs.readFileSync(CONFIG_PATH).toString();
    configContent = JSON.parse(configContent);
    this.templates = configContent.templates;
  }

  async askForType() {
    const { type } = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "What do you want to generate ?",
        choices: this.templates.map(template => template.type)
      }
    ]);
    this.currentTemplate = this.templates.find(
      template => template.type === type
    );
  }

  async askForVariables() {
    const { variables } = this.currentTemplate;
    const questions = Object.keys(variables).map(name => {
      const value = variables[name];
      const message = `What ${name} ?`;
      if (typeof value === "object") {
        return {
          type: "list",
          name,
          message,
          choices: value
        };
      }
      return {
        type: "input",
        name,
        message
      };
    });

    this.currentVariables = await inquirer.prompt(questions);
  }
}

module.exports = new Config();
