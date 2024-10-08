# MongoDB Payments Operational Data Layer Demo

This project is built to facilitate a MongoDB payments solution: [Payments Modernization Accelerator](https://www.mongodb.com/solutions/solutions-library/payments-modernization) based on our MongoDB for [Payments](https://www.mongodb.com/use-cases/payments) vision:
![Overview](https://webimages.mongodb.com/_com_assets/cms/llcgrv7qgszjis2h7-image2.png?auto=format%252Ccompress)

The Stack is :
- Node JS microservices server/s
- MongoDB Atlas/Enterprise
- Kafka streams
- AWS KMS

### Features Covered

**Cross Microservices** 
- Indexing and Scalability
- JSON Schema Validation
- Permission and Data Segregation
- Auditing 


**User & Account Microservices***:
- Document Model : Flexible user and account structure for different accounts and user profiles 
- Kafka Streaming Sink : Data being streamed from external sources
- Transactions (User to Account references) : Keeping account and user data ACID compliant
- In-Use Encryption
- Full text search : Account ids and usernames are searchable for users to pick via full text search.


**Transactions & Payments Microservices**
- Change Streams: Payments are event driven by transactions
- Time Series for transaction history :Transaction history is built in a time series collection
- In-Use Encryption

**Notification Microservices**
- Kafka source : Notifications are being downstreamed to external systems and users via kafka
- Change Streams: Notifications are being captured by change streams and pushed via Websockets


**Reports**
- Materialized Views : Materialized views are built to preprocess and clear sensitive data for reporting
- Charts


## Getting Started

- Setup Atlas Cluster 7.0+
    - Setup users:
      This code should be run with Atlas CLI : https://www.mongodb.com/docs/atlas/cli/stable/ after you auth against the relevant project
 Create custom roles:
```
atlas customDbRoles create user_management_role --privilege FIND@FSI.users,FIND@_encrypt,INSERT@FSI.users,INSERT@_encrypt,REMOVE@FSI.users,REMOVE@_encrypt,UPDATE@FSI.users,UPDATE@_encrypt,UPDATE@FSI.accounts,BYPASS_DOCUMENT_VALIDATION@FSI.users,BYPASS_DOCUMENT_VALIDATION@_encrypt,CREATE_COLLECTION@FSI.users,CREATE_COLLECTION@_encrypt,CREATE_COLLECTION@FSI,CREATE_INDEX@FSI.users,CREATE_INDEX@_encrypt,CREATE_INDEX@FSI,DROP_COLLECTION@FSI.users,DROP_COLLECTION@_encrypt,DROP_COLLECTION@FSI,CHANGE_STREAM@FSI.users,CHANGE_STREAM@_encrypt,DROP_DATABASE@_encrypt,RENAME_COLLECTION_SAME_DB@_encrypt,LIST_COLLECTIONS@FSI
      
atlas customDbRoles create account_management_role --privilege FIND@FSI.accounts,FIND@_encrypt,INSERT@FSI.accounts,INSERT@_encrypt,REMOVE@FSI.accounts,REMOVE@_encrypt,UPDATE@FSI.accounts,UPDATE@_encrypt,UPDATE@FSI.users,BYPASS_DOCUMENT_VALIDATION@FSI.accounts,BYPASS_DOCUMENT_VALIDATION@_encrypt,CREATE_COLLECTION@FSI.accounts,CREATE_COLLECTION@_encrypt,CREATE_COLLECTION@FSI,CREATE_INDEX@FSI.accounts,CREATE_INDEX@_encrypt,CREATE_INDEX@FSI,DROP_COLLECTION@FSI.accounts,DROP_COLLECTION@_encrypt,CHANGE_STREAM@FSI.accounts,CHANGE_STREAM@_encrypt,COLL_MOD@FSI.accounts,COLL_MOD@_encrypt,COMPACT@FSI.accounts,COMPACT@_encrypt,CONVERT_TO_CAPPED@FSI.accounts,CONVERT_TO_CAPPED@_encrypt,DROP_INDEX@FSI.accounts,DROP_INDEX@_encrypt,RE_INDEX@FSI.accounts,RE_INDEX@_encrypt,COLL_STATS@FSI.accounts,COLL_STATS@_encrypt,DB_HASH@FSI.accounts,DB_HASH@_encrypt,LIST_INDEXES@FSI.accounts,LIST_INDEXES@_encrypt,VALIDATE@FSI.accounts,VALIDATE@_encrypt,ENABLE_PROFILER@_encrypt,DROP_DATABASE@_encrypt,RENAME_COLLECTION_SAME_DB@_encrypt,DB_STATS@_encrypt,LIST_COLLECTIONS@_encrypt,LIST_COLLECTIONS@FSI --inheritedRole readWrite@FSI

atlas customDbRoles create transaction_management --privilege FIND@FSI.transactions,FIND@_encrypt,INSERT@FSI.transactions,INSERT@_encrypt,REMOVE@FSI.transactions,REMOVE@_encrypt,UPDATE@FSI.transactions,UPDATE@_encrypt,UPDATE@FSI.users,BYPASS_DOCUMENT_VALIDATION@FSI.transactions,BYPASS_DOCUMENT_VALIDATION@_encrypt,CREATE_COLLECTION@FSI.transactions,CREATE_COLLECTION@_encrypt,CREATE_COLLECTION@FSI,CREATE_INDEX@_encrypt,CREATE_INDEX@FSI,ENABLE_PROFILER@_encrypt,DROP_DATABASE@_encrypt,RENAME_COLLECTION_SAME_DB@_encrypt,DB_STATS@_encrypt,LIST_COLLECTIONS@_encrypt,LIST_COLLECTIONS@FSI

atlas customDbRoles create payment_management_role --privilege CHANGE_STREAM@FSI.transactions,FIND@FSI.transactions

atlas customDbRoles create notification_management_role --privilege FIND@FSI.notifications,INSERT@FSI.notifications,REMOVE@FSI.notifications,UPDATE@FSI.notifications,BYPASS_DOCUMENT_VALIDATION@FSI.notifications,CREATE_COLLECTION@FSI.notifications,CREATE_INDEX@FSI.notifications,CHANGE_STREAM@FSI.notifications
```

create users and associate with the relevant custom role.

    - user_management
    - account_management 
    - transaction_management
    - payment_management
    - notification_management

- Setup KMS (Optional)
- Setup Kafka Confluent (Optional)

### Install

Clone the repo:
```
git clone https://github.com/mongodb-industry-solutions/Payments_ODL
```

Download your OS shared crypt library for FLE : 
- Download [here](https://www.mongodb.com/docs/manual/core/queryable-encryption/reference/shared-library/#std-label-qe-reference-shared-library-download).
- Then unzip and place the "mongo_crypt_v1" file under /backend/lib.

> [!Note]
> If you want to run it on containers (node:20.10.0) choose the ubuntu 20.04 ARM 64 

Verify permissions and that the OS does not block it. (In MAC OS the system will usually block the file and you will need to unblock via system settings)
```
chmod 755 <FULL_PATH_TO_LIB_FILE>
```

Setup the .env file:
```
## Encrytion

# Shared Library file path for queryable encryption
SHARED_LIB_PATH="/lib/mongo_crypt_v1.<extentionfile>" # Download here https://www.mongodb.com/docs/manual/core/queryable-encryption/reference/shared-library/#std-label-qe-reference-shared-library-download

# AWS Credentials - Optional

AWS_ACCESS_KEY_ID="<Your AWS access key ID>"
AWS_SECRET_ACCESS_KEY="<Your AWS secret access key>"
AWS_KEY_REGION="<Your AWS key region>"
AWS_KEY_ARN="<Your AWS key ARN>"


# Microservices
## !IMPORTANT: Fill in the created users

USER_MANAGEMENT_USR=
USER_MANAGEMENT_PWD=

ACCOUNT_MANAGEMENT_USR=
ACCOUNT_MANAGEMENT_PWD=


TRANSACTION_MANAGEMENT_USR=
TRANSACTION_MANAGEMENT_PWD=


PAYMENT_MANAGEMENT_USR=
PAYMENT_MANAGEMENT_PWD=

NOTIFICATION_MANAGEMENT_USR=
NOTIFICATION_MANAGEMENT_PWD=

```

Setup database configuration under `config/dev.js` (eg. `dbCluster : cluster0.abcd.mongodb.net`):
```
module.exports = {
    dbCluster : '<YOUR_CLUSTER_HOST>',
    dbName : 'FSI'
}
```

### Start the application (manualy)

Install the repo on both the /backend folder and the /frontend folder:
```
npm install
```

Start the backend
```
node server.js
```

Start the frontend
```
node run dev
```

### Start the application (with containers)

On the home folder of the repo exectute these commands to start the containers:
```
make build
```

And to stop them:
```
make clean
```

### Test using postman:
 
Load `Payments.postman_collection.json` and run the sequence. The backend is on the port 3030.

### Web UI

Go to http://localhost:3000/

## Desclaimer

**This product is not a MongoDB official product. Use at your own risk!**

## Authors

- Pavel Duchovny, Lead, Developer Relations, MongoDB
- Paul Claret, Senior Specialist, Industry Solutions, MongoDB
