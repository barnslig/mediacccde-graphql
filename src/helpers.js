import camelCase from "lodash.camelcase";

/**
 * Check whether an Object is plain, e.g. no Array
 * @param {object} obj - Object to check
 * @returns {boolean} Whether an object is plain
 */
export const isPlainObject = obj =>
  obj instanceof Object && !(obj instanceof Array);

/**
 * Camelize an object's keys
 * @param {object} obj - Input object
 * @returns {object} Input object where all keys are camelized
 */
export const camelizeObj = obj =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [camelCase(key)]: isPlainObject(value) ? camelizeObj(value) : value
    }),
    {}
  );

/**
 * Generate an order function for an Array of Objects
 * @param {string} field - Field which should be used
 * @param {string} direction - Order direction, either ASC or DESC
 * @returns {function} Order function that can be used with .sort()
 */
export const orderObjArray = (orderBy = {}) => (a, b) => {
  const { field, direction } = orderBy;
  if (direction === "ASC") {
    return a[field] > b[field] ? 1 : -1;
  }
  if (direction === "DESC") {
    return a[field] < b[field] ? 1 : -1;
  }
  return 0;
};

/**
 * Make a GraphQL connection response
 *
 * @param {[]object} nodes - Nodes in this connection
 * @param {number} totalCount - Total amount of nodes, this may be larger than nodes.length
 * @param {number} offset - Current start node offset
 * @param {number} limit - Maximum amount of nodes in this connection
 * @returns {object} Connection object consisting of nodes, pageInfo and totalCount
 */
export const makeConnectionResponse = (nodes, totalCount, offset, limit) => ({
  nodes,

  pageInfo: {
    hasNextPage: offset + limit < totalCount,
    hasPreviousPage: offset > 0 && totalCount > 0
  },

  totalCount
});

/**
 * Make a GraphQL connection response from an Array
 *
 * This is meant to be used with APIs that do not implement pagination.
 *
 * @param {[]object} _nodes - All nodes supplied by the API
 * @param {number} offset - Current start node offset
 * @param {number} limit - Maximum amount of nodes in this connection
 * @returns {object} Connection object consisting of sliced nodes, pageInfo and totalCount
 */
export const makeConnectionResponseFromArray = (_nodes, offset, limit) => {
  const totalCount = _nodes.length;
  const nodes = _nodes.slice(offset, offset + limit).map(camelizeObj);

  return makeConnectionResponse(nodes, totalCount, offset, limit);
};

/**
 * Make a GraphQL connection response from an apollo-datasource-rest response
 *
 * This is meant to be used with a Rails API that uses https://github.com/davidcelis/api-pagination
 *
 * @param {[]object} _nodes - Nodes in this connection
 * @param {Response.Header} headers - Response headers
 * @param {number} offset - Current start node offset
 * @param {number} limit - Maximum amount of nodes in this connection
 * @returns {object} Connection object consisting of nodes, pageInfo and totalCount
 */
export const makeConnectionResponseFromResponse = (
  _nodes,
  headers,
  offset,
  limit
) => {
  const totalCount = parseInt(headers.get("total"), 10);
  const nodes = _nodes.map(camelizeObj);

  return makeConnectionResponse(nodes, totalCount, offset, limit);
};
