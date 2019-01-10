const { RESTDataSource } = require("apollo-datasource-rest");
const camelCase = require("lodash.camelcase");

class MediaApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.media.ccc.de/public/";
  }

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

  async getConferences() {
    const data = await this.get("/conferences");
    return data.conferences.map(c => MediaApi.camelize(c));
  }

  async getConference(id) {
    return MediaApi.camelize(await this.get(`/conferences/${id}`));
  }

  async getEvents() {
    const data = await this.get("/events");
    return data.events.map(e => MediaApi.camelize(e));
  }

  async getEvent(id) {
    return MediaApi.camelize(await this.get(`/events/${id}`));
  }

  async searchEvents(query) {
    const data = await this.get(`/events/search?q=${query}`);
    return data.events.map(e => MediaApi.camelize(e));
  }

  async getRecordings() {
    const data = await this.get("/recordings");
    return data.recordings.map(r => MediaApi.camelize(r));
  }

  async getRecording(id) {
    return MediaApi.camelize(await this.get(`/recording/${id}`));
  }
}

module.exports = MediaApi;
