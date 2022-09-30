import type { NextPage } from "next";
import { Fragment } from "react";
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";
import Content from "../components/Content";

const Home: NextPage = () => {
  return (
    <Fragment>
      <h1>Demo</h1>
      <WalletSelectorContextProvider>
        <Content />
      </WalletSelectorContextProvider>
    </Fragment>
  );
};

export default Home;
