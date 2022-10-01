import React from "react";
import type { Donate } from "../interfaces";

interface DonatesProps {
  donates: Array<Donate>;
}

const Donates: React.FC<DonatesProps> = ({ donates }) => {
  return (
    <>
      {donates.map((donate, i) => (
        // TODO: format as cards, add timestamp
        <p key={i}>
          {donate.account_id}<br />
          {donate.total_amount}
        </p>
      ))}
    </>
  );
};

export default Donates;
