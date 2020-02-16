const fs = require("fs");
const chalk = require("chalk");
const ejs = require("ejs");
const { CRAFTSMAN_FOLDER, TEMPLATE_EXT } = require("../constants");
const { TemplateNotFoundError, TemplateParserError } = require("../errors");
const ask = require("../Config/ask");

/**
 * Create a file
 * @param {string} path
 * @param {string} fileName
 * @param {string} content
 * @param {"yes"|"no"|"ask"|undefined} replaceExistingFile
 */
const createFile = async (path, fileName, content, replaceExistingFile) => {
  const filePath = `${path}/${fileName}`;
  if (fs.existsSync(filePath)) {
    if (replaceExistingFile === "no") {
      console.log(
        "=> " + chalk.blue(filePath) + chalk.red(" already exist ! 😇")
      );
      return;
    }

    if (replaceExistingFile !== "yes") {
      const { replaceIt } = await ask({
        replaceIt: {
          type: "choices",
          choices: ["no", "yes"],
          message: "Do you want to replace it ?"
        }
      });
      if (replaceIt === "no") return;
    }
  }
  fs.mkdirSync(path, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log("=> " + chalk.blue(filePath) + chalk.yellow(" Done ! 🥳"));
};

/**
 * Apply variables to a string
 * @param {object} variables
 * @param {string} content
 * @param {string} scope
 */
const applyVariable = (variables, content, scope) => {
  try {
    return ejs.render(content, variables);
  } catch (e) {
    throw new TemplateParserError(scope, e.message.split("\n")[0]);
  }
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
 * @param {"yes"|"no"|"ask"|undefined} replaceExistingFile
 * @param {object} variables
 */
module.exports = async (
  templateName,
  filePath,
  fileName,
  replaceExistingFile,
  variables
) => {
  filePath = applyVariable(variables, filePath, "file path");
  fileName = applyVariable(variables, fileName, "file name");
  templateName = applyVariable(variables, templateName, "template name");
  let content = getTemplateContent(templateName);
  content = applyVariable(variables, content, "content");
  await createFile(filePath, fileName, content, replaceExistingFile);
};
