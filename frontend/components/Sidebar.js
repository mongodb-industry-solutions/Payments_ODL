// components/Sidebar.js
import React, { useEffect, useState } from 'react';
import styles from '../styles/sidebar.module.css';
import { H2,H3,Body,Subtitle }  from '@leafygreen-ui/typography';
import Image from 'next/image';
import Link  from 'next/link';
import Button  from '@leafygreen-ui/button';
import Popup from './Popup';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [popupTitle, setPopupTitle] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleClosePopup = () => {
    setPopupOpen(false);
  };
  
  useEffect(() => {
    setData(JSON.parse(localStorage.getItem('login')));
    setLoading(false);
  }, []);

  const formatFieldName = (fieldName) => {
    return fieldName.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  };

  const handlePaypalPayment = async () => {
    setPopupTitle('PayPal Payment');
    setPopupOpen(true);
  };

  const handleNewTransaction = async () => {
    setPopupTitle('New Transaction');
    setPopupOpen(true);
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles['sidebar-content']}>
        <H3 baseFontSize ={16} >My Profile</H3>
        <Image className={styles.profileImage} src={'/images/userAvatar.png'} alt="Profile" width={500} height={500}/>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {Object.keys(data).map((key, index) => (
              <div className={styles.profileItem} key={index}>
                <Subtitle>{formatFieldName(key)}:&nbsp;</Subtitle>
                <Body baseFontSize={16}>{data[key]}</Body>
              </div>
            ))}
          </div>
        )}
        <Button onClick={handlePaypalPayment}>Mock PayPal Payment</Button>
        <Button onClick={handleNewTransaction}>New transaction</Button>
        <Popup isOpen={popupOpen} onClose={handleClosePopup} title={popupTitle} />
      </div>
      <div style={{ position: "fixed", bottom: 0, width: "100%", display: "flex", flexDirection: "row"}}>
        <Body style={{ color: "dark-green", margin: '5px' }}> Made with &hearts; by </Body>
        <Body style={{ margin: '5px' }}> <Link href="https://www.mongodb.com/developer/author/pavel-duchovny/" target="_blank" rel="noopener noreferrer">Pavel Duchovny</Link> </Body>
        <Body style={{ margin: '5px' }}> <Link href="https://www.mongodb.com/developer/author/paul-claret/" target="_blank" rel="noopener noreferrer">Paul Claret</Link></Body>
       </div>
    </div>
  );
};

export default Sidebar;