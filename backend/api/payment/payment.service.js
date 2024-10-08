const dbService = require('../../services/db.service')
const transactionService = require('../transaction/transaction.service')

const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const serviceName = 'PAYMENT_MANAGEMENT'

let isWatchRunning = false;
let resumeToken = null;

/**
 * Listens to the 'transactions' collection for new inserts and processes each transaction.
 */
async function listenToTransactions() {
    try {
        // Retrieve the 'transactions' collection
        const { collection } = await dbService.getCollection('transactions', serviceName);

        // Start watching the collection for changes
        const changeStream = collection.watch([], { resumeAfter: resumeToken });
        isWatchRunning = true;

        // Handle each change in the collection
        changeStream.on('change', async (next) => {
            // Save the resume token
            resumeToken = next._id;

            // Process only 'insert' operations
            if (next.operationType === 'insert') {
                const transaction = next.fullDocument;

                // Perform initial processing steps for the transaction
                const steps = transaction.steps.map((step) => {
                    console.log(`As part of payment for transaction ${transaction._id}, performing step ${step.api}`);
                    // mock sleep of 500ms per step
                   
                    return { completed: true, api: step.api, response: { status: 'success' } }; 
                });
                // mock sleep of 2s
                const waitPromise = new Promise(resolve => setTimeout(resolve, 2000));
                await waitPromise;
                // Update the transaction after performing steps
                logger.info('payment.service.js-listenToTransactions: updating transaction', transaction._id);
                if (['outgoing','incoming', 'refund'].includes(transaction.type)) {
                    transactionService.update(transaction._id, steps);
                }
                else if (transaction.type === 'external') {
                    transactionService.updateExternal(transaction._id, steps, transaction.amount);
                }

            }
        });

        changeStream.on('error', err => {
            // Handle errors and restart the change stream
            logger.error('payment.service.js-listenToTransactions: Error in change stream', err);
            isWatchRunning = false;
            setTimeout(listenToTransactions, 1000); // Restart after a delay
        });
    } catch (err) {
        // Log error if the stream setup fails
        logger.error('payment.service.js-listenToTransactions: cannot find transactions', err);
        throw err;
    }
}

/**
 * Checks if the change stream for transactions is running.
 * 
 * @returns {boolean} - True if the watch is running, false otherwise.
 */
async function isRunning() {
    return isWatchRunning;
}

// Start listening to transactions on script load
listenToTransactions();


module.exports = {
    isRunning
}

