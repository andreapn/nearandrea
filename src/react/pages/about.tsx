import React, { useEffect, useState } from 'react';
import type { NextPage } from "next";
import { Fragment } from "react";
import { WalletSelectorContextProvider } from "../contexts/WalletSelectorContext";
import Content from "../components/Content";
import Link from 'next/link';

import { useRouter } from 'next/router'
import AboutPage from '../components/AboutPage';
import Basics from '../views/IndexSections/Basics';

const About: NextPage = () => {
    return (
        <Fragment>
            <Basics />
        </Fragment >
    )
};
export default About;