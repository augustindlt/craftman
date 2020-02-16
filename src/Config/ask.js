const chalk = require("chalk");
const helpers = require("./helpers");
const execCondition = require("../condition");
const { ERRORS_NAMES } = require("../errors");

/**
 * Get default config of a question
 * @param {object} variable
 */
const getDefaultConfig = variable => ({
  name: variable.name,
  message:
    variable.message !== undefined
      ? variable.message
      : `What ${variable.name} ?`
});

/**
 * Get config for the select question of a file or a directory
 * @param {object} variable
 * @param {"file" | "directory"} type
 */
const getFileConfig = (variable, type) => ({
  ...getDefaultConfig(variable),
  type: "autocomplete",
  source: (_, fileName) =>
    new Promise(resolve => {
      const initialPath = variable.path || ".";
      const list =
        type === "file"
          ? helpers.getFiles(initialPath)
          : helpers.getDirectories(initialPath);

      resolve(
        list
          .filter(
            f =>
              !fileName || f.toLowerCase().indexOf(fileName.toLowerCase()) != -1
          )
          .filter(f => {
            if (!variable.matchRegex) return true;
            const regexMatch = new RegExp(variable.matchRegex);
            return regexMatch.test(f);
          })
          .filter(
            f =>
              !variable.matchString ||
              f.toLowerCase().indexOf(variable.matchString.toLowerCase()) != -1
          )
      );
    })
});

const questionsConfig = {
  /**
   * Get config for a text question
   * @param {object} variable
   */
  text: variable => ({
    ...getDefaultConfig(variable),
    type: "input"
  }),

  /**
   * Get config for a choices question
   * @param {object} variable
   */
  choices: variable => ({
    ...getDefaultConfig(variable),
    type: "list",
    choices: variable.choices
  }),

  /**
   * Get config for a file select question
   * @param {object} variable
   */
  file: variable => getFileConfig(variable, "file"),

  /**
   * Get config for a directory select question
   * @param {object} variable
   */
  directory: variable => getFileConfig(variable, "directory")
};

/**
 * Prompt questions and return the responses
 * @param {object} variables
 * @return {object} responses
 */
const ask = async (variables, prefixMessage) => {
  let responses = {};

  for (const variableName in variables) {
    const variable = variables[variableName];

    if (variable.type === "array") {
      if (variable.message) {
        console.log(
          `${chalk.bold(`\n\n${variable.message}`)} (ctrl+c to exit loop)`
        );
      }

      let response = [];
      let index = 0;
      const defaultVariable = {
        default: {
          type: "text",
          message: "",
          name: variableName
        }
      };

      while (true) {
        try {
          if (!variable.variables) {
            const subResponses = await ask(defaultVariable, `${index}:`);
            response = [
              ...response,
              ...Object.keys(subResponses).map(key => subResponses[key])
            ];
          } else {
            const subResponses = await ask(variable.variables, `${index}: `);
            response = [...response, subResponses];
          }
          index++;
        } catch (e) {
          if (e.name !== ERRORS_NAMES.CancelEditionError) {
            throw e;
          }
          break;
        }
      }

      responses = { ...responses, [variableName]: response };
    } else {
      const question = questionsConfig[variable.type]({
        name: variableName,
        ...variable
      });

      if (prefixMessage !== undefined) {
        question.message = `${prefixMessage}${question.message}`;
      }

      let response;
      if (variable.condition) {
        response = execCondition(variable.condition, responses)
          ? await helpers.safePrompt(question)
          : { [question.name]: "" };
      } else response = await helpers.safePrompt(question);

      responses = { ...responses, ...response };
    }
  }
  return responses;
};

module.exports = ask;
