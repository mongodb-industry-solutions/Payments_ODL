import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Icon from '@leafygreen-ui/icon';
import { H2, Body }  from '@leafygreen-ui/typography';
import { Tabs, Tab } from '@leafygreen-ui/tabs';
import AccountsTable from '../components/AccountsTable';
import TransactionTable from '../components/TransactionTable';
import RefreshIcon from '@leafygreen-ui/icon/dist/Refresh';
import IconButton from '@leafygreen-ui/icon-button';
import Popover from '@leafygreen-ui/popover';
import ExpandableCard from '@leafygreen-ui/expandable-card';
import { ToastProvider } from '@leafygreen-ui/toast';
import ReactMarkdown from 'react-markdown';



const HomePage = () => {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selected, setSelected] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

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
      const login = JSON.parse(localStorage.getItem('login'));
      const bud = JSON.parse(localStorage.getItem('txns'));
      if (!login || !bud) {
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
      > {isSidebarOpen ? <Icon style={{ zIndex:-1 }} glyph="ChevronLeft" /> : <Icon style={{ zIndex:-1 }} glyph="ChevronRight" />}
      </button>
  );

  const markdownText = `This demo shows how MongoDB can be leveraged to modernize legacy core banking systems using a composable banking approach. It highlights the benefits of a document model, domain-driven design (DDD), microservices, and an Operational Data Layer (ODL).
  
  ### Composable Core Banking
  To drive customer-centric innovation cost-effectively, core banking functions are implemented as decoupled microservices, each service is underpinned by MongoDB domain data models. These functions include: User Management, Transaction Processing, Account Management, Payments, Account Reconciliation, Reporting, Security and Compliance, Notification Services. Detailed implementation details can be found [here](https://www.mongodb.com/solutions/solutions-library/payments-modernization).
  
  An ODL is deployed in front of legacy systems, enabling new business initiatives such as open banking and payment data monetization. This approach meets new requirements without the risk and difficulty of a complete overhaul, ensuring a seamless transition to modern architecture.
  
  ### User Navigation
  The dashboard consists of two tabs: **My Accounts** and **Latest Transactions**. In the former tab, users can **Open New Account** or view their existing ones. The later tab allows users to see their **Latest Transactions**, view specifics, and request refunds if necessary.
  
  The sidebar provides users with the ability to generate either **New Transactions** or **Mock Digital Payments**.
  
  Note, be sure to use the refresh button on the right side of **My Dashboard** to ensure you are viewing the most up-to-date information.`;


  return (
    <>
      <Head>
            <title>Composable Core Banking</title>
            <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastProvider>
        <Header />
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <>{toggleButton}</>
        <div style={{margin: isSidebarOpen ? '75px 0 0 470px' : '70px 0 0 80px', transition: 'left 0.3s ease' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ExpandableCard
              title="Instructions"
              darkMode={false}
              style={{ margin: '10px 5px', marginTop: '10px' }}
            >
              <ReactMarkdown>{markdownText}</ReactMarkdown>
            </ExpandableCard>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <H2>My Dashboard&nbsp;</H2>
              <IconButton 
                darkMode={false} 
                aria-label="Some Menu" 
                onClick={handleRefresh} 
                style={{ marginTop: '5px', marginLeft: '10px' }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <RefreshIcon />
                <Popover active={isHovering} align="right" justify="middle" usePortal={true} >
                  <Body style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#f5f5f5' }}>Refresh</Body>
                </Popover>
              </IconButton>
            </div>
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
      </ToastProvider>
    </>
  );
};

export default HomePage;