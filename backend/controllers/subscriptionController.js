import mongoose from 'mongoose';
import Subscription from "../models/Subscriptions.js";
import Customer from "../models/Customers.js";
import Plan from '../models/Plans.js';
import Business from '../models/Business.js';

// Create a new subscription
export const createSubscription = async (req, res) => {
    try {
        const { customerId, planId, price, startDate, endDate, status, paymentId } = req.body;

        // Validate customerId and ensure the customer belongs to the authenticated business
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ message: "Invalid customer ID" });
        }

        // Ensure planId exists and belongs to the business
        const plan = await Plan.findOne({ _id: planId, businessId });
        if (!plan) {
            return res.status(400).send({ message: "Invalid planId or unauthorized plan" });
        }

        const customer = await Customer.findOne({ _id: customerId, businessId: req.firebaseUid });
        if (!customer) {
            return res.status(403).send({ message: "Unauthorized to create subscription for this customer" });
        }

        // Create the subscription and associate it with the authenticated business
        const subscription = await Subscription.create({
            customerId,
            planId,
            price,
            startDate,
            endDate,
            status,
            paymentId,
            businessId: req.firebaseUid // Use authenticated business ID
        });

        res.status(201).send({ message: "Subscription created successfully", data: subscription });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred while creating the subscription", error: err.message });
    }
};

// Get all subscriptions for a specific customer
export const getSubscriptionsByCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;

        // Validate customerId
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ message: "Invalid customer ID" });
        }

        // Fetch subscriptions for the specific customer
        const subscriptions = await Subscription.find({ customerId }).populate('planId');

        if (subscriptions.length === 0) {
            return res.status(404).send({ message: "No subscriptions found for this customer" });
        }

        res.status(200).send({ message: "Subscriptions retrieved successfully", data: subscriptions });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred while fetching the subscriptions", error: err.message });
    }
};

// Get all subscriptions for a specific business
export const getSubscriptionsByBusiness = async (req, res) => {
    try {
        const firebaseUid = req.firebaseUid; // Use firebaseUid for authorization
        const business = await Business.findOne({ firebaseUid });

        if (!business) {
            return res.status(404).send({ message: "Business not found" });
        }

        // Fetch subscriptions for the authenticated business
        const subscriptions = await Subscription.find({ businessId: business._id })
            .populate('customerId')
            .populate('planId');

        if (subscriptions.length === 0) {
            return res.status(404).send({ message: "No subscriptions found for this business" });
        }

        res.status(200).send({
            message: "Subscriptions retrieved successfully",
            data: subscriptions
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred while fetching the subscriptions", error: err.message });
    }
};

// Get details of a specific subscription
export const getSubscriptionDetail = async (req, res) => {
    try {
        const { id: subscriptionId } = req.params;

        // Validate subscriptionId
        if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
            return res.status(400).send({ message: "Invalid subscription ID" });
        }

        // Find subscription by ID and populate associated customer and plan details
        const subscription = await Subscription.findOne({ _id: subscriptionId })
            .populate('customerId')
            .populate('planId');

        if (!subscription) {
            return res.status(404).send({ message: "Subscription not found" });
        }

        // Check if the subscription belongs to the authenticated business
        if (subscription.customerId.businessId.toString() !== req.firebaseUid.toString()) {
            return res.status(403).send({ message: "Unauthorized to view this subscription" });
        }

        res.status(200).send({ message: "Subscription details retrieved successfully", data: subscription });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred while fetching the subscription details", error: err.message });
    }
};
