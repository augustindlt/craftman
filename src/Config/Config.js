const fs = require("fs");
const inquirer = require("inquirer");
const ask = require("./ask");
const { CONFIG_PATH, CRAFTSMAN_FOLDER } = require("../constants");
const { ConfigNotFoundError, ConfigValidationError } = require("../errors");

class Config {
  templates;
  formaters = {};
  currentTemplate;
  currentVariables;

  async askForType() {
    const { type } = await ask({
      type: {
        message: "What do you want to generate ?",
        type: "choices",
        choices: this.templates.map(template => template.type)
      }
    });

    this.currentTemplate = this.templates.find(
      template => template.type === type
    );

    if (this.currentTemplate.files.length < 1) {
      throw new ConfigValidationError("Add at least one file to your template");
    }
  }

  async askForVariables() {
    const { variables } = this.currentTemplate;
    this.currentVariables = await ask(variables);
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

    if (configContent.formaters) {
      Object.keys(configContent.formaters).forEach(formaterName => {
        let formaterPath;
        try {
          formaterPath = fs.realpathSync(
            `${CRAFTSMAN_FOLDER}/${configContent.formaters[formaterName]}.js`
          );
        } catch {
          throw new ConfigValidationError(
            `Formater ${formaterName} formater not found`
          );
        }

        const formater = require(formaterPath);
        if (
          typeof formater !== "function" ||
          typeof formater("something") !== "string"
        ) {
          throw new ConfigValidationError(
            `Make sure the ${formaterName} formater is a function that returns a string`
          );
        }
        this.formaters[formaterName] = formater;
      });
    }

    this.templates = configContent.templates;
  }
}

module.exports = new Config();
