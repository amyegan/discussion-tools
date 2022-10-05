import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "@apollo/client";
import client from "../../apollo-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.query;
  const login = params?.login || "ozgur-dogan";
  const repositoryId = params?.repositoryId || "R_kgDOGcG7Rw";
  const { data } = await client.query({
    query: gql`
      query User($login: String!, $repositoryId: ID!) {
        user(login: $login) {
          repositoryDiscussions(
            first: 50
            repositoryId: $repositoryId
            orderBy: { field: CREATED_AT, direction: DESC }
          ) {
            totalCount
            nodes {
              createdAt
              title
              url
            }
          }
        }
      }
    `,
    variables: { login, repositoryId },
  });

  const discussions = data?.user?.repositoryDiscussions?.nodes?.map(
    (discussion: DiscussionData) => {
      return {
        title: discussion.title,
        url: discussion.url,
        createdAt: discussion.createdAt,
      };
    }
  );

  res.status(200).json({
    login,
    repositoryId,
    totalDiscussionCount: data?.user?.totalCount,
    discussions,
  });
}

type DiscussionData = {
  title: string;
  url: string;
  createdAt: Date;
};
