import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'businesses',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'plans',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    razorpay_order_id: {
        type: String,
        required: true,
    },
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required:true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Transaction = mongoose.model("transactions", TransactionSchema);
export default Transaction;