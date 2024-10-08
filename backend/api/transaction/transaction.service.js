const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId
const serviceName = 'TRANSACTION_MANAGEMENT'
const userService = require('../user/user.service')
const accountService = require('../account/account.service')
const notificationService = require('../notification/notification.service')
const { getTransaction } = require('./transaction.controller')

const encryptedFieldsMap = {
    encryptedFields: {
        fields: [
            
            {
                path: "details", // Encrypting the password
                bsonType: "object",
            },
            {
                path: "referenceData.sender.accountNumber", // Encrypting the email
                bsonType: "string",
                queries: { queryType: "equality" }
            },
            {
                path: "referenceData.receiver.accountNumber", // Encrypting the email
                bsonType: "string",
                queries: { queryType: "equality" }
            }
        ]
    }
}

// Transaction Service

async function preWarmConnection(){
    try {
        await dbService.getEncryptedCollection('transactions', serviceName, encryptedFieldsMap)
        logger.info(`transaction.service.js-preWarmConnection: pre-warmed transactions`);
    } catch (err) {
        logger.error('transaction.service.js-preWarmConnection: cannot pre-warm transactions', err);
        throw err;
    }
}

preWarmConnection();

// docs/FSI - Payments Demo Architecture.txt

/**
 * Queries the encrypted transactions collection based on provided filter criteria.
 * 
 * @param {Object} filterBy - Criteria used for filtering the transactions.
 * @returns {Promise<Array>} - A promise that resolves to an array of transaction objects.
 */
async function query(filterBy) {
    // Build query criteria from the filter
    const criteria = _buildCriteria(filterBy);

    try {
        // Get the encrypted 'transactions' collection
        const { collection } = await dbService.getEncryptedCollection('transactions', serviceName);
        
        // Query the collection and convert the result to an array
        console.log('criteria', criteria);
        const transactions = await collection.find(criteria).toArray();

        return transactions;
    } catch (err) {
        // Log the error for debugging and rethrow it for handling upstream
        logger.error(`transaction.service.js-query: cannot find transactions`, err);
        throw err;
    }
}

/**
 * Retrieves a transaction by its ID from an encrypted collection.
 * 
 * @param {string} transactionId - The ID of the transaction to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the transaction object.
 */
async function getById(transactionId) {
    try {
        // Get the encrypted 'transactions' collection
        const { collection } = await dbService.getEncryptedCollection('transactions', serviceName);

        // Find the transaction by its ObjectId
        console.log(`Using findOne to find transaction ${transactionId}` );
        const transaction = await collection.findOne({ _id: new ObjectId(transactionId) });

        return transaction;
    } catch (err) {
        // Log the error and rethrow it for handling upstream
        logger.error(`transaction.service.js-getById: cannot find transaction ${transactionId}`, err);
        throw err;
    }
}


/**
 * Validates the initiation of a transaction by checking sender, receiver, and amount.
 * Ensures that the sender and receiver are not the same and both accounts exist.
 * 
 * @param {Object} sender - The sender's information.
 * @param {Object} receiver - The receiver's information.
 * @param {number} amount - The amount to be transacted.
 * @returns {Promise<{senderAccount: Object, receiverAccount: Object}>} - The accounts of the sender and receiver.
 * @throws {Error} - If validation fails.
 */
async function validateTrasactionInitiate(sender, receiver, amount) {
    // Validate required fields
    if (!sender) throw new Error('sender is required');
    if (!receiver) throw new Error('receiver is required');
    if (!amount) throw new Error('amount is required');
    if (sender.accountId === receiver.accountId) throw new Error('sender and receiver cannot be the same');

    // Retrieve accounts for sender and receiver
    const senderAccount = await accountService.getAccountAndUpdateBalance(sender.userId, sender.accountId, -1 * amount)
    const receiverAccount = await accountService.getAccountAndUpdateBalance(receiver.userId, receiver.accountId, amount)

    // Ensure both accounts exist
    if (!senderAccount) throw new Error(`sender ${sender._id} account not found`);
    if (!receiverAccount) throw new Error(`receiver ${receiver._id} account not found`);
    
    // Funds validation

    // Further validations can be added here (e.g., checking balance)
        // if (senderAccount.balance < amount) throw new Error(`sender ${sender._id} has insufficient funds`);

    return { senderAccount, receiverAccount };
}

/**
 * Defines the steps involved in processing a transaction based on its type.
 * 
 * @param {string} type - The type of the transaction (e.g., 'outgoing', 'refund').
 * @returns {Array} - An array of steps involved in the transaction process.
 */
