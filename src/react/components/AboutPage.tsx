import {
    Button,
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
import { useWalletSelector } from "../contexts/WalletSelectorContext";

const AboutPage = () => {
    return (
        <>
            <Row className="d-flex justify-content-center">
                <Col md={8} lg={8}>
                    About Page abc
                </Col>
            </Row>

        </>
    )
}
export default AboutPage;