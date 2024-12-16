import mongoose from "mongoose";
import Customer from "../models/Customers.js";
import Transaction from "../models/Transactions.js";
import Business from "../models/Business.js";
import { session } from "../neo4j.cjs";

// Create a new customer
export const createCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        const fullCustomer = await Customer.findById(customer._id).select("-__v"); // Fetch the full customer object

        // Step 2: Add the customer node to Neo4j
        try {
            await session.run(
                `
            CREATE (c:Customer {id: $customerId, name: $name, email: $email, phone: $phone, businessId: $businessId})
            RETURN c
            `,
                {
                    customerId: customer._id.toString(),
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    businessId: customer.businessId.toString(),
                }
            );
        } catch (neo4jerr) {
            console.error("Neo4j error: ", neo4jerr);
        }

        res.status(201).send({ message: "Customer created successfully", data: fullCustomer });
    } catch (err) {
        if (err.code === 11000) { // Handle duplicate key error
            return res.status(400).send({ message: "Customer with this email or phone already exists" });
        }
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
    }
};

// Get all customers for a specific business
export const getCustomersByBusiness = async (req, res) => {
    try {
        const firebaseUid = req.firebaseUid; // Use firebaseUid for authorization

        // Step 1: Find the business using the firebaseUid
        const business = await Business.findOne({ firebaseUid });

        if (!business) {
            return res.status(404).send({ message: "Business not found" });
        }

        // Step 2: Use the ObjectId of the business to fetch customers
        const customers = await Customer.find({ businessId: business._id }).select("-__v"); // Exclude metadata fields

        // if (customers.length === 0) {
        //     res.status(404).send({ message: "No customers found for this business", data:customers });
        // }

        res.status(200).send({ message: "Customers retrieved successfully", data: customers });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
    }
};

// Get all transactions for a specific customer
export const getTransactionsByCustomer = async (req, res) => {
    try {
        const { id: customerId } = req.params; // Extract customer ID from the route params

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ message: "Invalid customer ID" });
        }

        // // Check if the customer belongs to the authenticated business
        // const customer = await Customer.findOne({ _id: customerId, businessId: req.firebaseUid });
        // if (!customer) {
        //     return res.status(403).send({ message: "Unauthorized to view transactions for this customer" });
        // }

        // Fetch transactions for this customer
        const transactions = await Transaction.find({ customerId })
        .populate('planId', 'name price') // Populate only the name and amount fields of the plan
        .select("-__v"); // Exclude metadata fields

        if (!transactions.length) {
            return res.status(404).send({ message: "No transactions found for this customer" });
        }

        res.status(200).send({ message: "Transactions retrieved successfully", data: transactions });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
    }
};

// Get the profile of a specific customer
export const getCustomerProfile = async (req, res) => {
    try {
        const { email } = req.params; // Get email from the request parameters (sent by the frontend)

        // Fetch the customer profile using the email
        const customer = await Customer.findOne({ email })
            .populate('businessId', 'name') // populate the associated business details
            .select("-__v"); // Exclude metadata fields

        if (!customer) {
            return res.status(404).send({ message: "Customer not found" });
        }

        res.status(200).send({ message: "Customer profile retrieved successfully", data: customer });
    } catch (err) {
        console.error("Error fetching customer profile:", err);
        res.status(500).send({ message: "Internal server error" });
    }
};