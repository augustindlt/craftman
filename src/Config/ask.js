const chalk = require('chalk');
const utils = require('./utils');
const execCondition = require('../condition');
const { ERRORS_NAMES, ConfigValidationError } = require('../errors');
const { applyVariables } = require('../Generator');
const { CRAFTSMAN_FOLDER } = require('../constants');
const fs = require('fs');

/**
 * Get default config of a question
 * @param {object} variable
 */
const getDefaultConfig = (variable) => ({
  name: variable.name,
  message:
    variable.message !== undefined
      ? variable.message
      : `What ${variable.name} ?`,
});

/**
 * Get config for the select question of a file or a directory
 * @param {object} variable
 * @param {"file" | "directory"} type
 */
const getFileConfig = (variable, type) => ({
  ...getDefaultConfig(variable),
  type: 'autocomplete',
  source: (_, fileName) =>
    new Promise((resolve) => {
      const initialPath = variable.path || '.';
      const list =
        type === 'file'
          ? utils.getFiles(initialPath)
          : utils.getDirectories(initialPath);

      resolve(
        list
          .filter(
            (f) =>
              !fileName || f.toLowerCase().indexOf(fileName.toLowerCase()) != -1
          )
          .filter((f) => {
            if (!variable.matchRegex) return true;
            const regexMatch = new RegExp(variable.matchRegex);
            return regexMatch.test(f);
          })
          .filter(
            (f) =>
              !variable.matchString ||
              f.toLowerCase().indexOf(variable.matchString.toLowerCase()) != -1
          )
          .sort((a, b) => a.length - b.length)
      );
    }),
});

const questionsConfig = {
  /**
   * Get config for a text question
   * @param {object} variable
   */
  text: (variable) => ({
    ...getDefaultConfig(variable),
    type: 'input',
  }),

  /**
   * Get config for a choices question
   * @param {object} variable
   */
  choices: (variable) => ({
    ...getDefaultConfig(variable),
    type: 'list',
    choices: variable.choices,
  }),

  /**
   * Get config for a autocomplete question
   * @param {object} variable
   */
  autocomplete: (variable) => ({
    ...getDefaultConfig(variable),
    type: 'autocomplete',
    source: (_, search) => {
      const searchRegex = new RegExp(search, 'i');
      return new Promise((resolve, reject) =>
        resolve(
          variable.choices.filter((choice) => choice.search(searchRegex) !== -1)
        )
      );
    },
  }),

  /**
   * Get config for a file select question
   * @param {object} variable
   */
  file: (variable) => getFileConfig(variable, 'file'),

  /**
   * Get config for a directory select question
   * @param {object} variable
   */
  directory: (variable) => getFileConfig(variable, 'directory'),
};

/**
 * Prompt questions and return the responses
 * @param {object} variables
 * @return {object} responses
 */
const ask = async (variables, prefixMessage, responses = {}) => {
  for (const variableName in variables) {
    const variable = variables[variableName];

    if (variable.type === 'script') {
      let variableScriptPath;
      try {
        variableScriptPath = fs.realpathSync(
          `${CRAFTSMAN_FOLDER}/${variable.script}.js`
        );
      } catch (e) {
        console.log(e);
        throw new ConfigValidationError(
          `Variable ${variableName} script not found at ${variable.script}.`
        );
      }

      const variableScript = require(variableScriptPath);
      if (typeof variableScript !== 'function') {
        throw new ConfigValidationError(
          `Make sure the variable ${variableName} script is a function`
        );
      }
      await variableScript(responses, ask);
      continue;
    }

    if (variable.type === 'array') {
      if (variable.message) {
        console.log(
          `${chalk.bold(
            `\n${applyVariables(responses, variable.message, 'message')}`
          )} (esc to exit loop)`
        );
      }

      let response = [];
      let index = 0;
      const defaultVariable = {
        default: {
          type: 'text',
          message: '',
          name: variableName,
        },
      };

      while (true) {
        try {
          if (!variable.variables) {
            const subResponses = await ask(
              defaultVariable,
              `${index}:`,
              responses
            );
            response = [
              ...response,
              ...Object.keys(subResponses).map((key) => subResponses[key]),
            ];
          } else {
            const subResponses = await ask(
              variable.variables,
              `${index}: `,
              responses
            );
            response = [...response, subResponses];
          }
          index++;
        } catch (e) {
          if (e.name !== ERRORS_NAMES.CancelEditionError) {
            throw e;
          }
          console.log('\n');
          break;
        }
      }

      responses = { ...responses, [variableName]: response };
      continue;
    }

    const question = questionsConfig[variable.type]({
      name: variableName,
      message:
        variable.message &&
        applyVariables(responses, variable.message, 'message'),
      ...variable,
    });

    if (prefixMessage !== undefined) {
      question.message = `${prefixMessage}${question.message}`;
    }

    let response;
    if (variable.condition) {
      response = execCondition(variable.condition, responses)
        ? await utils.safePrompt(question)
        : { [question.name]: '' };
    } else response = await utils.safePrompt(question);

    responses = { ...responses, ...response };
  }
  return responses;
};

module.exports = ask;
