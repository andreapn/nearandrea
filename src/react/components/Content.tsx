import React, { Fragment, useCallback, useEffect, useState } from "react";
import { providers, utils } from "near-api-js";
import type {
  AccountView,
  CodeResult,
} from "near-api-js/lib/providers/provider";
import { Transaction } from "@near-wallet-selector/core";
import type { Account, Donate, Message } from "../interfaces";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import { CONTRACT_ID } from "../constants";
import SignIn from "./SignIn";
import FormInput from "./FormInput";
import Messages from "./Messages";
import Greeting from "./Greeting";
import Donates from "./Donates";
import { retryWhen } from "rxjs";
import { Container, Row, Col } from 'react-bootstrap';

const SUGGESTED_DONATION = "0";
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

const Content: React.FC = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [account, setAccount] = useState<Account | null>(null);
  // const [messages, setMessages] = useState<Array<Message>>([]);
  const [greeting, setGreeting] = useState();
  const [loading, setLoading] = useState<boolean>(false);
  const [donates, setDonates] = useState<Array<Donate>>([]);

  const getAccount = useCallback(async (): Promise<Account | null> => {
    console.log("Call getAccount.");
    if (!accountId) {
      return null;
    }

    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    return provider
      .query<AccountView>({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      })
      .then((data) => ({
        ...data,
        account_id: accountId,
      }));
  }, [accountId, selector.options]);

  const updateGreeting = useCallback(
    async (message: string) => {
      console.log("Call updateGreeting.");
      const { contract } = selector.store.getState();
      const wallet = await selector.wallet();
      return wallet
        .signAndSendTransaction({
          signerId: accountId!,
          receiverId: contract!.contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "set_greeting",
                args: { message: message },
                gas: BOATLOAD_OF_GAS,
                deposit: utils.format.parseNearAmount("0")!,
              },
            },
          ],
        })
        .catch((err) => {
          alert("Failed to add message");
          console.log("Failed to add message");

          throw err;
        });
    }, [selector]);

  const donate = useCallback(
    async (message: string, donation: string) => {
      console.log("Call Donate.");
      const { contract } = selector.store.getState();
      const wallet = await selector.wallet();
      return wallet
        .signAndSendTransaction({
          signerId: accountId!,
          receiverId: contract!.contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "multiSend",
                args: {},
                gas: BOATLOAD_OF_GAS,
                deposit: utils.format.parseNearAmount(donation)!,
              },
            },
          ],
        })
        .catch((err) => {
          alert("Failed to add message");
          console.log("Failed to add message");

          throw err;
        });
    }, [selector]);

  const getDonates = useCallback(() => {
    console.log("Call getDonates.");
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    const params: string = '{"from_index":0,"limit":50}';
    const paramb64 = Buffer.from(params).toString('base64');


    return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: CONTRACT_ID,
        method_name: "get_donations",
        args_base64: paramb64,
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()));

  }, [selector]);

  const getMessages = useCallback(() => {
    console.log("Call getMessages.");
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: CONTRACT_ID,
        method_name: "getMessages",
        args_base64: "",
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()));
  }, [selector]);

  const getGreeting = useCallback(() => {
    console.log("Call getGreeting.");
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: CONTRACT_ID,
        method_name: "get_greeting",
        args_base64: "",
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()));
  }, [selector]);

  useEffect(() => {
    console.log("Call useEffect1.");
    // TODO: don't just fetch once; subscribe!
    // getMessages().then(setMessages);
    getGreeting().then(setGreeting);
  }, []);

  useEffect(() => {
    console.log("Call useEffect2.");
    getDonates().then(setDonates);
  }, []);

  useEffect(() => {
    console.log("Call useEffect3.");
    if (!accountId) {
      return setAccount(null);
    }

    setLoading(true);

    getAccount().then((nextAccount) => {
      setAccount(nextAccount);
      setLoading(false);
    });
  }, [accountId, getAccount]);

  const handleSignIn = () => {
    modal.show();
  };

  const handleSignOut = async () => {
    const wallet = await selector.wallet();

    wallet.signOut().catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };

  const handleSwitchWallet = () => {
    modal.show();
  };

  const handleSwitchAccount = () => {
    const currentIndex = accounts.findIndex((x) => x.accountId === accountId);
    const nextIndex = currentIndex < accounts.length - 1 ? currentIndex + 1 : 0;

    const nextAccountId = accounts[nextIndex].accountId;

    selector.setActiveAccount(nextAccountId);

    alert("Switched account to " + nextAccountId);
  };

  const addMessages = useCallback(
    async (message: string, donation: string, multiple: boolean) => {
      const { contract } = selector.store.getState();
      const wallet = await selector.wallet();

      if (!multiple) {
        return wallet
          .signAndSendTransaction({
            signerId: accountId!,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "addMessage",
                  args: { text: message },
                  gas: BOATLOAD_OF_GAS,
                  deposit: utils.format.parseNearAmount(donation)!,
                },
              },
            ],
          })
          .catch((err) => {
            alert("Failed to add message");
            console.log("Failed to add message");

            throw err;
          });
      }

      const transactions: Array<Transaction> = [];

      for (let i = 0; i < 2; i += 1) {
        transactions.push({
          signerId: accountId!,
          receiverId: contract!.contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "addMessage",
                args: {
                  text: `${message} (${i + 1}/2)`,
                },
                gas: BOATLOAD_OF_GAS,
                deposit: utils.format.parseNearAmount(donation)!,
              },
            },
          ],
        });
      }

      return wallet.signAndSendTransactions({ transactions }).catch((err) => {
        alert("Failed to add messages");
        console.log("Failed to add messages");

        throw err;
      });
    },
    [selector, accountId]
  );

  const handleVerifyOwner = async () => {
    const wallet = await selector.wallet();
    try {
      const owner = await wallet.verifyOwner({
        message: "test message for verification",
      });

      if (owner) {
        alert(`Signature for verification: ${JSON.stringify(owner)}`);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      alert(message);
    }
  };

  const handleSubmit = useCallback(
    async (e: SubmitEvent) => {
      e.preventDefault();

      // TODO: Fix the typing so that target.elements exists..
      // @ts-ignore.
      const { fieldset, message, donation, multiple } = e.target.elements;
      fieldset.disabled = true;
      return updateGreeting(message.value)
        .then(async () => {
          console.log(greeting)
          try {
            const newGreeting = await getGreeting();
            setGreeting(newGreeting);
            message.value = "";
            fieldset.disabled = false;
            message.focus();
          } catch (err) {
            alert("Failed to refresh messages");
            console.log("Failed to refresh messages");

            throw err;
          }
        })
        .catch((err) => {
          console.error(err);

          fieldset.disabled = false;
        });
    },
    [updateGreeting, getGreeting]
  );

  const handleDonate = useCallback(
    async (e: SubmitEvent) => {
      e.preventDefault();

      // TODO: Fix the typing so that target.elements exists..
      // @ts-ignore.
      const { fieldset, message, donation, multiple } = e.target.elements;
      fieldset.disabled = true;
      try {
        const result = await donate(message.value, donation.value);
        const accountView = await getAccount();
        setAccount(accountView);
        message.value = "";
        fieldset.disabled = false;
        return result;
      } catch (err) {
        alert("Failed to refresh messages");
        console.log("Failed to refresh messages");

        throw err;
      }
      // return donate(message.value, donation.value)
      //   .catch((err) => {
      //     console.error(err);

      //     fieldset.disabled = false;
      //   });
    },
    [donate, getDonates, getAccount]
  );

  if (loading) {
    return null;
  }

  if (!account) {
    return (
      <Fragment>
        <div>
          <button onClick={handleSignIn}>Log in</button>
        </div>
        <SignIn />
      </Fragment>
    );
  }

  return (
    <Fragment>

      <Container fluid="md">
        <Row>
          <Col>
            <h1>Demo</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <div>
              <button onClick={handleSignOut}>Log out</button>
              <button onClick={handleSwitchWallet}>Switch Wallet</button>
              {/* <button onClick={handleVerifyOwner}>Verify Owner</button> */}
              {accounts.length > 1 && (
                <button onClick={handleSwitchAccount}>Switch Account</button>
              )}
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormInput
              account={account}
              onSubmit={(e) => handleDonate(e as unknown as SubmitEvent)}
            />
            {/* <Messages messages={messages} /> */}
            <Greeting greeting={greeting} />
            <Donates donates={donates} />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Content;