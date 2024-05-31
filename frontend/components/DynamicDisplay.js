import React, { useState } from 'react';
import styles from '../styles/DynamicDisplay.module.css';

const JsonPretty = ({ data }) => {
  const json = JSON.stringify(data, null, 2);
  const jsonParts = json.split(/("(?:[^"\\]|\\.)*")|(\d+)|(:)|(,)|(\[)|(\])|(\{)|(\})|(true)|(false)/g);

  return (
    <pre>
      {jsonParts.map((part, i) => {
        if (part === undefined) return null;
        console.log(part);
        if (part.startsWith('"')) {
          if (part.endsWith('\":')) {
            return <span key={i} style={{ color: 'black' }}>{part}</span>;
          } else if ( part.endsWith('"')) {
            return <span key={i} style={{ color: 'green' }}>{part}</span>;
          }
        }
        if (!isNaN(part)) {
          return <span key={i} style={{ color: 'red' }}>{part}</span>;
        }
        if (part === ':' || part === ',') {
          return <span key={i} style={{ color: 'black' }}>{part}</span>;
        }
        if (part === '[' || part === ']' || part === '{' || part === '}') {
          return <span key={i} style={{ color: 'black' }}>{part}</span>;
        }
        if (part === 'true' || part === 'false') {
          return <span key={i} style={{ color: 'blue' }}>{part}</span>;
        }
        return part;
      })}
    </pre>
  );
};

const DynamicDisplay = ({ data, backgroundColor = '#f8f9fa' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div onClick={handleClick} style={{ backgroundColor, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div className={styles.grid}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.amount}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.type}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.status}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{new Date(data.date).toLocaleString()}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.referenceData?.receiver?.accountId}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.referenceData?.sender?.accountId || data.paymentMethod}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{data.txId || data._id}</div>
      </div>
      {isOpen && <JsonPretty data={data} />}
    </div>
  );
};

export default DynamicDisplay;