import Transaction from "../models/Transactions.js";
import Customer from "../models/Customers.js";

export const createTransaction = async (req, res) => {
    try {
        const { customerId, amount, status, method } = req.body;

        // Check if the customer belongs to the authenticated business
        const customer = await Customer.findOne({ _id: customerId, businessId: req.business.id });
        if (!customer) {
            return res.status(403).send({ message: "Unauthorized to create transaction for this customer" });
        }

        // Create the transaction
        const transaction = await Transaction.create({ customerId, amount, status, method });
        res.status(201).send({ message: "Transaction created successfully", data: transaction });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

export const getTransactionsByBusiness = async (req, res) => {
    try {
        // Get the businessId from the authenticated business
        const businessId = req.business.id;

        // Fetch all customers belonging to the logged-in business
        const customerIds = await Customer.find({ businessId }).distinct('_id');

        // Fetch transactions for the customers of this business
        const transactions = await Transaction.find({ customerId: { $in: customerIds } });
        res.status(200).send({ message: transactions });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

export const getTransactionDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the transaction belongs to the authenticated business
        const transaction = await Transaction.findOne({ _id: id }).populate('customerId');
        if (!transaction || transaction.customerId.businessId.toString() !== req.business.id) {
            return res.status(403).send({ message: "Unauthorized to view this transaction" });
        }

        res.status(200).send({ message: transaction });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};