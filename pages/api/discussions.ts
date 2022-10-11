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
    const startDate = typeof params.startDate === 'string' ? new Date(params.startDate) : new Date();
    const endDate = typeof params.endDate === 'string' ? new Date(params.endDate) : new Date();
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
                comments(first: 50) {
                  totalCount
                  nodes {
                    author {
                      login
                      url
                    }
                    id
                    url
                    isAnswer
                    publishedAt
                    replies(first: 25) {
                      totalCount
                      nodes {
                        author {
                          login
                          url
                        }
                        id
                        url
                        isAnswer
                        publishedAt
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { query },
    });

    console.log('** START');
    let posters: string[] = [];
    let commenters: string[] = [];
    let totalCommentsAndReplies = 0; // count comments and replies that happened this week
    const discussions = data.discussions.nodes.map((post: QueryData) => {
      const dateUpdated = new Date(post.updatedAt);
      const dateCreated = new Date(post.createdAt);
      const updatedAt = dateUpdated.toLocaleDateString(undefined, {
        dateStyle: "long",
      });
      const createdAt = dateCreated.toLocaleDateString(undefined, {
        dateStyle: "long",
      });

      if (new Date(post?.createdAt) >= startDate) {
        posters.push(post?.author?.login);
      }

      for (let comment of post?.comments?.nodes) {
        if (new Date(comment.publishedAt) >= startDate) {
          totalCommentsAndReplies++;
          commenters.push(comment?.author?.login);
        }

        for (let reply of comment.replies.nodes) {
          if (new Date(reply.publishedAt) >= startDate) {
            totalCommentsAndReplies++;
            commenters.push(reply?.author?.login);
          }
        }
      }

      return {
        title: post?.title,
        id: post?.id,
        author: post?.author,
        number: post?.number,
        url: post?.url,
        createdAt,
        updatedAt,
        answerChosenAt: post?.answerChosenAt,
        comments: post?.comments?.nodes,
      };
    });

    let posterSet = new Set(posters);
    let commenterSet = new Set(commenters);

    let newDiscussions = discussions.filter((discussion: any) => {
      let date = new Date(discussion.createdAt);
      return date > startDate && date < endDate;
    });

    res.status(200).json({
      total: data.discussions.discussionCount,
      new: newDiscussions.length,
      totalCommentsAndReplies,
      postAuthors: Array.from(posterSet),
      commentAuthors: Array.from(commenterSet),
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
  createdAt: string;
  updatedAt: string;
  answerChosenAt?: string;
  comments: {
    nodes: Array<Comment>;
  };
};

type Comment = {
  id: string;
  isAnswer: boolean;
  publishedAt: string;
  url: string;
  author: { login: string; url: string };
  replies: {
    nodes: Array<Comment>;
  };
};