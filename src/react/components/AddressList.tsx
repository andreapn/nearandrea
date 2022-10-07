import React, { MouseEventHandler } from 'react'
import { Address } from '../interfaces';
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
    Col,
    Table
} from "reactstrap";

interface AddressListProps {
    addressList: Array<Address>;
    remove: MouseEventHandler;
}

const AddressList: React.FC<AddressListProps> = ({ addressList, remove }) => {
    return (
        <>
            <Table hidden={addressList.length === 0}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Address</th>
                        <th>Ⓝ</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {addressList.map((address, i) =>
                        <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{address.a}</td>
                            <td>{address.b}</td>
                            <td><Button value={address.a} onClick={remove}>X</Button></td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </>
    );
};

export default AddressList;
