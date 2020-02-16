const fs = require("fs");
const inquirer = require("inquirer");
const { CancelEditionError } = require("../errors");

/**
 * Get all files and sub directories files of a directory
 * @param {string} dir
 * @param {string[]} directories_
 * @return {string[]} list of files
 */
const getFiles = (dir, files_) => {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
};

/**
 * Get all diretories and sub directories of a directory
 * @param {string} dir
 * @param {string[]} directories_
 * @return {string[]} list of directories
 */
const getDirectories = (dir, directories_) => {
  directories_ = directories_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getDirectories(name, directories_);
      directories_.push(name);
    }
  }
  return directories_;
};

/**
 * By default Inquirer handles Ctrl-C itself by force-quitting the process with
 * no way to clean up. This wrapper around Inquirer throws a Error
 * instead, allowing normal exception handling.
 * Thanks https://github.com/justjake
 */
const safePrompt = async question => {
  const promptModule = inquirer.createPromptModule();

  promptModule.registerPrompt(
    "autocomplete",
    require("inquirer-autocomplete-prompt")
  );

  const ui = new inquirer.ui.Prompt(promptModule.prompts, {});
  return new Promise((resolve, reject) => {
    const rl = ui.rl;
    rl.listeners("SIGINT").forEach(listener => rl.off("SIGINT", listener));

    const handleCtrlC = () => {
      rl.off("SIGINT", handleCtrlC);
      ui.close();
      reject(new CancelEditionError());
    };

    rl.on("SIGINT", handleCtrlC);
    ui.run([question]).then(resolve, reject);
  });
};

module.exports = { getFiles, getDirectories, safePrompt };
