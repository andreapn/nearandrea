import React, { MouseEventHandler } from 'react'
import { Address } from '../interfaces';
import { CloseButton, Row, Col, Table } from 'react-bootstrap';

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
                            <td>{address.nearAddress}</td>
                            <td>{address.nearAmount}</td>
                            <td><CloseButton value={address.nearAddress} onClick={remove} /></td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </>
    );
};

export default AddressList;
