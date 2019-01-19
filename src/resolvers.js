import { GraphQLDate, GraphQLDateTime } from "graphql-iso-date";

const resolvers = {
  Date: GraphQLDate,

  DateTime: GraphQLDateTime,

  Node: {
    __resolveType: obj => {
      if (obj.id && obj.id.slice(0, 16) === "tag:media.ccc.de") {
        return "News";
      }

      if (Object.prototype.hasOwnProperty.call(obj, "lastSync")) {
        return "Mirror";
      }

      if (obj.url && obj.url.indexOf("/public/cofnerences/") > -1) {
        return "Conference";
      }

      if (obj.url && obj.url.indexOf("/public/events/") > -1) {
        return "Event";
      }

      if (obj.url && obj.url.indexOf("/public/recordings/") > -1) {
        return "Recording";
      }

      return null;
    }
  },

  News: {
    id: _source => `news-${_source.id}`,

    createdAt: _source => _source.published,

    updatedAt: _source => _source.updated
  },

  Conference: {
    id: _source => `conference-${_source.url.split("/").slice(-1)[0]}`,

    events: async (_source, { offset, limit, orderBy }, { dataSources }) =>
      dataSources.MediaApi.getConferenceEvents(
        _source.url.split("/").slice(-1)[0],
        offset,
        limit,
        orderBy
      )
  },

  Event: {
    id: _source => `event-${_source.guid}`,

    conference: async (_source, _params, { dataSources }) =>
      dataSources.MediaApi.getConference(
        _source.conferenceUrl.split("/").slice(-1)[0]
      ),

    recordings: async (_source, { offset, limit }, { dataSources }) =>
      dataSources.MediaApi.getEventRecordings(_source.guid, offset, limit),

    relatedEvents: async (_source, { offset, limit }, { dataSources }) =>
      dataSources.MediaApi.getEventRelated(_source.guid, offset, limit)
  },

  Recording: {
    id: _source => `recording-${_source.url.split("/").slice(-1)[0]}`,

    duration: _source => _source.length,

    event: async (_source, _params, { dataSources }) =>
      dataSources.MediaApi.getEvent(_source.eventUrl.split("/").slice(-1)[0]),

    conference: async (_source, _params, { dataSources }) =>
      dataSources.MediaApi.getConference(
        _source.conferenceUrl.split("/").slice(-1)[0]
      )
  },

  Query: {
    mirrors: async (_source, { offset, limit, orderBy }, { dataSources }) =>
      dataSources.MirrorApi.getMirrors(offset, limit, orderBy),

    mirror: async (_source, { id }, { dataSources }) =>
      dataSources.MirrorApi.getMirror(id),

    news: async (_source, { offset, limit, orderBy }, { dataSources }) =>
      dataSources.NewsApi.getNews(offset, limit, orderBy),

    node: async (_source, { id }, { dataSources }) => {
      if (id.slice(0, 7) === "mirror-") {
        return dataSources.MirrorApi.getMirror(id.slice(7));
      }

      if (id.slice(0, 11) === "conference-") {
        return dataSources.MediaApi.getConference(id.slice(11));
      }

      if (id.slice(0, 6) === "event-") {
        return dataSources.MediaApi.getEvent(id.slice(6));
      }

      if (id.slice(0, 10) === "recording-") {
        return dataSources.MediaApi.getRecording(id.slice(10));
      }

      return null;
    },

    conferences: async (_source, { offset, limit, orderBy }, { dataSources }) =>
      dataSources.MediaApi.getConferences(offset, limit, orderBy),

    conference: async (_source, { id }, { dataSources }) => {
      const realId = id.slice(0, 11) === "conference-" ? id.slice(11) : id;
      return dataSources.MediaApi.getConference(realId);
    },

    events: async (_source, { offset, limit, orderBy }, { dataSources }) =>
      dataSources.MediaApi.getEvents(offset, limit, orderBy),

    event: async (_source, { id }, { dataSources }) => {
      const realId = id.slice(0, 6) === "event-" ? id.slice(6) : id;
      return dataSources.MediaApi.getEvent(realId);
    },

    eventsSearch: async (_source, { offset, limit, query }, { dataSources }) =>
      dataSources.MediaApi.getEventsSearch(offset, limit, query),

    recording: async (_source, { id }, { dataSources }) => {
      const realId = id.slice(0, 10) === "recording-" ? id.slice(10) : id;
      return dataSources.MediaApi.getRecording(realId);
    }
  }
};

export default resolvers;