function getDistrebutionSteps(type) {
    switch (type) {
        case 'outgoing':
            // Steps for an outgoing transaction
            return [
                { completed: false, api: 'riskAnalysis', endpoint: '$external/riskAnalysis', response: {} },
                { completed: false, api: 'fraudDetection', endpoint: '$external/fraudDetection', response: {} },
                { completed: false, api: 'paymentConfirmation', endpoint: '$external/paymentConfirmation', response: {} },
                { completed: false, api: 'paymentStatus', endpoint: '$external/paymentStatus', response: {} }
            ];
        case 'refund':
            // Steps for a refund transaction
            return [
                { completed: false, api: 'paymentRefund', endpoint: '$external/paymentRefund', response: {} },
                { completed: false, api: 'refundConfirmation', endpoint: '$external/fraudDetection', response: {} },
                { completed: false, api: 'paymentStatus', endpoint: '$external/paymentStatus', response: {} }
            ];
        case 'external':
            // Steps for an external transaction
            return [
                { completed: false, api: 'externalRiskAnalysis', endpoint: '$external/riskAnalysis', response: {} },
                { completed: false, api: 'externalVerification', endpoint: '$external/fraudDetection', response: {} },
                { completed: false, api: 'externalPaymentConfirmation', endpoint: '$external/paymentConfirmation', response: {} },
                { completed: false, api: 'externalPaymentStatus', endpoint: '$external/paymentStatus', response: {} }
            ];
        default:
            // Default steps (similar to outgoing)
            return [
                { completed: false, api: 'riskAnalysis', endpoint: '$external/riskAnalysis', response: {} },
                { completed: false, api: 'fraudDetection', endpoint: '$external/fraudDetection', response: {} },
                { completed: false, api: 'paymentConfirmation', endpoint: '$external/paymentConfirmation', response: {} },
                { completed: false, api: 'paymentStatus', endpoint: '$external/paymentStatus', response: {} }
            ];
    }
}


/**
 * Adds a new transaction to the database and links it to a user.
 * 
 * @param {string} userId - The ID of the user initiating the transaction.
 * @param {Object} transaction - The transaction details.
 * @returns {Promise<Object>} - A promise that resolves to the added transaction object.
 */
async function add(userId, transaction) {
    try {
        // Retrieve the encrypted 'transactions' collection
        const { collection/*, session */} = await dbService.getEncryptedCollection('transactions', serviceName, encryptedFieldsMap);
        
        // Fetch the user initiating the transaction
        const user = await userService.getById(userId);
        if (!user) throw new Error(`user ${userId} not found`);

        // Set initial transaction details
        transaction.date = Date.now();
        transaction.status = 'pending';
        transaction.type = 'outgoing';
        transaction.steps = getDistrebutionSteps(transaction.type);

        // Validate the transaction initiation
        const { receiver } = transaction.referenceData;
        const sender = transaction.sender ? transaction.sender : { "userId": user._id, "accountId": transaction.accountId };
        const { senderAccount, receiverAccount } = await validateTrasactionInitiate(sender, receiver, transaction.amount);

        // Update transaction with receiver and sender details
        transaction.referenceData = {
            ...transaction.referenceData,
            receiver: {
                ...transaction.referenceData.receiver,
                name: receiverAccount.user.username,
                accountNumber: receiverAccount.accountNumber
            },
            sender: {
                ...transaction.referenceData.sender,
                accountId: senderAccount._id,
                name: senderAccount.user.username,
                accountNumber: senderAccount.accountNumber
            }
        };

          // Update transaction with receiver and sender details
          transaction.referenceData = {
            ...transaction.referenceData,
            receiver: {
                ...transaction.referenceData.receiver,
                name: receiverAccount.user.username,
                accountNumber: receiverAccount.accountNumber
            },
            sender: {
                accountId: senderAccount._id,
                name: senderAccount.user.username,
                userId: user._id,
                accountNumber: senderAccount.accountNumber
            }
        };

        // Insert the transaction into the collection
        console.log('Inserting transaction...');
        const addedTransaction = await collection.insertOne(transaction/*, { session }*/);
        transaction.txId = addedTransaction.insertedId;

        // Update the user's transaction history
        const users = await dbService.getEncryptedCollection('users', serviceName);
        await userService.addTransaction(userId, transaction, users.collection/*, session*/);

        // Clean up sensitive data before returning
        delete transaction.referenceData.sender.accountNumber;
        delete transaction.referenceData.receiver.accountNumber;

        return transaction;
    } catch (err) {
        logger.error(`transaction.service.js-add: cannot insert transaction`, err);
        
        // Abort the transaction in case of an error
        if (session && session.inTransaction()) {
            await session.abortTransaction();
        }
        throw err;
       
    }
}

