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

const PageHeader: React.FC = () => {
  return (
    <div className="page-header header-filter">
      <div className="squares square1" />
      <div className="squares square2" />
      <div className="squares square3" />
      {/* <div className="squares square4" /> */}
      <div className="squares square5" />
      <div className="squares square6" />
      <div className="squares square7" />
      <div>

        <div className="content-center brand">
          <h1 className="h1-seo">NEARANDREA</h1>
          <h3 className="d-sm-block">
            Bring convenience to NEAR users.
          </h3>
        </div>

      </div>
    </div>
  );
}
export default PageHeader;
