import React, { useEffect, useState } from 'react';
import { NumberInput } from '@leafygreen-ui/number-input';
import Button  from '@leafygreen-ui/button';
import {SearchInput,SearchResult} from '@leafygreen-ui/search-input';
import { Subtitle }  from '@leafygreen-ui/typography';
import { useToast } from '@leafygreen-ui/toast';



const Form = ({  setPopupOpen, popupTitle }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [amount, setAmount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [Originator, setOriginator] = useState(null);
    const [Beneficiary, setBeneficiary] = useState(null);
    const { pushToast } = useToast();
    const [value1, setValue1] = useState([]);
    const [value2, setValue2] = useState([]);


    const fetchAccounts = async () => {
        const login = JSON.parse(localStorage.getItem('login'));
        const response = await fetch(`${apiUrl}/api/account?userId=${login._id}`, { method: 'GET' });
        const data = await response.json();
        const reformattedData = data.map(item => ({
          username: item.user.username,
          userId: item.userId,
          account: item.accountType,
          accountId: item._id,
          accountNumber: item.accountNumber
        }));
        return reformattedData;
      };

    const fetchUserAccounts = async () => {
        const response = await fetch(`${apiUrl}/api/account/fts/search`, { method: 'GET' });
        const data = await response.json();
        //console.log('data', data);
        return data;
      };

    function findAccountByNumber(accounts, accountNumber) {
        return accounts.find(account => account.accountNumber === accountNumber);
    }

    const handleSubmit2 = (event) => {
        event.preventDefault();
        console.log('Amount:', amount);
        console.log('Originator:', Originator);
        console.log('Beneficiary:', Beneficiary);
        console.log('value1:', findAccountByNumber(value1, Originator));
        console.log('value2:', findAccountByNumber(value2, Beneficiary));
        //setPopupOpen(false); // close the popup when form is submitted
    };

    const handleSubmit = async () => {
        if (Beneficiary == Originator) {
          alert("Beneficiary can't be the same as the Originator");
          return;
        } else {
          const login = JSON.parse(localStorage.getItem('login'));
          const Ori = findAccountByNumber(value1, Originator);
          const Benef = findAccountByNumber(value2, Beneficiary);
          if (popupTitle === 'New Digital Payment') {
            const bud = {
              "accountId": Benef.accountId,
              "amount": amount,
              "type": "external",
              "paymentMethod": paymentMethod,
              "status": "Completed",
              "payerInfo": {
                  "payerId": "AX12345BXC123456",
                  "email": "payer@example.com",
                  "firstName": "John",
                  "lastName": "Doe",
                  "shippingAddress": {
                      "line1": "123 Main St",
                      "city": "Anytown",
                      "state": "CA",
                      "postalCode": "12345",
                      "countryCode": "US"
                  }
              },
              "recipientInfo": {
                  "merchantId": Benef.userId
              }
          }
          console.log(bud);
          console.log('Ori',Ori);
          console.log('Benef',Benef);
          
            // Perform PUT request
            const response = await fetch(`${apiUrl}/api/transaction/external/${Ori.accountId}/${Benef.accountId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bud)
            });
            if (response.ok) {
              pushToast({ title:"The Digital Payment was successful.", variant: "success" });
            } else {
              pushToast({ title:"The Digital Payment failed.", variant: "warning" });
            }
          } else {
            // Perform POST request
            const bud = {
              "accountId": Ori.accountId,
              "amount": amount,
              "type": "credit",
              "details": {
                  "description": "Payment for services",
                  "userId": `${login._id}`
              },
              "referenceData": {
                  "receiver": {
                      "userId": Benef.userId,
                      "accountId": Benef.accountId
                  }
              }
            };
    
            const response = await fetch(`${apiUrl}/api/transaction/${login._id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bud)
            });
            console.log(response);
            if (response.ok) {
              pushToast({ title:"The Transaction was successful.", variant: "success" });
            } else {
              pushToast({ title:"The Transaction failed.", variant: "warning" });
            }
          }
          setPopupOpen(false);
        }
      };

    const generateOriginators = async () => {
        let accounts = [];
        accounts = await fetchAccounts();
        await setValue1(accounts);
      };

      const generateBeneficiary = async () => {
        let accounts = [];
        accounts = await fetchUserAccounts();
        await setValue2(accounts);
      };

    useEffect(() => {
        generateOriginators();
        generateBeneficiary();
      }, []);

  return (
    <form onSubmit={handleSubmit}>
        <Subtitle>{popupTitle}</Subtitle>
        <NumberInput style={{marginTop:'3px'}} value={amount} placeholder={'Transaction Amount'} onChange={event => setAmount(Number(event.target.value))} />
        {popupTitle !== 'New Transaction' && (
          <SearchInput style={{marginTop:'3px'}} placeholder={'Payment method'} value={paymentMethod}
          onChange={event => setPaymentMethod(event.target.value)}>
          <SearchResult key={1} description={`Digital Payment`}>Paypal</SearchResult>
          <SearchResult key={2} description={`Digital Payment`}>Zelle</SearchResult>
          <SearchResult key={3} description={`Digital Payment`}>Venmo</SearchResult>
      </SearchInput>
        )}
        <SearchInput style={{marginTop:'3px'}} placeholder={'Originator Account Number'} value={Originator}
            onChange={event => setOriginator(event.target.value)}>
            {value1.map((account, index) => (
                <SearchResult key={index} description={`${account.username} ${account.account}`}  >
                {account.accountNumber}
                </SearchResult>
            ))}
        </SearchInput>
        <SearchInput style={{marginTop:'3px'}} placeholder={'Beneficiary Account Number'} value={Beneficiary}
            onChange={event => setBeneficiary(event.target.value)}>
            {value2.map((account, index) => (
                <SearchResult key={index} description={`${account.username} ${account.account}`}  >
                {account.accountNumber}
                </SearchResult>
            ))}
        </SearchInput>
        <div>
            <Button onClick={() => setPopupOpen(false)} style={{marginTop:'3px'}} >Close</Button>
            <Button onClick={handleSubmit} style={{marginLeft:'3px'}} > Submit</Button>
        </div>
    </form>
  );
};

export default Form;