/**
 This is the external transaction example document:
 {
    "_id": "5f2b5bcd12345a678d123456",
    "transactionId": "9J1234567D8901234",
    "amount": {
        "total": "50.00",
        "currency": "USD"
    },
    "paymentMethod": "PayPal",
    "status": "Completed",
    "payerInfo": {
        "payerId": "AX12345BXC123456",
        "email": "payer@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "shippingAddress": {
            "line1": "123 Main St",
            "city": "Anytown",
            "state": "CA",
            "postalCode": "12345",
            "countryCode": "US"
        }
    },
    "recipientInfo": {
        "merchantId": "XYZ12345ABC67890"
    },
    "createdAt": "2024-03-12T08:00:00Z",
    "updatedAt": "2024-03-12T10:00:00Z",
    "customField": "Additional Information"
}
**/

async function addExternalTransaction(oriAccountId, recAccountId, transaction) {
    try {

        // Retrieve the encrypted 'transactions' collection
        const { collection/*, session */} = await dbService.getEncryptedCollection('transactions', serviceName, encryptedFieldsMap);

        console.log("********* Start External Transaction Receiver *********")
        // Fetch target user details
        console.log("recAccountId" + recAccountId)
        let recAccount = await accountService.getById(recAccountId);
        if (!recAccount) throw new Error(`user ${recAccountId} not found`);

        // Set initial transaction details
        transaction.date = Date.now();
        transaction.status = 'pending';
        transaction.type = 'external';
        transaction.steps = getDistrebutionSteps(transaction.type);

        const receiver = {
            userId: recAccount.userId,
            name: recAccount.user.username,
            accountNumber: recAccount.accountNumber,
            accountId: recAccountId
        }

        console.log("********* Start External Transaction Originator *********")
        // Fetch target user details
        let OriAccount  = await accountService.getById(oriAccountId);
        if (!OriAccount) throw new Error(`user ${oriAccountId} not found`);

        const sender = {
            userId: OriAccount.userId,
            name: OriAccount.user.username,
            accountNumber: OriAccount.accountNumber,
            accountId: new ObjectId(oriAccountId)
        }

        transaction.referenceData = { 
            receiver,
            sender
        }

        console.log("********* Insert External Transaction *********" + JSON.stringify(transaction))

        const addedTransaction = await collection.insertOne(transaction/*, { session }*/);
        transaction.txId = addedTransaction.insertedId;

        // Update the user's transaction history
        const users = await dbService.getEncryptedCollection('users', serviceName);

        await userService.addTransaction(user._id, transaction, users.collection/*, session*/);

        return transaction;
    } catch (err) {
        logger.error(`transaction.service.js-addExternalTransaction: cannot insert transaction`, err);

        
    }
}





function cleanTransaction(transaction) {
   //delete transaction.referenceData.sender.accountNumber;
    //delete transaction.referenceData.receiver.accountNumber;
    delete transaction.details;
    delete transaction['__safeContent__'];

    return transaction;
}

// status update
/**
 * Updates the steps and status of a transaction based on the provided steps.
 * 
 * @param {string} transactionId - The ID of the transaction to update.
 * @param {Array} steps - An array of steps involved in the transaction process.
 * @returns {Promise<void>} - A promise that resolves when the update operation is complete.
 */
async function update(transactionId, steps) {
    try {
        const { collection } = await dbService.getEncryptedCollection('transactions', serviceName);

        let transactionToSave = { steps };

        const isCompleted = steps.every(step => step.completed);
        if (isCompleted) {
            transactionToSave.status = 'completed';

            let transaction = await collection.findOne({ _id: new ObjectId(transactionId) });
            const receiver = transaction.referenceData.receiver;
            const sender = transaction.referenceData.sender;

            // Create separate transaction objects for sender and receiver
            let senderTransaction = {
                ...transaction,
                type: 'outgoing',
                status: 'completed'
            };

            let receiverTransaction = {
                ...transaction,
                type: 'incoming',
                status: 'completed'
            };

            senderTransaction = cleanTransaction(senderTransaction);
            receiverTransaction = cleanTransaction(receiverTransaction);

            // Update users with correct transaction details
            await Promise.all([
                userService.addTransaction(sender.userId, senderTransaction),
                userService.addTransaction(receiver.userId, receiverTransaction)
            ]);

            const senderNotification = {
                username: sender.name,
                data: `You have sent $${transaction.amount} to ${receiver.name} with status ${transaction.status}`,
            };
            const receiverNotification = {
                username: receiver.name,
                data: `You have received $${transaction.amount} from ${sender.name} with status ${transaction.status}`,
            };
            await notificationService.sendNotification([senderNotification, receiverNotification]);
        }

        await collection.updateOne({ _id: new ObjectId(transactionId) }, { $set: transactionToSave });

    } catch (err) {
        logger.error(`transaction.service.js-update: cannot update transaction ${transactionId}`, err);
        throw err;
    }
}

