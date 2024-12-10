import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        required: true
    },
    method: {
        type: String,
        enum: ['Card', 'UPI', 'Netbanking'],
        required: true
    }
}, { timestamps: true });

const Transaction = mongoose.model("transactions", TransactionSchema);
export default Transaction;