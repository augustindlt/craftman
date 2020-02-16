const fs = require("fs");
const ask = require("./ask");
const { CONFIG_PATH, CRAFTSMAN_FOLDER } = require("../constants");
const { ConfigNotFoundError, ConfigValidationError } = require("../errors");

class Config {
  templates;
  exposedHelpers = {};
  currentTemplate;
  currentVariables;

  async askForTemplate() {
    if (this.templates.length === 1) {
      this.currentTemplate = this.templates[0];
      return;
    }

    const { name } = await ask({
      name: {
        message: "What do you want to generate ?",
        type: "choices",
        choices: this.templates.map(template => template.name)
      }
    });

    this.currentTemplate = this.templates.find(
      template => template.name === name
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
      if (template.name === undefined || template.files === undefined) {
        throw new ConfigValidationError(
          "Make sure templates have all the keys name and files"
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

    if (configContent.helpers) {
      Object.keys(configContent.helpers).forEach(helperName => {
        let helperPath;
        try {
          helperPath = fs.realpathSync(
            `${CRAFTSMAN_FOLDER}/${configContent.helpers[helperName]}.js`
          );
        } catch {
          throw new ConfigValidationError(
            `helper ${helperName} helper not found`
          );
        }

        const helper = require(helperPath);
        if (typeof helper !== "function") {
          throw new ConfigValidationError(
            `Make sure the ${helperName} helper is a function`
          );
        }
        this.exposedHelpers[helperName] = helper;
      });
    }

    this.templates = configContent.templates;
  }
}

module.exports = new Config();
