import { NextPage } from "next";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";

const UserInfo: NextPage = () => {
  const router = useRouter();
  const { username } = router.query;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [discussionComments, setDiscussionComments] = useState<DiscussionComment[]>([]);

  useEffect(() => {
    const fetchData = async (username: any) => {
      setLoading(true);
      const res = await fetch(
        `/api/user?username=${username}`
      );
      const discussionComments = await res?.json() || [];
  
      setDiscussionComments(discussionComments);
  
      setLoading(false);
    };

    fetchData(username).catch(console.error);
  }, [username]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Today&apos;s Discussion Comments by {username}: {discussionComments.length}</h2>
      <ul>
        {discussionComments && discussionComments.map((comment: any) => {
          return <li key={comment.id}>{comment.author} - {(new Date(comment.createdAt)).toLocaleDateString()} - {comment.discussion.repoName} - {comment.discussion.title}</li>
        })}
      </ul>
      {/* <table>
        <thead>
          <tr>
            <th></th>
          </tr>
        </thead>
      </table> */}
    </div>
  )
}

type DiscussionComment = {
  id: string;
  author: string;
  createdAt: Date;
  url: string;
  replyTo: string;
  discussion: {
    title: string;
    url: string;
    repoId: string;
    repoName: string;
    commentCount: number;
  }
};

export default UserInfo;