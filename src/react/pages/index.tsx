import type { NextPage } from "next";
import { Fragment } from "react";
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";
import Content from "../components/Content";
import Basics from "../views/IndexSections/Basics";
import PageHeader from "../components/PageHeader/PageHeader";

const Home: NextPage = () => {
  return (
    <Fragment>
      <PageHeader />
      {/* <Basics /> */}
    </Fragment>
  );
};

export default Home;
