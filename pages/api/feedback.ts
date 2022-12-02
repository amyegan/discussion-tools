import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "@apollo/client";
import client from "../../apollo-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data } = await client.query({
    query: gql`
      query Feedback {
        repository(name: "community", owner: "vercel") {
          disc1: discussion(number: 222) {
            comments(first: 20) {
              totalCount
              nodes {
                replies(first: 1) {
                  totalCount
                }
              }
            }
            reactions {
              totalCount
            }
            upvoteCount
          }
          disc2: discussion(number: 1109) {
            comments(first: 20) {
              totalCount
              nodes {
                replies(first: 1) {
                  totalCount
                }
              }
            }
            reactions {
              totalCount
            }
            upvoteCount
          }
        }
      }
    `,
  });

  let popularityMetrics = [];
  for (const [key, value] of Object.entries<Discussion>(data.repository)) {
    if (key !== "__typename") {
      const commentCount = getCommentCount(value.comments);

      popularityMetrics.push({
        discussion: key,
        repo: "community",
        commentCount,
        reactionCount: value.reactions?.totalCount,
        upvoteCount: value.upvoteCount,
      });
    }
  }

  //res.setHeader("Cache-Control", "max-age=0, s-maxage=300");
  res.status(200).json(popularityMetrics);
}

const getCommentCount = (comments: Comments) => {
  let commentTotal = comments.totalCount;
  let replyTotal = 0;

  for (const [key, value] of Object.entries(comments.nodes)) {
    replyTotal += value.replies.totalCount
  }

  return commentTotal + replyTotal;
};

type Discussion = {
  comments: Comments;
  reactions: {
    totalCount: number;
  };
  upvoteCount: number;
};

type Comments = {
  totalCount: number;
  nodes: [
    {
      replies: Reply;
    }
  ];
};

type Reply = {
  totalCount: number;
};
