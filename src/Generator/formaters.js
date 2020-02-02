module.exports = {
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
  capitalize: value => value.charAt(0).toUpperCase() + value.slice(1)
};
