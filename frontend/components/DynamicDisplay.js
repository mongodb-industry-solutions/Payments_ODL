import React, { useState } from 'react';
import styles from '../styles/DynamicDisplay.module.css';
import Code from '@leafygreen-ui/code';
import Plus from '@leafygreen-ui/icon/dist/Plus';
import Minus from '@leafygreen-ui/icon/dist/Minus';
import Return from '@leafygreen-ui/icon/dist/Return';
import IconButton from '@leafygreen-ui/icon-button';
import Popover from '@leafygreen-ui/popover';
import { Body }  from '@leafygreen-ui/typography';
import { useToast } from '@leafygreen-ui/toast';
import ConfirmationModal from '@leafygreen-ui/confirmation-modal';


const DynamicDisplay = ({ data, backgroundColor = '#f8f9fa' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isHovering0, setIsHovering0] = useState(false);
  const [modal1, setModal1] = useState(false);
  const { pushToast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; 

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleRefund = async () => {
    setModal1(false)
    const response = await fetch(`${apiUrl}/api/transaction/refund/${data._id}`, {method: 'PUT'});
    if (response.ok) {
      pushToast({ title:"Transaction was refunded successfully.", variant: "success" });
    } else {
      pushToast({ title:"Transaction refund failed.", variant: "warning" });
    }
  };

  return (
    <div style={{ backgroundColor, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div className={styles.grid}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.amount}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.paymentMethod || data.type}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.status}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{new Date(data.date).toLocaleString()}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.referenceData?.receiver?.name}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.referenceData?.receiver?.accountNumber}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.referenceData?.sender?.name || data.paymentMethod}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.referenceData?.sender?.accountNumber}</div>
        <IconButton 
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} 
          onClick={handleClick} aria-label="Some Menu"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}>
          {isOpen ? <Minus /> : <Plus />}
          <Popover active={isHovering} align="top" justify="middle" usePortal={true} >
            <Body style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#f5f5f5' }}>Expand</Body>
          </Popover>
        </IconButton> 
        <IconButton style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center' }} 
          onClick={() => setModal1(!modal1)} aria-label="Some Menu"
          onMouseEnter={() => setIsHovering0(true)}
          onMouseLeave={() => setIsHovering0(false)}
          disabled={!data.referenceData?.sender?.name || data.relatedTransactions?.some(transaction => transaction.type === "refund")}>
          <Return />
          <Popover active={isHovering0} align="top" justify="middle" usePortal={true} >
            <Body style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#f5f5f5' }}>refund</Body>
          </Popover>
        </IconButton>
        <ConfirmationModal
        open={modal1}
        style={{ zIndex: 10}}
        confirmButtonProps={{
          children: 'confirm',
          onClick: () =>  handleRefund (),
          style: { position: 'absolute', right: '100px', bottom: '20px' },
        }}
        cancelButtonProps={{
          onClick: () => setModal1(false),
          variant: 'default',
          style: { position: 'absolute', right: '170px', bottom: '20px' },
        }}
        title="Transaction Refund"
      >
        Refunding the transaction is definitive. Are you sure you want to proceed?
      </ConfirmationModal>
      </div>
      {isOpen && 
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Code language={'json'} style={{ width: '100%' }}>
            {JSON.stringify(data, null, 3)}
          </Code>
        </div>
      }
    </div>
  );
};

export default DynamicDisplay;