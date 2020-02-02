const fs = require("fs");

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

module.exports = { getFiles, getDirectories };
