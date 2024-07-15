// pages/register.js

import Register from '../components/Register';
import Head from 'next/head';

const RegisterPage = () => {

  return (
    <>
      <Head>
        <title>Composable Core Banking</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Register />
    </>
  );
};

export default RegisterPage;