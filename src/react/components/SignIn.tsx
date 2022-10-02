import React, { Fragment, MouseEventHandler } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

interface SignInProps {
  handleSignIn: MouseEventHandler;
}

const SignIn: React.FC<SignInProps> = ({ handleSignIn }) => {
  return (
    <Fragment>
      <Container fluid="md">
        <Row className="d-flex justify-content-center">
          <Col md={8} lg={8}>
            <h1>NEARANDREA</h1>
          </Col>
        </Row>
        <Row className="d-flex justify-content-center">
          <Col md={8} lg={8}>
            <Button variant="secondary" onClick={handleSignIn}>Log In</Button>
            <p>NEARANDREA bring convenience to near users. Please login to use multisend.</p>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default SignIn;
