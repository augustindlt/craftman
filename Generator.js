const fs = require("fs");
const chalk = require("chalk");

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
  Object.keys(variables).forEach(name => {
    const value = variables[name];
    content = content.replace(new RegExp(`#{${name}}#`, "g"), value);
  });
  return content;
};

/**
 * Get the content of a template file
 * @param {string} templateName
 */
const getTemplateContent = templateName => {
  return fs.readFileSync(`./.craftman/${templateName}.craft`).toString();
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
  let content = getTemplateContent(templateName);
  content = applyVariable(variables, content);
  createFile(filePath, fileName, content);
};