async function updateExternal(transactionId, steps, amount) {

    try {

        // Retrieve the encrypted 'transactions' collection
        const { collection } = await dbService.getEncryptedCollection('transactions', serviceName);

        // Prepare the object to be saved
        let transactionToSave = { steps };

        // Check if all steps are completed
        const isCompleted = steps.every(step => step.completed);

        if (isCompleted) {
            
            // Update the status to 'completed' if all steps are completed
            transactionToSave.status = 'completed';
            let transaction = await collection.findOne({ _id: new ObjectId(transactionId) });
            //update reciever user
            const senderAccount = await accountService.getAccountAndUpdateBalance(transaction.referenceData.sender.userId.toString(), transaction.referenceData.sender.accountId.toString(), -1 * amount)
            const receiverAccount = await accountService.getAccountAndUpdateBalance(transaction.referenceData.receiver.userId, transaction.referenceData.receiver.accountId, amount)

            // Update users with  transaction details
            await collection.updateOne({ _id: new ObjectId(transactionId) }, { $set: transactionToSave });
            transaction = {...transaction, ...transactionToSave};
            const receiverNotification = {
                username: transaction.referenceData.receiver.name,
                data: `You have received $${transaction.amount} to account ${receiverAccount.accountType}, origin: ${senderAccount} from ${transaction.payerInfo.email} with status ${transactionToSave.status}`,
            }
            // Update users object with transaction details
            await Promise.all([
                userService.addTransaction(transaction.referenceData.sender.userId, transaction),
                userService.addTransaction(transaction.referenceData.receiver.userId, transaction)
            ]);
            // Send notification to receiver
            await notificationService.sendNotification([receiverNotification]);

        }
    }
    catch (err) {
        // Log and throw the error for further handling
        logger.error(`transaction.service.js-updateExternal: cannot update transaction ${transactionId}`, err);
        throw err;
    }
}
/**
 transaction refund

    * @param {string} transactionId - The ID of the transaction to update.

    * @returns {Promise<void>} - A promise that resolves when the update operation is complete.
**/

async function refund(transactionId) {

    try {

        // Retrieve the encrypted 'transactions' collection
        const { collection } = await dbService.getEncryptedCollection('transactions', serviceName);

        // get transaction
        const transaction = await getById(transactionId);

        // Prepare the object to be saved
        delete transaction._id;
        transaction.type = 'refund';
        transaction.status = 'pending';
        transaction.steps = getDistrebutionSteps(transaction.type);
        transaction.date = Date.now();
        transaction.referenceData = {
            receiver: transaction.referenceData.sender,
            sender: transaction.referenceData.receiver
        }

        const { senderAccount, receiverAccount } = await validateTrasactionInitiate(transaction.referenceData.sender, transaction.referenceData.receiver, transaction.amount);

        
        cleanTransaction(transaction);

        // Insert the transaction into the collection
        const addedTransaction = await collection.insertOne(transaction);
        transaction.txId = addedTransaction.insertedId;

        // Update the user's transaction history
        console.log(`Using updateOne to update transaction ${transactionId} relatedTransactions`)
        await collection.updateOne({ _id: new ObjectId(transactionId) }, { $set : { relatedTransactions : [{
            txId: transaction.txId,
            type: transaction.type,
            date: transaction.date
        }] } });


        // Prepare the object to be saved
    } catch (err) {
        // Log and throw the error for further handling
        logger.error(`transaction.service.js-refund: cannot refund transaction ${transactionId}`, err);
        throw err;
    }
}

function _buildCriteria(query) {
    let criteria = {};

    if (query.status) {
        criteria.status = query.status;
    }
    if (query.amount) {
        criteria.amount = parseFloat(query.amount);
    }
    if (query.dateFrom && query.dateTo) {
        criteria.date = { $gte: new Date(query.dateFrom), $lte: new Date(query.dateTo) };
    }
    //referenceData queries
    if (query.userId) {
        criteria['referenceData.sender.userId'] = query.userId;
    }
    if (query.accountId) {
        criteria['accountId'] = query.accountId;
    }

    return criteria;
}



module.exports = {
    query,
    getById,
    add,
    addExternalTransaction,
    updateExternal, 
    update,
    refund
}









