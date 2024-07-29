import React, { useState } from 'react';
import { PasswordInput } from '@leafygreen-ui/password-input';
import TextInput from '@leafygreen-ui/text-input';
import { H2 } from '@leafygreen-ui/typography';
import { MongoDBLogoMark } from '@leafygreen-ui/logo';
import Button  from '@leafygreen-ui/button';
import Banner from '@leafygreen-ui/banner';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [clientId, setClientId] = useState('');
  //const [password, setPassword] = useState(''); 
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; 

  const handleClientIdChange = (event) => {
    setClientId(event.target.value);
    //setPassword(event.target.value);
  };

  // const handlePasswordChange = (event) => {
  //   setPassword(event.target.value);
  // };

  const handleLogin = async () => {
    if (clientId.trim() === '') {
      alert('Please enter both Client ID and Password');
      return;
    }
    let lowerCaseClientId = clientId.toLowerCase();
    const response = await fetch(`${apiUrl}/api/user/username/${lowerCaseClientId}`, {method: 'GET'});
    const exi = await response.json();
    console.log("exi",exi);
    // if (clientId.trim() === '' || password.trim() === '') {
    if(exi.err) {
      alert('Client ID does not exist');
      return;
    } else {
      const log = {};
      log._id = exi._id;
      log.username = lowerCaseClientId;
      log.email = exi.email;
      log.image_URL = exi.imgUrl;
      log.Number_linked_accounts = exi.linkedAccounts.length;
      log.Number_recent_transactions = exi.recentTransactions.length;
      localStorage.setItem('login', JSON.stringify(log));
      localStorage.setItem('txns', JSON.stringify(exi.recentTransactions));
      // console.log("localStorage.getItem('login')",JSON.stringify(localStorage.getItem('login')));
      // console.log("localStorage.getItem('login')",JSON.stringify(localStorage.getItem('login')));
      router.push('/');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const handleRegister = async () => {
    router.push('/register');
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
          <form style={styles.form} onSubmit={handleFormSubmit}>
            <MongoDBLogoMark />
            <H2 style={styles.button}> Composable Core Banking </H2>
            <TextInput
              label="Username"
              placeholder="Name"
              onChange={handleClientIdChange}
              value={clientId}
              style={{position: 'relative', top: '0px', left: '-10px',  width: '180px', boxSizing: 'border-box',  padding: '5px',}}
            />
            {/*<PasswordInput
              label="Enter Password"
              id="new-password"
              onChange={handlePasswordChange}
              value={password}
              style={{position: 'relative', top: '0px', left: '14px',  width: '180px',}}
            />*/}
            <div style={styles.buttonContainer}>
              <Button size={'default'} onClick={handleLogin} style={{marginTop: '10px',}} > Login </Button>
              <Button size={'default'} onClick={handleRegister} style={{marginTop: '10px',}} > Register </Button>
            </div>
            <div>
              <Banner variant="warning" style={{marginTop: '15px',}} >
                Please enter your name and press enter or <br />register if no account has been created under your name.
              </Banner>
            </div>
          </form>
      </div>
    </div>
  );
};

export default LoginPage;
