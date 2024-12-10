import mongoose from "mongoose";
import Transaction from "../models/Transactions.js";
import Customer from "../models/Customers.js";

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new transaction
export const createTransaction = async (req, res) => {
    try {
        const { customerId, amount, status, method } = req.body;

        // Validate customerId
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ message: "Invalid customer ID" });
        }

        // Check if the customer belongs to the authenticated business
        const customer = await Customer.findOne({ _id: customerId, businessId: req.firebaseUid });
        if (!customer) {
            return res.status(403).send({ message: "Unauthorized to create transaction for this customer" });
        }

        // Create the transaction and associate it with the business
        const transaction = await Transaction.create({ customerId, amount, status, method, businessId: req.firebaseUid });
        res.status(201).send({ message: "Transaction created successfully", data: transaction });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred while creating the transaction", error: err.message });
    }
};

// Get all transactions for a specific business
export const getTransactionsByBusiness = async (req, res) => {
    try {
        const businessId = req.firebaseUid; // Use firebaseUid for the authenticated business

        // Fetch all customers belonging to the logged-in business
        const customerIds = await Customer.find({ businessId }).distinct('_id');

        if (customerIds.length === 0) {
            return res.status(404).send({ message: "No customers found for this business" });
        }

        // Fetch transactions for the customers of this business
        const transactions = await Transaction.find({ customerId: { $in: customerIds } })
            .populate('customerId')
            .populate('planId')
            .select("-__v");

        res.status(200).send({ message: "Transactions retrieved successfully", data: transactions });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred while fetching the transactions", error: err.message });
    }
};

// Get details of a specific transaction
export const getTransactionDetail = async (req, res) => {
    try {
        const { id: transactionId } = req.params;

        // Validate ObjectId for transactionId
        if (!isValidObjectId(transactionId)) {
            return res.status(400).send({ message: "Invalid transaction ID" });
        }

        // Find transaction by ID and populate associated customer and plan details
        const transaction = await Transaction.findOne({ _id: transactionId })
            .populate('customerId')
            .populate('planId');
        
        if (!transaction) {
            return res.status(404).send({ message: "Transaction not found" });
        }

        // Check if the transaction belongs to the authenticated business
        if (transaction.customerId.businessId.toString() !== req.firebaseUid.toString()) {
            return res.status(403).send({ message: "Unauthorized to view this transaction" });
        }

        res.status(200).send({ message: "Transaction details retrieved successfully", data: transaction });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred while fetching the transaction details", error: err.message });
    }
};