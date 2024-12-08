import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, // Example: Basic, Premium, etc.
    description: {
        type: String
    }, // Brief about the plan
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    }, // Duration in days
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
}, { timestamps: true });

const Plan = mongoose.model("plans", PlanSchema);
export default Plan;