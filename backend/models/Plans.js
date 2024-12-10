import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, // Example: Basic, Premium, etc.
    description: {
        type: String,
        maxlength: 500
    }, // Brief about the plan
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    }, // Duration in days
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
}, { timestamps: true });

const Plan = mongoose.model("plans", PlanSchema);
export default Plan;