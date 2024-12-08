import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
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