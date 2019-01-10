const camelCase = require("lodash.camelcase");

/**
 * Camelize an object's keys
 * @param {object} obj - Input object
 * @returns {object} Input object where all keys are camelized
 */
const camelizeObj = obj =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({ ...acc, [camelCase(key)]: value }),
    {}
  );

module.exports = camelizeObj;
