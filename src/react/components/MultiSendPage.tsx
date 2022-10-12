import React, { Fragment, useCallback, useEffect, useState } from "react";
import classnames from "classnames";
import Big from "big.js";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import {
  AccountView, CodeResult,
} from "near-api-js/lib/providers/provider";
import image from "../public/logo-multisend.png";
import loadingGif from "../public/loading.gif";

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
import { Account, Address, Msg } from "../interfaces";
import { providers, utils } from "near-api-js";
import { CONTRACT_ID } from "../constants";
import { Transaction } from "@near-wallet-selector/core";

const DEFAULT_NEAR = "0";
const FEE = 0.05;
const BOATLOAD_OF_GAS_SMALL = utils.format.parseNearAmount("0.00000000003")!; // < 50 records
const BOATLOAD_OF_GAS_MEDIUM = utils.format.parseNearAmount("0.0000000001")!; // < 150 records
const BOATLOAD_OF_GAS_LARGE = utils.format.parseNearAmount("0.0000000003")!; // 1000 records
const ONE_YOCTO_NEAR = '0.000000000000000000000001';

const MultiSendPage: React.FC = () => {
  const [inputFocus, setInputFocus] = React.useState(false);
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [account, setAccount] = useState<Account | null>(null);
  const [addressList, setAddressList] = useState<Array<Address>>([]);
  const [display, setDisplay] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalSuccessShow, setModalSuccessShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sentNumber, setSentNumber] = useState(0);
  const [csvFile, setCsvFile] = useState();
  const fileReader = new FileReader();

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

  // Check account exist or not
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
      if (address.b) {
        deposit += Number(address.b);
      }
    });
    const jsonString = JSON.stringify(addressList)
    // console.log(jsonString);


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
              gas: addressList.length >= 150 ?
                BOATLOAD_OF_GAS_LARGE :
                (addressList.length >= 50 && addressList.length < 150) ?
                  BOATLOAD_OF_GAS_MEDIUM :
                  BOATLOAD_OF_GAS_SMALL,
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
      console.log("Result: ", result);
      if (result) {
        const accountView = await getAccount();
        setAccount(accountView);
        setAddressList([]);
        setSentNumber(0);
        setDisplay(false);
        onShowSuccess(true, "Sent successful!");
      }
    } catch (err: any) {
      setDisplay(false);
      onShowAlert(true, err.message);
    }
  }, [submitSend]);

  const updateAddressList = (message: string, donation: number) => {
    let check: boolean = false;
    let currentDonation: number = 0;
    addressList.forEach((address): any => {
      if (address.a === message) {
        currentDonation = Number(address.b);
        check = true;
        return true;
      };
    })

    if (check) {
      const newAddressList = addressList.filter((address) => { return address.a !== message })
      const newDonation = Number(donation) + currentDonation;
      newAddressList.push({ a: message, b: newDonation });
      setAddressList(newAddressList);
    } else {
      setAddressList([
        ...addressList,
        { a: message, b: donation }
      ])
    }
    // setTimeout(() => {
    setSentNumber(Number(sentNumber) + Number(donation));
    // }, 2000)
  };

  const onShowAlert = (flag: boolean, msg: string) => {
    setError(msg);
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
              message.value = "";
              donation.value = DEFAULT_NEAR;
              message.focus();
              onShowAlert(true, "Amount Ⓝ should not be 0.");
            }
          }).catch((err) => {
            onShowAlert(true, err.message);
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

    const target = addressList.filter((address) => {
      return address.a === value;
    })[0];

    setSentNumber(Number(sentNumber) - Number(target.b));

    setAddressList(addressList.filter((address) => {
      return address.a !== value;
    }))

  }

  const handleOnChange = (e: any) => {
    setCsvFile(e.target.files[0]);
  };

  const handleOnSubmitCsv = useCallback((e: any) => {
    e.preventDefault();
    // @ts-ignore.
    const { fieldSubmitCsv, csvFileInput } = e.target.elements;
    if (csvFile) {
      fileReader.onload = function (event: any) {
        const csvOutput = event.target.result;
        csvFileToArray(csvOutput, fieldSubmitCsv);
      };
      fileReader.readAsText(csvFile)
      csvFileInput.value = "";
      setCsvFile(undefined);
    }
  }, [handleOnChange]);

  const csvFileToArray = (str: string, fieldSubmitCsv: any) => {
    if ((str.includes("\n") && str.includes(",")) || (str.includes("\n") && str.includes(";"))) {
      const csvRows = str.split("\n");
      const newAddressList = new Array<Address>();
      // let errorAccount: string = "";
      fieldSubmitCsv.disabled = true;
      setLoading(true);
      csvRows.map((row) => {
        let part: string | any[] = [];
        if (row.includes(",")) {
          part = row.split(",");
        } else if (row.includes(";")) {
          part = row.split(";");
        } else {
          return;
        }
        if (part.length === 2 && !isNaN(Number(part[1]))) {
          checkAccount(part[0])
            .then((res) => {
              newAddressList.push({
                a: part[0], b: Number(part[1])
              });
            })
            .catch((err) => {
              return;
            })
        } else {
          return;
        }
      })
      window.setTimeout(() => {
        let totalSend = 0;
        newAddressList.forEach((a) => {
          totalSend += Number(a.b);
        });
        setSentNumber(Number(totalSend));
        setAddressList(newAddressList);
        setLoading(false);
        fieldSubmitCsv.disabled = false;
        onShowSuccess(true, "Import successful!")
      }, 2000);
    } else {
      onShowAlert(true, "CSV wrong format!");
    }
  };

  //send non-near token
  const sendNonNearToken = async () => {
    try {
      const transactions: Array<Transaction> = [];
      transactions.push({
        signerId: accountId!,
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "deposit",
              args: {},
              gas: BOATLOAD_OF_GAS_SMALL,
              deposit: utils.format.parseNearAmount(FEE.toString())!,
            },
          },
        ],
      });

      // Calculate total deposit from addressList
      let deposit: number = 0;
      addressList.forEach((address) => {
        if (address.b) {
          deposit += Number(address.b);
        }
      });
      const msg: Msg = {
        a: "wrap.testnet",
        b: 24,
        c: addressList,
      }

      const amountSend: string = BigInt(Number(deposit) * 10 ** Number(msg.b)).toString();
      const args = JSON.stringify(msg)
      transactions.push({
        signerId: accountId!,
        receiverId: msg.a,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "ft_transfer_call",
              args: {
                receiver_id: CONTRACT_ID,
                amount: amountSend,
                msg: args
              },
              gas: BOATLOAD_OF_GAS_LARGE,
              deposit: utils.format.parseNearAmount(ONE_YOCTO_NEAR)!,
            },
          },
        ],
      });

      // Sign wallet
      const wallet = await selector.wallet();
      // const amount = Number(FEE) + Number(ONE_YOCTO_NEAR);
      return wallet.signAndSendTransactions({ transactions }).catch((err) => {
        console.log("Failed to add messages");
        throw err;
      });
    } catch (err) {
      throw err;
    }
  };

  const printUtils = () => {
    console.log(utils.format.parseNearAmount(ONE_YOCTO_NEAR));
  }

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
                  style={{ width: "150px" }}
                />
                <h1>NEAR MultiSend</h1>
                <h5>{FEE}Ⓝ for 1 tx.</h5>
              </Col>
            </Row>
            <Row className="justify-content-md-center">
              <Col sm="8">
                <h4 className="text-primary" hidden={!accountId}>Current balance is <b className="text-success">{account ? utils.format.formatNearAmount(account.amount, 2) : 0}Ⓝ</b></h4>
                <p><span>You intend to send <b className="text-success">{sentNumber}Ⓝ</b> to <b className="text-success">{addressList.length}</b> address.</span></p>
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
                <p className="text-primary">You can add by manual:</p>
                <Button color="default" type="submit" size="sm">
                  <i className="tim-icons icon-simple-add" /> Add
                </Button>
                {/* <Button color="default" disabled>
                  <i className="tim-icons icon-single-copy-04" /> Import
                </Button> */}
                <Button color="default" type="button" onClick={() => clear()} size="sm">
                  <i className="tim-icons icon-simple-remove" /> Clear
                </Button>
                <Button color="primary" type="button" onClick={() => handleSubmitSend()} size="sm">
                  <i className="tim-icons icon-send" /> Send
                </Button>
                <Button color="primary" type="button" onClick={() => sendNonNearToken()} size="sm">
                  <i className="tim-icons icon-send" /> Test
                </Button>
              </Col>
            </Row>
          </fieldset>

        </Form>
        <Form onSubmit={(e) => {
          handleOnSubmitCsv(e);
        }}>
          <Row className="justify-content-md-center">
            <Col sm="8">
              <p className="text-primary">Or upload via CSV file (support <span className="text-success" >"," ";"</span> delimited), for example:</p>
              <p className="text-success">
                nearaddress01.near,1
              </p>
              <p className="text-success">
                nearaddress02.near,10
              </p>
              <p className="text-primary">Currently CSV file just support lower 450 records.</p>
              <fieldset id="fieldSubmitCsv">
                <input
                  color="default"
                  id="csvFileInput"
                  type={"file"}
                  accept={".csv"}
                  onChange={handleOnChange}
                />
                <Button color="default" type="submit" size="sm"><i hidden={loading} className="tim-icons icon-single-copy-04" />
                  <img
                    hidden={!loading}
                    alt="..."
                    className="img-fluid rounded"
                    src={loadingGif.src}
                    style={{ width: "17px" }}
                  /> Import</Button>
              </fieldset>
            </Col>
          </Row>
        </Form>
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
        <Row className="justify-content-md-center">
          <Col sm="8">
            <Table className="table" >
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
                    <td>{address.a}</td>
                    <td className="text-center">{address.b}</td>
                    <td className="text-center"><button value={address.a} className="btn btn-link btn-primary" onClick={(e) => remove(e)}><i className="tim-icons icon-simple-remove"></i></button></td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </div >
  );
}

export default MultiSendPage;