const fastXMLParser = require("fast-xml-parser");
const { RESTDataSource } = require("apollo-datasource-rest");

const cacheOptions = { ttl: 60 * 10 };

class NewsApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://media.ccc.de/news.atom";
  }

  async getNews() {
    const data = await this.get("https://media.ccc.de/news.atom", null, {
      cacheOptions
    });
    const entries = fastXMLParser.parse(data).feed.entry;

    // do the mapping here so our order function works
    return entries.map(e => ({
      ...e,
      createdAt: e.published,
      updatedAt: e.updated
    }));
  }
}

module.exports = NewsApi;
