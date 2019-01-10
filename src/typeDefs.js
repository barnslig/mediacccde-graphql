const { gql } = require("apollo-server");

module.exports = gql`
  scalar Date

  scalar DateTime

  """
  This entity is a single audio/video recording from an Event/Lecture
  """
  type Recording {
    id: ID!
    filename: String
    folder: String
    height: Int
    highQuality: Boolean
    language: String
    length: Int
    mimeType: String
    recordingUrl: String
    size: Int
    state: String
    updatedAt: DateTime
    width: Int

    event: Event
    conference: Conference
  }

  enum EventOrder {
    date_ASC
    date_DESC
    duration_ASC
    duration_DESC
    promoted
    releaseDate_ASC
    releaseDate_DESC
    viewCount_ASC
    viewCount_DESC
  }

  """
  This entity is an Event/Lecture that took place during a Conference/Lecture series and consists of multiple Recordings
  """
  type Event {
    guid: ID!
    date: DateTime
    description: String
    duration: Int
    frontendLink: String
    link: String
    originalLanguage: String
    persons: [String]
    posterUrl: String
    promoted: String
    releaseDate: Date
    slug: String
    subtitle: String
    tags: [String]
    thumbnailsUrl: String
    thumbUrl: String
    timelineUrl: String
    title: String
    updatedAt: DateTime
    viewCount: Int

    conference: Conference
    recordings: [Recording]
    relatedEvents(offset: Int = 0, limit: Int = 3): [Event]
  }

  enum ConferenceOrder {
    eventLastReleasedAt_ASC
    eventLastReleasedAt_DESC
    updatedAt_ASC
    updatedAt_DESC
  }

  """
  This entity groups multiple Events/Lectures together, e.g. a Conference or Lecture Series
  """
  type Conference {
    id: ID!
    acronym: String!
    aspectRatio: String
    eventLastReleasedAt: Date
    imagesUrl: String
    logoUrl: String
    recordingsUrl: String
    scheduleUrl: String
    slug: String
    title: String
    updatedAt: DateTime
    webgenLocation: String

    events(
      order: EventOrder = date_ASC
      offset: Int = 0
      limit: Int = 10
    ): [Event]
  }

  type Query {
    conferences(
      order: ConferenceOrder = eventLastReleasedAt_ASC
      offset: Int = 0
      limit: Int = 10
    ): [Conference]

    conference(id: ID!): Conference

    events(
      order: EventOrder = date_ASC
      offset: Int = 0
      limit: Int = 10
    ): [Event]

    event(id: ID!): Event

    eventsSearch(query: String!, offset: Int = 0, limit: Int = 10): [Event]

    recording(id: ID!): Recording
  }
`;
