import Head from 'next/head';
import styles from '@/styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>Next API Nodemailer</title>
        <meta name='description' content='Nodemailer API for contact forms using Next.js API routes' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <div className={styles.box}>
          <div className={styles.gradients}>
            <div className={styles.gradient} />
            <div className={styles.gradient} />
            <div className={styles.gradient} />
          </div>
          <div className={styles.content}>
            <h1 className={styles.title}>Next API</h1>
            <h1 className={styles.title}>Nodemailer</h1>
            <p className={styles.text}>Powering contact forms with the Nodemailer library and Next.js API routes.</p>
          </div>
        </div>
      </main>
    </>
  );
}
