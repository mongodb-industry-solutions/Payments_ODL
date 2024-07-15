import React from 'react';
import styles from '../styles/header.module.css';
import { MongoDBLogoMark } from '@leafygreen-ui/logo';
import { H2,Body }  from '@leafygreen-ui/typography';
import Link from 'next/link';
import { useRouter } from 'next/router';

function Header() {
  const router = useRouter();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('login');
    localStorage.removeItem('txns');
    router.push('/login');
  }

  return (
    <div className={styles["layout-header"]}>
      <div className={styles["logo-container"]}>
        <MongoDBLogoMark />
      </div>
      <div className={styles["title-container"]}>
        <H2>Composable Core Banking Using MongoDB</H2>
      </div>
      <div className={styles["logout-container"]}>
        <Link href="/login">
          <a onClick={handleLogout}>
            <Body style={{ cursor: 'pointer' }}>Log Out</Body>
          </a>
        </Link>
      </div>
    </div>
  );
}

export default Header;