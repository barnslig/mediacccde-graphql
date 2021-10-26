import { ApolloServer } from "apollo-server";

import MediaApi from "./MediaApi";
import MirrorApi from "./MirrorApi";
import NewsApi from "./NewsApi";

import resolvers from "./resolvers";
import typeDefs from "./schema.graphql";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    MediaApi: new MediaApi(),
    MirrorApi: new MirrorApi(),
    NewsApi: new NewsApi(),
  }),
  introspection: true,
});

server.listen().then(({ url }) => {
  // eslint-disable-next-line no-console
  console.log(`🚀  Server ready at ${url}`);
});
