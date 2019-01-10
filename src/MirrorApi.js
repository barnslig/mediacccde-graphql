const { RESTDataSource } = require("apollo-datasource-rest");

const camelizeObj = require("./camelizeObj");

class MirrorApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://cdn-api.media.ccc.de/";
  }

  async getMirrors() {
    const data = await this.get("/");
    return data.MirrorList.map(m => camelizeObj(m));
  }

  async getMirror(id) {
    const mirrors = await this.getMirrors();
    return mirrors.find(m => m.id === id);
  }
}

module.exports = MirrorApi;
