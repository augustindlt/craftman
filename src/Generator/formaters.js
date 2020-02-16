const config = require("../Config");

module.exports = () => {
  const formaters = {
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
     * Add config formaters
     */
    ...config.formaters
  };

  Object.keys(formaters).forEach(formaterName => {
    global[formaterName] = formaters[formaterName];
  });
};
