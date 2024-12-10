import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/  // This ensures the email is in the correct format
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{10}$/  // This ensures the phone number is exactly 10 digits long
    },
    firebaseUid: {  // Store the Firebase UID which is unique to the business
        type: String,
        required: true,
        unique: true  // This ensures only one business can be linked with a given Firebase UID
    },
    address: {
        type: String
    }
}, { timestamps: true });

const Business = mongoose.model("businesses", BusinessSchema);
export default Business;