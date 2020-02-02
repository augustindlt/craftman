const chalk = require("chalk");

const ERRORS_NAMES = {
  ConfigNotFoundError: "ConfigNotFoundError",
  ConfigValidationError: "ConfigValidationError",
  TemplateNotFoundError: "TemplateNotFoundError",
  FormaterNotFoundError: "FormaterNotFoundError"
};

class ConfigNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = ERRORS_NAMES.ConfigNotFoundError;
    this.message = "Sorry but the configuration file could not be found 👀";
  }
}

class ConfigValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = ERRORS_NAMES.ConfigValidationError;
    this.message = message;
  }
}

class TemplateNotFoundError extends Error {
  constructor(templateName) {
    super(templateName);
    this.name = ERRORS_NAMES.TemplateNotFoundError;
    this.message = `Sorry but the ${templateName} template file could not be found 🕵🏻‍♂️`;
  }
}

class FormaterNotFoundError extends Error {
  constructor(formaterName) {
    super(formaterName);
    this.name = ERRORS_NAMES.FormaterNotFoundError;
    this.message = `Sorry but the ${formaterName} formater could not be found 🕵🏻‍♂️`;
  }
}

const handleError = error => {
  if (error.name in ERRORS_NAMES) {
    console.error(chalk.red(error.message) + "\n");
    return;
  }
  throw error;
};

module.exports = {
  ConfigNotFoundError,
  ConfigValidationError,
  TemplateNotFoundError,
  FormaterNotFoundError,
  handleError
};
