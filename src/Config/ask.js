const inquirer = require("inquirer");
const helpers = require("./helpers");
const execCondition = require("../condition");

inquirer.registerPrompt(
  "autocomplete",
  require("inquirer-autocomplete-prompt")
);

/**
 * Get default config of a question
 * @param {object} variable
 */
const getDefaultConfig = variable => ({
  name: variable.name,
  message: variable.message || `What ${variable.name} ?`
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
      const initialPath = variable.path || "./";
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
module.exports = async variables => {
  const questions = Object.keys(variables).map(name => {
    const variable = variables[name];
    return questionsConfig[variable.type]({ name, ...variable });
  });

  let responses = {};
  for (const question of questions) {
    const variable = variables[question.name];

    let response;
    if (variable.condition) {
      response = execCondition(variable.condition, responses)
        ? await inquirer.prompt(question)
        : { [question.name]: "" };
    } else response = await inquirer.prompt(question);

    responses = { ...responses, ...response };
  }

  return responses;
};
