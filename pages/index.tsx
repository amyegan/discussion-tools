import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { gql } from "@apollo/client";
import client from "../apollo-client";

type HomeProps = {
  discussions: Discussion[];
  labels: Label[];
};

const Home: NextPage<HomeProps> = ({ discussions, labels }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Discussion Tools</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          {discussions.map((discussion: Discussion) => (
            <div key={discussion.id} className={styles.card}>
              <a href={discussion.url} target="_blank" rel="noreferrer">
                <h3>{discussion.title}</h3>
                <p>
                  {discussion.number} - {discussion.title}
                </p>
                <p>{`Updated: ${discussion.updatedAt}`}</p>
                <div>
                  <ul>
                    {discussion?.labels?.length > 0 &&
                      discussion.labels.map((label) => (
                        <li key={label.id}>{label.name}</li>
                      ))}
                  </ul>
                </div>
              </a>
            </div>
          ))}
        </div>
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
  title: string;
  id: string;
  number: string;
  url: string;
  updatedAt: Date;
  labels: Array<Label>;
  category: {
    id: string;
    name: string;
  };
};

type Label = { id: string; name: string; description: string };

export async function getServerSideProps() {
  let today = new Date();
  const offset = today.getTimezoneOffset();
  today = new Date(today.getTime() - offset * 60 * 1000);
  const dateString = today.toISOString().split("T")[0];

  let responses = await Promise.allSettled([
    fetch("http://localhost:3000/api/discussions"),
    fetch(`http://localhost:3000/api/labels`),
  ]);
  let discussions =
    responses[0].status === "fulfilled"
      ? await (responses[0] as PromiseFulfilledResult<Response>).value.json()
      : [];
  let labels =
    responses[0].status === "fulfilled"
      ? await (responses[1] as PromiseFulfilledResult<Response>).value.json()
      : [];

  return {
    props: {
      discussions,
      labels,
    },
  };
}

export default Home;
