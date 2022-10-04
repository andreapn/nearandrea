import React, { MouseEventHandler, FormEventHandler } from "react";
import Big from "big.js";
import {
  Button,
  Form,
  Label,
  FormGroup,
  CustomInput,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col
} from "reactstrap";

import type { Account } from "../interfaces";

interface FormProps {
  account: Account;
  onSubmit: FormEventHandler;
  send: MouseEventHandler;
  clear: MouseEventHandler;
  display: boolean;
}

const parseNearStr = (numberNear: string) => {
  // console.log("Call parseNearStr.");
  const odd = numberNear.split(".");
  // console.log(odd);
  if (odd && odd[1]) {
    const result = odd[0] + "." + odd[1].substring(0, 2);
    return result;
  }
  return numberNear;
}

const FormInput: React.FC<FormProps> = ({ account, onSubmit, send, clear, display }) => {
  return (
    <Form onSubmit={onSubmit}>
      <fieldset id="fieldset" disabled={display}>
        <Label>Hi, {account.account_id}!, {parseNearStr(Big(account.amount)
          .div(10 ** 24)
          .toString())}<span title="NEAR Tokens">Ⓝ</span></Label>
        <p>Multisend Ⓝ to multi address.</p>
        <FormGroup className="mb-3">
          <Label>Ⓝ Address:</Label>
          <Input id="message" required />
        </FormGroup>
        <FormGroup className="mb-3">
          <Label>Amount Ⓝ:</Label>
          <Input
            type="number"
            id="donation"
            autoComplete="off"
            defaultValue={"0"}
            max={Big(account.amount)
              .div(10 ** 24)
              .toString()}
            min="0"
            step="0.01" />
        </FormGroup>
        <Row>
          <Col md={8} lg={8}>
            <Button variant="secondary" type="submit">
              Add Address
            </Button>{' '}
            <Button variant="secondary" onClick={clear}>
              Clear
            </Button>{' '}
            <Button variant="primary" onClick={send}>
              Submit
            </Button>
          </Col>
        </Row>
      </fieldset>
    </Form>
  );
};

export default FormInput;
