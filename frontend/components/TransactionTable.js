/* TransactionTable.js */

import React from 'react';
import DynamicDisplay from './DynamicDisplay';
import styles from '../styles/TransactionTable.module.css';

const TransactionTable = ({ transactions }) => {

  console.log("transactions",transactions);

  return (
    <div className={styles.transactionTable}>
      <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 0.5fr 0.5fr 0.75fr 0.5fr 0.5fr 0.5fr 0.5fr 0.2fr 0.2fr', width: '100%', margin: '10px 0px' }}>
        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Amount</div>
        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Type</div>
        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Status</div>
        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Date</div>
        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Receiver Name</div>
        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Receiver ID</div>
        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sender Name</div>
        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sender ID</div>
      </div>
      {transactions.length === 0 ? (
        <p>No transactions on this account</p>
      ) : (
        transactions.map((transaction, index) => (
          <DynamicDisplay key={index} data={transaction} backgroundColor={index % 2 === 0 ? '#F9FBFA' : '#ffffff'} />
        ))
      )}
    </div>
  );
};

export default TransactionTable;