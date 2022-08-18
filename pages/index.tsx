import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";

type HomeProps = {
  discussions: Discussion[];
  labels: Label[];
};

const Home: NextPage<HomeProps> = () => {
  const [selectedLabel, setSelectedLabel] = useState<Label>();
  const [labels, setLabels] = useState<Label[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [displayDiscussions, setDisplayDiscussions] = useState<Discussion[]>(
    []
  );
  const [isLoading, setLoading] = useState<Boolean>(false);

  useEffect(() => {
    setLoading(true);

    function getDates() {
      let today = new Date();
      const dayOfWeek = today.getDay();
      const difference = today.getDate() - dayOfWeek;
      let sunday = new Date(today);
      sunday.setDate(difference);
      let saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      const dateString = today.toISOString().split("T")[0];
      const startDate = sunday.toISOString().split("T")[0];
      const endDate = today.toISOString().split("T")[0];

      return {
        startDate,
        endDate,
      };
    }
    const dates = getDates();

    const fetchData = async () => {
      let responses = await Promise.allSettled([
        fetch(
          `http://localhost:3000/api/discussions?startDate=${dates.startDate}&endDate=${dates.endDate}`
        ),
        fetch(`http://localhost:3000/api/labels`),
      ]);
      let discussions =
        responses[0].status === "fulfilled"
          ? await (
              responses[0] as PromiseFulfilledResult<Response>
            ).value.json()
          : [];
      let labels =
        responses[1].status === "fulfilled"
          ? await (
              responses[1] as PromiseFulfilledResult<Response>
            ).value.json()
          : [];

      setDiscussions(discussions);
      setDisplayDiscussions(discussions);
      setLabels(labels);
      setLoading(false);
    };

    fetchData().catch(console.error);
  }, []);

  let handleLabelSelectionChange = (event: any) => {
    let newLabel = event.target.value;
    setSelectedLabel(newLabel);

    if (newLabel) {
      let filteredDiscussions = discussions.filter((discussion) => {
        return discussion.labels.some((l) => l.name === newLabel);
      });
      setDisplayDiscussions(filteredDiscussions);
      return;
    } else {
      setDisplayDiscussions(discussions);
    }
  };

  let handleSubmit = (event: any) => {
    event.preventDefault();

    let selectedLabel = event.target.githubLabel.value;
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
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p>Discussions count is {discussions.length}</p>

        <form
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          <label htmlFor="githubLabel">Label filter</label>
          <select
            name="pets"
            id="githubLabel"
            onChange={(e) => {
              handleLabelSelectionChange(e);
            }}
          >
            <option value="">--Please choose an option--</option>
            {labels &&
              labels.map((label) => (
                <option value={label.name} key={label.id}>
                  {label.name}
                </option>
              ))}
          </select>
        </form>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          {displayDiscussions.map((discussion) => (
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

export default Home;
