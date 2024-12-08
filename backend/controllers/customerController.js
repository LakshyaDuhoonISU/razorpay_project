import Customer from "../models/Customers.js";
import Transaction from "../models/Transactions.js";

export const createCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).send({ message: "Customer created successfully" });
    }
    catch (err) {
        res.status(500).send({ message: err });
    }
}

export const getCustomersByBusiness = async (req, res) => {
    try {
        const customers = await Customer.find({ businessId: req.params.businessId });
        res.status(200).send({ message: customers });
    }
    catch (err) {
        res.status(500).send({ message: err });
    }
}

export const getTransactionsByCustomer = async (req, res) => {
    try {
        const { id: customerId } = req.params;

        // Check if the customer belongs to the authenticated business
        const customer = await Customer.findOne({ _id: customerId, businessId: req.business.id });
        if (!customer) {
            return res.status(403).send({ message: "Unauthorized to view transactions for this customer" });
        }

        // Fetch transactions for this customer
        const transactions = await Transaction.find({ customerId });
        res.status(200).send({ message: transactions });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

export const getCustomerProfile = async (req, res) => {
    try {
        const customerId = req.params.id;

        // Check if the customer belongs to the authenticated business
        const customer = await Customer.findOne({ _id: customerId, businessId: req.business.id });
        if (!customer) {
            return res.status(403).send({ message: "Unauthorized to view this customer's profile" });
        }

        res.status(200).send({ message: "Customer profile retrieved successfully", data: customer });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};