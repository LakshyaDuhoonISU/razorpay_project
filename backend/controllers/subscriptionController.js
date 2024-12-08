import Subscription from "../models/Subscriptions.js";

export const createSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.create(req.body);
        res.status(201).send({ message: "Subscription created successfully" });
    }
    catch (err) {
        res.status(500).send({ message: err });
    }
}

export const getSubscriptionsByCustomer = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ customerId: req.params.id });
        res.status(200).send({ message: subscriptions });
    }
    catch (err) {
        res.status(500).send({ message: err });
    }
}

import Subscription from "../models/Subscriptions.js";

export const getSubscriptionsByBusiness = async (req, res) => {
    try {
        const businessId = req.businessId; // Extracted from authMiddleware
        // Fetch subscriptions for the authenticated business
        const subscriptions = await Subscription.find({ businessId });
        if (subscriptions.length === 0) {
            return res.status(404).send({ message: "No subscriptions found for this business" });
        }
        res.status(200).send({
            message: "Subscriptions retrieved successfully",
            data: subscriptions
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};