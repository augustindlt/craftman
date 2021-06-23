const config = require('../Config');

module.exports = () => {
  const helpers = {
    /**
     * Make the first letter to uppercase
     * @param {string} value
     */
    capitalize: value => value.charAt(0).toUpperCase() + value.slice(1),

    /**
     * Add config helpers
     */
    ...config.exposedHelpers,
  };

  Object.keys(helpers).forEach(helperName => {
    global[helperName] = helpers[helperName];
  });
};
