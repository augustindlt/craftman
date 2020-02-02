/**
 * Convert a condition string to boolean
 * @param {string} condition
 * @param {object} variables
 * @return {boolean} result of the condition
 */
const execCondition = (condition, variables) => {
  for (const variableName of Object.keys(variables)) {
    condition = condition.replace(variableName, `'${variables[variableName]}'`);
  }
  return !!new Function(`return ${condition}`)();
};

module.exports = execCondition;
