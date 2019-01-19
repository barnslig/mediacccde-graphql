/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "orderBy" }] */
import { RESTDataSource } from "apollo-datasource-rest";
import { UserInputError } from "apollo-server";

import {
  camelizeObj,
  makeConnectionResponse,
  makeConnectionResponseFromArray,
  makeConnectionResponseFromResponse
} from "./helpers";

/* Some media.ccc.de API methods return very large responses. For example,
 * the 35c3 conference API response is ~800kB.
 *
 * GraphQL queries may result in multiple API requests, thus we have to make
 * sure that they are locally cached.
 *
 * As by default the API sets Cache-Control: max-age=0, private, must-revalidate
 * we have to override the cache TTL to a reasonable duration, e.g. 10 minutes
 */
const cacheOptions = { ttl: 60 * 10 };

/* Default amount of nodes per page */
const defaultPageLimit = 25;

class MediaApi extends RESTDataSource {
  /**
   * Calculate page and per_page query param from limit/offset graphql arguments
   *
   * @param {number} offset - Skip the first n items
   * @param {number} limit - Maximum amount of items to fetch
   * @returns {object} Query parameters
   */
  static makePaginationParams(offset, limit) {
    if (!Number.isInteger(offset / limit)) {
      throw new UserInputError(
        "Offset is not divisible by limit without remainder.",
        {
          invalidArgs: ["offset"]
        }
      );
    }
    return { per_page: limit, page: offset / limit + 1 };
  }

  constructor() {
    super();
    this.baseURL = "https://api.media.ccc.de/public/";
  }

  /**
   * Override internal RESTDataSource method so we can access the response headers
   *
   * @param {Response} response - HTTP response
   * @returns {Promise} Promise that resolves with the parsed response body and response object
   */
  async didReceiveResponse(response) {
    if (response.ok) {
      const body = await this.parseBody(response);
      return [body, response];
    }
    throw await this.errorFromResponse(response);
  }

  async getConferences(offset = 0, limit = defaultPageLimit, orderBy) {
    const [data] = await this.get("/conferences", {}, { cacheOptions });

    // TODO public API does not support pagination for this endpoint right now
    return makeConnectionResponseFromArray(data.conferences, offset, limit);
  }

  async getConference(id) {
    const [data] = await this.get(`/conferences/${id}`, null, { cacheOptions });

    return camelizeObj(data);
  }

  async getConferenceEvents(id, offset = 0, limit = defaultPageLimit, orderBy) {
    const { events } = await this.getConference(id);

    return makeConnectionResponseFromArray(events, offset, limit);
  }

  async getEvents(offset = 0, limit = defaultPageLimit, orderBy) {
    const [data, { headers }] = await this.get(
      "/events",
      { ...MediaApi.makePaginationParams(offset, limit) },
      { cacheOptions }
    );

    return makeConnectionResponseFromResponse(
      data.events,
      headers,
      offset,
      limit
    );
  }

  async getEvent(id) {
    const [data] = await this.get(`/events/${id}`, null, { cacheOptions });

    return camelizeObj(data);
  }

  async getEventRecordings(id, offset = 0, limit = defaultPageLimit) {
    const { recordings } = await this.getEvent(id);

    return makeConnectionResponseFromArray(recordings, offset, limit);
  }

  async getEventRelated(id, offset = 0, limit = defaultPageLimit) {
    const { related } = await this.getEvent(id);

    const totalCount = related.length;
    const nodes = await Promise.all(
      related
        .sort((a, b) => (a.weight < b.weight ? 1 : -1))
        .slice(offset, offset + limit)
        .map(r => this.getEvent(r.event_guid))
    );

    return makeConnectionResponse(nodes, totalCount, offset, limit);
  }

  async getEventsSearch(offset = 0, limit = defaultPageLimit, q) {
    const [data, { headers }] = await this.get(
      "/events/search",
      { q, ...MediaApi.makePaginationParams(offset, limit) },
      { cacheOptions }
    );

    return makeConnectionResponseFromResponse(
      data.events,
      headers,
      offset,
      limit
    );
  }

  async getRecordings(offset = 0, limit = defaultPageLimit) {
    const [data, { headers }] = await this.get(
      "/recordings",
      { ...MediaApi.makePaginationParams(offset, limit) },
      { cacheOptions }
    );

    return makeConnectionResponseFromResponse(
      data.recordings,
      headers,
      offset,
      limit
    );
  }

  async getRecording(id) {
    const [data] = await this.get(`/recordings/${id}`, null, { cacheOptions });

    return camelizeObj(data);
  }
}

export default MediaApi;
