const fs = require("fs");
const chalk = require("chalk");
const getFormaters = require("./formaters");
const {
  VAR_LEFT_DELEMITER,
  VAR_RIGHT_DELEMITER,
  VAR_FORMATER_DELEMIER,
  CRAFTSMAN_FOLDER,
  TEMPLATE_EXT
} = require("../constants");
const { TemplateNotFoundError, FormaterNotFoundError } = require("../errors");

/**
 * Create a file
 * @param {string} path
 * @param {string} fileName
 * @param {string} content
 */
const createFile = (path, fileName, content) => {
  const filePath = `${path}/${fileName}`;
  if (fs.existsSync(filePath)) {
    console.log(
      "=> " + chalk.blue(filePath) + chalk.red(" already exist ! 😇")
    );
    return;
  }
  fs.mkdirSync(path, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log("=> " + chalk.blue(filePath) + chalk.yellow(" Done ! 🥳"));
};

/**
 * Apply variables to a string
 * @param {object} variables
 * @param {string} content
 */
const applyVariable = (variables, content) => {
  const formaters = getFormaters();

  Object.keys(variables).forEach(name => {
    const regex = `${VAR_LEFT_DELEMITER}${name}[${VAR_FORMATER_DELEMIER}]?([\\w-]*)${VAR_RIGHT_DELEMITER}`;
    const matches = content.match(new RegExp(regex, "gm"));
    if (!matches) return;

    const value = variables[name];
    matches.forEach(match => {
      const [, formaterName] = match.match(new RegExp(regex));
      let formatedValue = value;
      if (formaterName) {
        if (typeof formaters[formaterName] !== "function") {
          throw new FormaterNotFoundError(formaterName);
        }
        formatedValue = formaters[formaterName](value);
      }
      content = content.replace(match, formatedValue);
    });
  });
  return content;
};

/**
 * Get the content of a template file
 * @param {string} templateName
 */
const getTemplateContent = templateName => {
  const templatePath = `${CRAFTSMAN_FOLDER}/${templateName}.${TEMPLATE_EXT}`;
  if (!fs.existsSync(templatePath)) {
    throw new TemplateNotFoundError(templateName);
  }
  return fs.readFileSync(templatePath).toString();
};

/**
 * Create a file in terms of template and variables
 * @param {string} templateName
 * @param {string} filePath
 * @param {string} fileName
 * @param {object} variables
 */
module.exports = (templateName, filePath, fileName, variables) => {
  filePath = applyVariable(variables, filePath);
  fileName = applyVariable(variables, fileName);
  templateName = applyVariable(variables, templateName);
  let content = getTemplateContent(templateName);
  content = applyVariable(variables, content);
  createFile(filePath, fileName, content);
};
