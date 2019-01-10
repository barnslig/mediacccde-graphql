const { ApolloServer } = require("apollo-server");

const MediaApi = require("./MediaApi");
const MirrorApi = require("./MirrorApi");
const NewsApi = require("./NewsApi");
const resolvers = require("./resolvers");
const typeDefs = require("./typeDefs");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    MediaApi: new MediaApi(),
    MirrorApi: new MirrorApi(),
    NewsApi: new NewsApi()
  }),
  introspection: true,
  playground: true,
  tracing: process.env.NODE_ENV !== "production"
});

server.listen().then(({ url }) => {
  // eslint-disable-next-line no-console
  console.log(`🚀  Server ready at ${url}`);
});
