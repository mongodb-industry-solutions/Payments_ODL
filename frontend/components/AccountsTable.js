import React, { useEffect, useState } from 'react';
import styles from '../styles/tableStyles.css';
import Button  from '@leafygreen-ui/button';
import TextInput from '@leafygreen-ui/text-input';
import { Combobox, ComboboxOption } from '@leafygreen-ui/combobox';

const flattenObject = (obj, prefix = '') => 
  Object.keys(obj).reduce((acc, k) => {
    if (typeof obj[k] === 'object' && obj[k] !== null && !(obj[k] instanceof Array)) {
      Object.assign(acc, flattenObject(obj[k]));
    } else {
      acc[k] = obj[k];
    }
    return acc;
  }, {});

const AccountsTable = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true); 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [isFormOpen, setFormOpen] = useState(false);
  const [accountType, setAccountType] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const openForm = () => {
    const nbr = (Math.floor(Math.random() * 900000000) + 100000000).toString();
    console.log('nbr', nbr);
    setAccountNumber(nbr);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const login = JSON.parse(localStorage.getItem('login'));
      const response = await fetch(`${apiUrl}/api/account?userId=${login._id}`, { method: 'GET' });
      const data = await response.json();
      //console.log('data', data);
      const flattenedData = data.map(d => flattenObject(d));
      setData(flattenedData);
      setLoading(false);
      const allColumns = flattenedData.length > 0 ? Object.keys(flattenedData[0]) : [];
      setColumns(allColumns.filter(column => !['__safeContent__', 'userId', '_id'].includes(column)));
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000); // Fetch data every 10 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [apiUrl]);

  const formatFieldName = (fieldName) => {
    return fieldName.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  };

  const handleSubmit = async () => {
    const login = JSON.parse(localStorage.getItem('login'));
    const bud = {
      "userId": login._id,
      "username": login.username,
      "accountDetails": {
          "accountNumber": accountNumber,
          "accountType": accountType,
          "balance": parseInt(accountBalance,10),
          "limitations": {
              "withdrawalLimit": 100000,
              "transferLimit": 1000,
              "otherLimitations": "No Limit"
          },
          "securityTags": [],
          "details": {
              "IBAN": `IL${accountNumber}`
          }
      }
    };
    console.log('bud', bud);
    const response = await fetch(`${apiUrl}/api/account`, 
    {method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bud),
  });
  const exi = await response.json();
  console.log("exi",exi);
  //window.location.href = '/';
  setFormOpen(false);
  
  };
  
  return (
    <div className="table-wrapper">
        {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',fontSize: '19px', fontFamily: 'sans-serif', marginTop:'15px' }}>
            Loading...
        </div>
        ) : (
            <table className="table-container">
                <thead>
                    <tr>
                    {columns.map((column, index) => (
                        <th key={index} className={column === 'reported_originator_address' || column === 'reported_beneficiary_address' ? 'min-width-column' : ''}>
                          {formatFieldName(column)}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                    <tr key={rowIndex} >
                        {columns.map((column, columnIndex) => (
                        <td key={columnIndex}>{row[column]}</td>
                        ))}
                    </tr>
                    ))}
                </tbody>
            </table>
        )}
        <Button size={'default'} onClick={isFormOpen ? closeForm : openForm} style={{marginTop: '10px',}} >
              {isFormOpen ? 'Close form' : 'Open a new account'}
            </Button>
            {isFormOpen && (
              <div className="form" >
                <TextInput
                  label="Account Number:"
                  value={accountNumber}
                  disabled={true}
                />  
                <TextInput
                  label="Account Balance:"
                  placeholder="100"
                  onChange={e => setAccountBalance(e.target.value)}
                  value={accountBalance}
                />
                <Combobox label="Account type:" placeholder="type" value={accountType} onChange={value => setAccountType(value)}>
                  <ComboboxOption value="Checking" />
                  <ComboboxOption value="Savings" />
                </Combobox>  
                <Button size={'default'} onClick={handleSubmit} style={{marginTop: '10px',}} > Submit </Button>
              </div>
            )}
    </div>
  );
};

export default AccountsTable;