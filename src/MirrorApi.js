import { RESTDataSource } from "apollo-datasource-rest";

import {
  camelizeObj,
  orderObjArray,
  makeConnectionResponseFromArray,
} from "./helpers";

/* Default amount of nodes per page */
const defaultLimit = 25;

class MirrorApi extends RESTDataSource {
  static transformMirror(m) {
    return {
      ...m,
      LastSync: m.LastSync * 1000,
    };
  }

  constructor() {
    super();
    this.baseURL = "https://cdn-api.media.ccc.de/";
  }

  async getMirrors(offset = 0, limit = defaultLimit, orderBy) {
    const data = await this.get("/");

    return makeConnectionResponseFromArray(
      data.MirrorList.sort(orderObjArray(orderBy)).map(
        MirrorApi.transformMirror
      ),
      offset,
      limit
    );
  }

  async getMirror(id) {
    const data = await this.get("/");

    return camelizeObj(
      MirrorApi.transformMirror(data.MirrorList.find((m) => m.ID === id))
    );
  }
}

export default MirrorApi;
