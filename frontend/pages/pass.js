import React, { useEffect, useState } from 'react';
import { FormSkeleton } from '@leafygreen-ui/skeleton-loader';
import ConfirmationModal from '@leafygreen-ui/confirmation-modal';

const Pass = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; 

  const fetchData = async () => {
    // Ensure window and apiUrl are available
    if (typeof window !== 'undefined' && apiUrl) {
      const queryParams = new URLSearchParams(window.location.search);
      const clientId = queryParams.get('clientid');
      let lowerCaseClientId = clientId.toLowerCase();

      const response = await fetch(`${apiUrl}/api/user/username/${lowerCaseClientId}`, {method: 'GET'});
      const exi = await response.json();

      if (exi.err) { 
        alert('Client does not exist');
        window.location.href = '/login';
        return; 
      }

      const log = {};
      log._id = exi._id;
      log.username = lowerCaseClientId;
      log.email = exi.email;
      log.image_URL = exi.imgUrl;
      log.Number_linked_accounts = exi.linkedAccounts.length;
      log.Number_recent_transactions = exi.recentTransactions.length;
      localStorage.setItem('login', JSON.stringify(log));
      localStorage.setItem('txns', JSON.stringify(exi.recentTransactions));
    //   console.log("localStorage.getItem('login')",JSON.stringify(log));
    //   console.log("localStorage.getItem('exi.recentTransactions')",JSON.stringify(exi.recentTransactions));
      window.location.href = '/';
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  return (
    <div>
        <FormSkeleton/>
    </div>
  );
};

export default Pass;