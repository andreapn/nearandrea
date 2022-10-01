import React, { FormEventHandler } from "react";
import Big from "big.js";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import type { Account } from "../interfaces";

interface FormProps {
  account: Account;
  onSubmit: FormEventHandler;
}

const parseNearStr = (numberNear: string) => {
  console.log("Call parseNearStr.");
  const odd = numberNear.split(".");
  console.log(odd);
  if (odd && odd[1]) {
    const result = odd[0] + "." + odd[1].substring(0, 2);
    return result;
  }
  return numberNear;
}

const FormInput: React.FC<FormProps> = ({ account, onSubmit }) => {
  return (
    <Form onSubmit={onSubmit}>
      <fieldset id="fieldset">
        <Form.Label>Sign Nearandrea, {account.account_id}!, {parseNearStr(Big(account.amount)
          .div(10 ** 24)
          .toString())}<span title="NEAR Tokens">Ⓝ</span></Form.Label>
        <Form.Group className="mb-3">
          <Form.Label>Address:</Form.Label>
          <Form.Control type="input" id="message" /
          ></Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Amount <span title="NEAR Tokens">Ⓝ</span>:</Form.Label>
          <Form.Control
            type="number"
            id="donation"
            autoComplete="off"
            defaultValue={"0"}
            max={Big(account.amount)
              .div(10 ** 24)
              .toString()}
            min="0"
            step="0.01" />
        </Form.Group>

        <Button variant="primary" type="submit">
          Add
        </Button>
      </fieldset>
    </Form>
  );
};

export default FormInput;
