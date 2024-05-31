// Popup.js
import React, { useEffect, useState } from 'react';
import '../styles/Popup.css'; 
import { Combobox, ComboboxOption } from '@leafygreen-ui/combobox';
import { NumberInput } from '@leafygreen-ui/number-input';
import Button  from '@leafygreen-ui/button';


const Popup = ({ isOpen, onClose, loading, title, children }) => {
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [amount, setAmount] = useState(null);
  const [senders, setSenders] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const popupClassName = isOpen ? 'popup-container open' : 'popup-container';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


  const fetchAccounts = async () => {
    const login = JSON.parse(localStorage.getItem('login'));
    const response = await fetch(`${apiUrl}/api/account?userId=${login._id}`, { method: 'GET' });
    const data = await response.json();
    console.log('data', data);
    const reformattedData = data.map(item => ({
      username: item.user.username,
      account: item.accountType,
      accountId: item._id,
      userId: item.userId
    }));
    return reformattedData;
  };

  const fetchUserAccounts = async () => {
    const response = await fetch(`${apiUrl}/api/account/fts/search`, { method: 'GET' });
    const data = await response.json();
    console.log('data', data);
    return data;
  };

  useEffect(() => {
    if (title === 'PayPal Payment') {
      fetchAccounts().then(data => {
        setSenders([{"username":"paypal","account":" ", "accountId":" ", userId:" "}]);
        setReceivers(data);
      });
    } else if (title === 'New Transaction') {
      Promise.all([fetchAccounts(), fetchUserAccounts()]).then(([userAccounts, allAccounts]) => {
        setSenders(userAccounts);
        setReceivers(allAccounts);
      });
    }
  }, [title, fetchAccounts, fetchUserAccounts]);

  const handleClose = () => {
    setSender(null);
    setReceiver(null);
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (receiver == sender) {
      alert("Receiver can't be the same as the sender");
      return;
    }else {
      const login = JSON.parse(localStorage.getItem('login'));
      if (title === 'PayPal Payment') {
        const parts = receiver.split(' ');
        const bud = {
          "accountId": parts[3],
          "amount": amount,
          "type": "external",
          "paymentMethod": "PayPal",
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
              "merchantId": parts[1]
          }
      }
        // Perform PUT request
        const response = await fetch(`${apiUrl}/api/transaction/external/${login._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bud)
        });
        console.log('response', response);
      } else {
        // Perform POST request
        const parts = receiver.split(' ');
        const chunks = sender.split(' ');
        const bud = {
          "accountId": chunks[3],
          "amount": amount,
          "type": "credit",
          "details": {
              "description": "Payment for services",
              "userId": `${login._id}`
          },
          "referenceData": {
              "receiver": {
                  "userId": parts[1],
                  "accountId": parts[3]
              }
          }
        }

        const response = await fetch(`${apiUrl}/api/transaction/${login._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bud)
        });
        console.log(response);
      }
      handleClose();
    }
  };

  return (
    <div className={popupClassName}>
      <div className="popup">
        <h2 className="popup-title">{title}</h2>
        { !loading && (
          <button className="close-button" onClick={handleClose}>
            &times;
          </button>
        )}
        <div className="input-container">
        <NumberInput
          label={"Amount:"}
          value={amount}
          onChange={event => setAmount(Number(event.target.value))}
          unit='$'/>
          <Combobox label="Sender account:" placeholder="sender" value={sender} onChange={value => setSender(value)}>
            {senders.map((sender, index) => (
              <ComboboxOption key={index}  value={`${sender.username} ${sender.userId} ${sender.account} ${sender.accountId}`} />
            ))}
          </Combobox>  
          <Combobox label="Receiver account:" placeholder="receiver" value={receiver} onChange={value => setReceiver(value)}>
            {receivers.map((receiver, index) => (
              <ComboboxOption key={index}  value={`${receiver.username} ${receiver.userId} ${receiver.account} ${receiver.accountId}`} />
            ))}
          </Combobox>  
          <Button onClick={handleSubmit}> Submit </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Popup;