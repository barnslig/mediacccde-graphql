import { ApolloServer, gql } from "apollo-server";
import { join } from "path";
import { readFileSync } from "fs";

import NewsApi from "./NewsApi";

import resolvers from "./resolvers";
import typeDefs from "./schema.graphql";

const NewsApiMockData = readFileSync(
  join(__dirname, "./__mockdata__/NewsApi.atom")
).toString();

const newsApi = new NewsApi();
newsApi.get = jest.fn((path) => {
  if (path !== "/news.atom") {
    throw new Error(`Unexpected request path: ${path}`);
  }

  return NewsApiMockData;
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    NewsApi: newsApi,
  }),
});

test("getNews", async () => {
  const newsQuery = gql`
    query news($offset: Int, $limit: Int) {
      news(offset: $offset, limit: $limit) {
        nodes {
          id
          title
          content
          createdAt
          updatedAt
        }

        pageInfo {
          hasNextPage
          hasPreviousPage
        }

        totalCount
      }
    }
  `;

  const res = await server.executeOperation({ query: newsQuery });
  expect(res).toMatchSnapshot();
});
