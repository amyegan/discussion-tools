import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "@apollo/client";
import client from "../../apollo-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query;
  let query = `repo:vercel/community updated:${params.startDate}..${params.endDate} sort:updated`;
  const { data } = await client.query({
    query: gql`
      query Discussions($query: String!) {
        discussions: search(query: $query, type: DISCUSSION, first: 20) {
          nodes {
            ... on Discussion {
              id
              number
              url
              title
              updatedAt
              author {
                login
                url
              }
              category {
                id
                name
                description
              }
              labels(first: 10) {
                nodes {
                  id
                  name
                  description
                }
              }
            }
          }
        }
      }
    `,
    variables: { query },
  });

  const discussions = data.discussions.nodes.map((node: QueryData) => {
    const dateUpdated = new Date(node.updatedAt);
    const updatedAt = dateUpdated.toLocaleDateString(undefined, {
      dateStyle: "long",
    });
    return {
      title: node.title,
      id: node.id,
      number: node.number,
      url: node.url,
      updatedAt,
      labels: node.labels.nodes,
      category: {
        id: node.category.id,
        name: node.category.name,
      },
    };
  });

  res.status(200).json(discussions);
}

type QueryData = {
  title: string;
  id: string;
  number: string;
  url: string;
  updatedAt: Date;
  labels: {
    nodes: Array<{ id: string; name: string; description: string }>;
  };
  category: {
    id: string;
    name: string;
  };
};
