const fs = require("fs");
const inquirer = require("inquirer");
const { CONFIG_PATH } = require("./constants");
const { ConfigNotFoundError, ConfigValidationError } = require("./errors");

class Config {
  templates;
  currentTemplate;
  currentVariables;

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

    if (this.currentTemplate.files.length < 1) {
      throw new ConfigValidationError("Add at least one file to your template");
    }
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

  fetchConfig() {
    if (this.templates !== undefined) return;

    if (!fs.existsSync(CONFIG_PATH)) throw new ConfigNotFoundError();

    let configContent;
    try {
      configContent = fs.readFileSync(CONFIG_PATH).toString();
      configContent = JSON.parse(configContent);
    } catch {
      throw new ConfigValidationError(
        "Make sure the configuration file is in the JSON format"
      );
    }
    if (configContent.templates === undefined)
      throw new ConfigValidationError(
        "Make sure the configuration file has the key templates"
      );
    if (
      configContent.templates.length === undefined ||
      typeof configContent.templates !== "object"
    ) {
      throw new ConfigValidationError(
        "Make sure the key templates is an array"
      );
    }
    if (configContent.templates.length < 1) {
      throw new ConfigValidationError(
        "Add templates to the configuration file"
      );
    }
    for (const template of configContent.templates) {
      if (template.type === undefined || template.files === undefined) {
        throw new ConfigValidationError(
          "Make sure templates have all the keys type and files"
        );
      }
      if (
        template.files.length === undefined ||
        typeof template.files !== "object"
      ) {
        throw new ConfigValidationError(
          "Make sure templates have all the key files of type array"
        );
      }
      for (const file of template.files) {
        if (!file.path || !file.name || !file.template) {
          throw new ConfigValidationError(
            "Make sure files have all the keys path name and template"
          );
        }
      }
      if (!template.variables) {
        template.variables = {};
      }
    }

    this.templates = configContent.templates;
  }
}

module.exports = new Config();
