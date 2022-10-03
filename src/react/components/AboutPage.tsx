import { Col, Row } from "react-bootstrap";
import { useWalletSelector } from "../contexts/WalletSelectorContext";

const AboutPage = () => {
    return (
        <>
            <Row className="d-flex justify-content-center">
                <Col md={8} lg={8}>
                    About Page
                </Col>
            </Row>

        </>
    )
}
export default AboutPage;