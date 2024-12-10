import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null, // For non-expiring subscriptions
        validate: {
            validator: function (value) {
                // Ensure endDate is after startDate if provided
                return !value || value > this.startDate;
            },
            message: 'End date must be after the start date.'
        }
    },
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Cancelled'],
        default: 'Active'
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
}, { timestamps: true });

const Subscription = mongoose.model("subscriptions", SubscriptionSchema);
export default Subscription;