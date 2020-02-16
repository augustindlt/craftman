const config = require("../Config");

module.exports = () => {
  const helpers = {
    /**
     * Change value to uppercase
     * @param {string} value
     */
    uppercase: value => value.toUpperCase(),

    /**
     * Change value to lowercase
     * @param {string} value
     */
    lowercase: value => value.toLowerCase(),

    /**
     * Make the first letter to uppercase
     * @param {string} value
     */
    capitalize: value => value.charAt(0).toUpperCase() + value.slice(1),

    /**
     * Add config helpers
     */
    ...config.exposedHelpers
  };

  Object.keys(helpers).forEach(helperName => {
    global[helperName] = helpers[helperName];
  });
};
