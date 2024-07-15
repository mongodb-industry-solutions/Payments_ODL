// pages/login.js

import Login from '../components/Login';
import Head from 'next/head';


const LoginPage = () => {
  return (
    <>
      <Head>
          <title>Composable Core Banking</title>
          <link rel="icon" href="/favicon.ico" />
      </Head>
      <Login />
    </>
  );
};

export default LoginPage;
