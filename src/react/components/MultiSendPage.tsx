import React, { Fragment, useCallback, useEffect, useState } from "react";
import classnames from "classnames";
import Big from "big.js";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import {
  AccountView, CodeResult,
} from "near-api-js/lib/providers/provider";
import image from "../public/logo-multisend.png";

// reactstrap components
import {
  Form,
  Button,
  Table,
  Label,
  FormGroup,
  CustomInput,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
  UncontrolledAlert
} from "reactstrap";
import { Account, Address } from "../interfaces";
import { providers, utils } from "near-api-js";

const DEFAULT_NEAR = "0";
const FEE = 0.05;
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

const MultiSendPage: React.FC = () => {
  const [inputFocus, setInputFocus] = React.useState(false);
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [account, setAccount] = useState<Account | null>(null);
  const [addressList, setAddressList] = useState<Array<Address>>([]);
  const [display, setDisplay] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalSuccessShow, setModalSuccessShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sentNumber, setSentNumber] = useState(0);

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
    setSentNumber(deposit);

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
              deposit: utils.format.parseNearAmount((deposit + FEE).toString())!,
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
      onShowSuccess(true, "Sent successful!");
      setSentNumber(0);
      return result;
    } catch (err: any) {
      setDisplay(false);
      setError(err.message)
      onShowAlert(true);
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

  const onShowAlert = (flag: boolean) => {
    setModalShow(flag);
    window.setTimeout(() => {
      setModalShow(!flag);
      setError("");
    }, 2500)
  }

  const onShowSuccess = (flag: boolean, msg: string) => {
    setModalSuccessShow(flag);
    setSuccess(msg);
    window.setTimeout(() => {
      setModalSuccessShow(!flag);
      setSuccess("");
    }, 2500)
  }

  const addAddress = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();
      // @ts-ignore.
      const { fieldset, message, donation, multiple } = e.target.elements;
      if (message.value !== "") {
        checkAccount(message.value)
          .then((res) => {
            if (donation.value !== "0") {
              updateAddressList(message.value, donation.value);
              message.value = "";
              donation.value = DEFAULT_NEAR;
              message.focus();
              onShowSuccess(true, "Address added successful!");
            } else {
              setError("Amount Ⓝ should not be 0.")
              message.value = "";
              donation.value = DEFAULT_NEAR;
              message.focus();
              onShowAlert(true);
            }
          }).catch((err) => {
            console.log(err.message)
            setError(err.message)
            onShowAlert(true);
            message.value = "";
            donation.value = DEFAULT_NEAR;
            message.focus();
          });
      }
    }, [addressList]
  );

  const clear = () => {
    setAddressList([]);
    setSentNumber(0);
  }

  const remove = (e: any) => {
    const value = e.currentTarget.value;
    setAddressList(addressList.filter((address) => { return address.nearAddress !== value }))
    setSentNumber(0);
  }

  // const scrollToDownload = () => {
  //   document
  //     .getElementById("download-section")
  //     .scrollIntoView({ behavior: "smooth" });
  // };

  // if (!account) {
  //   return null;
  // }

  return (
    <div className="section section-signup">
      <Container>
        <div className="squares square-1" />
        <div className="squares square-2" />
        <div className="squares square-3" />
        <div className="squares square-4" />
        <Form onSubmit={(e) => addAddress(e as unknown as SubmitEvent)}>
          <fieldset disabled={display}>

            <Row className="justify-content-md-center">
              <Col sm="8" className="text-center">
                <img
                  alt="..."
                  className="img-fluid rounded"
                  src={image.src}
                  style={{ width: "300px" }}
                />
                <h1>NEAR MultiSend</h1>
                <h5>{FEE}Ⓝ for 1 tx.</h5>
              </Col>
            </Row>
            <Row className="justify-content-md-center">
              <Col sm="8">
                <h4 className="text-primary" hidden={!accountId}>Current balance is <b className="text-success">{account ? utils.format.formatNearAmount(account.amount, 2) : 0}Ⓝ</b><span hidden={sentNumber === 0}>. You intend to send <b className="text-success"><span>{sentNumber}Ⓝ</span></b>, your fee is <b className="text-success">{FEE}Ⓝ</b>/tx.</span></h4>
              </Col>
            </Row>
            <Row className="justify-content-md-center">
              <Col sm="8">
                <p className="default">NEAR Address:</p>
              </Col>
            </Row>
            <Row className="justify-content-md-center">
              <Col sm="8">
                <FormGroup>
                  <Input
                    defaultValue=""
                    placeholder="Input NEAR address here."
                    type="text"
                    id="message"
                    require="true"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row className="justify-content-md-center">
              <Col sm="8">
                <p className="default">Amount NEAR:</p>
              </Col>
            </Row>
            <Row className="justify-content-md-center">
              <Col sm="8">
                <FormGroup>
                  <Input
                    placeholder="Input NEAR address here."
                    type="number"
                    id="donation"
                    autoComplete="off"
                    defaultValue={"0"}
                    max={account ? Big(account.amount)
                      .div(10 ** 24)
                      .toString() : "100000"}
                    min="0"
                    step="0.01" />
                </FormGroup>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col sm="8">
                <Button color="default" type="submit">
                  <i className="tim-icons icon-simple-add" /> Add
                </Button>
                <Button color="default" disabled>
                  <i className="tim-icons icon-single-copy-04" /> Import
                </Button>
                <Button color="default" type="button" onClick={() => clear()}>
                  <i className="tim-icons icon-simple-remove" /> Clear
                </Button>
                <Button color="primary" type="button" onClick={() => handleSubmitSend()}>
                  <i className="tim-icons icon-send" /> Send
                </Button>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col sm="8">
                <UncontrolledAlert hidden={!modalShow} className="alert-with-icon" color="danger">
                  <span data-notify="icon" className="tim-icons icon-bell-55" />
                  <span>
                    {error}
                  </span>
                </UncontrolledAlert>
              </Col>
              <Col sm="8">
                <UncontrolledAlert hidden={!modalSuccessShow} className="alert-with-icon" color="success">
                  <span data-notify="icon" className="tim-icons icon-satisfied" />
                  <span>
                    {success}
                  </span>
                </UncontrolledAlert>
              </Col>
            </Row>

          </fieldset>
          <Row className="justify-content-md-center">
            <Col sm="8">
              <Table className="table" hidden={addressList.length === 0}>
                <thead>
                  <tr>
                    <th className="text-center">No</th>
                    <th>Ⓝ Address</th>
                    <th className="text-center">Amount Ⓝ</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {addressList.map((address, i) =>
                    <tr key={i}>
                      <td className="text-center">{i + 1}</td>
                      <td>{address.nearAddress}</td>
                      <td className="text-center">{address.nearAmount}</td>
                      <td className="text-center"><button value={address.nearAddress} className="btn btn-link btn-primary" onClick={(e) => remove(e)}><i className="tim-icons icon-simple-remove"></i></button></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Form>
      </Container>
    </div >
  );
}

export default MultiSendPage;