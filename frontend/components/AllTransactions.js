import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DynamicDisplay from './DynamicDisplay';

const AllTransactions = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchTransactions = async (accountId) => {
    const response = await axios.get(`${apiUrl}/api/transaction?accountId=${accountId}`);
    return response.data;
  };

  const fetchAccounts = useCallback(async () => {
    const login = JSON.parse(localStorage.getItem('login'));
    const response = await fetch(`${apiUrl}/api/account?userId=${login._id}`, { method: 'GET' });
    const data = await response.json();
    const accountsWithTransactions = await Promise.all(
      data.map(async (account) => {
        const transactions = await fetchTransactions(account._id);
        return { ...account, transactions };
      })
    );
    setAccounts(accountsWithTransactions);
    setLoading(false);
  }, [apiUrl]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {accounts.map((account, index) => (
        <div key={index}>
          <h2>Account ID: {account._id}</h2>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 0.5fr 1.5fr 2fr 2fr 2fr', width: '100%', margin: '10px 0px' }}>
              <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Amount</div>
              <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Type</div>
              <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Status</div>
              <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Date</div>
              <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Receiver ID</div>
              <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sender ID</div>
              <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Transaction ID</div>
            </div>
            {account.transactions.map((transaction, index) => {
              const { accountId, ...transactionWithoutAccountId } = transaction;
              return (
                <DynamicDisplay key={index} data={transactionWithoutAccountId} backgroundColor={index % 2 === 0 ? '#F9FBFA' : '#ffffff'} />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllTransactions;