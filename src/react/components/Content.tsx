import React, { Fragment, useCallback, useEffect, useState } from "react";
import { providers, utils } from "near-api-js";
import type {
  AccountView, CodeResult,
} from "near-api-js/lib/providers/provider";
import { Transaction } from "@near-wallet-selector/core";
import type { Account, Address } from "../interfaces";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import SignIn from "./SignIn";
import FormInput from "./FormInput";
import { Container, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal'
import AddressList from "./AddressList";
import { CONTRACT_ID } from "../constants";

const DEFAULT_NEAR = "0";
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

const Content: React.FC = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [account, setAccount] = useState<Account | null>(null);
  const [addressList, setAddressList] = useState<Array<Address>>([]);
  const [display, setDisplay] = useState(false);

  const getAccount = useCallback(async (): Promise<Account | null> => {
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

  useEffect(() => {
    if (!accountId) {
      return setAccount(null);
    }

    // setLoading(true);

    getAccount().then((nextAccount) => {
      setAccount(nextAccount);
      // setLoading(false);
    });
  }, [accountId, getAccount]);


  const checkAccount = useCallback((nearAccount: string) => {
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    return provider
      .query<CodeResult>({
        request_type: "view_account",
        account_id: nearAccount,
        finality: "optimistic",
      })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw err;
      });

  }, [selector]);

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

  // trigger wallet to send 
  const submitSend = async () => {
    // Calculate total deposit from addressList
    let deposit: number = 0;
    addressList.forEach((address) => {
      if (address.nearAmount) {
        deposit += Number(address.nearAmount);
      }
    });
    console.log(deposit);
    const jsonString = JSON.stringify(addressList)
    console.log(jsonString);

    // Sign wallet
    const wallet = await selector.wallet();
    try {
      return wallet.signAndSendTransaction({
        signerId: accountId!,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "multiSend",
              args: { listAddress: jsonString },
              gas: BOATLOAD_OF_GAS,
              deposit: utils.format.parseNearAmount(deposit.toString())!,
            },
          },
        ],
      });
    } catch (err) {
      throw err;
    }
  };

  const handleSubmitSend = useCallback(async () => {
    setDisplay(true);
    try {
      const result = await submitSend();
      const accountView = await getAccount();
      setAccount(accountView);
      setDisplay(false);
      setAddressList([]);
      return result;
    } catch (err: any) {
      setDisplay(false);
      // setError(err.message)
      // setModalShow(true);
    }
  }, [submitSend]);

  const updateAddressList = (message: string, donation: number) => {
    let check: boolean = false;
    let currentDonation: number = 0;
    addressList.forEach((address): any => {
      if (address.nearAddress === message) {
        currentDonation = Number(address.nearAmount);
        check = true;
        return true;
      };
    })

    if (check) {
      const newAddressList = addressList.filter((address) => { return address.nearAddress !== message })
      const newDonation = Number(donation) + currentDonation;
      newAddressList.push({ nearAddress: message, nearAmount: newDonation });
      setAddressList(newAddressList);
    } else {
      setAddressList([
        ...addressList,
        { nearAddress: message, nearAmount: donation }
      ])
    }
  };

  const addAddress = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();
      // @ts-ignore.
      const { fieldset, message, donation, multiple } = e.target.elements;
      checkAccount(message.value)
        .then((res) => {
          if (donation.value !== "0") {
            updateAddressList(message.value, donation.value);
            message.value = "";
            donation.value = DEFAULT_NEAR;
            message.focus();
          } else {
            // setError("Amount Ⓝ should not be 0.")
            // setModalShow(true);
            message.value = "";
            donation.value = DEFAULT_NEAR;
            message.focus();
          }
        }).catch((err) => {
          // setError(err.message)
          // setModalShow(true);
          message.value = "";
          donation.value = DEFAULT_NEAR;
          message.focus();
        });
    }, [addressList, setAddressList]
  );

  const clear = () => {
    setAddressList([]);
  }

  const remove = (e: any) => {
    const value = e.currentTarget.value;
    setAddressList(addressList.filter((address) => { return address.nearAddress !== value }))
  }

  const printAddressList = () => {
    console.log(addressList);
  }

  // if (loading) {
  //   return null;
  // }

  // if (!account) {
  //   return (
  //     <Fragment>
  //       <SignIn handleSignIn={() => { handleSignIn() }} />
  //     </Fragment>
  //   );
  // }
  if (account) {
    return (
      <Fragment>
        <Row className="d-flex justify-content-center">
          <Col md={8} lg={8}>
            <FormInput
              account={account}
              onSubmit={(e) => addAddress(e as unknown as SubmitEvent)}
              send={() => handleSubmitSend()}
              clear={() => clear()}
              display={display}
            />
            <AddressList addressList={addressList} remove={(e) => remove(e)} />
          </Col>
        </Row>
      </Fragment >
    );
  } else { return null; }
};

export default Content;
