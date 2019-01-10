const { GraphQLDate, GraphQLDateTime } = require("graphql-iso-date");

const MediaApi = require("./MediaApi");

/**
 * Generates a sort function
 *
 * The resulting function can be used to sort an Array of Objects by a key
 * specified through the order param.

 * @param {string} order - Order string formatted as [key]_(ASC|DESC)
 * @returns {function}
 */
const generateSortFn = order =>
  (() => {
    if (order === "promoted") {
      // special case: EventOrder contains promoted
      return a => (a.promoted ? -1 : 1);
    }

    const [key, direction] = order.split(/_(ASC|DESC)$/);

    if (direction === "ASC") {
      return (a, b) => (Date.parse(a[key]) < Date.parse(b[key]) ? 1 : -1);
    }
    if (direction === "DESC") {
      return (a, b) => (Date.parse(a[key]) > Date.parse(b[key]) ? 1 : -1);
    }

    return 0;
  })();

module.exports = {
  Date: GraphQLDate,

  DateTime: GraphQLDateTime,

  Recording: {
    id: _source => _source.url.split("/").slice(-1)[0],

    event: async (_source, _params, { dataSources }) =>
      dataSources.MediaApi.getEvent(_source.event_url.split("/").slice(-1)[0]),

    conference: async (_source, _params, { dataSources }) =>
      dataSources.MediaApi.getConference(
        _source.conference_url.split("/").slice(-1)[0]
      )
  },

  Event: {
    conference: async (_source, _params, { dataSources }) =>
      dataSources.MediaApi.getConference(
        _source.conferenceUrl.split("/").slice(-1)[0]
      ),

    recordings: async (_source, _params, { dataSources }) => {
      let { recordings } = _source;
      if (!recordings) {
        ({ recordings } = await dataSources.MediaApi.getEvent(_source.guid));
      }

      return recordings.map(r => MediaApi.camelize(r));
    },

    relatedEvents: async (_source, { offset, limit }, { dataSources }) =>
      Promise.all(
        _source.related
          .slice(offset, offset + limit)
          .map(related => dataSources.MediaApi.getEvent(related.event_guid))
      )
  },

  Conference: {
    id: _source => _source.url.split("/").slice(-1)[0],

    events: async (_source, { order, offset, limit }, { dataSources }) => {
      let { events } = _source;
      if (!events) {
        ({ events } = await dataSources.MediaApi.getConference(_source.id));
      }

      return events
        .map(e => MediaApi.camelize(e))
        .sort(generateSortFn(order))
        .slice(offset, offset + limit);
    }
  },

  Query: {
    mirrors: async (_source, _params, { dataSources }) =>
      dataSources.MirrorApi.getMirrors(),

    mirror: async (_source, { id }, { dataSources }) =>
      dataSources.MirrorApi.getMirror(id),

    news: async (_source, { order }, { dataSources }) => {
      const data = await dataSources.NewsApi.getNews();
      return data.sort(generateSortFn(order));
    },

    conferences: async (_source, { order, offset, limit }, { dataSources }) => {
      const data = await dataSources.MediaApi.getConferences();
      return data.sort(generateSortFn(order)).slice(offset, offset + limit);
    },

    conference: async (_source, { id }, { dataSources }) =>
      dataSources.MediaApi.getConference(id),

    events: async (_source, { order, offset, limit }, { dataSources }) => {
      const data = await dataSources.MediaApi.getEvents();
      return data.sort(generateSortFn(order)).slice(offset, offset + limit);
    },

    event: async (_source, { id }, { dataSources }) =>
      dataSources.MediaApi.getEvent(id),

    eventsSearch: async (
      _source,
      { query, offset, limit },
      { dataSources }
    ) => {
      const data = await dataSources.MediaApi.searchEvents(query);
      return data.slice(offset, offset + limit);
    },

    recording: async (_source, { id }, { dataSources }) =>
      dataSources.MediaApi.getRecording(id)
  }
};
