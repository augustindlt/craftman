const chalk = require('chalk');

const ERRORS_NAMES = {
  ConfigNotFoundError: 'ConfigNotFoundError',
  ConfigValidationError: 'ConfigValidationError',
  TemplateNotFoundError: 'TemplateNotFoundError',
  FormaterNotFoundError: 'FormaterNotFoundError',
  TemplateParserError: 'TemplateParserError',
  CancelEditionError: 'CancelEditionError',
};

class ConfigNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = ERRORS_NAMES.ConfigNotFoundError;
    this.message = 'Sorry but the configuration file could not be found 👀';
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

class TemplateParserError extends Error {
  constructor(scope, errorMessage) {
    super(errorMessage);
    this.name = ERRORS_NAMES.TemplateParserError;
    this.message = `An error occured when parsing ${scope} : ${errorMessage} 🙊`;
  }
}

class CancelEditionError extends Error {
  constructor() {
    super(ERRORS_NAMES.CancelEditionError);
    this.name = ERRORS_NAMES.CancelEditionError;
  }
}

const handleError = error => {
  if (error.name === ERRORS_NAMES.CancelEditionError) {
    process.exit();
  }
  if (error.name in ERRORS_NAMES) {
    console.error(chalk.red(error.message) + '\n');
    return;
  }
  throw error;
};

module.exports = {
  ERRORS_NAMES,
  ConfigNotFoundError,
  ConfigValidationError,
  TemplateNotFoundError,
  TemplateParserError,
  CancelEditionError,
  handleError,
};
