const { RESTDataSource } = require("apollo-datasource-rest");
const camelCase = require("lodash.camelcase");

/* The media.ccc.de API does not implement any kind of pagination which often
 * results in seriously large responses, e.g. the 35c3 API response is ~800kB.
 *
 * Some GraphQL queries submit multiple requests which quickly piles up.
 *
 * As by default the API sets Cache-Control: max-age=0, private, must-revalidate
 * we have to override the cache TTL to a reasonable duration, e.g. 10 minutes
 */
const cacheOptions = { ttl: 60 * 10 };

class MediaApi extends RESTDataSource {
  /**
   * Camelize an object's keys
   * @param {object} obj - Input object
   * @returns {object} Input object where all keys are camelized
   */
  static camelize(obj) {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => ({ ...acc, [camelCase(key)]: value }),
      {}
    );
  }

  constructor() {
    super();
    this.baseURL = "https://api.media.ccc.de/public/";
  }

  async getConferences() {
    const data = await this.get("/conferences", null, { cacheOptions });
    return data.conferences.map(c => MediaApi.camelize(c));
  }

  async getConference(id) {
    return MediaApi.camelize(
      await this.get(`/conferences/${id}`, null, { cacheOptions })
    );
  }

  async getEvents() {
    const data = await this.get("/events", null, { cacheOptions });
    return data.events.map(e => MediaApi.camelize(e));
  }

  async getEvent(id) {
    return MediaApi.camelize(
      await this.get(`/events/${id}`, null, { cacheOptions })
    );
  }

  async searchEvents(query) {
    const data = await this.get(`/events/search?q=${query}`, null, {
      cacheOptions
    });
    return data.events.map(e => MediaApi.camelize(e));
  }

  async getRecordings() {
    const data = await this.get("/recordings", null, { cacheOptions });
    return data.recordings.map(r => MediaApi.camelize(r));
  }

  async getRecording(id) {
    return MediaApi.camelize(
      await this.get(`/recording/${id}`, null, { cacheOptions })
    );
  }
}

module.exports = MediaApi;
