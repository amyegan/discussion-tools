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
        discussions: search(query: $query, type: DISCUSSION, first: 100) {
          nodes {
            ... on Discussion {
              id
              number
              url
              title
              createdAt
              updatedAt
              author {
                login
                url
              }
              answerChosenAt
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
              comments(first: 10) {
                nodes {
                  author {
                    login
                    url
                  }
                  createdAt
                  id
                  isAnswer
                  publishedAt
                  url
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
    const dateCreated = new Date(node.createdAt);
    const updatedAt = dateUpdated.toLocaleDateString(undefined, {
      dateStyle: "long",
    });
    const createdAt = dateCreated.toLocaleDateString(undefined, {
      dateStyle: "long",
    });
    return {
      title: node.title,
      id: node.id,
      author: node.author,
      number: node.number,
      url: node.url,
      createdAt,
      updatedAt,
      answerChosenAt: node.answerChosenAt,
      labels: node.labels.nodes,
      category: {
        id: node.category.id,
        name: node.category.name,
      },
      comments: node.comments.nodes,
    };
  });

  res.status(200).json(discussions);
}

type QueryData = {
  title: string;
  id: string;
  author: {
    login: string;
    url: string;
  };
  number: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  answerChosenAt?: Date;
  labels: {
    nodes: Array<{ id: string; name: string; description: string }>;
  };
  category: {
    id: string;
    name: string;
  };
  comments: {
    nodes: Array<{
      id: string;
      isAnswer: boolean;
      publishedAt: Date;
      url: string;
      author: { login: string; url: string };
    }>;
  };
};
