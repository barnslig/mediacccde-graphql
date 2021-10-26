import { ApolloServer, gql } from "apollo-server";

import MirrorApi from "./MirrorApi";
import MirrorApiMockData from "./__mockdata__/MirrorApi.json";

import resolvers from "./resolvers";
import typeDefs from "./schema.graphql";

const mirrorApi = new MirrorApi();
mirrorApi.get = jest.fn((path) => {
  if (path !== "/") {
    throw new Error(`Unexpected request path: ${path}`);
  }

  return MirrorApiMockData;
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    MirrorApi: mirrorApi,
  }),
});

test("getMirrors", async () => {
  const mirrorsQuery = gql`
    query mirrors($offset: Int, $limit: Int) {
      mirrors(offset: $offset, limit: $limit) {
        nodes {
          id
          asnum
          continentCode
          countryCodes
          enabled
          fileCount
          httpUrl
          lastSync
          latitude
          longitude
          monthBytes
          monthDownloads
          sponsorLogoUrl
          sponsorName
          sponsorUrl
          up
        }

        pageInfo {
          hasNextPage
          hasPreviousPage
        }

        totalCount
      }
    }
  `;

  const res = await server.executeOperation({ query: mirrorsQuery });
  expect(res).toMatchSnapshot();
});

test("getMirror", async () => {
  const mirrorQuery = gql`
    fragment TestMirror on Mirror {
      id
      asnum
      continentCode
      countryCodes
      enabled
      fileCount
      httpUrl
      lastSync
      latitude
      longitude
      monthBytes
      monthDownloads
      sponsorLogoUrl
      sponsorName
      sponsorUrl
      up
    }

    query mirror($id: ID!, $nodeId: ID!) {
      mirror(id: $id) {
        ...TestMirror
      }
      node(id: $nodeId) {
        ...TestMirror
      }
    }
  `;

  const res = await server.executeOperation({
    query: mirrorQuery,
    variables: { id: "berlin-ak", nodeId: "mirror-berlin-ak" },
  });
  expect(res.data.mirror).toEqual(res.data.node);
  expect(res).toMatchSnapshot();
});
