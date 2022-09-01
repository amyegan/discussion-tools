import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "@apollo/client";
import client from "../../apollo-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data } = await client.query({
    query: gql`
      query repo {
        repository(name: "community", owner: "vercel") {
          description
          labels(first: 20) {
            nodes {
              id
              name
              description
            }
          }
          discussionCategories(first: 10) {
            nodes {
              id
              name
              description
              slug
            }
          }
        }
      }
    `,
  });

  const labels = data?.repository?.labels?.nodes;
  const categories = data?.repository.discussionCategories?.nodes;
  res.status(200).json({ labels, categories });
}
