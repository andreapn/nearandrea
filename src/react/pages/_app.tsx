import React, { useEffect } from "react";
import "./styles.css";
// import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from "next/app";
import Head from "next/head";
import favicon from "../public/favicon.ico";
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";
import Link from 'next/link';
import IndexNavbar from "../components/Navbars/IndexNavbar.js";
import "../assets/css/nucleo-icons.css";
import "../assets/css/blk-design-system-react.css";
import "../assets/demo/demo.css";
import '@near-wallet-selector/modal-ui/styles.css'
import PageHeader from "../components/PageHeader/PageHeader";
import Footer from "../components/Footer/Footer";
import Basics from "../views/IndexSections/Basics";
import Navbars from "../views/IndexSections/Navbars";
import Tabs from "../views/IndexSections/Tabs";
import Pagination from "../views/IndexSections/Pagination";
import Notifications from "../views/IndexSections/Notifications";
import Typography from "../views/IndexSections/Typography";
import JavaScript from "../views/IndexSections/JavaScript";
import NucleoIcons from "../views/IndexSections/NucleoIcons";
import Signup from "../views/IndexSections/Signup";
import Examples from "../views/IndexSections/Examples";
import Download from "../views/IndexSections/Download";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.body.classList.toggle("index-page");
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("index-page");
    };

  }, []);
  return (
    <div>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href={favicon.src} />
        {/* <link
          href="https://fonts.googleapis.com/css?family=Poppins:200,300,400,600,700,800"
          rel="stylesheet"
        /> */}
        <link
          href="https://use.fontawesome.com/releases/v5.0.6/css/all.css"
          rel="stylesheet"
        />
        <title>NEARANDREA</title>
        <meta property="og:title" content="NEARANDREA" />
        <meta
          property="og:description"
          content="NEARANDREA bring convenience to NEAR users."
        />
      </Head>
      {/* <IndexNavbar /> */}
      <WalletSelectorContextProvider>
        <div className="wrapper">

          <div className="main">

            <Component {...pageProps} />
            {/* <Basics /> */}
            {/* <Navbars /> */}
            {/* <Tabs /> */}
            {/* <Pagination /> */}
            {/* <Notifications /> */}
            {/* <Typography /> */}
            {/* <JavaScript /> */}
            {/* <NucleoIcons /> */}
            {/* <Signup /> */}
            {/* <Examples /> */}
            {/* <Download /> */}
          </div>
          <Footer />
        </div>
      </WalletSelectorContextProvider>
    </div>
  );
}

export default MyApp;
