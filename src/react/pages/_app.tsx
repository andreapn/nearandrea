import React from "react";
import "./styles.css";
import '@near-wallet-selector/modal-ui/styles.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from "next/app";
import Head from "next/head";
import favicon from "../public/favicon.ico";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href={favicon.src} />
        <title>NEARANDREA</title>
        <meta property="og:title" content="NEARANDREA" />
        <meta
          property="og:description"
          content="NEARANDREA"
        />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
