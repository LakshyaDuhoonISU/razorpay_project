import mongoose from "mongoose";
import Plan from "../models/Plans.js";
import Business from "../models/Business.js";

// Create a new plan
export const createPlan = async (req, res) => {
    const { name, description, price, duration, businessId } = req.body;

    try {
        // Ensure the businessId exists
        const businessExists = await Business.findById(businessId);
        if (!businessExists) {
            return res.status(404).json({ message: "Business not found" });
        }

        // Create the plan
        const plan = await Plan.create({
            name,
            description,
            price,
            duration,
            businessId,
        });

        res.status(201).json({ message: "Plan created successfully", data: plan });
    } catch (err) {
        console.error("Error creating plan:", err);
        res.status(500).json({
            message: "An error occurred while creating the plan",
            error: err.message,
        });
    }
};

// Get all plans for a specific business
export const getPlansByBusiness = async (req, res) => {
    try {
        const firebaseUid = req.firebaseUid; // Use firebaseUid for authorization
        const business = await Business.findOne({ firebaseUid });

        if (!business) {
            return res.status(404).send({ message: "Business not found" });
        }

        const plans = await Plan.find({ businessId: business._id }).select("-__v"); // Exclude metadata fields
        res.status(200).send({ message: "Plans retrieved successfully", data: plans });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred while fetching the plans", error: err.message });
    }
};

// Get details of a specific plan
export const getPlanDetails = async (req, res) => {
    try {
        const { id: planId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(planId)) {
            return res.status(400).send({ message: "Invalid plan ID" });
        }

        const plan = await Plan.findById(planId).select("-__v"); // Exclude metadata fields
        if (!plan) {
            return res.status(404).send({ message: "Plan not found" });
        }

        res.status(200).send({ message: "Plan details retrieved successfully", data: plan });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "An error occurred while fetching the plan details", error: err.message });
    }
};