import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{10}$/
    },
    businessId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'businesses', 
        required: true 
    }
}, { timestamps: true });

const Customer = mongoose.model("customers", CustomerSchema);
export default Customer;