import React, { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { map, distinctUntilChanged } from "rxjs";
import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupDefaultWallets } from "@near-wallet-selector/default-wallets";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNightlyConnect } from "@near-wallet-selector/nightly-connect";
import { CONTRACT_ID } from "../constants";
// import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import {
  Button,
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
  UncontrolledTooltip,
  Label
} from "reactstrap";
import { providers, utils } from "near-api-js";
import type { AccountView } from "near-api-js/lib/providers/provider";
import SignIn from "../components/SignIn";
import type { Account } from "../interfaces";
import Link from 'next/link';

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export const WalletSelectorContextProvider: React.FC<Props> = ({
  children,
}) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [account, setAccount] = useState<Account | null>();
  const [modalShow, setModalShow] = useState(false);
  const [error, setError] = useState('');
  const [display, setDisplay] = useState(false);

  const [collapseOpen, setCollapseOpen] = useState(false);
  const [collapseOut, setCollapseOut] = useState("");
  const [color, setColor] = useState("navbar-transparent");

  useEffect(() => {
    window.addEventListener("scroll", changeColor);
    return function cleanup() {
      window.removeEventListener("scroll", changeColor);
    };
  }, []);
  const changeColor = () => {
    if (
      document.documentElement.scrollTop > 99 ||
      document.body.scrollTop > 99
    ) {
      setColor("bg-info");
    } else if (
      document.documentElement.scrollTop < 100 ||
      document.body.scrollTop < 100
    ) {
      setColor("navbar-transparent");
    }
  };
  const toggleCollapse = () => {
    document.documentElement.classList.toggle("nav-open");
    setCollapseOpen(!collapseOpen);
  };
  const onCollapseExiting = () => {
    setCollapseOut("collapsing-out");
  };
  const onCollapseExited = () => {
    setCollapseOut("");
  };
  // const scrollToDownload = () => {
  //   document
  //     .getElementById("download-section")
  //     .scrollIntoView({ behavior: "smooth" });
  // };

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: "testnet",
      debug: true,
      modules: [
        ...(await setupDefaultWallets()),
        setupNearWallet(),
        setupSender(),
        setupMathWallet(),
        setupNightly(),
        setupMeteorWallet(),
        setupNightlyConnect({
          url: "wss://relay.nightly.app/app",
          appMetadata: {
            additionalInfo: "",
            application: "NEAR Wallet Selector",
            description: "Example dApp used by NEAR Wallet Selector",
            icon: "https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png",
          },
        }),
      ],
    });
    const _modal = setupModal(_selector, { contractId: CONTRACT_ID });
    const state = _selector.store.getState();

    setAccounts(state.accounts);
    if (state.accounts.length > 0) {
      const accountState = state.accounts.find((account) => account.active);
      if (accountState) {
        const { network } = _selector.options;
        const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
        provider
          .query<AccountView>({
            request_type: "view_account",
            finality: "final",
            account_id: accountState.accountId,
          })
          .then((data) => ({
            ...data,
            account_id: accountState.accountId,
          }))
          .then((acc) => {
            setAccount(acc);
          });
      }
    }

    window.selector = _selector;
    window.modal = _modal;

    setSelector(_selector);
    setModal(_modal);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        setAccounts(nextAccounts);
      });

    return () => subscription.unsubscribe();
  }, [selector]);

  const handleSignOut = async () => {
    const wallet = await window.selector.wallet();

    wallet.signOut().catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };

  const handleSwitchWallet = () => {
    window.modal.show();
  };

  const handleSwitchAccount = () => {
    const currentIndex = accounts.findIndex((x) => x.accountId === account?.account_id);
    const nextIndex = currentIndex < accounts.length - 1 ? currentIndex + 1 : 0;

    const nextAccountId = accounts[nextIndex].accountId;

    window.selector.setActiveAccount(nextAccountId);

    alert("Switched account to " + nextAccountId);
  };

  const handleSignIn = () => {
    if (modal) {
      modal.show();
    }
  };

  if (!selector || !modal) {
    return null;
  }

  const accountId =
    accounts.find((account) => account.active)?.accountId || null;


  // if (!accountId) {
  //   return (
  //     <Fragment>
  //       <SignIn handleSignIn={() => { handleSignIn() }} />
  //     </Fragment>
  //   );
  // }

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
      }}
    >
      <Navbar className={"fixed-top " + color} color-on-scroll="100" expand="lg">
        <Container>
          <div className="navbar-translate">
            <NavbarBrand to="/" id="navbar-brand">
              <span>NEARANDREA</span>
            </NavbarBrand>
            <UncontrolledTooltip placement="bottom" target="navbar-brand">
              Bring convenience to NEAR users.
            </UncontrolledTooltip>
            <button
              aria-expanded={collapseOpen}
              className="navbar-toggler navbar-toggler"
              onClick={toggleCollapse}
            >
              <span className="navbar-toggler-bar bar1" />
              <span className="navbar-toggler-bar bar2" />
              <span className="navbar-toggler-bar bar3" />
            </button>
          </div>
          <Collapse
            className={"justify-content-end " + collapseOut}
            navbar
            isOpen={collapseOpen}
            onExiting={onCollapseExiting}
            onExited={onCollapseExited}
          >
            <div className="navbar-collapse-header">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <a href="#pablo" onClick={(e) => e.preventDefault()}>
                    NEARANDREA
                  </a>
                </Col>
                <Col className="collapse-close text-right" xs="6">
                  <button
                    aria-expanded={collapseOpen}
                    className="navbar-toggler"
                    onClick={toggleCollapse}
                  >
                    <i className="tim-icons icon-simple-remove" />
                  </button>
                </Col>
              </Row>
            </div>

            <Nav navbar>
              <NavItem className="p-0">
                <NavLink
                  data-placement="bottom"
                  href="#"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Follow us on Twitter"
                >
                  <i className="fab fa-twitter" />
                  <p className="d-lg-none d-xl-none">Twitter</p>
                </NavLink>
              </NavItem>
              <NavItem className="p-0">
                <NavLink
                  data-placement="bottom"
                  href="#"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Like us on Facebook"
                >
                  <i className="fab fa-facebook-square" />
                  <p className="d-lg-none d-xl-none">Facebook</p>
                </NavLink>
              </NavItem>
              <NavItem className="p-0">
                <NavLink
                  data-placement="bottom"
                  href="#"
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Follow us on Instagram"
                >
                  <i className="fab fa-instagram" />
                  <p className="d-lg-none d-xl-none">Instagram</p>
                </NavLink>
              </NavItem>

              <UncontrolledDropdown nav>
                <DropdownToggle
                  caret
                  color="default"
                  data-toggle="dropdown"
                  href="#pablo"
                  nav
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="fa fa-cogs d-lg-none d-xl-none" />
                  Category
                </DropdownToggle>
                <DropdownMenu className="dropdown-with-icons">
                  <Link href="/">
                    <DropdownItem>
                      <i className="tim-icons icon-paper" />
                      Home
                    </DropdownItem>
                  </Link>
                  <Link href="/multisend">
                    <DropdownItem>
                      <i className="tim-icons icon-paper" />
                      Multi-send
                    </DropdownItem>
                  </Link>
                  <Link href="/about">
                    <DropdownItem>
                      <i className="tim-icons icon-paper" />
                      About
                    </DropdownItem>
                  </Link>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem className="p-2">
                <p>{accountId}
                  {/* <span hidden={!accountId}>{utils.format.formatNearAmount(account ? account.amount : "0", 2)} Ⓝ</span> */}
                </p>
              </NavItem>

              <NavItem hidden={!!accountId}>
                <Button
                  className="nav-link d-none d-lg-block"
                  color="default"
                  onClick={handleSignIn}
                >
                  <i className="tim-icons icon-key-25" /> Login
                </Button>
              </NavItem>

              <NavItem hidden={!accountId}>
                <Button
                  className="nav-link d-none d-lg-block"
                  color="default"
                  onClick={handleSwitchWallet}
                >
                  <i className="tim-icons icon-wallet-43" /> Switch Wallet
                </Button>
              </NavItem>

              <NavItem hidden={!accountId}>
                <Button
                  className="nav-link d-none d-lg-block"
                  color="default"
                  onClick={handleSignOut}
                >
                  <i className="tim-icons icon-button-power" /> Log Out
                </Button>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
      {children}
    </WalletSelectorContext.Provider >
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
