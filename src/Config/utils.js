const fs = require('fs');
const inquirer = require('inquirer');
const observe = require('inquirer/lib/utils/events');
const { CancelEditionError } = require('../errors');

/**
 * Get all files and sub directories files of a directory
 * @param {string} dir
 * @param {string[]} directories_
 * @return {string[]} list of files
 */
const getFiles = (dir, files_) => {
  if (!fs.existsSync(dir)) return [];
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + '/' + files[i];
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
  if (!fs.existsSync(dir)) return [];
  directories_ = directories_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getDirectories(name, directories_);
      directories_.push(name);
    }
  }
  return directories_;
};

/**
 * Handle esc press inquirer
 */
const safePrompt = async question => {
  const promptModule = inquirer.createPromptModule();

  promptModule.registerPrompt(
    'autocomplete',
    require('inquirer-autocomplete-prompt')
  );

  const ui = new inquirer.ui.Prompt(promptModule.prompts, {});
  const events = observe(ui.rl);
  return new Promise(async (resolve, reject) => {
    const keySubscription = events.keypress.subscribe(e => {
      if (e.key.name === 'escape') {
        reject(new CancelEditionError());
        ui.close();
      }
    });

    try {
      const responses = await ui.run([question]);
      keySubscription.unsubscribe();
      resolve(responses);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = { getFiles, getDirectories, safePrompt };
