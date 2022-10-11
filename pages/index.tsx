import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";

function getDates() {
  let today = new Date();
  const offset = today.getTimezoneOffset();
  today = new Date(today.getTime() - offset * 60 * 1000);

  const dayOfWeek = today.getDay();

  const difference = today.getDate() - dayOfWeek;
  let sunday = new Date(today);
  sunday.setDate(difference);

  let saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const startDate = sunday.toISOString().split("T")[0];
  const endDate = saturday.toISOString().split("T")[0];

  const lastWeekStartDate = new Date(sunday);
  lastWeekStartDate.setDate(sunday.getDate() - 7);
  const lastWeekEndDate = new Date(sunday);
  lastWeekEndDate.setDate(sunday.getDate() - 1);

  return {
    startDate,
    endDate,
    lastWeekStartDate,
    lastWeekEndDate,
  };
}
const dates = getDates();

const Home: NextPage = () => {
  const [discussionCounts, setDiscussionCounts] = useState<{
    total: number;
    new: number;
    totalCommentsAndReplies: number;
    postAuthors: Array<string>;
    commentAuthors: Array<string>;
  }>();
  const [isLoading, setLoading] = useState<Boolean>(false);
  const [startDate, setStartDate] = useState<string>(dates.startDate);
  const [endDate, setEndDate] = useState<string>(dates.endDate);

  useEffect(() => {
    setLoading(true);

    fetchData().catch(console.error);
  }, []);

  const fetchData = async (start = startDate, end = endDate) => {
    console.log("using start and end dates", { startDate, endDate });
    const res = await fetch(
      `http://localhost:3000/api/discussions?startDate=${start}&endDate=${end}`
    );
    const discussionC = await res?.json() || [];

    console.log(discussionC);

    setDiscussionCounts(discussionC);

    setLoading(false);
  };
  

  let handleSubmit = (event: any) => {
    event.preventDefault();

    let start = event.target.githubStartDate.value;
    let end = event.target.githubEndDate.value;

    if (start != startDate || end != endDate) {
      setStartDate(start);
      setEndDate(end);
      fetchData(start, end);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Discussion Tools</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p>
          {discussionCounts?.total} discussions were updated between {startDate}{" "}
          and {endDate}
        </p>

        <div style={{ marginBottom: "2em" }}>
          <dl>
            <dt>Total discussions this week</dt>
            <dd>{discussionCounts?.total}</dd>
            <dt>New discussions created this week</dt>
            <dd>{discussionCounts?.new}</dd>
            <dt>First-timers</dt>
            <dd>
              <em>todo: count all posts by individual user, total all where only one</em>
            </dd>
            <dt>Comments and replies this week</dt>
            <dd>{discussionCounts?.totalCommentsAndReplies}</dd>
            <dt>Total contributors this week</dt>
            <dd>
              {(discussionCounts?.postAuthors?.length || 0) + (discussionCounts?.commentAuthors?.length || 0)}
            </dd>
          </dl>
        </div>

        <form
          style={{ marginBottom: "2em" }}
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          <div style={{ marginBottom: "0.5em" }}>
            <label>
              Start date ({startDate})
              <input
                type="date"
                defaultValue={startDate}
                id="githubStartDate"
                name="start-date"
              ></input>
            </label>
          </div>

          <div style={{ marginBottom: "0.5em" }}>
            <label>
              End date ({endDate})
              <input
                type="date"
                defaultValue={endDate}
                id="githubEndDate"
                name="end-date"
              ></input>
            </label>
          </div>

          <button type="submit">Search</button>
        </form>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

type Discussion = {
  discussionCount: number;
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
  labels: Array<Label>;
  category: {
    id: string;
    name: string;
  };
  comments: Comment[];
};

type Label = { id: string; name: string; description: string };

type Comment = {
  author: {
    login: string;
    url: string;
  };
  createdAt: Date;
  id: string;
  publishedAt: Date;
  url: string;
};

export default Home;
