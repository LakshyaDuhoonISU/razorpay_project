import Plan from "../models/Plans.js";

export const createPlan = async (req, res) => {
    try {
        const plan = await Plan.create(req.body);
        res.status(201).send({ message: "Plan created successfully" });
    }
    catch (err) {
        res.status(500).send({ message: err });
    }
}

export const getPlansByBusiness = async (req, res) => {
    try {
        const plans = await Plan.find({ businessId: req.params.businessId });
        res.status(200).send({ message: plans });
    }
    catch (err) {
        res.status(500).send({ message: err });
    }
}

export const getPlanDetails = async (req, res) => {
    try {
        const { id: planId } = req.params;
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).send({ message: "Plan not found" });
        }
        res.status(200).send({ message: "Plan details retrieved successfully", data: plan });
    } catch (err) {
        res.status(500).send({ message: "An error occurred while fetching the plan details", error: err.message });
    }
};