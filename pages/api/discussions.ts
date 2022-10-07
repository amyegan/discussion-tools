import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "@apollo/client";
import client from "../../apollo-client";
import { start } from "repl";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const params = req.query;
    const query = `repo:vercel/community updated:${params.startDate}..${params.endDate} sort:updated`;
    const { data } = await client.query({
      query: gql`
        query Discussions($query: String!) {
          discussions: search(query: $query, type: DISCUSSION, first: 100) {
            discussionCount
            nodes {
              ... on Discussion {
                id
                number
                url
                title
                createdAt
                publishedAt
                updatedAt
                author {
                  login
                  url
                }
                answerChosenAt
                repository {
                  id
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
        title: node?.title,
        id: node?.id,
        author: node?.author,
        number: node?.number,
        url: node?.url,
        createdAt,
        updatedAt,
        answerChosenAt: node?.answerChosenAt,
        comments: node?.comments?.nodes,
      };
    });

    let newDiscussions = discussions.filter((discussion: any) => {
      let date = new Date(discussion.createdAt);
      let publishedDate = new Date(discussion.createdAt);
      const start = params.startDate?.toString() || "";
      const end = params.endDate?.toString() || "";
      return date > new Date(start) && date < new Date(end);
    });

    res.status(200).json({
      total: data.discussions.discussionCount,
      new: newDiscussions.length,
      discussions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
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
