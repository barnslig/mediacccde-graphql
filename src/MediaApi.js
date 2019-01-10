const { RESTDataSource } = require("apollo-datasource-rest");

const camelizeObj = require("./camelizeObj");

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
  constructor() {
    super();
    this.baseURL = "https://api.media.ccc.de/public/";
  }

  async getConferences() {
    const data = await this.get("/conferences", null, { cacheOptions });
    return data.conferences.map(c => camelizeObj(c));
  }

  async getConference(id) {
    return camelizeObj(
      await this.get(`/conferences/${id}`, null, { cacheOptions })
    );
  }

  async getEvents() {
    const data = await this.get("/events", null, { cacheOptions });
    return data.events.map(e => camelizeObj(e));
  }

  async getEvent(id) {
    return camelizeObj(await this.get(`/events/${id}`, null, { cacheOptions }));
  }

  async searchEvents(query) {
    const data = await this.get(`/events/search?q=${query}`, null, {
      cacheOptions
    });
    return data.events.map(e => camelizeObj(e));
  }

  async getRecordings() {
    const data = await this.get("/recordings", null, { cacheOptions });
    return data.recordings.map(r => camelizeObj(r));
  }

  async getRecording(id) {
    return camelizeObj(
      await this.get(`/recording/${id}`, null, { cacheOptions })
    );
  }
}

module.exports = MediaApi;
