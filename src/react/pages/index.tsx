import type { NextPage } from "next";
import { Fragment } from "react";
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";
import Content from "../components/Content";
import Basics from "../views/IndexSections/Basics";
import PageHeader from "../components/PageHeader/PageHeader";
import MultiSendPage from "../components/MultiSendPage";
import Footer from "../components/Footer/Footer";

const Home: NextPage = () => {
  return (
    <Fragment>
      {/* <PageHeader /> */}
      <MultiSendPage />
    </Fragment>
  );
};

export default Home;
