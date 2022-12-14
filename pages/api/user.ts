import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "@apollo/client";
import client from "../../apollo-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query;

  if (!username) {
    res.setHeader("Cache-Control", "no-cache");
    res.status(400).json({message: "Please provide username"});
    return res;
  }

  const communityRepoId = "R_kgDOGcG7Rw";
  const vercelRepoId = "MDEwOlJlcG9zaXRvcnk2Nzc1MzA3MA==";
  const targetRepos = [communityRepoId, vercelRepoId];

  const { data } = await client.query({
    query: gql`
      query User($username: String!) {
        user(login:$username){
          repositoryDiscussionComments(first:50){
            totalCount
            nodes {
              id
              author {
                login
              }
              createdAt
              url
              replyTo {
                url
              }
              discussion {
                title
                url
                repository {
                  id
                  name
                }
                comments (first:1) {
                  totalCount
                  nodes {
                    replies (first:1) {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { username },
  });

  const discussionComments = data?.user?.repositoryDiscussionComments?.nodes?.filter(
    (discussionComment: DiscussionCommentData) => {
      let today = new Date();
      const offset = today.getTimezoneOffset();
      today = new Date(today.getTime() - offset * 60 * 1000);
      let createdDate = new Date(discussionComment.createdAt);
      createdDate = new Date(createdDate.getTime() - offset * 60 * 1000);
      const wasPostedToday = today.toLocaleDateString() === createdDate.toLocaleDateString();
      const isInTargetRepo = targetRepos.some(id => discussionComment)

      return discussionComment.author.login === username && wasPostedToday;
    })
    .map(
      (discussionComment: DiscussionCommentData) => {
        return {
          id: discussionComment.id,
          author: discussionComment.author.login,
          createdAt: discussionComment.createdAt,
          url: discussionComment.url,
          replyTo: discussionComment.replyTo?.url,
          discussion: {
            title: discussionComment.discussion.title,
            url: discussionComment.discussion.url,
            repoId: discussionComment.discussion.repository?.id,
            repoName: discussionComment.discussion.repository?.name,
            commentCount: discussionComment.discussion.comments?.totalCount + discussionComment.discussion.comments?.nodes?.replies?.totalCount
          }
        };
      }
    );

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=300')
  res.status(200).json(discussionComments);
}

type DiscussionCommentData = {
  id: string;
  discussion: {
    title: string;
    url: string;
    repository: {
      id: string;
      name: string;
    }
    comments: {
      totalCount: number;
      nodes: {
        replies: {
          totalCount: number;
        }
      }
    }
  }
  author: {
    login: string;
  }
  createdAt: Date;
  replyTo: {
    url: string;
  }
  url: string;
};
