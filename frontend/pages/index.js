import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Icon from '@leafygreen-ui/icon';
import { H2, Body }  from '@leafygreen-ui/typography';
import { Tabs, Tab } from '@leafygreen-ui/tabs';
import AccountsTable from '../components/AccountsTable';
import TransactionTable from '../components/TransactionTable';
import Button  from '@leafygreen-ui/button';
import RefreshIcon from '@leafygreen-ui/icon/dist/Refresh';
import IconButton from '@leafygreen-ui/icon-button';


const HomePage = () => {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selected, setSelected] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; 

  const handleRefresh = async () => {
    const login = JSON.parse(localStorage.getItem('login'));
    const response = await fetch(`${apiUrl}/api/user/username/${login.username}`, {method: 'GET'});
    const exi = await response.json();
    const log = {};
    log._id = exi._id;
    log.username = login.username;
    log.email = exi.email;
    log.image_URL = exi.imgUrl;
    log.Number_linked_accounts = exi.linkedAccounts.length;
    log.Number_recent_transactions = exi.recentTransactions.length;
    localStorage.setItem('login', JSON.stringify(log));
    localStorage.setItem('txns', JSON.stringify(exi.recentTransactions));
    setTransactions(exi.recentTransactions);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const _id = localStorage.getItem('_id');
      const bud = JSON.parse(localStorage.getItem('txns'));
      if (!_id || !bud) {
        window.location.href = '/login';
        return;
      }
      setTransactions(bud);
    } 
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleButton = (
    <button onClick={toggleSidebar}
        style={{ position: 'fixed', top: '70px', left: isSidebarOpen ? '420px' : '40px', zIndex: 2, width: '40px',
          height: '40px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid #ccc', display: 'flex',
          justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'left 0.3s ease',}}
      > {isSidebarOpen ? <Icon glyph="ChevronLeft" /> : <Icon glyph="ChevronRight" />}
      </button>
  );

  return (
    <div>
      <Header />
     <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <>{toggleButton}</>
       <div style={{margin: isSidebarOpen ? '75px 0 0 470px' : '70px 0 0 80px', transition: 'left 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'left' }}>
          <H2>My Dashboard&nbsp;</H2>
          {/*<Button onClick={handleRefresh}>Refresh</Button>*/}
          <IconButton darkMode={false} aria-label="Some Menu" onClick={handleRefresh} style={{ marginTop: '5px' }}>
            <RefreshIcon />
          </IconButton>
        </div>
        <Tabs setSelected={setSelected} selected={selected} baseFontSize={16}>
          <Tab name="My Accounts" disabled={false}>
            <AccountsTable />
          </Tab>
          <Tab name="Latest Transactions" styles={{zIndex:'0'}} >
            <TransactionTable transactions={transactions} />
          </Tab>
          {/*<Tab name="All Transactions" styles={{zIndex:'0'}} >
            <AllTransactions />
          </Tab>*/}
        </Tabs>
      </div>
    </div>
  );
};

export default HomePage;