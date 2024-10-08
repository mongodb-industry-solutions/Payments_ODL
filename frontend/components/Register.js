import React, { useState } from 'react';
import { PasswordInput } from '@leafygreen-ui/password-input';
import TextInput from '@leafygreen-ui/text-input';
import { H2 } from '@leafygreen-ui/typography';
import { MongoDBLogoMark } from '@leafygreen-ui/logo';
import Button  from '@leafygreen-ui/button';
import Banner from '@leafygreen-ui/banner';


const LoginPage = () => {
  const [clientId, setClientId] = useState('');
  const [password, setPassword] = useState(''); 
  const [email, setEmail] = useState('');  

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleClientIdChange = (event) => {
    const input = event.target.value;
    setClientId(input);
    setPassword(input);
    setEmail(`${input}@example.com`);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleBack = () => {
    window.location.href = '/login';
  };

  const handleSubmit = async () => {
    let lowerCaseClientId = clientId.toLowerCase();
    if (lowerCaseClientId.trim() === '' || password.trim() === '') {
      alert('Please enter both Client ID and Password');
      return;
    }else {
      const resp = await fetch(`${apiUrl}/api/user/username/${lowerCaseClientId}`, {method: 'GET'});
      const exi0 = await resp.json();
      if(exi0._id) {
        alert('Client ID already exist');
        return;
      }
      const response = await fetch(`${apiUrl}/api/user/register`, 
        {method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: lowerCaseClientId, email: email, password: password}),
        });
      const exi = await response.json();
      //console.log("exi",exi);
      const log = {};
      log._id = exi._id;
      log.username = clientId;
      log.email = exi.email;
      log.image_URL = exi.imgUrl;
      log.Number_linked_accounts = exi.linkedAccounts.length;
      log.Number_recent_transactions = exi.recentTransactions.length;
      localStorage.setItem('txns', JSON.stringify(exi.recentTransactions));
      localStorage.setItem('login', JSON.stringify(log));
      //console.log("localStorage.getItem('login')",JSON.stringify(localStorage.getItem('login')));
      window.location.href = '/';
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    },
    loginBox: {
      background: '#FFFFFF', 
      border: '10px', 
      borderRadius: '10px', 
      boxShadow: '0 2px 10px 0 rgba(70, 76, 79, .2)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '50px', 
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
    },
    input: { textAlign: 'left', width: '200px', },
    button: { margin: '10px' },
  };

  return (
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <form style={styles.form}>
            <MongoDBLogoMark />
            <H2 style={styles.button}> Composable Core Banking </H2>
            <TextInput
              label="Username"
              placeholder="Name"
              onChange={handleClientIdChange}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  handleSubmit();
                }
              }}
              value={clientId}
              style={{position: 'relative', top: '0px', left: '-10px',  width: '180px', boxSizing: 'border-box',  padding: '5px',}}
            />
            <TextInput
              label="Email"
              placeholder="name@example.com"
              onChange={handleEmailChange}
              value={email}
              style={{position: 'relative', top: '0px', left: '-10px',  width: '180px', boxSizing: 'border-box',  padding: '5px',}}
            />
            <PasswordInput
              label="Enter Password"
              id="new-password"
              onChange={handlePasswordChange}
              value={password}
              style={{position: 'relative', top: '0px', left: '14px',  width: '180px',}}
            />
            <PasswordInput
              label="Confirm Password"
              id="new-password"
              onChange={handlePasswordChange}
              value={password}
              style={{position: 'relative', top: '0px', left: '14px',  width: '180px',}}
            />
            <div style={styles.buttonContainer}>
              <Button size={'default'} onClick={handleSubmit} style={{marginTop: '10px',}} > Submit </Button>
              <Button size={'default'} onClick={handleBack} style={{marginTop: '10px',}} > Back </Button>
            </div>
            <Banner variant="warning" style={{marginTop: '15px',}} >
              Please enter your name and click on register. <br />No other field is required
            </Banner>
          </form>
      </div>
    </div>
  );
};

export default LoginPage;
