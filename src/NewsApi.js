import fastXMLParser from "fast-xml-parser";
import { RESTDataSource } from "apollo-datasource-rest";

import { orderObjArray, makeConnectionResponseFromArray } from "./helpers";

/* Override Cache-Control headers */
const cacheOptions = { ttl: 60 * 10 };

/* Default amount of nodes per page */
const defaultLimit = 25;

class NewsApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://media.ccc.de/";
  }

  async getNews(offset = 0, limit = defaultLimit, orderBy) {
    const data = await this.get("/news.atom", null, {
      cacheOptions
    });
    const entries = fastXMLParser.parse(data).feed.entry;

    return makeConnectionResponseFromArray(
      entries.sort(orderObjArray(orderBy)),
      offset,
      limit
    );
  }
}

export default NewsApi;
